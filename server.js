const express = require("express");
const app = express();
const mongoose = require("./database/db");

// use req.body==>parsse req.body as json
app.use(express.json());

require("dotenv").config();

app.use("/api/", require("./routes/home"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
