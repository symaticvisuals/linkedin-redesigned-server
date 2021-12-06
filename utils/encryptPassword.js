const bcrypt = require('bcrypt');
const salt = 10;

exports.cryptPassword = async (password) => {
    let hashed = await bcrypt.hash(password, salt);
    return hashed;
}

exports.comparePassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
}