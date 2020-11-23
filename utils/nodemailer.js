const nodemailer = require("nodemailer");
const Email = require("email-templates");
const ErrorResponse = require("../utils/errorResponse");
const mustache = require("mustache");
const mjml = require("mjml");

const mailer = async (options, template, templateData) => {
	/**
	 * TODO
	 * Might not be able to figure out how to use the email templates way of doing things,
	 * Might just convert the mjml and send it through nodemailer like normal
	 * eventually it looks like Postmark is the industry standard for SMTP servers, which would
	 * be where we want to go in the future as we expand the apps
	 */
	const mailOptions = options;
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.MAILER_EMAIL,
			pass: process.env.MAILER_PASSWORD,
		},
	});

	const renderedMJML = mustache.render(template, templateData);

	const html = mjml(renderedMJML).html;

	let info = await transporter.sendMail({
		from: "Pita Chip <info@pitachipphilly.com>", // sender address
		to: "alsaadirend@gmail.com", // list of receivers
		subject: "Order Confirmation", // Subject line
		text: "Hello world?", // plain text body
		html: html, // html body
	});

	console.log("Message sent: %s", info.messageId);

	/*
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
	*/
};

module.exports = mailer;
