const express = require("express");
const {
	registerNewUser,
	signin,
	getMyUserInfo,
	resetPassword,
	updatePassword,
} = require("../controllers/auth");

const router = express.Router();
const { protect } = require("../middleware/auth");

router.route("/me").get(protect, getMyUserInfo);
router.post("/register", registerNewUser);
router.post("/signin", signin);
router.post("/resetpassword", resetPassword);
router.route("/updatepassword").post(protect, updatePassword);

module.exports = router;
