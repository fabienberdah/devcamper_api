const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  //Log error to console for developer
  console.log(err.stack.brightRed);
  // console.log(err.name);

  //Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id ${err.value}.`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
