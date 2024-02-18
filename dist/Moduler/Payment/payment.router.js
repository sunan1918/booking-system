"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const payment_validation_1 = require("./payment.validation");
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const userRole_1 = require("../../utility/userRole");
const route = express_1.default.Router();
route.post('/orderBySSL', (0, auth_1.default)(userRole_1.userRole.customer, userRole_1.userRole.operator), (0, validationRequest_1.default)(payment_validation_1.paymentValidationSchema.TpaymentSSLValidationSchema), payment_controller_1.paymentController.makePayment);
route.post('/successBySSL/:id', (0, auth_1.default)(userRole_1.userRole.customer, userRole_1.userRole.operator), payment_controller_1.paymentController.paymentSuccess);
route.post('/failBySSL/:id', (0, auth_1.default)(userRole_1.userRole.customer, userRole_1.userRole.operator), payment_controller_1.paymentController.paymentFail);
route.post('/orderBybKash', (0, auth_1.default)(userRole_1.userRole.customer, userRole_1.userRole.operator), (0, validationRequest_1.default)(payment_validation_1.paymentValidationSchema.TpaymentBkashValidationSchema), payment_controller_1.paymentController.makePaymentBkash);
route.get('/callbackbKash', (0, auth_1.default)(userRole_1.userRole.customer, userRole_1.userRole.operator), payment_controller_1.paymentController.bKashPaymentCallback);
exports.paymentRouter = route;
