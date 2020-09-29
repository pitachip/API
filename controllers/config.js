const Config = require("../models/Config");
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc     get all special orders
//@route    GET /api/v1/config
//@access   Public
exports.getConfig = asyncHandler(async (req, res, next) => {
	const config = await Config.find();

	res.status(200).json({
		success: true,
		data: config,
	});
});
