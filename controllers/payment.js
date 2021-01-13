const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const asyncHandler = require("../middleware/async");
const stripeUtility = require("../utils/stripe");
const _ = require("lodash");

//@desc     create payment intent to be used to charge customer via credit card
//@route    POST /api/v1/payment/intent
//@access   Public TODO: needs to be an authorized route for now its okay
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
	const { amount } = req.body;
	const paymentIntent = await stripe.paymentIntents.create({
		amount: amount,
		currency: "usd",
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
	const {
		contactInformation,
		orderItems,
		deliveryAndTax,
		paymentInformation,
	} = req.body;
	/**
	 * 2. TODO: go through the customer use cases
	 * 			(e.g. has portal account, has portal account/stripeID, guest on the portal, guest on the portal with stripeID)
	 */

	const stripeCustomer = await stripeUtility.findStripeCustomer(
		contactInformation,
		req,
		next
	);

	var promiseArray = [];

	_.each(orderItems, (orderItem) => {
		promiseArray.push(
			stripe.invoiceItems.create({
				customer: stripeCustomer,
				unit_amount: orderItem.basePrice,
				description: orderItem.name,
				currency: "usd",
				quantity: orderItem.quantity,
			})
		);
	});

	_.each(deliveryAndTax, (deliveryAndTaxItem) => {
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
		custom_fields: [
			{
				name: "PO#",
				value: paymentInformation.purchaseOrderNumber
					? paymentInformation.purchaseOrderNumber
					: "N/A",
			},
			{
				name: "Univ Acct. #",
				value: paymentInformation.universityMoneyAccount
					? paymentInformation.universityMoneyAccount
					: "N/A",
			},
			{
				name: "Tax Exempt ID",
				value: paymentInformation.taxExemptId
					? paymentInformation.taxExemptId
					: "N/A",
			},
		],
	});

	//finalize invoice
	const finalizeInvoice = await stripe.invoices.finalizeInvoice(newInvoice.id);

	res.status(200).json({
		success: true,
		data: finalizeInvoice,
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
