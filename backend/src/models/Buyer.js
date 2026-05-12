import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BuyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },

    defaultAddress: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    preferredShopkeepers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper' },
    ],
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'hinglish'],
      default: 'hinglish',
    },
    householdSize: { type: Number, min: 1, default: 1 },
  },
  { timestamps: true }
);

BuyerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

BuyerSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// collection: `buyers`
export default mongoose.model('Buyer', BuyerSchema);
