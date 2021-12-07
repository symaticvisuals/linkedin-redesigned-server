require("dotenv").config();
const uri = process.env.DB_URL;
const mongoose = require("mongoose");
const dbOptions = {
  maxPoolSize: 5,
};
mongoose.connect(uri, dbOptions, (err) => {
  if (err) {
    console.log("DB Connection Failed..", err);
  } else {
    console.log("Connection Created...");
  }
});
module.exports = mongoose;
