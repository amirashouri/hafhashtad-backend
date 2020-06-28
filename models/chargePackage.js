const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const chargePackageSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  planId: { type: String, required: true },
});

chargePackageSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ChargePackage", chargePackageSchema);
