const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const briefSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Recibido", "En Proceso", "Completado"],
      default: "Recibido",
    },
    files: [fileSchema],
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedProducer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brief", briefSchema);
