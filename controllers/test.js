exports.getDefaultRoute = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, data: "Hello, World!", version: "v1.5.2" });
};
