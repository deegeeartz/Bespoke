const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { verifyPassword } = require('../../utils/hashPassword');
const { generateToken } = require('../../utils/jwtAuth');
const handlePrismaError = require('../../utils/handlePrismaError');

const prisma = new PrismaClient();

const userLogin = async (req, res) => {
	try {
		const schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
		});

		const { error, value } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });
		const { email, password } = value;

		const user = await prisma.user.findUnique({
			where: { email },
			include: { client: true, inspector: true },
		});
		// Verify the password
		const passwordMatch = await verifyPassword(password, user?.password ?? '');
		if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password!' });

		delete user.password; // Remove password property
		const token = generateToken({ id: user.id });
		res.status(200).json({ user, message: 'Login successful!', token });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const adminSetup = async (req, res) => {
	try {
		// Check if an admin already exist
		const existingUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
		if (existingUser) return res.status(403).json({ error: 'Admin has already been created!' });

		// Create record
		const hashPassword = await bcrypt.hash('@admin234bespoke', 10);
		await prisma.user.create({
			data: {
				name: 'Super Admin',
				email: 'admin@bespoke.com',
				password: hashPassword, // Hash password
				role: 'ADMIN',
			},
		});

		// Return response
		res.status(200).json({ message: 'Admin setup successful!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

module.exports = {
	userLogin,
	adminSetup,
};
