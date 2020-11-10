const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const asyncHandler = require("../middleware/async");

//@desc     create Stripe session for pre-built UI payment checkout
//@route    POST /api/v1/payment/session
//@access   Public TODO: needs to be an authorized route for now its okay
exports.createStripeSession = asyncHandler(async (req, res, next) => {
	const { email } = req.body;
	const YOUR_DOMAIN = "http://localhost:3000/checkout";
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [{ price: "price_1HlbeiJuHI1QTbxdfQpT0CVt", quantity: 1 }],
		mode: "payment",
		success_url: `${YOUR_DOMAIN}/confirmation?success=true`,
		cancel_url: `${YOUR_DOMAIN}/payment?canceled=true`,
		customer_email: email,
	});
	res.status(200).json({
		success: true,
		data: session.id,
	});
});
