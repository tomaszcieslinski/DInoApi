const UNISWAP_TOKEN_QUERRY = `{
    swaps(orderBy: timestamp, orderDirection: desc, where:
     { pool: "0x19c10e1f20df3a8c2ac93a62d7fba719fa777026" }
    ) {
      pool {
    
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      sender
      id
      recipient
      timestamp
      amount0
      amount1
     }
    }`;


const INSERT_EGG_HATCHERS =
  "INSERT INTO nftdata (id,hatchedby,hatchdate) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING";
const INSERT_WALLET_TRANSACTIONS =
  "INSERT INTO wallettransactions (walletaddress,transactionhash,timestamp,value,ethervalue) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING";

const INSERT_WALLETS =
  "INSERT INTO wallets (walletaddress) VALUES ($1) ON CONFLICT DO NOTHING";

const INSERT_BURN_DATA =
  "INSERT INTO burn (txhash,walletaddress,burned,timestamp) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING";

const INSERT_STAKE_DATA =
  "INSERT INTO staking (hash,walletaddress,stakedammount,timestamp) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING";

const GET_TRANSACTIONS = `with ranks as(select walletaddress as address,SUM(ethervalue) as ethervalue,count("timestamp")AS Value, RANK() over (order by SUM(ethervalue)desc) as rank 
    From wallettransactions 
    where ("timestamp" >= ($1) and "timestamp" <= ($2))
    GROUP BY walletaddress
    order by ethervalue desc)
    select * from ranks limit 99`;

const GET_WALLET_RANK = `with ranks as(select walletaddress as address,SUM(ethervalue) as ethervalue,count("timestamp")AS Value, RANK() over (order by SUM(ethervalue)desc) as rank 
From wallettransactions 
where ("timestamp" >= ($1) and "timestamp" <= ($2))
GROUP BY walletaddress
order by ethervalue desc)
select * from ranks
where address = ($3) `;

const GET_BUYS = `select * from wallettransactions w where walletaddress = ($1)
    and ("timestamp" >= ($2) and "timestamp" <= ($3) )`;

const GET_BURN_RANKING = `with ranks as(select walletaddress as address,SUM(burned) as burned,count("timestamp")AS Value, RANK() over (order by SUM(burned)desc) as rank 
    From burn 
    where ("timestamp" >= ($1) and "timestamp" <= ($2))
    GROUP BY walletaddress
    order by burned desc)
    select * from ranks limit 99`;

const GET_BURN_WALLET_RANK = `with ranks as(select walletaddress as address,SUM(burned) as burned,count("timestamp")AS Value, RANK() over (order by SUM(burned)desc) as rank 
    From burn 
    where ("timestamp" >= ($1) and "timestamp" <= ($2))
    GROUP BY walletaddress
    order by burned desc)
    select * from ranks
    where address = ($3)`;

const GET_BURNS = `select * from burn b where walletaddress = ($1)
    and ("timestamp" >= ($2) and "timestamp" <= ($3) )`;

const GET_STAKING_RANKING = ` with ranks as(select walletaddress as address,SUM(stakedammount) as stakedammount,count("timestamp")AS Value, RANK() over (order by SUM(stakedammount)desc) as rank 
    From staking 
    where ("timestamp" >= ($1) and "timestamp" <= ($2))
    GROUP BY walletaddress
    order by stakedammount desc)
    select * from ranks limit 99`;

const GET_STAKING_WALLET_RANK = `with ranks as(select walletaddress as address,SUM(stakedammount) as stakedammount,count("timestamp")AS Value, RANK() over (order by SUM(stakedammount)desc) as rank 
    From staking 
    where ("timestamp" >= ($1) and "timestamp" <= ($2))
    GROUP BY walletaddress
    order by stakedammount desc)
    select * from ranks 
    where address = ($3)`;

const GET_STAKED = `select * from staking s where walletaddress = ($1)
    and ("timestamp" >= ($2) and "timestamp" <= ($3) )`;

const GET_HATCH_RANKING = `SELECT hatchedby, COUNT(*) AS hatchedby_count,
RANK() OVER (ORDER BY COUNT(*) DESC) AS rank
FROM nftdata
WHERE hatchdate BETWEEN ($1) AND ($2)
GROUP BY hatchedby
ORDER BY rank
limit 99`

const GET_HATCH_WALLET_RANKING = `SELECT hatchedby, COUNT(*) AS hatchedby_count,
RANK() OVER (ORDER BY COUNT(*) DESC) AS rank
FROM nftdata
WHERE hatchdate BETWEEN ($1) AND ($2) AND hatchedby = ($3)
GROUP BY hatchedby
ORDER BY rank`

const GET_HATCHED =  `select * from nftdata s where hatchedby = ($1)
and (hatchdate >= ($2) and hatchdate <= ($3) )`;

export default {
  GET_HATCH_RANKING,
  GET_HATCH_WALLET_RANKING,
  GET_HATCHED,
  INSERT_EGG_HATCHERS,
  GET_BURNS,
  GET_BURN_RANKING,
  GET_BURN_WALLET_RANK,
  GET_STAKED,
  GET_STAKING_RANKING,
  GET_STAKING_WALLET_RANK,
  INSERT_STAKE_DATA,
  INSERT_BURN_DATA,
  INSERT_WALLETS,
  INSERT_WALLET_TRANSACTIONS,
  UNISWAP_TOKEN_QUERRY,
  GET_TRANSACTIONS,
  GET_BUYS,
  GET_WALLET_RANK,
};
