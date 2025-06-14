const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	console.log("Error in Middleware: ", err);
	error.message = err.message;

	//Mongoose id not found
	if (err.name === "CastError") {
		const message = `Object not found with id of ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	//Mongoose duplicate key
	if (err.code === 11000) {
		const message = "Duplicate invoice id entered";
		error = new ErrorResponse(message, 400);
	}

	//Mongoose validation error
	if (err.name === "ValidationError") {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server Error",
	});
};

module.exports = errorHandler;
