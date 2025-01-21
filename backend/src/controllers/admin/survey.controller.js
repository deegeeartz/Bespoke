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
	categories: Joi.array(),
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
			include: {
				questions : true,
				categories : true
			},
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
		// Validate incoming request body using the defined schema
		const { error, value } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		// Parse payload if it exists, otherwise use the validated value directly
		const data = value.payload ? JSON.parse(value.payload) : value;

		// Check if the categories array is empty, and return an error if so
		if (data.categories.length <= 0) return res.status(400).json({ error: 'Your survey is probably empty' });

		// Destructure validated data into individual variables
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
			surveyType = 'EXTERNAL', // Default survey type to 'EXTERNAL' if not provided
		} = data;

		// Assign categories and questions to local variables for later use
		let surveyCategories = categories;
		let surveyQuestions = questions;

		// Check if an Excel file was uploaded in the request
		const excelFile = req?.files?.excelFile;
		if (excelFile) {
			// Extract categories and questions from the uploaded Excel file
			const { categories, questions } = await extractDataFromExcel(excelFile);
			surveyCategories = categories; // Update categories from Excel data
			surveyQuestions = questions; // Update questions from Excel data
		}
		
		// Create the main survey record in the database
		let result = await prisma.survey.create({
			data: {
				hotelName,
				campaign,
				location,
				startDate: startDate ? new Date(startDate) : null, // Convert startDate to Date or null
				endDate: endDate ? new Date(endDate) : null, // Convert endDate to Date or null
				inspectors,
				clientName,
				clientId: Number(clientId), // Ensure clientId is a number
				type: surveyType, // Survey type
				categories : {
					create: surveyCategories.map((cat) => ({
						title: cat.title,
						id : cat.id,
					})),
				},
				questions: {
					create: surveyQuestions.map((question) => ({
						type: question.type,
						text: question.text,
						options: question.options ?? {}, // Default options to an empty object
						categoryId: question.categoryId, // Associate question with a category
					})),
				},
			},
		});

		res.status(201).json({ result, message: 'Survey created successfully!' });
	} catch (error) {
		// Handle any Prisma errors that occur during the process
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response); // Send error response
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
		const incomingCategoryIds = categories.map((cat) => cat.id).filter((id) => id);

		// Delete questions that are not in the incoming list
		const deleted = await prisma.question.deleteMany({
			where: { surveyId: parseInt(id), id: { notIn: incomingQuestionIds } },
		});

		await prisma.surveyCategory.deleteMany({
			where: { surveyId: parseInt(id), id: { notIn: incomingCategoryIds } },
		});

		// Prepare upsert operations for incoming questions
		const questionUpsertOperations = questions.map((question) => {
			return prisma.question.upsert({
				where: { id: question.id || 0 }, // If id is provided, use it for the where clause
				create: {
					survey: { connect: { id: parseInt(id) } },
					category : {connect : {id : question.categoryId}},
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

		// Prepare upsert operations for incoming categories
		const categoryUpsertOperations = categories.map((category) => {
			return prisma.surveyCategory.upsert({
				where: { id : category.id || 0}, 
				create: {
					survey: { connect: { id: parseInt(id) } },
					id: category.id,
					title: category.title,
				},
				update: {
					id: category.id,
					title: category.title,
				},
			});
		});

		// Execute all upsert operations within a transaction
		await prisma.$transaction([...categoryUpsertOperations, ...questionUpsertOperations]);

		// Update survey details
		let result = await prisma.survey.update({
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
				sortedCategories,
			},
		});
		result = {
			...result,
			categories : categories || []
		}
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
