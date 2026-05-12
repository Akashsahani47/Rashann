import express from 'express';
import jwt from 'jsonwebtoken';
import Buyer from '../models/Buyer.js';
import Shopkeeper from '../models/Shopkeeper.js';

const router = express.Router();

const signToken = (id, userType) =>
  jwt.sign({ userId: id, userType }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const publicBuyer = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  userType: 'buyer',
  defaultAddress: u.defaultAddress,
  preferredLanguage: u.preferredLanguage,
});

const publicShopkeeper = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  userType: 'shopkeeper',
  shopName: u.shopName,
  shopAddress: u.shopAddress,
  categories: u.categories,
});

// Email must be unique across both collections.
const emailTakenAnywhere = async (email) => {
  const [b, s] = await Promise.all([
    Buyer.exists({ email }),
    Shopkeeper.exists({ email }),
  ]);
  return Boolean(b || s);
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body;

    if (!['buyer', 'shopkeeper'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (await emailTakenAnywhere(email)) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    if (userType === 'buyer') {
      const buyer = new Buyer({
        name,
        email,
        phone,
        password,
        defaultAddress: req.body.defaultAddress,
        preferredLanguage: req.body.preferredLanguage,
        householdSize: req.body.householdSize,
      });
      await buyer.save();
      return res.status(201).json({
        message: 'Buyer registered',
        token: signToken(buyer._id, 'buyer'),
        user: publicBuyer(buyer),
      });
    }

    // shopkeeper branch
    const { shopName, shopAddress } = req.body;
    if (
      !shopName ||
      !shopAddress?.line1 ||
      !shopAddress?.city ||
      !shopAddress?.state ||
      !shopAddress?.pincode
    ) {
      return res.status(400).json({
        message:
          'Shopkeepers must provide shopName and a complete shopAddress (line1, city, state, pincode).',
      });
    }

    const shopkeeper = new Shopkeeper({
      name,
      email,
      phone,
      password,
      shopName,
      shopAddress,
      location: req.body.location,
      gstNumber: req.body.gstNumber,
      categories: req.body.categories,
      openingHours: req.body.openingHours,
      daysOpen: req.body.daysOpen,
      deliveryAvailable: req.body.deliveryAvailable,
      deliveryRadiusKm: req.body.deliveryRadiusKm,
      minOrderValue: req.body.minOrderValue,
    });
    await shopkeeper.save();
    return res.status(201).json({
      message: 'Shopkeeper registered',
      token: signToken(shopkeeper._id, 'shopkeeper'),
      user: publicShopkeeper(shopkeeper),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login — looks in both collections by email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Buyer.findOne({ email });
    let userType = 'buyer';
    if (!user) {
      user = await Shopkeeper.findOne({ email });
      userType = 'shopkeeper';
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      token: signToken(user._id, userType),
      user: userType === 'buyer' ? publicBuyer(user) : publicShopkeeper(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
