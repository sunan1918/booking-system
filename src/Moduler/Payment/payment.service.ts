const SSLCommerzPayment = require('sslcommerz').SslCommerzPayment
import config from '../../config';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { TPaymentDetails, Tpayment } from './payment.interface';
import AppError from '../../Error/AppError';
import httpStatus from 'http-status';
import paymentModel from './payment.model';
import { paymentUtils } from './payment.utils';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


const makePaymentBkash = async (payload: Partial<Tpayment>) => {
    const grantToken = await paymentUtils.grantToken()

    const { data } = await axios.post(config.bkash_create_payment_url!, {
        mode: '0011',
        payerReference: " ",
        callbackURL: 'http://localhost:5000/api/payment/callbackbKash',
        amount: payload.price,
        currency: "BDT",
        intent: 'sale',
        merchantInvoiceNumber: 'Inv' + uuidv4().substring(0, 5)
    }, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: grantToken,
            'x-app-key': config.bkash_api_key,
        }
    })
    payload.url = data.bkashURL
    payload.transactionId = data.paymentID
    const input = await paymentModel.create(payload)

    if (!input) {
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to Payment Process")
    }

    return data.bkashURL;

}

const bKashPaymentCallback = async (payload: any) => {
    const grantToken = await paymentUtils.grantToken()
    const { paymentID, status } = payload
    console.log(payload);

    if (status === 'cancel' || status === 'failure') {
        throw new AppError(httpStatus.BAD_REQUEST, `Payment is ${status}`)
    }
    else if (status === 'success') {
        try {
            const { data } = await axios.post(config.bkash_execute_payment_url!, { paymentID }, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    authorization: grantToken,
                    'x-app-key': config.bkash_api_key,
                }
            })
            if (data && data.statusCode === '0000' && data.statusMessage === 'Successful') {
                const result = await paymentModel.findOneAndUpdate({ transactionId: paymentID }, { transactionId: data.trxID, isPaid: true }, { new: true, upsert: true })
                if (!result) {
                    throw new AppError(httpStatus.BAD_REQUEST, "Failed to payment")
                }
            }
            else {
                throw new AppError(httpStatus.BAD_REQUEST, data.statusMessage)
            }
        } catch (error: any) {
            throw new AppError(httpStatus.BAD_REQUEST, error.message)
        }
    }
    return "Payment is Successful"


}

const makePaymentInDB = async (res: Response, payload: Partial<Tpayment>) => {

    let URL: string = '';

    try {
        const tran_id = new ObjectId().toString()
        payload.transactionId = tran_id
        const data = {
            total_amount: payload.price,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${config.backend_site}/api/payment/successBySSL/${tran_id}`,
            fail_url: `${config.backend_site}/api/paymentBySSL/fail/${tran_id}`,
            cancel_url: 'http://localhost:3030/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: payload.contactNo,
            cus_fax: payload.contactNo,
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        const sslcz = new SSLCommerzPayment(config.store_id, config.store_password, false)
        sslcz.init(data).then(async (apiResponse: any) => {
            let GatewayPageURL = apiResponse.GatewayPageURL
            if (GatewayPageURL) {
                URL = GatewayPageURL
            }
            else {
                throw new AppError(httpStatus.BAD_REQUEST, "SSL Session was not successful")
            }
        });

    } catch (error) {
        console.log(error);
    }
    payload.url = URL;
    const input = await paymentModel.create(payload)

    if (!input) {
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to Payment Process")
    }

    return URL;
}

const paymentSuccess = async (id: string) => {
    const result = await paymentModel.findOneAndUpdate({ transactionId: id }, { isPaid: true }, { new: true, upsert: true });
    return result
}

const paymentFail = async (id: string) => {
    const result = await paymentModel.findOneAndDelete({ transactionId: id })
    return result
}

export const paymentService = {
    makePaymentInDB,
    paymentSuccess,
    paymentFail,
    makePaymentBkash,
    bKashPaymentCallback
}