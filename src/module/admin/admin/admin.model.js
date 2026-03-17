const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true, maxlength: 255 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      unique: true
    },
    // bcrypt hash; never return in API responses
    password: { type: String, required: true, select: false },

    number: { type: String, default: null, trim: true, maxlength: 255 },
    profile_photo: { type: String, default: null, trim: true, maxlength: 255 },

    role: { type: String, required: true, default: "admin", trim: true, maxlength: 255 },
    permissions: { type: mongoose.Schema.Types.Mixed, default: ["*"] },

    status: { type: Number, default: 1, enum: [0, 1] },

    bio: { type: String, default: null },
    company_logo: { type: String, default: null, trim: true, maxlength: 255 },
    company_name: { type: String, default: null, trim: true, maxlength: 255 }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Admin", adminSchema);
