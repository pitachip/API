const User = require("../models/User");
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc     Get user's data from mongodb
//@route    GET /api/v1/user
//@access   Authenticated users
exports.getUserData = asyncHandler(async (req, res, next) => {
	const userData = await User.find({ firebaseUserId: req.user.uid });

	res.status(200).json({
		success: true,
		data: userData[0],
	});
});

//@desc     Save user's data to mongodb, created to be able to save guest user data since they sign in differently
//@route    POST /api/v1/user
//@access   Authenticated users
exports.saveUserData = asyncHandler(async (req, res, next) => {
	const { isAnonymous, metaData } = req.body;

	const saveUser = await User.create({
		firebaseUserId: req.user.uid,
		isAnonymous,
		metaData,
	});

	res.status(200).json({
		success: true,
		data: saveUser,
	});
});

//@desc     Update user's data from mongodb
//@route    PUT /api/v1/user
//@access   Authenticated users
exports.updateUserData = asyncHandler(async (req, res, next) => {
	const data = req.body;

	const updateUser = await User.findOneAndUpdate(
		{ firebaseUserId: req.user.uid },
		data,
		{ new: true }
	);

	res.status(200).json({
		success: true,
		data: updateUser,
	});
});
