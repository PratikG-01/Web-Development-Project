const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({}, { strict: false });

const College = mongoose.model("College", collegeSchema, "Colleges");

module.exports = College;
