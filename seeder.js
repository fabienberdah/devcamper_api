const fs = require("fs");
const mongoose = require("mongoose");

const colors = require("colors");
const dotenv = require("dotenv");

// load env vars
dotenv.config({
  path: "./config/config.env",
});

//load models
const Bootcamp = require("./models/Bootcamp");
const { CLIENT_RENEG_LIMIT } = require("tls");

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//Read JSON Files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

//import data into database
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log("Data imported...".rainbow);
  } catch (err) {
    console.error(err);
  }
};

//delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log("Data deleted from database".rainbow.inverse);
  } catch (err) {
    console.err(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}