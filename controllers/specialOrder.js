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
//@access   Public
exports.createSpecialOrder = async (req, res, next) => {
	const { customerInformation, orderItems } = req.body;
	try {
		/**
		 * 1. TODO: get customerID see if customer already exists with that email,
		 * 			if not, need to create them and then save that value in the userDB wherever that ends up being
		 * 2. TODO: go through the customer use cases
		 * 			(e.g. has portal account, has portal account/stripeID, guest on the portal, guest on the portal with stripeID)
		 * 3. Probably need to refactor this a bit into a utility.
		 */
		const stripeCustomerList = await stripe.customers.list({
			email: customerInformation.email,
		});

		/**
		 * TODO: not high priorty but I can't find a great way to
		 * add the modifers in the invoice without going through callback hell
		 */
		var promiseArray = [];

		_.each(orderItems, (orderItem) => {
			promiseArray.push(
				stripe.invoiceItems.create({
					customer: stripeCustomerList.data[0].id,
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
			customer: stripeCustomerList.data[0].id,
			auto_advance: false,
			collection_method: "send_invoice",
			days_until_due: 45,
		});

		//send invoice
		const sendInvoice = await stripe.invoices.sendInvoice(newInvoice.id);

		//Put into Mongo
		var specialOrder = req.body;
		specialOrder = {
			...specialOrder,
			invoiceId: sendInvoice.id,
			stripeCustomerId: sendInvoice.customer,
			hosted_invoice_url: sendInvoice.hosted_invoice_url,
			invoice_pdf: sendInvoice.invoice_pdf,
		};

		const newSpecialOrder = await SpecialOrder.create(specialOrder);

		res.status(201).json({
			success: true,
			data: newSpecialOrder,
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
	/**
	 * This is going to be a pain because we have to
	 * void and create a new invoice
	 */
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
