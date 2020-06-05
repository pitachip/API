const firebase = require("firebase-admin");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { validateNewUser } = require("../utils/authValidation");

//@desc     Register new user
//@route    POST /api/v1/auth/register
//@access   Public
exports.registerNewUser = asyncHandler(async (req, res, next) => {
	const { firstName, lastName, email, password } = req.body;

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

		await firebase.auth().setCustomUserClaims(user.uid, {
			customer: true,
			admin: false,
			manager: false,
			employee: false,
		});

		//Send back the token that they can store in cookies
		const token = await firebase.auth().createCustomToken(user.uid);

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
