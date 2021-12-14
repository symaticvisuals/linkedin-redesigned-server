const express = require("express");
const app = express();
const mongoose = require("./database/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(function (req, res, next) {
	//Enabling CORS
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
	);
	next();
});
// use req.body==>parsse req.body as json
app.use(express.json());

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

require("dotenv").config();
app.use("/", require("./routes/test"));
app.use("/api/", require("./routes/home"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
