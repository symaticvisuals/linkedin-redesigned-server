module.exports = {
	SCHEMAS: {
		ADMIN: "admin",
		USER: "user",


	},
	TYPES: {
		student: "student",
		organization: "organization",
		company: "company",
	},
	USECASE: {
		project: "I want to use it for my project",
		company: "I want to use it for my company",
		organization: "I want to use it for my organization",
	},
	STATUS_CODES: {
		SUCCESS: 200,
		SERVER_ERROR: 500,
		FILE_NOT_FOUND: 404,
	},
	LOGIN_EXPIRE_TIME: 1 * 24 * 60 * 60 * 1000
};
