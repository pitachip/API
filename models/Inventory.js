const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true,
	},
	stripeProductId: {
		type: String,
		unique: true,
		required: true,
	},
	stripePriceId: {
		type: String,
		unique: true,
		required: true,
	},
});

module.exports = mongoose.model("Inventory", InventorySchema);
