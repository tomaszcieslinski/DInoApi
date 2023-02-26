/** source/routes/posts.ts */
import express from "express";
import controller from "../controllers/transactions";
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();


router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerJsdoc));

router.get("/transactions", controller.getTransactions);
router.get("/walletRank", controller.getWalletRank);
export = router;
