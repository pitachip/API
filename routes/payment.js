const express = require("express");
const { createPaymentIntent } = require("../controllers/payment");
const router = express.Router();

router.route("/intent").post(createPaymentIntent);

module.exports = router;
