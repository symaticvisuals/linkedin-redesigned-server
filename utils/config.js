module.exports = {
	SCHEMAS: {
		ADMIN: "admin",
		USER: "user",
		POST: "Post"

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
	LOGIN_EXPIRE_TIME: 1 * 24 * 60 * 60 * 1000,
	OTP_EXPIRE_TIME: 1 * 24 * 60 * 60,
	dbCode: {
		inActive_by_admin: 0,
		active_by_admin: 1,
		emailAuthenticated: 1,
		email_not_Authenticated: 0,
		post_active_byAdmin: 1,
		post_Inactive_byAdmin: 0,
	},

};
