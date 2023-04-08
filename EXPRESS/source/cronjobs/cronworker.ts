import burnservice from "../services/burnservice"
import stakingservice from "../services/stakingservice"
import nftservice from "../services/nftservice"
var cron = require('node-cron');
let currentDate = new Date(Date.now()).toString()
function worker(){ 
    cron.schedule('*/30 * * * *', () => {
        console.log("Executing hatch table synchronization", currentDate)
        nftservice.synchNFTDataBase()
        nftservice.synchDatabase()
        console.log("Executing burn table synchronization", currentDate)
        burnservice.synchDatabase()
        console.log("Executing staking table synchronization", currentDate)
        stakingservice.synchDatabase()
    });
}
export default {worker}