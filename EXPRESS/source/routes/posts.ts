/** source/routes/posts.ts */
import express from "express";
import controller from "../controllers/transactions";
import nftholders from "../controllers/hatching"
import burn from "../controllers/burn";
import staking from "../controllers/staking";
import nftservice from "../services/nftservice";
const router = express.Router();

//TransactionRoutes
router.get("/transactions", controller.getTransactions);
router.get("/transactions/walletRank", controller.getWalletRank);
router.get("/transactions/list",controller.getBuys)

//NFT

router.get("/nft",nftholders.getHatchRanking)
router.get("/nft/walletRank",nftholders.getHatchWalletRank)
router.get("/nft/list",nftholders.getHatchByWallet)
router.get("/nft/nftOwners",nftholders.getNftOwners)
router.get("/nft/traits",nftholders.getNftTraits)
router.post("/nft/traits",nftholders.postNftFilter)
router.get("/nft/attributes",nftholders.getNftTraitsByAttr)
router.get("/nft/otraits",nftholders.getoNftTraits)
router.post("/nft/otraits",nftholders.postoNftFilter)
router.get("/nft/oattributes",nftholders.getoNftTraitsByAttr)

router.get("/nft/wtraits",nftholders.getwNftTraits)
router.post("/nft/wtraits",nftholders.postwNftFilter)

//BurnRanking
router.get("/burn",burn.getBurnRanking)
router.get("/burn/walletRank",burn.getBurnWalletRank)
router.get("/burn/list",burn.getBurnedByWallet)

//StakingRanking
router.get("/staking",staking.getStakingRanking)
router.get("/staking/walletRank",staking.getStakingWalletRank)
router.get("/staking/list",staking.getStakedByWallet)
export = router;
