const stripe = require("stripe")(process.env.STRIPE_KEY);
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const userUtility = require("../utils/userUtils");
const _ = require("lodash");
const SpecialOrder = require("../models/SpecialOrder");

//@desc     create payment intent to be used to charge customer via credit card
//@route    POST /api/v1/payment/intent
//@access   Public TODO: needs to be an authorized route for now its okay
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
	const { amount, description } = req.body;
	const paymentIntent = await stripe.paymentIntents.create({
		amount: amount,
		currency: "usd",
		description: description,
	});

	res.status(200).json({
		success: true,
		data: paymentIntent.client_secret,
	});
});

//@desc     create invoice
//@route    POST /api/v1/payment/invoice
//@access   Private: Authenticated users
exports.createInvoice = asyncHandler(async (req, res, next) => {
	const { contactInformation, orderItems, deliveryTaxTip } = req.body;

	const stripeCustomer = await stripeUtility.findStripeCustomer(
		contactInformation,
		req,
		next
	);

	var promiseArray = [];

	_.each(orderItems, (orderItem) => {
		let modifierTotal = 0;
		_.each(orderItem.modifiers, (modifier) => {
			_.each(modifier.modifierChoices, (modifierChoice) => {
				modifierTotal = +(modifierTotal + modifierChoice.price).toFixed(2);
			});
		});
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomer,
				unit_amount: orderItem.basePrice + modifierTotal,
				description: orderItem.name,
				currency: "usd",
				quantity: orderItem.quantity,
			})
		);
	});

	_.each(deliveryTaxTip, (deliveryAndTaxItem) => {
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomer,
				unit_amount: deliveryAndTaxItem.basePrice,
				description: deliveryAndTaxItem.name,
				currency: "usd",
				quantity: deliveryAndTaxItem.quantity,
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

	res.status(200).json({
		success: true,
		data: newInvoice,
	});
});

//@desc     update invoice
//@route    PUT /api/v1/payment/invoice
//@access   Private: Authenticated users
exports.updateInvoice = asyncHandler(async (req, res, next) => {
	const { orderItems, deliveryTaxTip, userId } = req.body;

	const stripeCustomerId = await userUtility.findStripeIdByUserId(userId, next);

	var promiseArray = [];

	_.each(orderItems, (orderItem) => {
		let modifierTotal = 0;
		_.each(orderItem.modifiers, (modifier) => {
			_.each(modifier.modifierChoices, (modifierChoice) => {
				modifierTotal = +(modifierTotal + modifierChoice.price).toFixed(2);
			});
		});
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomerId,
				unit_amount: orderItem.basePrice + modifierTotal,
				description: orderItem.name,
				currency: "usd",
				quantity: orderItem.quantity,
			})
		);
	});

	_.each(deliveryTaxTip, (deliveryAndTaxItem) => {
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomerId,
				unit_amount: deliveryAndTaxItem.basePrice,
				description: deliveryAndTaxItem.name,
				currency: "usd",
				quantity: deliveryAndTaxItem.quantity,
			})
		);
	});

	//put all promises in an array and wait till they are done executing.
	await Promise.all(promiseArray);

	//create invoice
	const newInvoice = await stripe.invoices.create({
		customer: stripeCustomerId,
		collection_method: "send_invoice",
		days_until_due: 45,
	});

	res.status(200).json({
		success: true,
		data: newInvoice,
	});
});

//@desc     get payment intent for completed payments
//@route    GET /api/v1/payment/intent/:id
//@access   Private: Authenticated users
exports.getPaymentIntent = asyncHandler(async (req, res, next) => {
	const paymentIntent = await stripeUtility.getPaymentIntent(
		req.params.id,
		next
	);

	res.status(200).json({
		success: true,
		data: paymentIntent,
	});
});

//@desc     POST refund for a credit card
//@route    POST /api/v1/payment/refund/creditcard
//@access   Private: Authenticated users
/**
 * TODO
 * make sure that only admin and person whose order it is can submit a refund, otherwise, unauthorized
 */
exports.refundCreditCard = asyncHandler(async (req, res, next) => {
	const { paymentIntentId } = req.body;

	const refund = await stripe.refunds.create({
		payment_intent: paymentIntentId,
	});

	res.status(200).json({
		success: true,
		data: refund,
	});
});

//@desc     POST void invoice
//@route    POST /api/v1/payment/refund/invoice
//@access   Private: Authenticated users
/**
 * TODO
 * make sure that only admin and person whose order it is can void an invoice, otherwise, unauthorized
 */
exports.voidInvoice = asyncHandler(async (req, res, next) => {
	const { invoiceId } = req.body;

	const voidInvoice = await stripe.invoices.voidInvoice(invoiceId);

	res.status(200).json({
		success: true,
		data: voidInvoice,
	});
});

//@desc     POST mark invoice as paid
//@route    POST /api/v1/payment/invoice/:id/paid
//@access   Private: Authenticated Managers and Admins
exports.markInvoicePaid = asyncHandler(async (req, res, next) => {
	const { orderId } = req.body;
	const paidInvoice = await stripe.invoices.pay(req.params.id, {
		paid_out_of_band: true,
	});

	const updateOrder = await SpecialOrder.findOneAndUpdate(
		{ _id: orderId },
		{
			"paymentDetails.invoicePaymentDetails": paidInvoice,
			"paymentInformation.paymentStatus": "Paid",
		},
		{ new: true }
	);

	res.status(200).json({
		success: true,
		data: updateOrder,
	});
});
