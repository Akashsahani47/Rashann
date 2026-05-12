import mongoose from 'mongoose';

const ShoppingListSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
  },
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shopkeeper',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  month: {
    type: String, // Format: "YYYY-MM"
    required: true,
  },
  items: [
    {
      itemName: String,
      quantity: Number,
      unit: String, // kg, liters, pieces, etc.
      estimatedPrice: Number,
      category: String, // vegetables, dairy, spices, etc.
      notes: String,
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'shared', 'completed', 'cancelled'],
    default: 'draft',
  },
  totalEstimatedPrice: Number,
  sharedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ShoppingList', ShoppingListSchema);
