const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const chargePlanSchema = new Schema({
  name: { type: String, required: true },
  operatorId: { type: String, required: true },
  package: [
    { type: mongoose.Types.ObjectId, required: true, ref: "ChargePackage" },
  ],
});

chargePlanSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ChargePlan", chargePlanSchema);
