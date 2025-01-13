const readXlsxFile = require('read-excel-file/node');

const extractDataFromExcel = async (file) => {
	const excelRows = await readXlsxFile(file.data).then((rows) => {
		rows.shift(); // Remove header row
		return rows;
	});

	let categories = [];
	let questions = [];

	excelRows.forEach((row) => {
		const [categoryTitle, questionText, options] = row;
		const categoryIndex = categories.findIndex((cat) => cat.title === categoryTitle.trim());
		let categoryId = categories[categoryIndex]?.id;

		// Add category if it doesn't exist
		if (categoryIndex === -1) {
			categoryId = Math.floor(Math.random() * Date.now()).toString();
			const newCategory = { title: categoryTitle.trim(), id: categoryId };
			categories.push(newCategory);
		}

		// Add question to the category
		const questionOptions = options && options.split(',').map((opt) => opt.trim());
		const newQuestion = {
			type: questionOptions ? 'multi_choice' : 'text',
			text: questionText.trim(),
			options: questionOptions ? Object.fromEntries(questionOptions.map((opt, i) => [i + 1, opt])) : {},
			categoryId: categoryId || '',
		};
		questions.push(newQuestion);
	});

	return { categories, questions };
};

module.exports = { extractDataFromExcel };
