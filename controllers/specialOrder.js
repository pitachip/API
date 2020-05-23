const SpecialOrder = require("../models/SpecialOrder");

//@desc     get all special orders
//@route    GET /api/v1/specialorder
//@access   Public
exports.getSpecialOrders = (req, res, next) => {
	res.status(200).json({ success: true, data: "Show all special orders" });
};

//@desc     get single specialorder
//@route    GET /api/v1/specialorder/:id
//@access   Public
exports.getSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Get special order ${req.params.id}` });
};

//@desc     Create new special order
//@route    POST /api/v1/specialorder
//@access   Private
exports.createSpecialOrder = async (req, res, next) => {
	try {
		const specialOrder = await SpecialOrder.create(req.body);

		res.status(201).json({
			success: true,
			data: specialOrder,
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err });
		console.log(`Error: ${err}`.bold.red);
	}
};

//@desc     Update specialorder
//@route    PUT /api/v1/specialorder/:id
//@access   Private
exports.updateSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Update special order ${req.params.id}` });
};

//@desc     Delete specialorder
//@route    DELETE /api/v1/specialorder/:id
//@access   Private
exports.deleteSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Delete special order ${req.params.id}` });
};
