const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
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
					name: customerInformation.name,
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

exports.findStripeCustomer = findStripeCustomer;
exports.createInvoiceItems = createInvoiceItems;
