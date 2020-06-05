const firebase = require("firebase-admin");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { validateNewUser } = require("../utils/authValidation");
const User = require("../models/User");

//@desc     Register new user
//@route    POST /api/v1/auth/register
//@access   Public
exports.registerNewUser = asyncHandler(async (req, res, next) => {
	const { firstName, lastName, email, password, role } = req.body;

	const isValid = validateNewUser(req);

	if (!isValid) {
		return next(new ErrorResponse("Please add required user fields", 401));
	} else {
		//Create user
		const user = await firebase.auth().createUser({
			email,
			password,
			displayName: `${firstName} ${lastName}`,
			disabled: false,
		});

		//assign user roles
		//TODO: Might want to protect the ability to make admin users more
		await firebase.auth().setCustomUserClaims(user.uid, {
			customer: role.customer ? true : false,
			manager: role.manager ? true : false,
			employee: role.employee ? true : false,
			admin: role.admin ? true : false,
		});

		//Send back the token that they can signin with token and get a token id to be used on future server requests
		const token = await firebase.auth().createCustomToken(user.uid);

		//Put user into mongo for reference and metadata storage
		await User.create({
			firebaseUserId: user.uid,
		});

		res.status(200).json({
			success: true,
			token,
		});
	}
});

//@desc     Sign in a user with a token
//@route    POST /api/v1/auth/signin
//@access   Public
exports.signin = asyncHandler(async (req, res, next) => {
	const { token } = req.body;

	//Verify signin token that was sent
	const veryifyToken = await firebase.auth().verifyIdToken(token);

	res.status(200).json({
		success: true,
		data: veryifyToken,
	});
});
