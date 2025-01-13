const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const handlePrismaError = require('../../utils/handlePrismaError');
const { extractDataFromExcel } = require('../../utils/extractDataFromExcel');

const prisma = new PrismaClient();
const orderBy = { id: 'desc' };

const schema = Joi.object({
	clientId: Joi.number().allow(''),
	clientName: Joi.string().allow(''),
	hotelName: Joi.string().allow(''),
	campaign: Joi.string().allow(''),
	location: Joi.string().allow(''),
	startDate: Joi.string().allow(''),
	endDate: Joi.string().allow(''),
	inspectors: Joi.array().allow(''),
	questions: Joi.array(),
	categories: Joi.array().allow(''),
	sortedCategories: Joi.array().allow(''),
	payload: Joi.string().allow(''),
	surveyType: Joi.string().allow(''),
});

const getAllRecords = async (req, res) => {
	try {
		const { search, surveyType = 'EXTERNAL' } = req.query;
		let result;
		const include = {
			_count: { select: { audits: true } },
		};

		if (search) {
			result = await prisma.survey.findMany({
				where: {
					OR: [{ clientName: { contains: search } }, { hotelName: { contains: search } }],
					type: surveyType,
				},
				include,
				orderBy,
			});
		} else {
			result = await prisma.survey.findMany({ where: { type: surveyType }, include, orderBy });
		}

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getRecordById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await prisma.survey.findUnique({
			where: { id: parseInt(id) },
			include: { questions: true },
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

		res.status(200).json({ result: { ...result, groupedQuestions: groupedQuestions } });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const createRecord = async (req, res) => {
	try {
		// Validation
		const { error, value } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const data = value.payload ? JSON.parse(value.payload) : value;
		const {
			clientId,
			clientName,
			hotelName,
			campaign,
			location,
			startDate,
			endDate,
			inspectors,
			categories,
			questions,
			surveyType = 'EXTERNAL',
		} = data;

		let surveyCategories = categories;
		let surveyQuestions = questions;

		const excelFile = req?.files?.excelFile;
		if (excelFile) {
			const { categories, questions } = await extractDataFromExcel(excelFile);
			surveyCategories = categories;
			surveyQuestions = questions;
		}

		// Create record
		const result = await prisma.survey.create({
			data: {
				hotelName,
				campaign,
				location,
				startDate: startDate ? new Date(startDate) : null,
				endDate: endDate ? new Date(endDate) : null,
				inspectors,
				clientName,
				clientId: Number(clientId),
				categories: surveyCategories || [],
				type: surveyType,
				questions: {
					create: surveyQuestions.map((question) => ({
						type: question.type,
						text: question.text,
						options: question.options ?? {},
						categoryId: question.categoryId,
					})),
				},
			},
		});

		res.status(201).json({ result, message: 'Survey created successfully!' });
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
			clientId,
			clientName,
			hotelName,
			campaign,
			location,
			startDate,
			endDate,
			inspectors,
			questions,
			categories,
			sortedCategories,
		} = value;

		// Check if record exists
		const existingSurvey = await prisma.survey.findUnique({ where: { id: parseInt(id) } });
		if (!existingSurvey) return res.status(404).json({ error: 'Survey not found!' });

		// Determine questions to delete
		const incomingQuestionIds = questions.map((q) => q.id).filter((id) => id);

		// Delete questions that are not in the incoming list
		await prisma.question.deleteMany({
			where: { surveyId: parseInt(id), id: { notIn: incomingQuestionIds } },
		});

		// Prepare upsert operations for incoming questions
		const upsertOperations = questions.map((question) => {
			return prisma.question.upsert({
				where: { id: question.id || 0 }, // If id is provided, use it for the where clause
				create: {
					survey: { connect: { id: parseInt(id) } },
					categoryId: question.categoryId,
					type: question.type,
					text: question.text,
					options: question.options ?? {},
				},
				update: {
					type: question.type,
					text: question.text,
					options: question.options ?? {},
					categoryId: question.categoryId,
				},
			});
		});

		// Execute all upsert operations within a transaction
		await prisma.$transaction(upsertOperations);

		// Update survey details
		const result = await prisma.survey.update({
			where: { id: parseInt(id) },
			data: {
				hotelName,
				campaign,
				location,
				startDate: startDate ? new Date(startDate) : null,
				endDate: endDate ? new Date(endDate) : null,
				inspectors,
				clientName,
				clientId,
				categories: categories || [],
				sortedCategories,
			},
		});

		res.status(200).json({ result, message: 'Survey updated successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const deleteRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const surveyId = parseInt(id);

		const existingSurvey = await prisma.survey.findUnique({ where: { id: surveyId } });
		if (!existingSurvey) return res.status(404).json({ error: 'Survey not found!' });

		// Delete survey and all associated questions
		await prisma.question.deleteMany({ where: { surveyId } });
		await prisma.survey.delete({ where: { id: surveyId } });

		// Delete all audits associated with the survey and their responses
		await prisma.response.deleteMany({ where: { audit: { surveyId } } });
		await prisma.audit.deleteMany({ where: { surveyId } });

		res.status(200).json({ message: 'Survey deleted successfully!' });
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
};
