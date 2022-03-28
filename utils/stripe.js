const stripe = require("stripe")(process.env.STRIPE_KEY);
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

const findStripeCustomer = async (customerInformation, req, next) => {
	const user = req.user;
	try {
		const userMetaData = await User.find({ firebaseUserId: user.uid });

		//stripe customerID not found for firebase user
		if (!userMetaData[0].stripeCustomerId) {
			const lookForStripeCustomer = await stripe.customers.list({
				email: customerInformation.email,
			});

			//email doesn't exist in Stripe customer list
			if (_.isEmpty(lookForStripeCustomer.data)) {
				//create new stripe customer
				const createStripeCustomer = await stripe.customers.create({
					name:
						customerInformation.firstName + " " + customerInformation.lastName,
					email: customerInformation.email,
				});

				//update user metadata in mongodb
				const updateUser = await User.findOneAndUpdate(
					{ firebaseUserId: req.user.uid },
					{ stripeCustomerId: createStripeCustomer.id },
					{ new: true }
				);
				return createStripeCustomer.id;

				//email exists in Stripe but not in mongodb
			} else {
				//update user metadata in mongodb
				const updateUser = await User.findOneAndUpdate(
					{ firebaseUserId: req.user.uid },
					{ stripeCustomerId: lookForStripeCustomer.data[0].id },
					{ new: true }
				);
				return lookForStripeCustomer.data[0].id;
			}
			//stripecustomer id already exists for user
		} else {
			return userMetaData[0].stripeCustomerId;
		}
	} catch (error) {
		return next(new ErrorResponse(error, 500));
	}
};

const createInvoiceItems = async (orderItems, stripeCustomer, next) => {
	try {
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
	} catch (error) {
		return next(new ErrorResponse("Error Create Stripe Invoice Items", 500));
	}
};

const getPaymentIntent = async (paymentIntentId, next) => {
	try {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		return paymentIntent;
	} catch (error) {
		return next(new ErrorResponse("Error in getting payment intent", 500));
	}
};

const updateInvoiceDescription = async (
	invoiceId,
	description,
	paymentInformation,
	orderNumber
) => {
	try {
		await stripe.invoices.update(invoiceId, {
			description: description,
			footer: description,
			custom_fields: [
				{
					name: "Order Ref. #",
					value: orderNumber,
				},
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
	} catch (error) {
		console.log(error);
	}
};

const finalizeInvoice = async (invoiceId) => {
	try {
		return await stripe.invoices.finalizeInvoice(invoiceId);
	} catch (error) {
		console.log(error);
	}
};

exports.findStripeCustomer = findStripeCustomer;
exports.createInvoiceItems = createInvoiceItems;
exports.getPaymentIntent = getPaymentIntent;
exports.updateInvoiceDescription = updateInvoiceDescription;
exports.finalizeInvoice = finalizeInvoice;
