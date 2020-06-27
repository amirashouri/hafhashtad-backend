const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  code: { type: String, required: true, ref: "Code" },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
