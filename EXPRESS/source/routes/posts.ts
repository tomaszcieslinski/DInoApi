/** source/routes/posts.ts */
import express, {Request, Response, NextFunction } from 'express';
import controller from "../controllers/transactions";
import nftholders from "../controllers/hatching"
import burn from "../controllers/burn";
import staking from "../controllers/staking";
import nftservice from "../services/nftservice";
import { createClient } from '@supabase/supabase-js'

import TelegramBot from "node-telegram-bot-api";


const router = express.Router();

declare global {
    namespace Express {
      interface Request {
        user: any;
      }
    }
  }
//TransactionRoutes
router.get("/transactions", controller.getTransactions);
router.get("/transactions/walletRank", controller.getWalletRank);
router.get("/transactions/list",controller.getBuys)
router.get("/transactions/count",staking.getTransactionCount)
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

import jwt from "jsonwebtoken"
const SECRET_KEY = process.env.SECRET_KEY || 'DinoBetSecret20239988';
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization');
  if (token === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next(); 
  });
}
const supabase = createClient('https://zmcgresldlmnwrglimlf.supabase.co', String(process.env.SUPA_KEY))
router.post('/dinobetapi/gameData', authenticateToken, async (req: Request, res: Response) => {
  res.json({ message: req.body });
  let score = await supabase.from("DinoBet").select().eq('Player',req.body.name)
  let scoreTotal = Number(req.body.won);
  score.data?.forEach(element => {
     scoreTotal+=Number(element.Won)
  })
  console.log(scoreTotal)
  await supabase.from("DinoBet").insert({Player: req.body.name, Won: req.body.won})
  bot.sendPhoto(-1001883928989,"source/DinoBanner3mobile.png",{
    caption: `🦖💰🦖💰🦖💰🦖💰🦖💰🦖💰🦖\n\n\n *Player* : ${req.body.name}\n *Won* : \$${Math.floor(req.body.won)}\n *Game* : ${req.body.game.title}\n *Currency* : ${req.body.currency}\n *Multiplier* : x${ Math.round(req.body.multiple)}\n *Total Win* : \$${scoreTotal}\n\n\n🦖💰🦖💰🦖💰🦖💰🦖💰🦖💰🦖`,
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
          [   
              {
                  text: "Play Here",
                  url: "https://dinobet.io/r/ZG3GhFyb"
              },             
          ]
      ]
  }
  })
});
router.post('/dinobetapi/login', (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  const expiresIn = 3650 * 24 * 60 * 60; // 10 years in seconds
  if (username == "dinobet" && password == "DinoBetSecret20239988") {
    const user = { name: username };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Check Username or password" });
  }
});

const botToken = String(process.env.BOT_DINOBET);
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/startDinoBot/, (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  bot.sendMessage(chatId, "Hello! Your notification bot has been set up now!");
});

export default router;

