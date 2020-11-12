const stripe = require("stripe")("sk_test_lG00dXwz3Cpz3Z1TIwdNLL7c"); //TODO: need to use environment variables here
const asyncHandler = require("../middleware/async");

//@desc     create Stripe session for pre-built UI payment checkout
//@route    POST /api/v1/payment/session
//@access   Public TODO: needs to be an authorized route for now its okay
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
	const { amount } = req.body;
	const paymentIntent = await stripe.paymentIntents.create({
		amount: amount,
		currency: "usd",
	});

	res.status(200).json({
		success: true,
		data: paymentIntent.client_secret,
	});
});
