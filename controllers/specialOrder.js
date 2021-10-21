const SpecialOrder = require("../models/SpecialOrder");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const nodemailer = require("../utils/nodemailer");
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

	//Formatting the date and time
	newSpecialOrder.orderDetails.orderDate = new Date(
		newSpecialOrder.orderDetails.orderDate
	).toLocaleString();

	console.log(
		"Date String for email: ",
		newSpecialOrder.orderDetails.orderDate
	);

	const mailList = [
		"info@pitachipphilly.com",
		newSpecialOrder.customerInformation.email,
	];

	const mailOptions = {
		template,
		templateData: newSpecialOrder,
		toEmail: mailList,
		subject: `Submitted Order#${newSpecialOrder.orderNumber}`,
		text: "Order Confirmation",
	};

	await nodemailer(mailOptions);
});

//@desc     Update specialorder
//@route    PUT /api/v1/specialorder/:id
//@access   Private
exports.updateSpecialOrder = asyncHandler(async (req, res, next) => {
	const { modifiedOrder, sendEmail } = req.body;
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

	if (sendEmail) {
		//send confirmation email via nodemailer
		/**
		 * TODO:
		 * This is intentially bad. Will be switching how we send confirmation emails relatively soon
		 * so I don't want to spend too much time on this. Just something quick and dirty
		 */
		var template = "";
		if (
			modifyOrder.paymentInformation.paymentType === "cc" &&
			modifyOrder.orderDetails.shippingMethod === "delivery"
		) {
			template = fs
				.readFileSync(
					"./emails/orderConfirmation/creditCardConfirmationModified.mjml"
				)
				.toString();
		} else if (
			modifyOrder.paymentInformation.paymentType === "cc" &&
			modifyOrder.orderDetails.shippingMethod === "pickup"
		) {
			template = fs
				.readFileSync(
					"./emails/orderConfirmation/creditCardConfirmationPickupModified.mjml"
				)
				.toString();
		} else if (modifyOrder.orderDetails.shippingMethod === "delivery") {
			template = fs
				.readFileSync(
					"./emails/orderConfirmation/invoiceConfirmationModified.mjml"
				)
				.toString();
		} else {
			template = fs
				.readFileSync(
					"./emails/orderConfirmation/invoiceConfirmationPickupModified.mjml"
				)
				.toString();
		}

		modifyOrder.orderDetails.orderDate = new Date(
			modifyOrder.orderDetails.orderDate
		).toLocaleString();

		const mailList = [
			"info@pitachipphilly.com",
			modifyOrder.customerInformation.email,
		];

		const mailOptions = {
			template,
			templateData: modifyOrder,
			toEmail: mailList,
			subject: `${modifyOrder.status} Order#${modifyOrder.orderNumber}`,
			text: "Order Confirmation",
		};

		await nodemailer(mailOptions);
	}
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
