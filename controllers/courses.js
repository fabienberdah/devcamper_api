const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");

// @description:  Get all courses
// @route         GET /api/v1/courses => will get all the courses in general
// @route         GET /api/v1/bootcamps/:bootcampId/courses => will get courses for specific bootcamp
// @access        Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  //initialize the query
  let query;

  // check if the bootcamp exists
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    //If we can't find a related bootcamp
    // query = Course.find().populate("bootcamp");
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description location.city",
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});
