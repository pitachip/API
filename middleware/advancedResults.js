//This makes the advanced querying functionality very generic
const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	const reqQuery = { ...req.query };
	const user = req.user;

	//Fields to exclude
	const removeFields = ["select", "sort", "page", "limit"];

	//Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	let queryString = JSON.stringify(reqQuery);

	//Create operators like greater than, less than
	queryString = queryString.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	//Finding the resources
	query = model.find(JSON.parse(queryString));

	//Select fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	//Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		//Maybe do a default sort
	}

	//Check roles
	/**
	 * Customers should only be able to see their orders
	 * managers, and admins can see all
	 * Customer can only see what they're filtering on in terms of total documents for
	 * propper pagination
	 */
	let totalDocumentFilter = {};
	if (user.customClaims.customer) {
		query = query.find({ userId: user.uid });
		totalDocumentFilter.userId = user.uid;

		//append the rest of the nonreservered mongo keywords to the filter list. At this point all the keywords should be removed
		totalDocumentFilter = { ...totalDocumentFilter, ...reqQuery };
	} else if (user.customClaims.manager || user.customClaims.admin) {
		query = query.find(reqQuery);
		totalDocumentFilter = reqQuery;
	}

	//Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 4;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments(totalDocumentFilter);
	const totalPages = Math.ceil(total / limit);

	query = query.skip(startIndex).limit(limit);

	//Check if you need to populate another model in the result
	if (populate) {
		query.populate(populate);
	}

	//Executing the query
	const results = await query;

	//Pagination result
	const pagination = {};
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}
	pagination.totalPages = totalPages;
	pagination.totalOrders = total;
	pagination.limit = limit;

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
