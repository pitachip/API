const express = require("express");
const {
	registerNewUser,
	signin,
	getMyUserInfo,
	resetPassword,
	updatePassword,
	updateUser,
	getUserRoles,
} = require("../controllers/auth");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.route("/me").get(protect, getMyUserInfo);
router.post("/register", registerNewUser);
router.post("/signin", signin);
router.post("/resetpassword", resetPassword);
router.route("/updatepassword").put(protect, updatePassword);
router.route("/updateroles").put(protect, authorize("admin"), updateUser);
router.route("/roles/:id").get(protect, authorize("admin"), getUserRoles);

module.exports = router;
