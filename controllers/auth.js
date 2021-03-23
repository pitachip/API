const firebase = require("firebase-admin");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { validateNewUser } = require("../utils/authValidation");
const { getIdToken } = require("../utils/generateIdToken");
const nodemailer = require("../utils/nodemailer");
const fs = require("fs");
const User = require("../models/User");

//@desc     Register new user
//@route    POST /api/v1/auth/register
//@access   Public
exports.registerNewUser = asyncHandler(async (req, res, next) => {
	const { firstName, lastName, email, password, role } = req.body;

	//Validate that required fields are included
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

		//Put user into mongo for reference and metadata storage
		const saveUser = await User.create({
			firebaseUserId: user.uid,
			metaData: {
				firstName,
				lastName,
				email,
			},
		});

		//Create a custom token for client-side sign in
		const token = await firebase.auth().createCustomToken(user.uid);

		res.status(200).json({
			success: true,
			token,
			user,
			metaData: saveUser.metaData,
		});
	}
});

//@desc     Sign in a user with a token
//@route    POST /api/v1/auth/signin
//@access   Public
exports.signin = asyncHandler(async (req, res, next) => {
	//TODO: Handle invalid creds
	const { email, password } = req.body;

	sendTokenResponse(email, password, res, next);
});

//@desc    	Get current user's information
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMyUserInfo = asyncHandler(async (req, res, next) => {
	const user = req.user;

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc    	Send user a password reset link
//@route    POST /api/v1/auth/resetpassword
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	const { email } = req.body;

	const passwordResetLink = await firebase
		.auth()
		.generatePasswordResetLink(email);

	const template = fs
		.readFileSync("./emails/passwordReset/passwordReset.mjml")
		.toString();

	const templateData = {
		passwordResetLink: passwordResetLink,
	};

	const mailOptions = {
		template,
		templateData,
		toEmail: email,
		subject: "Reset Password",
		text: "Password reset",
	};

	try {
		await nodemailer(mailOptions);

		res.status(200).json({
			success: true,
			data: "Password reset email sent",
		});
	} catch (error) {
		console.log(error);
		return next(new ErrorResponse("Error sending password reset email", 500));
	}
});

//@desc    	Update user's password
//@route    PUT /api/v1/auth/updatepassword
//@access   Private (authenticated users)
exports.updatePassword = asyncHandler(async (req, res, next) => {
	//TODO: could possibly make this for any updates and pass optional params in
	const { uid, password } = req.body;

	//Make sure user that went through protected middleware is the same as body
	if (uid !== req.user.uid) {
		return next(new ErrorResponse("Not authorized to change password", 401));
	}

	const response = await firebase.auth().updateUser(uid, { password });

	res.status(200).json({
		success: true,
		data: response,
	});
});

//@desc    	Update user roles & disabled flag
//@route    POST /api/v1/auth/updateroles
//@access   Private (authenticated users | admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
	const { uid, role, disabled } = req.body;
	let response;
	let updateMongoUser;

	if (role) {
		response = await firebase.auth().setCustomUserClaims(uid, {
			customer: role.customer ? true : false,
			manager: role.manager ? true : false,
			employee: role.employee ? true : false,
			admin: role.admin ? true : false,
		});
	}
	if (disabled || !disabled) {
		response = await firebase.auth().updateUser(uid, {
			disabled,
		});
		updateMongoUser = await User.findOneAndUpdate(
			{ firebaseUserId: uid },
			{ disabled },
			{ new: true }
		);
	}

	res.status(200).json({
		success: true,
		response,
		updateMongoUser,
	});
});

//@desc    	Get user's roles
//@route    GET /api/v1/auth/roles/:id
//@access   Private Authenticated admins
exports.getUserRoles = asyncHandler(async (req, res, next) => {
	const user = await firebase.auth().getUser(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

//Get token, create cookie and send response
const sendTokenResponse = async (email, password, res, next) => {
	const token = await getIdToken(email, password, next);

	const options = {
		httpOnly: true,
	};

	if (!token) {
		return next(new ErrorResponse("Invalid Credentials", 401));
	}

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	//TODO: change the name of the token based on the environment
	res.status(200).cookie(`${process.env.COOKIE_NAME}`, token, options).json({
		success: true,
		token,
	});
};
