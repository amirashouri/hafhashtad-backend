const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const codeSchema = new Schema({
  value: { type: String, required: true },
  created_at: { type: Date, required: true },
  phone: { type: String, required: true, unique: true },
});

codeSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Code", codeSchema);
