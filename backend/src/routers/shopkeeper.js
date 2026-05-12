import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getMe,
  updateMe,
  getShoppingLists,
  getCustomerLists,
  getCustomers,
  markAsCompleted,
  recordPayment,
  getLedger,
} from '../controller/shopkeeperController.js';

const router = express.Router();

// Profile
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

// Lists
router.get('/shopping-lists', auth, getShoppingLists);
router.get('/customer/:buyerId/lists', auth, getCustomerLists);
router.get('/customers', auth, getCustomers);
router.put('/shopping-list/:id/complete', auth, markAsCompleted);

// Ledger
router.post('/ledger/payment', auth, recordPayment);
router.get('/ledger', auth, getLedger);

export default router;
