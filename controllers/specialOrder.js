const SpecialOrder = require("../models/SpecialOrder");
const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const nodemailer = require("../utils/nodemailer");
const orderUtility = require("../utils/orderUtility");

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
	const response = await SpecialOrder.findById(req.params.id);
	res.status(200).json({ success: true, data: response });
});

//@desc     Create new special order
//@route    POST /api/v1/specialorder
//@access   Private
exports.createSpecialOrder = asyncHandler(async (req, res, next) => {
	var specialOrder = req.body.order;
	specialOrder = {
		...specialOrder,
		userId: req.user.uid,
		status: "Submitted",
	};

	const newSpecialOrder = await SpecialOrder.create(specialOrder);

	res.status(201).json({
		success: true,
		data: newSpecialOrder,
	});
	/*
	const { customerInformation, orderItems } = req.body;
	/**
	 * 2. TODO: go through the customer use cases
	 * 			(e.g. has portal account, has portal account/stripeID, guest on the portal, guest on the portal with stripeID)
	 */

	/*
	const stripeCustomer = await stripeUtility.findStripeCustomer(
		customerInformation,
		req,
		next
	);

	/**
	 * TODO: not high priorty but I can't find a great way to
	 * add the modifers in the invoice without going through callback hell
	 */
	/*
	var promiseArray = [];

	_.each(orderItems, (orderItem) => {
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomer,
				unit_amount: orderItem.pricePerUnit * 100,
				description: orderItem.item,
				currency: "usd",
				quantity: orderItem.quantity,
			})
		);
	});

	//put all promises in an array and wait till they are done executing.
	await Promise.all(promiseArray);

	//create invoice
	const newInvoice = await stripe.invoices.create({
		customer: stripeCustomer,
		collection_method: "send_invoice",
		days_until_due: 45,
	});

	//finalize invoice
	const finalizeInvoice = await stripe.invoices.finalizeInvoice(newInvoice.id);

	//send invoice via nodemailer
	const mailOptions = {
		template: "specialOrder",
		toEmail: customerInformation.email,
		locals: {
			orderNumber: finalizeInvoice.number,
			customerName: customerInformation.name,
			invoiceUrl: finalizeInvoice.hosted_invoice_url,
		},
	};
	await nodemailer(mailOptions);
	*/
});

//@desc     Update specialorder
//@route    PUT /api/v1/specialorder/:id
//@access   Private
exports.updateSpecialOrder = asyncHandler(async (req, res, next) => {
	/**
	 * 5.TODO: maybe we put voided invoices in an array for tracking
	 *
	 * case for updating items that would require an invoice update
	 * 		-customer information
	 * 		-order items
	 * case for updating items that would not require an invoice update
	 * 		-delivery information
	 * 		-payment type
	 * 		-status
	 */
	let updatedOrder;
	const { orderItems, customerInformation, updateType } = req.body;
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

	if (!updateType) {
		return next(new ErrorResponse("Type of update needs to be specified", 500));
	}

	/**
	 * check the type of update that needs to be made
	 *
	 * case for updating items that would require an invoice update
	 * 		-customer information
	 * 		-order items
	 * case for updating items that would not require an invoice update
	 * 		-delivery information
	 * 		-payment type
	 * 		-status
	 */
	switch (updateType) {
		case "INVOICE_UPDATE":
			updatedOrder = await orderUtility.invoiceUpdate(
				req,
				orderItems,
				customerInformation,
				order,
				next
			);
			return res.status(201).json({ success: true, data: updatedOrder });
		case "NON_INVOICE_UPDATE":
			updatedOrder = await orderUtility.nonInvoiceUpdate(
				req,
				orderItems,
				customerInformation,
				order,
				next
			);
			return res.status(200).json({ success: true, data: updatedOrder });
		default:
			return res.status(200).json({ success: true, data: " " });
	}
});

//@desc     Cancel a special order
//@route    DELETE /api/v1/specialorder/:id
//@access   Private
exports.deleteSpecialOrder = asyncHandler(async (req, res, next) => {
	const user = req.user;

	const order = await SpecialOrder.findById(req.params.id);
	if (order.userId !== req.user.uid && !user.customClaims.admin) {
		return next(
			new ErrorResponse(
				`User ${req.user.uid} Not Authorized to Cancel Order ${req.params.id}`,
				401
			)
		);
	}

	//Void the invoice
	const voidInvoice = await stripe.invoices.voidInvoice(order.invoiceId);

	//Set the status of order to "cancelled" in mongo
	const cancelOrder = await SpecialOrder.findByIdAndUpdate(
		req.params.id,
		{ status: "Cancelled" },
		{ new: true }
	);

	res.status(200).json({ success: true, data: cancelOrder });
});
