const { PrismaClient } = require('@prisma/client');
const handlePrismaError = require('../../utils/handlePrismaError');

const prisma = new PrismaClient();
const orderBy = { id: 'desc' };

const getAllSurveys = async (req, res) => {
	try {
		let result;
		const { search } = req.query;
		const userId = req.user.id.toString();
		const where = { inspectors: { array_contains: userId } };
		const include = {
			audits: { select: { id: true, inspectorId: true } },
			_count: { select: { audits: true } },
		};

		if (search) {
			result = await prisma.survey.findMany({
				where: { ...where, OR: [{ clientName: { contains: search } }, { hotelName: { contains: search } }] },
				include,
				orderBy,
			});
		} else {
			result = await prisma.survey.findMany({
				where,
				include,
				orderBy,
			});
			// if (!result.length) return res.status(404).json({ error: 'No survey found!' });
		}

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getSurveyById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await prisma.survey.findUnique({
			where: { id: parseInt(id) },
			include: { categories : true, questions: true },
		});
		if (!result) return res.status(404).json({ error: 'Survey not found!' });

		// Group questions by category
		let groupedQuestions = [];
		result.categories.forEach((category) => {
			const catQuestions = result.questions.filter((question) => question.categoryId == category.id);
			groupedQuestions.push({ ...category, questions: catQuestions });
		});

		// Sort grouped questions by category order
		if (result?.sortedCategories?.length) {
			groupedQuestions.sort(
				(a, b) => result.sortedCategories?.indexOf(a.id) - result.sortedCategories?.indexOf(b.id)
			);
		}

		res.status(200).json({ result: { ...result, groupedQuestions } });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const getStats = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);

		const clientId = (await prisma.client.findUnique({ where: { userId } })).id;
		const surveyCount = await prisma.survey.count({
			where: { clientId: parseInt(clientId), type: 'INTERNAL' },
		});
		const auditCount = await prisma.audit.count({ where: { survey: { clientId: parseInt(clientId) } } });
		const inspectorCount = await prisma.inspector.count({ where: { clientId: parseInt(clientId) } });

		// Return counts in the response
		res.status(200).json({ result: { surveyCount, auditCount, inspectorCount } });
	} catch (error) {
		console.error('Error fetching statistics:', error);
		res.status(500).json({ error: 'An error occurred while fetching statistics' });
	}
};

module.exports = {
	getAllSurveys,
	getSurveyById,
	getStats,
};
