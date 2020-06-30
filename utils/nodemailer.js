const nodemailer = require("nodemailer");
const Email = require("email-templates");
const ErrorResponse = require("../utils/errorResponse");

const mailer = async (toEmail, orderNumber, customerName, invoiceUrl, next) => {
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

	try {
		const sendMail = await email.send({
			template: "specialOrder",
			message: {
				from: "Pita Chip <info@pitachipphilly.com>",
				to: toEmail,
			},
			locals: {
				customerName,
				orderNumber,
				invoiceUrl,
			},
		});
		//const sendMail = await transporter.sendMail(mailOptions);
		return sendMail;
	} catch (error) {
		return next(new ErrorResponse("Error sending password reset email", 500));
	}
};

module.exports = mailer;
