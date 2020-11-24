const nodemailer = require("nodemailer");
const Email = require("email-templates"); //TODO: might not need this anymore
const ErrorResponse = require("../utils/errorResponse");
const mustache = require("mustache");
const mjml = require("mjml");

const mailer = async (toEmail, template, templateData) => {
	/**
	 * TODO
	 * Might not be able to figure out how to use the email templates way of doing things,
	 * Might just convert the mjml and send it through nodemailer like normal
	 * eventually it looks like Postmark is the industry standard for SMTP servers, which would
	 * be where we want to go in the future as we expand the apps
	 */
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
		to: toEmail, // list of receivers
		subject: "Order Confirmation", // Subject line
		text: "Order Confirmation", // plain text body
		html: html, // html body
	});
};

module.exports = mailer;
