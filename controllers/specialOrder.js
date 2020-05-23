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
exports.createSpecialOrder = (req, res, next) => {
	res.status(200).json({ success: true, data: "Create new special order" });
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
