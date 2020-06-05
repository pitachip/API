const validateNewUser = (req) => {
	const { firstName, lastName, email, password } = req.body;

	if (!firstName || !lastName || !email || !password) {
		return false;
	} else {
		return true;
	}
};

module.exports = {
	validateNewUser,
};
