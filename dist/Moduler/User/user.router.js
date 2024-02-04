"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const userRole_1 = require("../../utility/userRole");
const router = express_1.default.Router();
router.post('/create-customer', (0, validationRequest_1.default)(user_validation_1.MemberValidationSchema), user_controller_1.userController.createCustomer);
router.post('/create-operator', (0, auth_1.default)(userRole_1.userRole.admin, userRole_1.userRole.moderator), (0, validationRequest_1.default)(user_validation_1.operatorValidationSchema), user_controller_1.userController.createOperator);
router.post('/create-driver', (0, auth_1.default)(userRole_1.userRole.admin), (0, validationRequest_1.default)(user_validation_1.MemberValidationSchema), user_controller_1.userController.createDriver);
router.post('/create-moderator', (0, auth_1.default)(userRole_1.userRole.admin), (0, validationRequest_1.default)(user_validation_1.moderatorValidationSchema), user_controller_1.userController.createModerator);
exports.userRouter = router;
