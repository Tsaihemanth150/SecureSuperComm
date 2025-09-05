import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slugCandidate = baseSlug;
    let counter = 1;

    while (await mongoose.model("Category").findOne({ slug: slugCandidate })) {
      slugCandidate = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slugCandidate;
  }
  next();
});

categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
