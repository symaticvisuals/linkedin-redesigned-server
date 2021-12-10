//io redis is a redis client for node
const Redis = require('ioredis');
const client = new Redis(); //uses default configuration i.e localhost and port 6379

module.exports = {
    client
}