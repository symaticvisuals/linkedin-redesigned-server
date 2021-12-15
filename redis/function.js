const { client } = require('../redis/redis');

const setKey = async (key, value, expire = 0) => {
    let set = await client.set(key, value);

    if (expire != 0) {
        await client.expire(key, expire);
    }

    return set;
}

const getValue = async (key) => {
    let value = await client.get(key);
    return value;
}

const deleteKey = async (key) => {
    let value = await client.del(key);
    return value;
}

// const set_SET = async(key)=>{

// }
module.exports = {
    setKey,
    getValue,
    deleteKey
}