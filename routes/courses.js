const express = require("express");

const {
  getCourses,
  // getCourse,
  // createCourse,
  // updateCourse,
  // deleteCourse,
} = require("../controllers/courses");

const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);

// router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
