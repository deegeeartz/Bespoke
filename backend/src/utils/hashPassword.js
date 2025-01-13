const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
	const hashPassword = await bcrypt.hash(password, 10);
	return hashPassword;
};

const verifyPassword = async (password, hashPassword) => {
	return await bcrypt.compare(password, hashPassword);
};

module.exports = { hashPassword, verifyPassword };
