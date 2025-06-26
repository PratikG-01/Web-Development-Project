const route = require("express").Router();
const collegeHistoryController = require("../controllers/collegeHistory.controller.js");
const auth = require("../middlewares/auth.js");

route.post(
  "/history/:collegeId",
  auth.verifyJWT,
  collegeHistoryController.addCollegeToHistory
);
route.get(
  "/history",
  auth.verifyJWT,
  collegeHistoryController.getCollegeHistory
);

route.get("/history/views", collegeHistoryController.getCollegeViewCount);

module.exports = route;
