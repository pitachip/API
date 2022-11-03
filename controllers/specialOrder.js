const SpecialOrder = require("../models/SpecialOrder");
const _ = require("lodash");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const nodemailer = require("../utils/nodemailer"); //TODO: delete once sendgrid is stable
const sendGridMailer = require("../utils/sendGridMailer");
const fs = require("fs"); //TODO: delete once sendgrid is stable

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
	let newSpecialOrder = await SpecialOrder.create(specialOrder);

	/* 
	update the invoice description now that you have an order number. This has to be here and not /payment because an orderNumber has not been created yet. 
	to avoid this, I would need to make the special order first, then create the invoice, then update that special order. 
	*/
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

	//Formatting the dollar amounts
	newSpecialOrder.orderTotals.subTotal =
		+newSpecialOrder.orderTotals.subTotal.toFixed(2);
	newSpecialOrder.orderTotals.tax = +newSpecialOrder.orderTotals.tax.toFixed(2);
	newSpecialOrder.orderTotals.tip = +newSpecialOrder.orderTotals.tip.toFixed(2);
	newSpecialOrder.orderTotals.delivery =
		+newSpecialOrder.orderTotals.delivery.toFixed(2);
	newSpecialOrder.orderTotals.total =
		+newSpecialOrder.orderTotals.total.toFixed(2);

	//https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings

	const mailOptions = {
		templateData: newSpecialOrder,
		toEmail: newSpecialOrder.customerInformation.email,
		subject: `Submitted Order# ${newSpecialOrder.orderNumber}`,
		templateId: "d-11e5319b9ac04fb4b08f23c0d3abeff1",
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
		/*
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
		*/

		//Formatting the date/time
		modifyOrder.orderDetails.orderDate = new Date(
			modifyOrder.orderDetails.orderDate
		).toLocaleString("en-US", { timeZone: "America/New_York" });

		//Formatting the dollar amounts
		modifyOrder.orderTotals.subTotal.toFixed(2);
		modifyOrder.orderTotals.tax.toFixed(2);
		modifyOrder.orderTotals.tip.toFixed(2);
		modifyOrder.orderTotals.delivery.toFixed(2);
		modifyOrder.orderTotals.total.toFixed(2);

		const mailOptions = {
			templateData: modifyOrder,
			toEmail: modifyOrder.customerInformation.email,
			subject: `${modifyOrder.status} Order# ${modifyOrder.orderNumber}`,
			templateId: "d-2ca81be6ff004c9ebaaf716c93dd0bf4",
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
		templateId: "d-1e6c7198f5f043caa08ea464d27f0cc3",
	};

	await sendGridMailer(mailOptions);

	res.status(200).json({ success: true, data: cancelOrder });
});
