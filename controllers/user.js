const User = require("../models/User");
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc     Get all users mongodb
//@route    GET /api/v1/user
//@access   Authenticated Admins
exports.getUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc     Get user's data from mongodb
//@route    GET /api/v1/user/:id
//@access   Authenticated Users
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.find({ firebaseUserId: req.params.id });
	if (user[0].firebaseUserId !== req.user.uid && !req.user.customClaims.admin) {
		return next(
			new ErrorResponse(
				`User ${req.user.uid} Not Authorized to Access User ${req.params.id}`,
				401
			)
		);
	}
	res.status(200).json({
		success: true,
		data: user,
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
