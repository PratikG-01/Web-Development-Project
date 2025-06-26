const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "https://search-college-in.netlify.app",
    credentials: true,
    secure: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ Message: "Welcome to the College API" });
});

const collegeList = require("./src/routes/CollegeList.route.js");
app.use("/api/colleges", collegeList);

const userRoute = require("./src/routes/user.route.js");
app.use("/api/user", userRoute);

const collegeHistory = require("./src/routes/CollegeHistory.route.js");
app.use("/api/viewedColleges", collegeHistory);

module.exports = app;
