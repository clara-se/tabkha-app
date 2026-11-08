import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    sourceUrl: { type: String, default: '' },
    ingredients: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          quantity: { type: Number, required: true },
          unit: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    steps: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Recipe = mongoose.model('Recipe', recipeSchema);