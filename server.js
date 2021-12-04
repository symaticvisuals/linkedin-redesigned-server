const express = require("express");
const app = express();
const mongoose = require("./database/db");

require("dotenv").config();

app.use("/", require("./routes/home"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
