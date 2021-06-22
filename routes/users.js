const express = require("express");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const User = require("../models/User");


const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.use(protect);//this means than anything below this will use protect
router.use(authorize('admin'));//this means than anything below this will use authorize

router
  .route("/")
  .get(advancedResults(User), getUsers)
  .post(createUser)
  
  

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)
  
module.exports = router;
