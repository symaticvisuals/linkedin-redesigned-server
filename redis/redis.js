//io redis is a redis client for node
const Redis = require('ioredis');
require('dotenv').config();

const REDIS_URL = process.env.NOMI_REDIS_ENDPOINT;

// uses heroku redis endpoint
//  >>>for testing

// const client = new Redis(REDIS_URL,{
//     tls: {
//         rejectUnauthorized: false,
//         enableTLSForSentinelMode: true
//      },
// });

//uses default configuration i.e localhost and port 6379
// >>>for development
const client = new Redis();

module.exports = {
    client
}