const express = require("express");
const { check } = require("express-validator");

const chargesController = require("../controllers/charges-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", chargesController.getChargeList);

router.post(
  "/createOperator",
  [check("name").not().isEmpty()],
  chargesController.createOperator,
);

router.post(
  "/createChargePlan",
  [check("name").not().isEmpty(), check("operatorId").not().isEmpty()],
  chargesController.createChargePlan,
);

router.post(
  "/createChargePackage",
  [
    check("name").not().isEmpty(),
    check("planId").not().isEmpty(),
    check("description").not().isEmpty(),
    check("price").not().isEmpty(),
  ],
  chargesController.createChargePackage,
);

module.exports = router;
