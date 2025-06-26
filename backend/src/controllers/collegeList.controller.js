const College = require("../models/collegeList.model.js");
const CollegeInfo = require("../models/individualCollegeInfo.model.js");
const CollegeBucket = require("../models/collegeBucket.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const axios = require("axios");

exports.showColleges = asyncHandler(async (req, res) => {
  let pageNumber = parseInt(req.query.page) || 0;
  let pageSize = 20;

  const skipValue = pageNumber * pageSize;

  const colleges = await College.find().skip(skipValue).limit(pageSize);

  return res
    .status(200)
    .json(new ApiResponse(200, colleges, `Total colleges: ${colleges.length}`));
});

exports.collegeStates = asyncHandler(async (req, res) => {
  const results = await College.aggregate([
    { $group: { _id: "$state", count: { $sum: 1 } } },
    { $sort: { count: -1 } }, //
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, results, `Total states: ${results.length}`));
});

exports.collegeByState = asyncHandler(async (req, res) => {
  const state = req.params.state;
  let pageNumber = parseInt(req.query.page) || 0;
  let pageSize = 20;

  const skipValue = pageNumber * pageSize;

  const results = await College.find({ state: state })
    .skip(skipValue)
    .limit(pageSize);

  if (results.length === 0 && pageNumber != 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, `No colleges found in ${state}`));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        results,
        `Total colleges in ${state}: ${results.length}`
      )
    );
});

exports.searchColleges = asyncHandler(async (req, res) => {
  const name = req.params.name;
  let pageNumber = parseInt(req.query.page) || 0; // Default to 0 for the first page
  let pageSize = 20;

  // Calculate the skip value based on the pageNumber
  const skipValue = pageNumber * pageSize;

  // Query to fetch colleges based on name and pagination
  const colleges = await College.find({
    name: { $regex: name, $options: "i" },
  })
    .skip(skipValue)
    .limit(pageSize);

  // Get the total count of matching colleges to calculate the total pages
  const totalCount = await College.countDocuments({
    name: { $regex: name, $options: "i" },
  });

  const totalPages = Math.ceil(totalCount / pageSize); // Calculate total number of pages

  // If no colleges were found, handle it
  if (colleges.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, `No colleges found with name ${name}`));
  }

  // Return the response with pagination info
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        colleges,
        `Total colleges with name "${name}": ${totalCount}`
      )
    );
});

// exports.getCollegeInfo = asyncHandler(async (req, res) => {
//   const collegeName = req.params.name;
//   const response = await axios.post(
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
//       process.env.GEMINI_API_KEY,
//     {
//       contents: [
//         {
//           parts: [
//             {
//               text: `Give complete and structured information about the college "${collegeName}" in the following JSON format only:

// {
//   "name": "",
//   "location": "",
//   "affiliation": "",
//   "type": "",
//   "courses": [],
//   "infrastructure": [],
//   "website": "",
//   "contactInfo": {
//     "phone": "",
//     "email": "",
//     "address": ""
//   },
//   "image": "",
//   "admission": "",
//   "studentLife": []
// }

// If any field is not available, return "N/A" or an empty array.try harder to find website`,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   // Log the full response for debugging
//   // console.log("Response received:", response.data.candidates[0].content);

//   // Check if the response contains the expected content and parse it
//   if (
//     response.data &&
//     response.data.candidates &&
//     response.data.candidates[0] &&
//     response.data.candidates[0].content
//   ) {
//     console.log(response.data.candidates[0].content.parts[0].text);
//     // console.log(response.data.candidates[0].content.parts[0].text);
//     // Send back the parsed content in the response
//     return res.status(200).json({
//       status: "success",
//       data: response.data.candidates[0].content.parts[0].text,
//       message: `Details for college: ${collegeName}`,
//     });
//   } else {
//     // Handle cases where the response format is unexpected
//     return res.status(500).json({
//       status: "failed",
//       message: "Unexpected response format from Gemini API.",
//     });
//   }
// });

exports.getCollegeInfo = asyncHandler(async (req, res) => {
  const collegeId = req.params.collegeId;
  // console.log(collegeId);
  const collegeInfoFromVisitedColleges = await CollegeInfo.findOne({
    collegeId: collegeId,
  });

  if (collegeInfoFromVisitedColleges) {
    // console.log(`${collegeInfoFromVisitedColleges.name} found in database`);
    return res.status(200).json({
      status: "success",
      data: collegeInfoFromVisitedColleges,
      message: `Details for college: ${collegeInfoFromVisitedColleges.name}`,
    });
  }

  const collegeFromList = await College.findById(collegeId);

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      contents: [
        {
          parts: [
            {
              text: `Give complete and structured information about the college "${collegeFromList.name}", State - ${collegeFromList.state}, pincode - ${collegeFromList.pin_code}, city - ${collegeFromList.city},district - ${collegeFromList.district} in *strict* JSON format ONLY. No explanations, no markdown, no code blocks — just a valid JSON object like this:

{ 
  "name": "",
  "location": "",
  "affiliation": "",
  "type": "",
  "courses": [],
  "infrastructure": [],
  "website": "",
  "contactInfo": {
    "phone": "",
    "email": "",
    "address": ""
  },
  "image": "",
  "admission": "",
  "studentLife": []
}

If any field is missing or unknown, use "N/A" or an empty array.
Try harder to find the official website and contact information.`,
            },
          ],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const rawText =
    response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}") + 1;
    const jsonStr = rawText.substring(jsonStart, jsonEnd);

    const parsedData = JSON.parse(jsonStr);
    parsedData.collegeId = collegeFromList._id; // Add the collegeId to the parsed data

    await CollegeInfo.create(parsedData);
    // console.log(`${collegeFromList.name} added to database`);

    return res.status(200).json({
      status: "success",
      data: parsedData,
      message: `Details for college: ${collegeFromList.name}`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Failed to parse Gemini response as JSON.",
      error: error.message,
      raw: rawText,
    });
  }
});

exports.getCollegeCountForSearch = asyncHandler(async (req, res) => {
  const name = req.params.name;
  const count = await College.countDocuments({
    name: { $regex: name, $options: "i" },
  });
  if (count === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          404,
          { total: 0 },
          `No colleges found with name ${name}`
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { total: count },
        `Total colleges with name ${name}: ${count}`
      )
    );
});

exports.collegeBucket = asyncHandler(async (req, res) => {
  // const collegeId = req.params.collegeId;
  const page = parseInt(req.query.page) || 0;
  const limit = 20;
  const skip = page * limit;
  const colleges = await CollegeBucket.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res
    .status(200)
    .json(
      new ApiResponse(200, colleges, "College bucket fetched successfully")
    );
});

exports.addToCollegeBucket = asyncHandler(async (req, res) => {
  const collegeId = req.params.collegeId;
  const userId = req.user._id;

  const college = await College.findById(collegeId);
  if (!college) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "College not found"));
  }

  const existingBucketItem = await CollegeBucket.findOne({
    collegeId: collegeId,
    userId: userId,
  });

  if (existingBucketItem) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, existingBucketItem, "College already in bucket")
      );
  }
  const newBucketItem = await CollegeBucket.create({
    collegeId: collegeId,
    userId: userId,
    name: college.name,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newBucketItem,
        "College added to bucket successfully"
      )
    );
});

// exports.getCollegeCourses = asyncHandler(async (req, res) => {

//   // const collegeInfo = await CollegeInfo.find({});
//   const colleges = await College.find({});

//   res.status(200).json(
//     new ApiResponse(200, colleges, `Total colleges: ${colleges.length}`)
//   );

// });

exports.getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = 30;

  const skip = page * limit;

  const courses = await CollegeInfo.aggregate([
    { $unwind: "$courses" },
    {
      $group: {
        _id: "$courses",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, courses, `Total courses: ${courses.length}`));
});

exports.getSpecificCourseColleges = asyncHandler(async (req, res) => {
  const courseName = req.params.courseName;
  const page = parseInt(req.query.page) || 0;
  const limit = 20;
  const skip = page * limit;

  const colleges = await CollegeInfo.find(
    {
      courses: courseName,
    },
    {
      name: 1,
      location: 1,
      collegeId: 1,
      _id: 0,
    }
  )
    .skip(skip)
    .limit(limit);

  // console.log(colleges);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        colleges,
        `Total colleges offering ${courseName}: ${colleges.length}`
      )
    );
});

exports.removeFromCollegeBucket = asyncHandler(async (req, res) => { 

  const itemId = req.params.itemId;

  const deletedItem = await CollegeBucket.findByIdAndDelete(itemId);
  if (!deletedItem) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Item not found in bucket"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedItem, "Item removed from bucket"));

});

exports.checkIfItsInBucketOrNot = asyncHandler(async (req, res) => {

  const collegeId = req.params.collegeId;
  const userId = req.user._id;

  const existingBucketItem = await CollegeBucket.findOne({
    collegeId: collegeId,
    userId: userId,
  });

  if (existingBucketItem) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {inBucket: true}, "College already in bucket")
      );
  }
    return res
      .status(200)
      .json(new ApiResponse(200, {inBucket: false}, "College not in bucket"));
  

 });