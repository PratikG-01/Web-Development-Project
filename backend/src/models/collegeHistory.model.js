const mongoose = require("mongoose");

const collegeHistorySchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
    },
    visitedCollegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    visitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitedDate: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const CollegeHistory = mongoose.model("CollegeHistory", collegeHistorySchema);

module.exports = CollegeHistory;
