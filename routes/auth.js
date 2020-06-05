const express = require("express");
const { registerNewUser, signin } = require("../controllers/auth");

const router = express.Router();

router.post("/register", registerNewUser);
router.post("/signin", signin);

module.exports = router;
