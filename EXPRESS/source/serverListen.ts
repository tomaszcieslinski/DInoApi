/** source/server.ts */
import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import routes from "./routes/posts";
import transactions from "./controllers/transactions";

import cronworker from './cronjobs/cronworker'
import Web3 from "web3";
import { Network, Alchemy, AssetTransfersCategory, fromHex } from "alchemy-sdk";
import nftservice from "./services/nftservice";

const router: Express = express();

/** Logging */
router.use(morgan("dev"));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*");
  // set the CORS headers
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With,Content-Type,Accept, Authorization"
  );
  // set the CORS method headers
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }
  next();
});

/** Routes */
router.use("/", routes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message,
  });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
//cronworker.worker()
// //transactions.listen();
// nftservice.synchTraitDatabase()

// console.log("testStart")
// nftservice.synchDatabase()
console.log("testStart")
nftservice.synchNFTDataBase()
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
);
//nftservice.synchNFTDataBase()

