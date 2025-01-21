const { PrismaClient } = require('@prisma/client');
const express = require('express');
const handlePrismaError = require('../../utils/handlePrismaError');
const { hashPassword } = require('../../utils/hashPassword');
const router = express.Router();

const prisma = new PrismaClient();

router.get('/stats', async (req, res) => {
	try {
		// Get counts using Prisma aggregation functions
		const survey = await prisma.survey.count();
		const client = await prisma.client.count();
		const inspector = await prisma.inspector.count();

		// Return counts in the response
		res.status(200).json({ result: { survey, client, inspector } });
	} catch (error) {
		console.error('Error fetching statistics:', error);
		res.status(500).json({ error: 'An error occurred while fetching statistics' });
	}
});

router.put('/change-password', async (req, res) => {
	const userId = parseInt(req.user.id);

	try {
		// Validation
		const schema = Joi.object({
			password: Joi.string().required(),
			newPassword: Joi.string().required(),
		});
		const { error } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const { password, newPassword } = req.body;

		// Fetch user from the database
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) return res.status(404).json({ error: 'User not found!' });

		// Verify current password
		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect current password!' });

		// Hash the new password
		const hashedNewPassword = await hashPassword(newPassword);

		// Update user details
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedNewPassword },
		});

		res.status(200).json({ message: 'Password updated successfully!' });
	} catch (error) {
		console.error('Error updating password:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
});

module.exports = router;
