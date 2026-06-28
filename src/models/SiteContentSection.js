import mongoose from "mongoose";

/**
 * Keyed site content sections (footer, homepage banners, navigation, etc.)
 * Site content sections stored in MongoDB for avenue-admin.
 */
const SiteContentSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteContentSection ||
  mongoose.model("SiteContentSection", SiteContentSectionSchema);
