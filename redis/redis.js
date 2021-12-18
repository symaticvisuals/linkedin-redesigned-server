//io redis is a redis client for node
const Redis = require('ioredis');
require('dotenv').config();
const url = require('url')

const REDIS_URL = process.env.NOMI_REDIS_ENDPOINT;


const client = new Redis(process.env.NOMI_REDIS_ENDPOINT,{
    tls: {
        rejectUnauthorized: false,
        enableTLSForSentinelMode: true
     },
}); //uses default configuration i.e localhost and port 6379

module.exports = {
    client
}