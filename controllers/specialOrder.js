const SpecialOrder = require("../models/SpecialOrder");
const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc     get all special orders
//@route    GET /api/v1/specialorder
//@access   Public
exports.getSpecialOrders = asyncHandler(async (req, res, next) => {
	let query;

	const reqQuery = { ...req.query };

	/**
	 * Fields to exclude because they are mongodb keywords
	 */
	const removeFields = ["select", "sort", "page", "limit"];

	//Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	let queryString = JSON.stringify(reqQuery);

	//Create operators like greater than, less than
	queryString = queryString.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	/**
	 * Find the resources
	 * Start by building the query object
	 */
	query = SpecialOrder.find(JSON.parse(queryString));

	//Select fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	//Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		//TODO: might want a default sort. Maybe not
	}

	//Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 2;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await SpecialOrder.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//Executing the query
	const specialorders = await query;

	//Pagination result
	const pagination = {};
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.status(200).json({
		success: true,
		count: specialorders.length,
		pagination,
		data: specialorders,
	});
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
