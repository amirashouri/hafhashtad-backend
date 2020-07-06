const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Operator = require("../models/operator");
const ChargePlan = require("../models/chargePlan");
const ChargePackage = require("../models/chargePackage");
const operator = require("../models/operator");

const createOperator = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { name } = req.body;

  try {
    const operator = await Operator.findOne({ name: name });
    if (operator) {
      return next(
        new HttpError(
          "the name entered is exist, please choose another name",
          422,
        ),
      );
    }
  } catch (err) {}

  const newOperator = new Operator({
    name,
    plan: [],
  });

  try {
    await newOperator.save();
  } catch (err) {
    return next(new HttpError("Something went wrong, please try again!", 500));
  }

  res.status(201).json({ message: newOperator.toObject({ getters: true }) });
};

const createChargePlan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { name, operatorId } = req.body;

  try {
    const plan = await ChargePlan.findOne({ name: name });
    console.log("operator id: " + plan.operatorId + "and id: " + operatorId);
    if (plan && plan.operatorId.toObject({ getters: true }) === operatorId) {
      return next(
        new HttpError(
          "the name entered is exist, please choose another name",
          422,
        ),
      );
    }
  } catch (err) {}

  let operator;
  try {
    operator = await Operator.findOne({ _id: operatorId });
  } catch (err) {
    return next(new HttpError("the operator does not exist", 422));
  }

  const newPlan = new ChargePlan({
    name,
    operatorId,
    package: [],
  });

  try {
    await newPlan.save();
  } catch (err) {
    return next(
      new HttpError(`failed to save plan, please try again! err: ${err}`, 500),
    );
  }

  if (operator) {
    const plans = operator.plan;
    plans.push(newPlan);
    operator.plan = plans;

    try {
      await operator.save();
    } catch (err) {
      return next(
        new HttpError(
          `failed to update operators with new plan, please try again! err: ${err}`,
          422,
        ),
      );
    }
  } else {
    return next(
      new HttpError("failed to add plan to operators, please try again!", 422),
    );
  }

  res.status(201).json({ plan: newPlan });
};

const createChargePackage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { name, description, planId, price } = req.body;

  let plan;
  try {
    plan = await ChargePlan.findOne({ _id: planId });
  } catch (err) {}

  if (!plan) {
    return next(
      new HttpError(
        "no charge plan found with given id, please try again!",
        422,
      ),
    );
  }

  try {
    const existedPackage = await ChargePackage.findOne({ name: name });
    if (existedPackage && existedPackage.planId === planId) {
      return next(
        new HttpError(
          "the package name exist choose another name, and try again!",
          422,
        ),
      );
    }
  } catch (err) {}

  const newPackage = new ChargePackage({
    name,
    description,
    price,
    planId,
  });

  try {
    await newPackage.save();
  } catch (err) {
    return next(
      new HttpError("failed to save the package, please try again!", 500),
    );
  }

  const packages = plan.package;
  packages.push(newPackage);
  plan.package = packages;

  try {
    await plan.save();
  } catch (err) {
    return next(
      new HttpError(
        "failed to save the pakcages in plan, please try again!",
        500,
      ),
    );
  }

  res.status(201).json({ message: newPackage.toObject({ getters: true }) });
};

const getChargeList = async (req, res, next) => {
  let operators;

  try {
    operators = await Operator.find()
      .populate({
        path: "plan",
        populate: {
          path: "package",
        },
      })
      .cache({ key: 1 });
  } catch (err) {}

  if (!operators) {
    return next(
      new HttpError("failed to fetch the list , please try again!", 500),
    );
  }

  res.status(201).json({
    operators,
  });
};

exports.createOperator = createOperator;
exports.createChargePlan = createChargePlan;
exports.createChargePackage = createChargePackage;
exports.getChargeList = getChargeList;
