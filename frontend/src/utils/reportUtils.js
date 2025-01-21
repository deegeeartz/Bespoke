// reportUtils.js

export const getYesNoQuestions = (responses, questions, categories) => {
	const yesQuestions = [];
	const noQuestions = [];
	// const naQuestions = [];

	responses.forEach((response) => {
		const question = questions.find((q) => q.id == response.questionId);
		const category = categories?.find((c) => c.id == question?.categoryId);

		if (question) {
			if (response?.optionText?.toUpperCase() == 'YES') {
				yesQuestions.push({ ...question, response, category: categories ? category : null });
			} else if (response?.optionText?.toUpperCase() == 'NO') {
				noQuestions.push({ ...question, response, category: categories ? category : null });
			}
			// else if (response?.optionText?.toUpperCase() == 'N/A') {
			// 	naQuestions.push({ ...question, response, category: categories ? category : null });
			// }
		}
	});

	return { yesQuestions, noQuestions };
};

export const calculateQuestionStatistics = (yesQuestions, noQuestions) => {
	const totalCount = yesQuestions.length + noQuestions.length || 0;
	const yesCount = yesQuestions.length || 0;
	const noCount = noQuestions.length || 0;

	const yesPercentage = ((yesCount / totalCount) * 100).toFixed(2);
	const noPercentage = ((noCount / totalCount) * 100).toFixed(2);

	return {
		totalCount,
		yesCount,
		noCount,
		// Check if it is a valid number
		yesPercentage: isNaN(yesPercentage) ? 0 : yesPercentage,
		noPercentage: isNaN(noPercentage) ? 0 : noPercentage,
	};
};

// Function to get pie chart data
export const getPieData = (yesCount, noCount) => {
	return {
		labels: ['Yes', 'No'],
		datasets: [
			{
				data: [yesCount, noCount],
				backgroundColor: ['#36A2EB', '#FF6384'],
			},
		],
	};
};

// Function to get rating stars based on percentage
export const getRatingStars = (percentage) => {
	if (percentage >= 80) {
		return '★★★';
	} else if (percentage >= 60) {
		return '★★';
	} else {
		return '★';
	}
};

// Function to get bar chart data
export const getBarData = (yesPercentage, noPercentage, averageStats) => {
	return {
		labels: ['Yes', 'No'],
		datasets: [
			{
				label: 'Current Survey',
				data: [yesPercentage, noPercentage],
				backgroundColor: ['#36A2EB', '#FF6384'],
			},
			{
				label: 'Average Survey',
				data: [averageStats.yesPercentage, averageStats.noPercentage],
				backgroundColor: ['#FFCE56', '#4BC0C0'],
			},
		],
	};
};

// Function to calculate statistics for category
export function calculateCategoryStats(category, questions) {
	let categoryYesCount = 0;
	let categoryNoCount = 0;
	let categoryTotalQuestions = 0;

	questions.forEach((question) => {
		if (question.response?.optionText?.toUpperCase() == 'YES') {
			categoryYesCount++;
			categoryTotalQuestions++;
		} else if (question.response?.optionText?.toUpperCase() == 'NO') {
			categoryNoCount++;
			categoryTotalQuestions++;
		}
	});

	const yesPercentage = ((categoryYesCount / categoryTotalQuestions) * 100).toFixed(2);
	const noPercentage = ((categoryNoCount / categoryTotalQuestions) * 100).toFixed(2);

	return { category, yesPercentage, noPercentage };
}

// Function to calculate average statistics across all clients
export const calculateAverageStatistics = (surveyReports) => {
	const totalStats = surveyReports.reduce(
		(acc, report) => {
			const stats = calculateStatistics(report.responses);
			acc.totalQuestions += stats.totalQuestions;
			acc.yesCount += stats.yesCount;
			acc.noCount += stats.noCount;
			return acc;
		},
		{ totalQuestions: 0, yesCount: 0, noCount: 0 }
	);

	const yesPercentage = ((totalStats.yesCount / totalStats.totalQuestions) * 100).toFixed(2);
	const noPercentage = ((totalStats.noCount / totalStats.totalQuestions) * 100).toFixed(2);

	return { yesPercentage, noPercentage };
};
