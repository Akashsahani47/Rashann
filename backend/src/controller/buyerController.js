import mongoose from 'mongoose';
import ShoppingList from '../models/ShoppingList.js';
import Shopkeeper from '../models/Shopkeeper.js';
import Ledger from '../models/Ledger.js';

// ---------------------------------------------------------------- Shopkeepers

export const listShopkeepers = async (req, res) => {
  try {
    const filter = { isAcceptingOrders: true };
    if (req.query.pincode) filter['shopAddress.pincode'] = req.query.pincode;
    if (req.query.category) filter.categories = req.query.category;

    const shopkeepers = await Shopkeeper.find(filter)
      .select(
        'name phone shopName shopAddress categories deliveryAvailable deliveryRadiusKm minOrderValue rating openingHours daysOpen upiVpa'
      )
      .sort({ 'rating.avg': -1, name: 1 });
    res.json(shopkeepers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------- Lists

export const createShoppingList = async (req, res) => {
  try {
    const { title, month, items } = req.body;
    const shoppingList = new ShoppingList({
      buyerId: req.user.userId,
      title,
      month,
      items: items || [],
      status: 'draft',
      totalEstimatedPrice: (items || []).reduce(
        (sum, item) => sum + (Number(item.estimatedPrice) || 0),
        0
      ),
    });
    await shoppingList.save();
    res.status(201).json({ message: 'Shopping list created', shoppingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShoppingLists = async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({ buyerId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rollover — fetch the most recent list (any status) so buyer can clone its items
export const getLastShoppingList = async (req, res) => {
  try {
    const last = await ShoppingList.findOne({ buyerId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(last || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShoppingListsByMonth = async (req, res) => {
  try {
    const shoppingLists = await ShoppingList.find({
      buyerId: req.user.userId,
      month: req.params.month,
    });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShoppingList = async (req, res) => {
  try {
    const { title, items } = req.body;
    const shoppingList = await ShoppingList.findById(req.params.id);
    if (!shoppingList) return res.status(404).json({ message: 'Not found' });
    if (shoppingList.buyerId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (title) shoppingList.title = title;
    if (items) {
      shoppingList.items = items;
      shoppingList.totalEstimatedPrice = items.reduce(
        (sum, item) => sum + (Number(item.estimatedPrice) || 0),
        0
      );
    }
    shoppingList.updatedAt = Date.now();
    await shoppingList.save();
    res.json({ message: 'Shopping list updated', shoppingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const shareShoppingList = async (req, res) => {
  try {
    const { shopkeeperId } = req.body;
    const shoppingList = await ShoppingList.findById(req.params.id);
    if (!shoppingList) return res.status(404).json({ message: 'Not found' });
    if (shoppingList.buyerId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    shoppingList.shopkeeperId = shopkeeperId;
    shoppingList.status = 'shared';
    shoppingList.sharedAt = Date.now();
    await shoppingList.save();
    res.json({ message: 'Shared', shoppingList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------- Ledger / Udhaar khata

// Running balance with every shopkeeper this buyer has dealt with
export const getLedger = async (req, res) => {
  try {
    const buyerId = new mongoose.Types.ObjectId(req.user.userId);
    const grouped = await Ledger.aggregate([
      { $match: { buyerId } },
      {
        $group: {
          _id: '$shopkeeperId',
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
          shopkeeperId: '$_id',
          charges: 1,
          payments: 1,
          balance: { $subtract: ['$charges', '$payments'] },
          lastActivity: 1,
        },
      },
      { $sort: { lastActivity: -1 } },
    ]);

    const ids = grouped.map((g) => g.shopkeeperId);
    const shopkeepers = await Shopkeeper.find({ _id: { $in: ids } })
      .select('name shopName upiVpa');
    const skMap = Object.fromEntries(shopkeepers.map((s) => [s._id.toString(), s]));

    res.json(
      grouped.map((g) => ({
        ...g,
        shopkeeper: skMap[g.shopkeeperId.toString()] || null,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Full transaction history with a specific shopkeeper
export const getLedgerWith = async (req, res) => {
  try {
    const entries = await Ledger.find({
      buyerId: req.user.userId,
      shopkeeperId: req.params.shopkeeperId,
    })
      .populate('shoppingListId', 'title month')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record a payment from buyer → shopkeeper
export const recordPayment = async (req, res) => {
  try {
    const { shopkeeperId, amount, method, note } = req.body;
    if (!shopkeeperId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'shopkeeperId and positive amount required' });
    }
    const entry = await Ledger.create({
      buyerId: req.user.userId,
      shopkeeperId,
      kind: 'payment',
      amount,
      method: method || 'upi',
      note: note || '',
    });
    res.status(201).json({ message: 'Payment recorded', entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
