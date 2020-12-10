const express = require("express");
const {
	createPaymentIntent,
	createInvoice,
	getPaymentIntent,
} = require("../controllers/payment");
const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/intent").post(createPaymentIntent);
router.route("/intent/:id").get(protect, getPaymentIntent);

router.route("/invoice").post(protect, createInvoice);

module.exports = router;
