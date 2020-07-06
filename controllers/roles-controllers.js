const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const Role = require("../models/role");

const getRoles = async (req, res, next) => {
  let roles;

  try {
    roles = await Role.find({}, "-password");
  } catch (err) {
    return next(new HttpError("something went wrong", 500));
  }

  if (!roles) {
    return next(new HttpError("could not find any role", 404));
  }

  res.status(201).json({ roles });
};

const createRole = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { username, password } = req.body;
  let role;

  try {
    role = await Role.findOne({ username });
  } catch (err) {
    return next(new HttpError("something went wrong", 500));
  }

  if (role) {
    return next(
      new HttpError("the user existed, please choose another username!", 403),
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500,
    );
    return next(error);
  }

  role = new Role({
    username,
    password: hashedPassword,
  });

  try {
    await role.save();
  } catch (err) {
    console.log("something went wrong in saving role!" + err);
  }

  let token;
  try {
    token = jwt.sign(
      { roleId: role.id, username: role.username },
      "supersecret_dont_share",
      { expiresIn: "1h" },
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
    );
    return next(error);
  }

  res.status(201).json({ token: token, username: role.username });
};

const loginRole = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { username, password } = req.body;
  let role;

  try {
    role = await Role.findOne({ username });
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500),
    );
  }

  if (!role) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 403),
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, role.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again." +
        err,
      500,
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403,
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { roleId: role.id, username: role.username },
      "supersecret_dont_share",
      { expiresIn: "1h" },
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500,
    );
    return next(error);
  }

  res.json({
    roleId: role.id,
    username: role.username,
    token: token,
  });
};

exports.getRoles = getRoles;
exports.createRole = createRole;
exports.loginRole = loginRole;
