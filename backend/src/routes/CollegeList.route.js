const route = require("express").Router();
const collegeController = require("../controllers/collegeList.controller.js");
const auth = require("../middlewares/auth.js");

route.get("/", collegeController.showColleges);
route.get("/states", collegeController.collegeStates);
route.get("/:state", collegeController.collegeByState);

route.get("/search/:name", collegeController.searchColleges);
route.get("/searchCount/:name", collegeController.getCollegeCountForSearch);
route.get("/id/:collegeId", collegeController.getCollegeInfo);

route.get("/courses/all", collegeController.getCourses);
route.get("/courses/courseName/:courseName", collegeController.getSpecificCourseColleges);

route.get("/addToBucket/view", auth.verifyJWT, collegeController.collegeBucket);
route.post("/addToBucket/id/:collegeId", auth.verifyJWT, collegeController.addToCollegeBucket);
route.delete("/addToBucket/remove/:itemId", auth.verifyJWT, collegeController.removeFromCollegeBucket);
route.get("/addToBucket/checkCollege/:collegeId", auth.verifyJWT, collegeController.checkIfItsInBucketOrNot);

module.exports = route;
//