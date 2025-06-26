const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.CLUSTER_URI);
    console.log("SUCCESSFULLY CONNECTED WITH THE DATABASE");
  } catch (err) {
    console.log("error connecting to the database : ", err);
    process.exit(1);
  }
};

module.exports = connectDb;
