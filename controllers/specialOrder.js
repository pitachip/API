const SpecialOrder = require("../models/SpecialOrder");
const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const nodemailer = require("../utils/nodemailer");
const orderUtility = require("../utils/orderUtility");
const fs = require("fs");

//@desc     get all special orders
//@route    GET /api/v1/specialorder
//@access   Public
exports.getSpecialOrders = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc     get single specialorder
//@route    GET /api/v1/specialorder/:id
//@access   Public
exports.getSpecialOrder = asyncHandler(async (req, res, next) => {
	const order = await SpecialOrder.findById(req.params.id);
	const user = req.user;
	if (order.userId !== req.user.uid && !user.customClaims.admin) {
		return next(
			new ErrorResponse(
				`User ${req.user.uid} Not Authorized to Access Order ${req.params.id}`,
				401
			)
		);
	}
	res.status(200).json({ success: true, data: order });
});

//@desc     Create new special order
//@route    POST /api/v1/specialorder
//@access   Private
exports.createSpecialOrder = asyncHandler(async (req, res, next) => {
	var { specialOrder } = req.body;

	specialOrder = {
		...specialOrder,
		userId: req.user.uid,
		status: "Submitted",
	};

	//Save order to Mongo
	const newSpecialOrder = await SpecialOrder.create(specialOrder);

	res.status(201).json({
		success: true,
		data: newSpecialOrder,
	});

	//send confirmation email via nodemailer
	/**
	 * TODO:
	 * This is intentially bad. Will be switching how we send confirmation emails relatively soon
	 * so I don't want to spend too much time on this. Just something quick and dirty
	 */
	var template = "";
	if (
		newSpecialOrder.paymentInformation.paymentType === "cc" &&
		newSpecialOrder.orderDetails.shippingMethod === "delivery"
	) {
		template = fs
			.readFileSync("./emails/orderConfirmation/creditCardConfirmation.mjml")
			.toString();
	} else if (
		newSpecialOrder.paymentInformation.paymentType === "cc" &&
		newSpecialOrder.orderDetails.shippingMethod === "pickup"
	) {
		template = fs
			.readFileSync(
				"./emails/orderConfirmation/creditCardConfirmationPickup.mjml"
			)
			.toString();
	} else if (newSpecialOrder.orderDetails.shippingMethod === "delivery") {
		template = fs
			.readFileSync("./emails/orderConfirmation/invoiceConfirmation.mjml")
			.toString();
	} else {
		template = fs
			.readFileSync("./emails/orderConfirmation/invoiceConfirmationPickup.mjml")
			.toString();
	}

	newSpecialOrder.orderDetails.orderDate = new Date(
		newSpecialOrder.orderDetails.orderDate
	)
		.toLocaleString()
		.split(",")[0];

	const mailOptions = {
		template,
		templateData: newSpecialOrder,
		toEmail: newSpecialOrder.customerInformation.email,
		subject: `Confirmation Order#${newSpecialOrder.orderNumber}`,
		text: "Order Confirmation",
	};

	await nodemailer(mailOptions);
});

//@desc     Update specialorder
//@route    PUT /api/v1/specialorder/:id
//@access   Private
exports.updateSpecialOrder = asyncHandler(async (req, res, next) => {
	const { modifiedOrder } = req.body;
	const user = req.user;

	const order = await SpecialOrder.findById(req.params.id);
	if (order.userId !== req.user.uid && !user.customClaims.admin) {
		return next(
			new ErrorResponse(
				`User ${req.user.uid} Not Authorized to Access Order ${req.params.id}`,
				401
			)
		);
	}

	const modifyOrder = await SpecialOrder.findOneAndUpdate(
		{ _id: req.params.id },
		modifiedOrder,
		{ new: true }
	);

	res.status(201).json({
		success: true,
		data: modifyOrder,
	});
});

//@desc     Cancel a special order
//@route    DELETE /api/v1/specialorder/:id
//@access   Private
exports.cancelSpecialOrder = asyncHandler(async (req, res, next) => {
	const user = req.user;
	const { paymentStatus } = req.body;

	const order = await SpecialOrder.findById(req.params.id);
	if (order.userId !== req.user.uid && !user.customClaims.admin) {
		return next(
			new ErrorResponse(
				`User ${req.user.uid} Not Authorized to Cancel Order ${req.params.id}`,
				401
			)
		);
	}

	//Set the status of order to "cancelled" in mongo
	const cancelOrder = await SpecialOrder.findByIdAndUpdate(
		{ _id: req.params.id },
		{
			$set: {
				status: "Cancelled",
				"paymentInformation.paymentStatus": paymentStatus,
			},
		},
		{ new: true }
	);

	res.status(200).json({ success: true, data: cancelOrder });
});
