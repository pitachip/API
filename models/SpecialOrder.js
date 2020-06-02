const mongoose = require("mongoose");

const SpecialOrderSchema = new mongoose.Schema({
	customerInformation: {
		name: {
			type: String,
			required: [true, "Name is Required"],
			trim: true,
		},
		email: {
			type: String,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please use a valid email format",
			],
		},
		phoneNumber: Number,
	},
	deliveryInformation: {
		name: {
			type: String,
			required: [true, "Contact Information for Delivery is Required"],
			trim: true,
		},
		phoneNumber: {
			type: Number,
			required: [true, "Contact Information for Delivery is Required"],
		},
		deliveryAddress: {
			type: String,
			required: [true, "Delivery Address is Required"],
		},
		addressDetails: String,
		orderDate: {
			type: String,
			required: [true, "Order Data is Required"],
		},
		dropOffTime: {
			type: String,
			required: [true, "Dropoff Time is Required"],
		},
	},
	payment: {
		type: [String],
		required: [true, "Type of Payment is Required"],
		enum: [
			"Purchase Order",
			"Credit Card",
			"Check",
			"University Money Account",
		],
	},
	orderItems: {
		type: [Object],
	},
	invoiceId: String,
	stripeCustomerId: String,
	hosted_invoice_url: String,
	invoice_pdf: String,
	status: {
		type: String,
		required: [true, "Status is Required"],
		enum: ["Submitted", "Confirmed", "Scheduled For Delivery", "Completed"],
	},
});

module.exports = mongoose.model("SpecialOrder", SpecialOrderSchema);
