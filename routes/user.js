const express = require("express");
const {
	getUserData,
	saveUserData,
	updateUserData,
} = require("../controllers/user");
const router = express.Router();

//Route protection
/**
 * Routes that have this middleware can only be accessed by
 * logged in users
 */
const { protect, authorize } = require("../middleware/auth");

router
	.route("/")
	.get(protect, getUserData)
	.post(protect, saveUserData)
	.put(protect, updateUserData);

module.exports = router;
