const CollegeHistory = require("../models/collegeHistory.model.js");
const College = require("../models/collegeList.model");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const mongoose = require("mongoose");

exports.addCollegeToHistory = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;
  const userId = req.user._id;

  const visitedCollege = await CollegeHistory.findOne({
    visitedCollegeId: collegeId,
    visitedBy: userId,
  });
  // console.log(visitedCollege);
  if (visitedCollege) {
    const updateVistedCollege = await CollegeHistory.findOneAndUpdate(
      { visitedCollegeId: collegeId, visitedBy: userId },
      { $set: { visitedDate: Date.now() } },
      { new: true }
    );
    // console.log("Updated college visit date:", updateVistedCollege);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updateVistedCollege,
          "College visit date updated successfully"
        )
      );
  }

  const college = await College.findById(collegeId);

  const addedCollege = await CollegeHistory.create({
    visitedCollegeId: collegeId,
    visitedBy: userId,
    collegeName: college.name,
  });

  if (!addedCollege) {
    throw new ApiError(500, "Failed to add college to history");
  }

  // console.log("Added college to history:", addedCollege);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addedCollege,
        "College added to history successfully"
      )
    );
});

exports.getCollegeHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // console.log(userId);
  let pageNumber = parseInt(req.query.page) || 0;
  let pageSize = 10;
  const skipValue = pageNumber * pageSize;
  const collegeHistory = await CollegeHistory.find({ visitedBy: userId })
    .sort({
      visitedDate: -1,
    })
    .skip(skipValue)
    .limit(pageSize);

  if (!collegeHistory) {
    throw new ApiError(404, "No college history found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        collegeHistory,
        "College history fetched successfully"
      )
    );
});

exports.getCollegeViewCount = asyncHandler(async (req, res) => {
  const result = await CollegeHistory.aggregate([
    {
      $group: {
        _id: "$visitedCollegeId",
        name: { $first: "$collegeName" },
        views: { $sum: 1 },
      },
    },
    {
      $sort: { views: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "College viewed count fetched successfully")
    );
});
