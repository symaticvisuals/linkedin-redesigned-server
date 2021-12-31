const express = require("express");
const app = express();
const mongoose = require("./database/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');


const morgan = require("morgan");

morgan.token(
	"headers",
	(getHeaders = (req) => {
		// console.log(req);
	})
);
app.use(
	morgan(
		":method :url :status :response-time ms :req[content-length] B :headers"
	)
);

app.use(function (req, res, next) {
	res.header("Content-Type", "application/json;charset=UTF-8");
	res.header("Access-Control-Allow-Credentials", true);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	res.header("Access-Control-Allow-Credentials", true);
	next();
});

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));


// use req.body==>parsse req.body as json
app.use(express.json());

// Parse Cookie header and populate req.cookies
app.use(cookieParser());


// public folder for images and videos
app.use(express.static(path.join(__dirname,"public")));

require("dotenv").config();
app.use("/", require("./routes/test"));
app.use("/api/", require("./routes/home"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));


/**
 * error handling for page not found 404
 */
app.use((req,res,next)=>{
	const err = new Error('Route Not Found');
	res.status(404).json({
		success:false,
		message:err.message
	});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
