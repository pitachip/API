const axios = require("axios");
const ErrorResponse = require("../utils/errorResponse");

const getIdToken = async (email, password, next) => {
	try {
		const token = await axios.post(
			"https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCrsDcLr2hRM2-H4h0LDGd5eolrMQPCbXM",
			{
				email,
				password,
				returnSecureToken: true,
			}
		);
		return token.data.idToken;
	} catch (error) {
		return next(new ErrorResponse("Invalid Credentials", 401));
	}
};

module.exports = {
	getIdToken,
};
