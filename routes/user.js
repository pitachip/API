const express = require("express");
const {
	getUsers,
	getUser,
	saveUserData,
	updateUserData,
} = require("../controllers/user");
const router = express.Router();

//Route protection
const { protect, authorize } = require("../middleware/auth");

//Middleware for advanced querying -- have to bring in model
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

router
	.route("/")
	.get(protect, authorize("admin"), advancedResults(User), getUsers)
	.post(protect, saveUserData)
	.put(protect, updateUserData);

router.route("/:id").get(protect, getUser)

module.exports = router;
