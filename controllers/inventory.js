const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const inventory = require("../models/Inventory");

/**
 * TODO: Don't think I need any of the inventory stuff sadly.
 * Take out from code, and delete the table in mongo
 */

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
	const { name, type, active, description, shippable, price } = req.body;

	try {
		const newProduct = await stripe.products.create({
			name,
			type,
			active,
			description,
			shippable,
		});
		const newPrice = await stripe.prices.create({
			unit_amount: price,
			currency: "usd",
			product: newProduct.id,
		});
		//add produc/price object into mongo inventory db.
		const newInventory = await inventory.create({
			name,
			stripeProductId: newProduct.id,
			stripePriceId: newPrice.id,
		});
		res.status(201).json({ success: true, data: newInventory });
	} catch (err) {
		res.status(400).json({ success: false, message: err });
	}
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
