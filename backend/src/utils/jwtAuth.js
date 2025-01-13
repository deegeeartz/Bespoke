const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

exports.generateToken = (user) => {
	return jwt.sign(user, SECRET_KEY, { expiresIn: '6h' });
};
