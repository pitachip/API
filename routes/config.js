const express = require("express");
const { getConfig } = require("../controllers/config");
const router = express.Router();

router.route("/").get(getConfig);

module.exports = router;
