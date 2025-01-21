const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getResponseByClientId(req, res) {
    try {
        
    } catch (error) {
        console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
    } 
}