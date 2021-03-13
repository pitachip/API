const express = require("express");
const {
	createPaymentIntent,
	createInvoice,
	getPaymentIntent,
	refundCreditCard,
	voidInvoice,
	addPurchaseOrderNumber,
} = require("../controllers/payment");
const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/intent").post(createPaymentIntent);
router.route("/intent/:id").get(protect, getPaymentIntent);

router.route("/invoice").post(protect, createInvoice);
router
	.route("/invoice/:id/purchaseorder")
	.post(protect, addPurchaseOrderNumber);

router.route("/refund/creditcard").post(protect, refundCreditCard);
router.route("/refund/invoice").post(protect, voidInvoice);

module.exports = router;
