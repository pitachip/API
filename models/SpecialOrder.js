const mongoose = require("mongoose");
var AutoIncrement = require("mongoose-sequence")(mongoose);

const SpecialOrderSchema = new mongoose.Schema({
	orderNumber: Number,
	userId: {
		type: String,
		required: [true, "User Id is required for Special Orders"],
	},
	customerInformation: {
		firstName: {
			type: String,
			required: [true, "First Name is Required"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Last Name is Required"],
			trim: true,
		},
		email: {
			type: String,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please use a valid email format",
			],
		},
		phoneNumber: String,
	},
	deliveryInformation: {
		firstName: {
			type: String,
			required: [true, "Contact Information for Delivery is Required"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Contact Information for Delivery is Required"],
			trim: true,
		},
		phoneNumber: {
			type: String,
			required: [true, "Contact Information for Delivery is Required"],
		},
		email: {
			type: String,
			required: [true, "Contact Information for Delivery is Required"],
		},
		address1: {
			type: String,
			required: [true, "Delivery Address is Required"],
		},
		address2: {
			type: String,
		},
		city: {
			type: String,
			required: [true, "City is Required"],
		},
		state: {
			type: String,
			required: [true, "State is Required"],
		},
		zip: {
			type: String,
			required: [true, "Zip is Required"],
		},
		deliveryInstructions: String,
	},
	paymentInformation: {
		paymentType: {
			type: String,
			required: [true, "Type of Payment is Required"],
			enum: ["cc", "check", "univ"],
		},
		taxExempt: {
			type: Boolean,
			required: [true, "Tax Exempt Status is Required"],
		},
		creditCardPaymentDetails: Object,
		taxExemptId: String,
		purchaseOrder: Boolean,
		purchaseOrderNumber: String,
		universityMoneyAccount: String,
		stripePaymentIntentId: String,
		invoiceId: String,
		invoiceNumber: String,
		stripeCustomerId: String,
		hosted_invoice_url: String,
		invoice_pdf: String,
	},
	orderItems: {
		type: [Object],
	},
	orderDetails: {
		location: String,
		orderDate: {
			type: String,
			required: [true, "Order Date is Required"],
		},
		shippingMethod: {
			type: String,
			required: [true, "Type of Shipping is Required"],
			enum: ["delivery", "pickup"],
		},
		specialInstructions: String,
	},
	orderTotals: {
		subTotal: Number,
		tax: Number,
		delivery: Number,
		total: Number,
	},
	status: {
		type: String,
		required: [true, "Status is Required"],
		enum: [
			"Submitted",
			"Confirmed",
			"Scheduled For Delivery",
			"Completed",
			"Canceled",
		],
	},
	createdAt: {
		type: Date,
		required: [true, "Created At is Required"],
		default: Date.now,
	},
});

SpecialOrderSchema.plugin(AutoIncrement, {
	inc_field: "orderNumber",
	start_seq: 1000,
	id: "ordeNumberSequencer",
});

module.exports = mongoose.model("SpecialOrder", SpecialOrderSchema);
