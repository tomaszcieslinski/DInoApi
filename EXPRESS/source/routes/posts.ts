/** source/routes/posts.ts */
import express from 'express';
import controller from '../controllers/transactions';
const router = express.Router();

router.get('/transactions', controller.getTransactions);
router.get('/walletRank',controller.getWalletRank)
export = router;