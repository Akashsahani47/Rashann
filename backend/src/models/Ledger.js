import mongoose from 'mongoose';

// One entry per ledger event between a buyer ↔ shopkeeper.
// kind='charge' (shopkeeper fulfilled an order, buyer owes)
// kind='payment' (buyer paid, balance reduces)
const LedgerSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    shopkeeperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shopkeeper',
      required: true,
    },
    kind: {
      type: String,
      enum: ['charge', 'payment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // For kind='charge': the shopping list that was fulfilled
    shoppingListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShoppingList',
      default: null,
    },
    // For kind='payment': how it was paid. Charges don't set this.
    method: {
      type: String,
      enum: {
        values: ['upi', 'cash', 'card', 'bank_transfer', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      // no default — leave unset for 'charge' entries
    },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

LedgerSchema.index({ buyerId: 1, shopkeeperId: 1, createdAt: -1 });

export default mongoose.model('Ledger', LedgerSchema);
