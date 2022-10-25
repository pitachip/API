const sgMail = require("@sendgrid/mail");

const sendGridMailer = async (mailOptions) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	const msg = {
		to: [mailOptions.toEmail, "info@pitachipphilly.com"],
		from: {
			email: "info@pitachipphilly.com",
			name: "Pita Chip",
		},
		templateId: mailOptions.templateId,
		subject: mailOptions.subject,
		dynamic_template_data: mailOptions.templateData,
	};

	await sgMail.send(msg);
};

module.exports = sendGridMailer;
