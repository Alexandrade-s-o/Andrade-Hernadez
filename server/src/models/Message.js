const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    brief: { type: mongoose.Schema.Types.ObjectId, ref: "Brief", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["cliente", "productor"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
