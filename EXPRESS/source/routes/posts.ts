/** source/routes/posts.ts */
import express from "express";
import controller from "../controllers/transactions";
import nftholders from "../controllers/hatching"
import burn from "../controllers/burn";
import staking from "../controllers/staking";
const router = express.Router();

//TransactionRoutes
router.get("/transactions", controller.getTransactions);
router.get("/transactions/walletRank", controller.getWalletRank);
router.get("/transactions/buys",controller.getBuys)

//NFT

router.get("/nft",nftholders.getHatchRanking)
router.get("/nft/walletRank",nftholders.getHatchRanking)
router.get("/nft/buys",nftholders.getHatchByWallet)
router.get("/nft/nftOwners",nftholders.getNftOwners)

//BurnRanking
router.get("/burn",burn.getBurnRanking)
router.get("/burn/walletRank",burn.getBurnWalletRank)
router.get("/burn/burns",burn.getBurnedByWallet)

//StakingRanking
router.get("/staking",staking.getStakingRanking)
router.get("/staking/walletRank",staking.getStakingWalletRank)
router.get("/staking/staked",staking.getStakedByWallet)
export = router;
