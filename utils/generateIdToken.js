const axios = require("axios");
const ErrorResponse = require("../utils/errorResponse");

const getIdToken = async (email, password, next) => {
	try {
		const token = await axios.post(
			`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.GOOGLE_API_KEY}`,
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
