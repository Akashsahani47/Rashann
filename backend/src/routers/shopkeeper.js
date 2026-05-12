import express from 'express';
import mongoose from 'mongoose';
import ShoppingList from '../models/ShoppingList.js';
import Buyer from '../models/Buyer.js';
import Shopkeeper from '../models/Shopkeeper.js';
import Ledger from '../models/Ledger.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// ---------------------------------------------------------------- Profile

router.get('/me', auth, async (req, res) => {
  try {
    const me = await Shopkeeper.findById(req.user.userId).select('-password');
    if (!me) return res.status(404).json({ message: 'Not found' });
    res.json(me);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const EDITABLE = [
  'phone',
  'shopName',
  'shopAddress',
  'location',
  'shopImage',
  'gstNumber',
  'upiVpa',
  'categories',
  'openingHours',
  'daysOpen',
  'deliveryAvailable',
  'deliveryRadiusKm',
  'minOrderValue',
  'isAcceptingOrders',
];

router.put('/me', auth, async (req, res) => {
  try {
    const update = {};
    for (const key of EDITABLE) {
      if (key in req.body) update[key] = req.body[key];
    }
    const me = await Shopkeeper.findByIdAndUpdate(req.user.userId, update, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!me) return res.status(404).json({ message: 'Not found' });
    res.json(me);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Lists shared with this shopkeeper.
// Default: returns both 'shared' and 'completed'.
// Optional ?status=shared|completed to filter.
router.get('/shopping-lists', auth, async (req, res) => {
  try {
    const filter = { shopkeeperId: req.user.userId };
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $in: ['shared', 'completed'] };
    }
    const shoppingLists = await ShoppingList.find(filter)
      .populate('buyerId', 'name email phone')
      .sort({ sharedAt: -1, completedAt: -1 });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lists from a specific buyer
router.get('/customer/:buyerId/lists', auth, async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({
      buyerId: req.params.buyerId,
      shopkeeperId: req.user.userId,
    }).sort({ sharedAt: -1 });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// All customers who have shared a list with this shopkeeper
router.get('/customers', auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({
      shopkeeperId: req.user.userId,
      status: 'shared',
    }).distinct('buyerId');
    const customers = await Buyer.find({ _id: { $in: lists } })
      .select('name email phone');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a list complete — and auto-record a ledger 'charge' for the actual price
router.put('/shopping-list/:id/complete', auth, async (req, res) => {
  try {
    const { actualPrice } = req.body;
    const shoppingList = await ShoppingList.findById(req.params.id);
    if (!shoppingList) return res.status(404).json({ message: 'Not found' });
    if (
      !shoppingList.shopkeeperId ||
      shoppingList.shopkeeperId.toString() !== req.user.userId
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    shoppingList.status = 'completed';
    shoppingList.completedAt = Date.now();
    const charge = Number(actualPrice) || shoppingList.totalEstimatedPrice || 0;
    await shoppingList.save();

    if (charge > 0) {
      await Ledger.create({
        buyerId: shoppingList.buyerId,
        shopkeeperId: req.user.userId,
        kind: 'charge',
        amount: charge,
        shoppingListId: shoppingList._id,
        note: `Order: ${shoppingList.title}`,
      });
    }

    // Increment lifetime completed orders on shopkeeper
    await Shopkeeper.updateOne(
      { _id: req.user.userId },
      { $inc: { totalCompletedOrders: 1 } }
    );

    res.json({ message: 'Marked complete', shoppingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record a payment received from a customer (cash/UPI/etc.)
router.post('/ledger/payment', auth, async (req, res) => {
  try {
    const { buyerId, amount, method, note } = req.body;
    if (!buyerId || !amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: 'buyerId and positive amount required' });
    }
    const entry = await Ledger.create({
      buyerId,
      shopkeeperId: req.user.userId,
      kind: 'payment',
      amount: Number(amount),
      method: method || 'cash',
      note: note || '',
    });
    res.status(201).json({ message: 'Payment recorded', entry });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Customer balances — for shopkeeper's "Khaate" view
router.get('/ledger', auth, async (req, res) => {
  try {
    const shopkeeperId = new mongoose.Types.ObjectId(req.user.userId);
    const grouped = await Ledger.aggregate([
      { $match: { shopkeeperId } },
      {
        $group: {
          _id: '$buyerId',
          charges: {
            $sum: { $cond: [{ $eq: ['$kind', 'charge'] }, '$amount', 0] },
          },
          payments: {
            $sum: { $cond: [{ $eq: ['$kind', 'payment'] }, '$amount', 0] },
          },
          lastActivity: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          buyerId: '$_id',
          charges: 1,
          payments: 1,
          balance: { $subtract: ['$charges', '$payments'] },
          lastActivity: 1,
        },
      },
      { $sort: { balance: -1, lastActivity: -1 } },
    ]);

    const ids = grouped.map((g) => g.buyerId);
    const buyers = await Buyer.find({ _id: { $in: ids } })
      .select('name phone');
    const bMap = Object.fromEntries(buyers.map((b) => [b._id.toString(), b]));

    res.json(
      grouped.map((g) => ({
        ...g,
        buyer: bMap[g.buyerId.toString()] || null,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
