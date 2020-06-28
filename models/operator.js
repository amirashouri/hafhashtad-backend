const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const operatorSchema = new Schema({
  name: { type: String, required: true, unique: true },
  plan: [{ type: mongoose.Types.ObjectId, required: true, ref: "ChargePlan" }],
});

operatorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Operator", operatorSchema);
