const mongoose = require("mongoose");

const collegeBucketSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CollegeBucket = mongoose.model("CollegeBucket", collegeBucketSchema);

module.exports = CollegeBucket;
