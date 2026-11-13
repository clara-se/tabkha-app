import mongoose from 'mongoose';

const pantryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

pantryItemSchema.index({ userId: 1, name: 1 });

export const PantryItem = mongoose.model('PantryItem', pantryItemSchema);