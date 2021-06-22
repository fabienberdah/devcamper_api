const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const path = require("path");

// const { request } = require("https");

// @description:  Get all bootcamps
// @route         GET /api/v1/bootcamps
// @access        Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @description:  Get single bootcamp
// @route         GET /api/v1/bootcamps/:id
// @access        Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @description:  Create a new bootcamp
// @route         POST /api/v1/bootcamps
// @access        Private (need to be logged in or send a token)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  //Check for published bootcamp by user
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //If user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published one bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description:  Update a bootcamp
// @route         PUT /api/v1/bootcamps/:id
// @access        Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to update this bootcamp. Please contact bootcamp owner or admin.`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @description:  Delete a bootcamp
// @route         DELETE /api/v1/bootcamps/:id
// @access        Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to delete this bootcamp. Please contact bootcamp owner or admin.`,
        401
      )
    );
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @description:  Upload Photo
// @route         Put /api/v1/bootcamps/:id/photo
// @access        Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  //Check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You are not authorized to update this bootcamp. Please contact bootcamp owner or admin.`,
        401
      )
    );
  }

  //check if file was previously uploaded
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  //make sure that the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Image cannot be more than ${process.env.MAX_FILE_UPLOAD / 1000000}Mb`,
        400
      )
    );
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`; // this will not give us the type
  // console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @description:  Get bootcamps within a radius
// @route         GET /api/v1/bootcamps/radius/:zipcode/:distance /:unit
// @access        Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  // Get access to the zipcode and the distance from the url
  const { zipcode, distance } = req.params;

  // Get latitude/longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radians
  //divide distance by radius of Earch
  // Earth radius = 3963miles  or 6378km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
