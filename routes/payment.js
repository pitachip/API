const express = require("express");
const { createStripeSession } = require("../controllers/payment");
const router = express.Router();

router.route("/session").post(createStripeSession);

module.exports = router;
