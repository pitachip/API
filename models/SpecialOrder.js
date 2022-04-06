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
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		phoneNumber: String,
		email: String,
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: String,
		deliveryInstructions: String,
	},
	pickupInformation: {
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: String,
		phoneNumber: String,
		email: String,
		pickupInstructions: String,
	},
	paymentInformation: {
		paymentType: {
			type: String,
			required: [true, "Type of Payment is Required"],
			enum: ["cc", "check", "univ"],
		},
		paymentStatus: {
			type: String,
			required: [true, "Payment Status is Required"],
			enum: ["Paid", "Pending", "Refunded", "Invoice Voided"],
		},
		taxExempt: {
			type: Boolean,
			required: [true, "Tax Exempt Status is Required"],
		},
		creditCardPaymentDetails: Object,
		invoicePaymentDetails: Object,
		taxExemptId: String,
		purchaseOrder: Boolean,
		purchaseOrderNumber: String,
		universityMoneyAccount: String,
		sendGridDateFormat: {
			type: String,
			default: "dddd, MMMM DD, YYYY",
		},
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
		fulfilledBy: String,
		deliveredBy: String,
		specialInstructions: String,
	},
	orderTotals: {
		subTotal: Number,
		tax: Number,
		delivery: Number,
		tip: Number,
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
			"Cancelled",
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
