/** source/routes/posts.ts */
import express from "express";
import controller from "../controllers/transactions";
import nftholders from "../controllers/nftholders"
import burn from "../controllers/burn";
import staking from "../controllers/staking";
const router = express.Router();

//TransactionRoutes
router.get("/transactions", controller.getTransactions);
router.get("/transactions/walletRank", controller.getWalletRank);
router.get("/transactions/buys",controller.getBuys)

//TransactionRoutes
router.get("/nft/nftOwners",nftholders.getdata)

//BurnRanking
router.get("/burn",burn.getBurnRanking)
router.get("/burn/walletRank",burn.getBurnWalletRank)
router.get("/burn/burns",burn.getBurnWalletRank)

//StakingRanking
router.get("/staking",staking.getStakingRanking)
router.get("/staking/walletRank",staking.getStakingWalletRank)
router.get("/staking/burns",staking.getStakedByWallet)
export = router;
