import burnservice from "../services/burnservice"
import stakingservice from "../services/stakingservice"
import nftservice from "../services/nftservice"
var cron = require('node-cron');
let currentDate = new Date(Date.now()).toString()
function worker(){ 
    cron.schedule('*/30 * * * *', () => {
        console.log("Executing hatch table synchronization", currentDate)
        nftservice.synchDatabase()
        console.log("Executing burn table synchronization", currentDate)
        burnservice.synchDatabase()
        console.log("Executing staking table synchronization", currentDate)
        stakingservice.synchDatabase()
    });
}

function worker2(){ 
    cron.schedule('0 * * * *', () => {
        console.log("Executing NFT tables synchronization", currentDate)
        nftservice.synchNFTDataBase()
    });
}
export default {worker,worker2}