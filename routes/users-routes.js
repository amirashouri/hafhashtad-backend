const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/getVerificationCode",
  [check("phone").not().isEmpty()],
  usersController.getVerificationCode,
);

router.post(
  "/verify",
  [check("phone").not().isEmpty(), check("code").not().isEmpty()],
  usersController.verify,
);

module.exports = router;
