const express = require("express");
const { getDefaultRoute } = require("../controllers/test");
const router = express.Router();

router.route("/").get(getDefaultRoute);

module.exports = router;
