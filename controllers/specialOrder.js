const SpecialOrder = require("../models/SpecialOrder");
const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const _ = require("lodash");

//@desc     get all special orders
//@route    GET /api/v1/specialorder
//@access   Public
exports.getSpecialOrders = (req, res, next) => {
	res.status(200).json({ success: true, data: "Show all special orders" });
};

//@desc     get single specialorder
//@route    GET /api/v1/specialorder/:id
//@access   Public
exports.getSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Get special order ${req.params.id}` });
};

//@desc     Create new special order
//@route    POST /api/v1/specialorder
//@access   Private
exports.createSpecialOrder = async (req, res, next) => {
	const { customerInformation, orderItems } = req.body;
	try {
		/**
		 * 1. TODO: get customerID see if customer already exists with that email,
		 * 			if not, need to create them and then save that value in the userDB wherever that ends up being
		 * 2. TODO: just get the total price and create an invoice line item with that
		 * 3. TODO: Create invoice with that customer and that newly created line item
		 * 4. TODO: modify req object with newly created data and put it into mongo.
		 */
		const stripeCustomerList = await stripe.customers.list({
			email: customerInformation.email,
		});

		_.each(orderItems, async (orderItem) => {
			const lineItemTotal = orderItem.quantity * orderItem.pricePerUnit * 100; //invoice is calculated in cents
			await stripe.invoiceItems.create({
				customer: stripeCustomerList.data[0].id,
				unit_amount: orderItem.pricePerUnit * 100,
				description: orderItem.item,
				currency: "usd",
				quantity: orderItem.quantity,
			});
		});

		const newInvoice = await stripe.invoices.create({
			customer: stripeCustomerList.data[0].id,
		});

		res.status(201).json({
			success: true,
			data: newInvoice,
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err });
		console.log(`Error: ${err}`.bold.red);
	}
};

//@desc     Update specialorder
//@route    PUT /api/v1/specialorder/:id
//@access   Private
exports.updateSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Update special order ${req.params.id}` });
};

//@desc     Delete specialorder
//@route    DELETE /api/v1/specialorder/:id
//@access   Private
exports.deleteSpecialOrder = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: `Delete special order ${req.params.id}` });
};
