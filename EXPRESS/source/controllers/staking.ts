/** source/controllers/posts.ts */
import { Request, Response, NextFunction, response } from "express";
import stakingservice from "../services/stakingservice";

const getStakingRanking = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let res = await stakingservice.getRanking(dateFrom,dateTo)
    return response.status(200).json({ res });
}

const getStakingWalletRank = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let wallet = req.query.walletaddress?.toString().toLowerCase()
    let res = await stakingservice.getWalletRank(dateFrom,dateTo,wallet)
    return response.status(200).json({ res });
}

const getStakedByWallet = async(req: Request, response: Response)=>{
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    let wallet = req.query.walletaddress?.toString().toLowerCase()
    let res = await stakingservice.getStaked(dateFrom,dateTo,wallet)
    return response.status(200).json({ res });
}

export default {getStakingRanking,getStakingWalletRank,getStakedByWallet}