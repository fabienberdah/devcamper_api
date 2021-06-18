const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const advancedResults = require("../middleware/advancedResults");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @description:  Get all courses
// @route         GET /api/v1/courses => will get all the courses in general
// @route         GET /api/v1/bootcamps/:bootcampId/courses => will get courses for specific bootcamp
// @access        Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // check if the bootcamp exists
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    //If we can't find a related bootcamp
    res.status(200).json(res.advancedResults);
  }
});

//@description:   Get one course by Id
//@route:         GET /api/v1/courses/:id
//@access:        Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description location.city",
  });

  if (!course) {
    return next(
      new ErrorResponse(`There is no course with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@description  Create new course
//@route        POST /api/v1/bootcamps/:bootcampId/courses
//@access       Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`There is no bootcamp with id of ${req.params.id}`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

//@description  Update course
//@route        PUT /api/v1/courses/:courseId
//@access       Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`There is no bootcamp with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    msg: `Course with id ${req.params.id} successfully deleted.`,
    data: {},
  });
});
