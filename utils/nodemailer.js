const nodemailer = require("nodemailer");
const Email = require("email-templates");
const ErrorResponse = require("../utils/errorResponse");

const mailer = async (options) => {
	//toEmail, orderNumber, customerName, invoiceUrl, next
	//Need to generalize this more and create mailOptions
	const mailOptions = options;
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.MAILER_EMAIL,
			pass: process.env.MAILER_PASSWORD,
		},
	});

	const email = new Email({
		transport: transporter,
		send: true,
		preview: false,
	});

	await email.send({
		template: mailOptions.template,
		message: {
			from: "Pita Chip <info@pitachipphilly.com>",
			to: mailOptions.toEmail,
		},
		locals: mailOptions.locals,
	});
};

module.exports = mailer;
