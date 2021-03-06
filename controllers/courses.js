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
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`There is no bootcamp with id of ${req.params.id}`, 404)
    );
  }

  //making sure that the bootcamp owner is the user that is logged in
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to add a course to ${bootcamp.name}. Please contact bootcamp owner or admin.`,
        401
      )
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

  //Check that the course exists:
  if (!course) {
    return next(
      new ErrorResponse(`There is no course with id ${req.params.id}.`, 404)
    );
  }

  //making sure that the course owner is the user that is logged in
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to update course ${course.name}. Please contact the bootcamp owner or admin.`,
        401
      )
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  //Checking that the course exists
  if (!course) {
    return next(
      new ErrorResponse(`There is no bootcamp with id ${req.params.id}`)
    );
  }

  //Checking that the user is an admin or owns the course
  //making sure that the course owner is the user that is logged in
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to delete course ${course.name}. Please contact the bootcamp owner or admin.`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    msg: `Course with id ${req.params.id} successfully deleted.`,
    data: {},
  });
});
