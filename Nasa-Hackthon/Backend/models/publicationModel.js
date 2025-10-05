const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A publication must have a title"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "A publication must have a link"],
      trim: true,
    },
    year: Number,
    summary: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
    embedding: {
      type: [Number],
      default: undefined,
      index: false,
    },
  },
  {
    timestamps: true,
  }
);

const Publication = mongoose.model("Publication", publicationSchema);
module.exports = Publication;
