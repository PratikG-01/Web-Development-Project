const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = require("./app");
const mongoose = require("mongoose");
const connectDb = require("./DATABASE/mongo");

connectDb()
  .then(
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })
  )
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit the process with failure
  });
