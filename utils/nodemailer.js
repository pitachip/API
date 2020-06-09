const nodemailer = require("nodemailer");
const ErrorResponse = require("../utils/errorResponse");

const mailer = async (toEmail, subject, body, next) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.MAILER_EMAIL,
			pass: process.env.MAILER_PASSWORD,
		},
	});

	const mailOptions = {
		from: '"Pita Chip" info@pitachipphilly.com',
		to: toEmail,
		subject: subject,
		html: `${body}`,
	};

	try {
		const sendMail = await transporter.sendMail(mailOptions);
		return sendMail;
	} catch (error) {
		return next(new ErrorResponse("Error sending password reset email", 500));
	}
};

module.exports = mailer;
