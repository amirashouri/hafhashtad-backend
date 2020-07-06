const express = require("express");
const { check } = require("express-validator");

const rolesController = require("../controllers/roles-controllers");

const router = express.Router();

router.get("/", rolesController.getRoles);

router.post(
  "/createRole",
  [check("username").not().isEmpty(), check("password").not().isEmpty()],
  rolesController.createRole,
);

router.post(
  "/loginRole",
  [check("username").not().isEmpty(), check("password").not().isEmpty()],
  rolesController.loginRole,
);

module.exports = router;
