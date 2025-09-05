import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

const courseSchema = new mongoose.Schema(
  {
    courseUid: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    courseCode: {
      type: String,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseType: {
      type: String,
      required: true,
      enum: ["online", "offline", "hybrid"],
    },
    duration: {
      type: Number,
      required: true, // in hours
      min: [1, "Duration must be at least 1 hour"],
    },
    instructor: {
      type: String,
      required: true,
      default: "SecureSuperComm",
      trim: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return this.isFree ? value === 0 : true;
        },
        message: "Price must be 0 if course is free",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
courseSchema.index({ courseName: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ slug: 1 });

/**
 * Pre-save hook to generate slug and unique courseCode
 */
courseSchema.pre("save", async function (next) {
  try {
    // Generate slug from courseName
    if (!this.slug && this.courseName) {
      this.slug = slugify(this.courseName, { lower: true, strict: true });
    }

    // Generate unique courseCode if not set
    if (!this.courseCode) {
      const category = await mongoose.model("Category").findById(this.category);
      if (!category) throw new Error("Invalid category");

      const prefix = category.name.replace(/\s+/g, "").toUpperCase();

      let unique = false;
      while (!unique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const candidate = `${prefix}${randomDigits}`;
        const exists = await mongoose
          .model("Course")
          .findOne({ courseCode: candidate });
        if (!exists) {
          this.courseCode = candidate;
          unique = true;
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
