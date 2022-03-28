const SpecialOrder = require("../models/SpecialOrder");
const _ = require("lodash");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const nodemailer = require("../utils/nodemailer"); //delete once sendgrid is stable
const sendGridMailer = require("../utils/sendGridMailer");
const fs = require("fs"); //delete once sendgrid is stable

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

	/**
	 * Create a draft invoice
	 * Send draft invoice details to this endpoint
	 * save the order in mongo to get an orderNumber
	 * Add the description
	 * Finalize the invoice using a stripe utility
	 * Add the new invoice details to the object
	 * modify the special order object in mongo so it has the link
	 * add Order reference number to the list of custom fields
	 * add information to the footer as well
	 */

	//Save order to Mongo
	let newSpecialOrder = await SpecialOrder.create(specialOrder);

	//update the invoice description now that you have an order number
	if (newSpecialOrder.paymentInformation.paymentType !== "cc") {
		const invoiceDescription = `Attention Accounts Payable: When processing payment for this order, please reference order: #${newSpecialOrder.orderNumber}. The invoice number listed is subject to change after the initial order has been placed due to order modifications leading up to the delivery date.`;
		await stripeUtility.updateInvoiceDescription(
			newSpecialOrder.paymentInformation.invoicePaymentDetails.id,
			invoiceDescription,
			newSpecialOrder.paymentInformation,
			newSpecialOrder.orderNumber
		);

		const finalizedInvoice = await stripeUtility.finalizeInvoice(
			newSpecialOrder.paymentInformation.invoicePaymentDetails.id
		);

		newSpecialOrder.paymentInformation.invoicePaymentDetails = finalizedInvoice;

		newSpecialOrder = await SpecialOrder.findOneAndUpdate(
			{ _id: newSpecialOrder.id },
			newSpecialOrder,
			{ new: true }
		);
	}

	//Formatting the date and time
	newSpecialOrder.orderDetails.orderDate = new Date(
		newSpecialOrder.orderDetails.orderDate
	).toLocaleString("en-US", { timeZone: "America/New_York" });

	const mailOptions = {
		templateData: newSpecialOrder,
		toEmail: newSpecialOrder.customerInformation.email,
		subject: `Submitted Order# ${newSpecialOrder.orderNumber}`,
		templateId: "d-2d5d5f14a3f1458d914ac18cf2fadcf0",
	};

	await sendGridMailer(mailOptions);

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

	/*
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
	*/
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

	if (modifiedOrder.paymentInformation.paymentType !== "cc") {
		const invoiceDescription = `Attention Accounts Payable: When processing payment for this order, please reference order: #${order.orderNumber}. The invoice number listed is subject to change after the initial order has been placed due to order modifications leading up to the delivery date.`;
		await stripeUtility.updateInvoiceDescription(
			modifiedOrder.paymentInformation.invoicePaymentDetails.id,
			invoiceDescription,
			modifiedOrder.paymentInformation,
			order.orderNumber
		);

		const finalizedInvoice = await stripeUtility.finalizeInvoice(
			modifiedOrder.paymentInformation.invoicePaymentDetails.id
		);

		modifiedOrder.paymentInformation.invoicePaymentDetails = finalizedInvoice;
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
		).toLocaleString("en-US", { timeZone: "America/New_York" });

		const mailOptions = {
			templateData: modifyOrder,
			toEmail: modifyOrder.customerInformation.email,
			subject: `${modifyOrder.status} Order# ${modifyOrder.orderNumber}`,
			templateId: "d-8331a5ea5e8d439797d1adc632683a73",
		};

		await sendGridMailer(mailOptions);

		/*
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
		*/
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

	//Formatting the date and time
	cancelOrder.orderDetails.orderDate = new Date(
		cancelOrder.orderDetails.orderDate
	).toLocaleString("en-US", { timeZone: "America/New_York" });

	//Send Cancelation Email
	const mailOptions = {
		templateData: cancelOrder,
		toEmail: cancelOrder.customerInformation.email,
		subject: `Canceled Order# ${cancelOrder.orderNumber}`,
		templateId: "d-327a605483e444d586db38821c05420c",
	};

	await sendGridMailer(mailOptions);

	res.status(200).json({ success: true, data: cancelOrder });
});
