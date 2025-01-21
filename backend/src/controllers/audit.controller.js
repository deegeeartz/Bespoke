const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const handlePrismaError = require('../utils/handlePrismaError');

const prisma = new PrismaClient();

const orderBy = { id: 'desc' };

const schema = Joi.object({
	expense: Joi.string().allow(''),
	brandStandard: Joi.string().allow(''),
	detailedSummary: Joi.string().allow(''),
	executiveSummary: Joi.string().allow(''),
	scenario: Joi.string().allow(''),
	status: Joi.string().allow(''),
	responses: Joi.array(),
	uploads: Joi.object(),
	surveyId: Joi.number().required(),
	// inspectorId: Joi.number().required(),
});

function determineState(optionText) {
	if (optionText === 'NO') return 'NOT_ADDRESSED';
	else if (optionText === 'YES') return 'ADDRESSED';
	else return 'NOT_SEEN';
};

async function getCatId(id) {
	const catId = await prisma.question.findFirst({
        where : {
            id
        },
        select : {
            categoryId : true
        }
    });
	return (catId).categoryId;
};

const getAllRecords = async (req, res) => {
	try {
		const { search } = req.query;
		const include = { inspector: true, survey: true };
		let result;

		if (search) {
			result = await prisma.audit.findMany({
				where: {
					OR: [
						{ survey: { clientName: { contains: search } } },
						{ survey: { hotelName: { contains: search } } },
					],
				},
				include,
				orderBy,
			});
		} else {
			result = await prisma.audit.findMany({ include, orderBy });
			// if (!result.length) return res.status(404).json({ error: 'No audit found!' });
		}

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getInspectorAudits = async (req, res) => {
	try {
		const { search } = req.query;
		const userId = parseInt(req.user.id);
		const include = { inspector: true, survey: true };
		let result;

		if (search) {
			result = await prisma.audit.findMany({
				where: {
					inspector: { userId },
					OR: [
						{ survey: { clientName: { contains: search } } },
						{ survey: { hotelName: { contains: search } } },
					],
				},
				include,
				orderBy,
			});
		} else {
			result = await prisma.audit.findMany({ where: { inspector: { userId } }, include, orderBy });
		}

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getClientAudits = async (req, res) => {
	try {
		const { search } = req.query;
		const userId = parseInt(req.user.id);
		const include = { survey: true };
		let result;

		if (search) {
			result = await prisma.audit.findMany({
				where: {
					survey: { client: { userId } },
					OR: [
						{ survey: { hotelName: { contains: search } } },
						{ survey: { campaign: { contains: search } } },
					],
				},
				include,
				orderBy,
			});
		} else {
			result = await prisma.audit.findMany({
				where: { survey: { client: { userId } } },
				include,
				orderBy,
			});
			if (!result.length) return res.status(404).json({ error: 'No audit found for this user!' });
		}

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getSurveyAudits = async (req, res) => {
	try {
		const { id: surveyId } = req.params;

		const result = await prisma.audit.findMany({
			where: { surveyId: parseInt(surveyId) },
			select: {
				id: true,
				status: true,
				createdAt: true,
				inspector: {
					select: { user: { select: { name: true } } },
				},
			},
			orderBy,
		});

		// Format result
		const formattedResult = result.map((audit) => ({
			id: audit.id,
			status: audit.status,
			createdAt: new Date(audit.createdAt).toDateString(),
			inspectorName: audit?.inspector?.user?.name,
		}));
		res.status(200).json({ result: formattedResult });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const addFeedback = async (req, res) => {
	try {
		const { id: auditId } = req.params;
		const { feedback, uploads } = req.body;

		const audit = await prisma.audit.findUnique({ where: { id: parseInt(auditId) } });
		// Update feedback and uploads
		const result = await prisma.audit.update({
			where: { id: parseInt(auditId) },
			data: { feedback, uploads: { ...audit.uploads, feedback: uploads } },
		});

		if (!result) return res.status(404).json({ error: 'Audit not found!' });
		res.status(200).json({ message: 'Feedback updated successfully!', result });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const getRecordById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await prisma.audit.findUnique({
			where: { id: parseInt(id) },
			include: {
				inspector: true,
				survey: { include: { categories : true, questions: true } },
				responses: true,
			},
		});

		if (!result) return res.status(404).json({ error: 'Audit not found!' });

		// Group questions by category
		let groupedQuestions = [];
		result.survey.categories.forEach((category) => {
			const catQuestions = result.survey.questions.filter((question) => question.categoryId == category.id);
			groupedQuestions.push({ ...category, questions: catQuestions });
		});
		// Sort grouped questions by category order
		if (result.survey?.sortedCategories?.length) {
			groupedQuestions.sort(
				(a, b) =>
					result.survey.sortedCategories?.indexOf(a.id) - result.survey.sortedCategories?.indexOf(b.id)
			);
		}
		res.status(200).json({ result: { ...result, groupedQuestions } });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching the audit record' });
	}
};

const createRecord = async (req, res) => {
	try {
		const { error, value } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const {
			expense,
			brandStandard,
			detailedSummary,
			executiveSummary,
			scenario,
			status,
			surveyId,
			responses,
			uploads,
		} = value;

		// Validate inspector existence
		const userId = parseInt(req.user.id);
		const inspector = await prisma.inspector.findUnique({ where: { userId } });
		if (!inspector) return res.status(404).json({ error: 'Inspector not found!' });

		const _clientId = await prisma.survey.findUnique({
			where : {id : parseInt(surveyId)},
			select : {
				clientId : true
			}
		});

		if (!_clientId) return res.status(404).json({ error: 'Client not found!' });

		const result = await prisma.audit.create({
			data: {
				expense,
				brandStandard,
				detailedSummary,
				executiveSummary,
				scenario,
				status,
				inspectorId: inspector.id,
				surveyId,
				uploads,
				clientId : _clientId.clientId,
			},
		});
		const updatedResponse = await Promise.all(responses.map(async (response) => ({
			answer: response.answer,
			optionAnswer: response.optionAnswer,
			optionText: response.optionText,
			files: response.files ?? [],
			skip: response.skip,
			questionId: response.questionId,
			categoryId  : await getCatId(response.questionId),
			state : determineState(response.optionText),
			auditId : result.id
		})));
	
		await prisma.response.createMany({
			data: updatedResponse, // Wrap updatedResponse in a `data` field
			skipDuplicates: true, // Optional: Skips inserting duplicates
		  });

		await prisma.surveyCategory.updateMany({
			where : {
				surveyId : parseInt(surveyId)
			},
			data : {
				auditId : result.id
			}
		});

		res.status(201).json({ result, message: 'Audit created successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const updateRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const { error, value } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const {
			expense,
			brandStandard,
			detailedSummary,
			executiveSummary,
			scenario,
			status,
			surveyId,
			uploads,
			responses,
		} = value;

		const _clientId = await prisma.survey.findUnique({
			where : {id : parseInt(surveyId)},
			select : {
				clientId : true
			}
		});

		if (!_clientId) return res.status(404).json({ error: 'Client not found!' });

		const result = await prisma.audit.update({
			where: { id: parseInt(id) },
			data: {
				expense,
				brandStandard,
				detailedSummary,
				executiveSummary,
				scenario,
				status,
				survey : {
					connect : {
						id : surveyId
					}
				},
				uploads,
				client : {
					connect : {
						id : _clientId.clientId
					}
				},
			},
		});

		for (const response of responses) {
			
			await prisma.response.upsert({
				where : {
					id : parseInt(response.id || 0)
				},
				create : {
					answer: response.answer,
					optionAnswer: response.optionAnswer,
					optionText: response.optionText,
					files: response.files ?? [],
					skip: response.skip,
					state : determineState(response.optionText),
					question: { connect: { id: parseInt(response.questionId) } },
					audit: { connect: { id: parseInt(result.id) } },
					category : {connect : {id : await getCatId(response.questionId)}}
				},
				update : {
					answer: response.answer,
					optionAnswer: response.optionAnswer,
					optionText: response.optionText,
					files: response.files ?? [],
					skip: response.skip,
					questionId: response.questionId,
					auditId : response.auditId
				},
			})
		};

		res.status(200).json({ result, message: 'Audit updated successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const deleteRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const auditId = parseInt(id);

		const existingAudit = await prisma.audit.findUnique({ where: { id: auditId } });
		if (!existingAudit) return res.status(404).json({ error: 'Audit not found!' });

		await prisma.response.deleteMany({ where: { auditId } });
		await prisma.audit.delete({ where: { id: auditId } });

		res.status(200).json({ message: 'Audit deleted successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

module.exports = {
	getAllRecords,
	getRecordById,
	createRecord,
	updateRecord,
	deleteRecord,
	getInspectorAudits,
	getSurveyAudits,
	getClientAudits,
	addFeedback,
};
