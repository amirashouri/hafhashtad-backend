const { validationResult } = require("express-validator");
//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Code = require("../models/code");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500,
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getVerificationCode = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }
  const { phone } = req.body;

  let code;

  try {
    code = await Code.findOne({ phone: phone });
  } catch (err) {
    const error = new HttpError(
      `can not find any code in database. err: ${err}`,
      500,
    );
    return next(error);
  }

  const verifyCode = Math.floor(Math.random() * 9000 + 1000).toString();

  if (code) {
    if (new Date() - code.created_at > 10 * 1000) {
      code.value = verifyCode;
    }
  } else {
    code = new Code({
      value: verifyCode,
      created_at: new Date(),
      phone: phone,
    });
  }

  try {
    await code.save();
  } catch (err) {
    const error = new HttpError(
      `Creating verification code failed, please try again later. ${err}`,
      500,
    );
    return next(error);
  }

  res
    .status(201)
    .json({ message: "verification code has been sent to your number." });
};

// Login:

const verify = async (req, res, next) => {
  const { phone, code } = req.body;

  let isAuthenticated = false;
  try {
    const existingCode = await Code.findOne({ phone: phone });
    isAuthenticated = existingCode.value == code;
  } catch (err) {
    const error = new HttpError(
      `Logging in failed, please try again later. err: ${err}`,
      500,
    );
    return next(error);
  }

  if (!isAuthenticated) {
    const error = new HttpError(
      `Logging in failed, verification code does not matched!`,
      403,
    );
    return next(error);
  }

  let existingUser;

  try {
    existingUser = await User.findOne({ phone: phone });
  } catch (err) {
    const error = new HttpError(
      `Logging in failed, please try again later. err: ${err}`,
      500,
    );
    return next(error);
  }

  if (!existingUser) {
    existingUser = new User({
      phone: phone,
    });
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, phone: existingUser.phone },
      "supersecret_dont_share",
      { expiresIn: "1h" },
    );
  } catch (err) {
    const error = new HttpError(
      `Logging in failed, please try again later. err: ${err}`,
      500,
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    phone: existingUser.phone,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.getVerificationCode = getVerificationCode;
exports.verify = verify;
