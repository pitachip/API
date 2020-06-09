const { auth } = require("firebase-admin");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const _ = require("lodash");

exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	/*
    else if(req.cookies.token){
        token = req.cookies.token
    }
    */

	//Make sure token exists
	if (!token) {
		return next(new ErrorResponse("Not authorized", 401));
	}

	//Verify token & set user data
	try {
		const verifiedToken = await auth().verifyIdToken(token);

		req.user = await auth().getUser(verifiedToken.uid);

		next();
	} catch (error) {
		return next(new ErrorResponse("Not authorized", 401));
	}
});

//Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		let userPermissionsArray = [];
		_.forOwn(req.user.customClaims, (value, key) => {
			if (value === true) {
				userPermissionsArray.push(key);
			}
		});
		if (_.isEmpty(_.intersectionWith(roles, userPermissionsArray))) {
			return next(new ErrorResponse("Access Not authorized", 403));
		}
		next();
	};
};
