import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  listShopkeepers,
  createShoppingList,
  getShoppingLists,
  getLastShoppingList,
  getShoppingListsByMonth,
  updateShoppingList,
  shareShoppingList,
  getLedger,
  getLedgerWith,
  recordPayment,
} from '../controller/buyerController.js';

const router = express.Router();

// Shopkeepers
router.get('/shopkeepers', auth, listShopkeepers);

// Lists
router.post('/shopping-list', auth, createShoppingList);
router.get('/shopping-lists', auth, getShoppingLists);
router.get('/shopping-lists/last', auth, getLastShoppingList);
router.get('/shopping-lists/:month', auth, getShoppingListsByMonth);
router.put('/shopping-list/:id', auth, updateShoppingList);
router.post('/shopping-list/:id/share', auth, shareShoppingList);

// Ledger / Udhaar khata
router.get('/ledger', auth, getLedger);
router.get('/ledger/:shopkeeperId', auth, getLedgerWith);
router.post('/ledger/payment', auth, recordPayment);

export default router;
