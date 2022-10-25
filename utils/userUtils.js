const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

const findStripeIdByUserId = async (userId, next) => {
	try {
		const user = await User.find({ firebaseUserId: userId });
		return user[0].stripeCustomerId;
	} catch (error) {
		return next(new ErrorResponse(error, 500));
	}
};

exports.findStripeIdByUserId = findStripeIdByUserId;
