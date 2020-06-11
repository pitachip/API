const express = require("express");
const {
	registerNewUser,
	signin,
	getMyUserInfo,
	resetPassword,
	updatePassword,
	updateUser,
} = require("../controllers/auth");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.route("/me").get(protect, getMyUserInfo);
router.post("/register", registerNewUser);
router.post("/signin", signin);
router.post("/resetpassword", resetPassword);
router.route("/updatepassword").post(protect, updatePassword);
router.route("/updateroles").post(protect, authorize("admin"), updateUser);

module.exports = router;
