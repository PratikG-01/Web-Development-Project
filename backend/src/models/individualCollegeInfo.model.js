const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, default: "N/A" },
  email: { type: String, default: "N/A" },
  address: { type: String, default: "N/A" },
});

const collegeInfoSchema = new mongoose.Schema({
  name: { type: String, default: "N/A" },
  location: { type: String, default: "N/A" },
  affiliation: { type: String, default: "N/A" },
  type: { type: String, default: "N/A" },
  courses: { type: [String], default: [] },
  infrastructure: { type: [String], default: [] },
  website: { type: String, default: "N/A" },
  contactInfo: { type: contactInfoSchema, default: {} },
  image: { type: String, default: "N/A" },
  admission: { type: String, default: "N/A" },
  studentLife: { type: [String], default: [] },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
});

const CollegeInfo = mongoose.model("CollegeInfo", collegeInfoSchema);

module.exports = CollegeInfo;
