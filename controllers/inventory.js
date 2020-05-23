//@desc     get all inventory items
//@route    GET /api/v1/inventory
//@access   Public
exports.getInventory = (req, res, next) => {
	res.status(200).json({ success: true, data: "Show all inventory items" });
};

//@desc     Get inventory item
//@route    GET /api/v1/inventory/:id
//@access   Public
exports.getInventoryItem = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Get inventory item ${req.params.id}` });
};

//@desc     Create new inventory item
//@route    POST /api/v1/inventory
//@access   Private
exports.createInventoryItem = async (req, res, next) => {
	res.status(200).json({ success: true, data: `Create inventory item` });
};

//@desc     Update inventory item
//@route    PUT /api/v1/inventory/:id
//@access   Private
exports.updateInventoryItem = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Update inventory item ${req.params.id}` });
};

//@desc     Delete inventory item
//@route    DELETE /api/v1/inventory/:id
//@access   Private
exports.deleteInventoryItem = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Delete inventory item ${req.params.id}` });
};
