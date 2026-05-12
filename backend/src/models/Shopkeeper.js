import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CATEGORIES = [
  'grains',
  'pulses',
  'spices',
  'oils',
  'dairy',
  'vegetables',
  'fruits',
  'snacks',
  'beverages',
  'personal_care',
  'household',
];

const ShopkeeperSchema = new mongoose.Schema(
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

    shopName: { type: String, required: true, trim: true },
    shopAddress: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{6}$/,
      },
    },
    location: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    shopImage: { type: String, default: null },
    gstNumber: { type: String, trim: true, uppercase: true, default: null },
    upiVpa: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[\w.-]+@[\w]+$/,
      default: null,
    },
    categories: {
      type: [{ type: String, enum: CATEGORIES }],
      default: [],
    },
    openingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '21:00' },
    },
    daysOpen: {
      type: [
        { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      ],
      default: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryRadiusKm: { type: Number, min: 0, default: 0 },
    minOrderValue: { type: Number, min: 0, default: 0 },
    isAcceptingOrders: { type: Boolean, default: true },
    totalCompletedOrders: { type: Number, default: 0 },
    rating: {
      avg: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ShopkeeperSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

ShopkeeperSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

ShopkeeperSchema.index({ 'shopAddress.pincode': 1 });
ShopkeeperSchema.index({ shopName: 'text' });

// collection: `shopkeepers`
export { CATEGORIES };
export default mongoose.model('Shopkeeper', ShopkeeperSchema);
