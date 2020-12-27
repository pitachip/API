const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
	menuType: String,
	categories: {
		type: [
			{
				title: String,
				description: String,
				items: [
					{
						name: {
							type: String,
							required: [true, "Name for Menu Item is Required"],
						},
						basePrice: {
							type: Number,
							required: [true, "Price for Menu Item is Required"],
						},
						itemMinimum: {
							type: Number,
							required: [true, "Item Minimum is Required"],
						},
						description: String,
						modifiers: [
							{
								name: String,
								price: Number,
								min_number_options: Number,
								max_number_options: Number,
								options: [
									{
										name: String,
										default: Boolean,
										price: Number,
									},
								],
							},
						],
					},
				],
			},
		],
	},
});

module.exports = mongoose.model("Menu", MenuSchema);
