const stripeUtility = require("./stripe");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const ErrorResponse = require("./errorResponse");
const SpecialOrder = require("../models/SpecialOrder");
const nodemailer = require("./nodemailer");
const { update } = require("../models/SpecialOrder");

const invoiceUpdate = async (
	req,
	orderItems,
	customerInformation,
	order,
	next
) => {
	//find the stripe customer
	const stripeCustomer = await stripeUtility.findStripeCustomer(
		customerInformation,
		req,
		next
	);

	//void the invoice
	const voidInvoice = await stripe.invoices.voidInvoice(order.invoiceId);

	//create new invoice with updated order items
	await stripeUtility.createInvoiceItems(orderItems, stripeCustomer, next);

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

	//update record in mongodb
	var specialOrder = req.body;
	specialOrder = {
		...specialOrder,
		invoiceId: finalizeInvoice.id,
		invoiceNumber: finalizeInvoice.number,
		stripeCustomerId: finalizeInvoice.customer,
		hosted_invoice_url: finalizeInvoice.hosted_invoice_url,
		invoice_pdf: finalizeInvoice.invoice_pdf,
	};

	const updatedSpecialOrder = await SpecialOrder.findByIdAndUpdate(
		req.params.id,
		specialOrder,
		{ new: true }
	);

	return updatedSpecialOrder;
};

//TODO: Send a nodemailer
const nonInvoiceUpdate = async (
	req,
	orderItems,
	customerInformation,
	order,
	next
) => {
	//update record in mongodb
	var specialOrder = req.body;
	const updatedSpecialOrder = await SpecialOrder.findByIdAndUpdate(
		req.params.id,
		specialOrder,
		{ new: true }
	);
	return updatedSpecialOrder;
};

exports.invoiceUpdate = invoiceUpdate;
exports.nonInvoiceUpdate = nonInvoiceUpdate;
