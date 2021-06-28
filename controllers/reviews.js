const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

// @description:  Get reviews
// @route         GET /api/v1/reviews => will get all the reviews in general
// @route         GET /api/v1/bootcamps/:bootcampId/reviews => will get reviews for specific bootcamp
// @access        Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // check if the bootcamp exists
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    //If we can't find a related bootcamp
    res.status(200).json(res.advancedResults);
  }
});

// @description:  Get single review
// @route         GET /api/v1/reviews/:id
// @access        Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`There is no review with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @description:  Add review
// @route         POST /api/v1/bootcamps/:bootcampId/reviews
// @access        Private // need to be a user
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorMessage(
        `There is no bootcamp with id: ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @description:  Update review
// @route         PUT /api/v1/reviews/:id
// @access        Private // need to be a user
exports.updateReview = asyncHandler(async (req, res, next) => {
  //find review by its id
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`There is no review with id: ${req.params.id}`, 404)
    );
  }

  // we need to make sure that the review belongs to the user, unless it's an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authorized to update this review.`, 401)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
    message: "Your review has been updated.",
  });
});

// @description:  delete review
// @route         delete /api/v1/reviews/:id
// @access        Private // need to be a user or admin
exports.deleteReview = asyncHandler(async (req, res, next) => {
  //find review by its id
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`There is no review with id: ${req.params.id}`, 404)
    );
  }

  // we need to make sure that the review belongs to the user, unless it's an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You are not authorized to delete this review.`, 401)
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
    message: "Your review has been deleted.",
  });
});
