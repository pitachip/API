const express = require("express");
const { auth } = require("firebase-admin");
const {
	createPaymentIntent,
	createInvoice,
	getPaymentIntent,
	refundCreditCard,
	voidInvoice,
	markInvoicePaid,
} = require("../controllers/payment");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.route("/intent").post(createPaymentIntent);
router.route("/intent/:id").get(protect, getPaymentIntent);

router.route("/invoice").post(protect, createInvoice);
router
	.route("/invoice/:id/pay")
	.post(protect, authorize("admin", "manager"), markInvoicePaid);

router.route("/refund/creditcard").post(protect, refundCreditCard);
router.route("/refund/invoice").post(protect, voidInvoice);

module.exports = router;
