const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createCategoriesFromSurvey = async () => {
    try {
      // Fetch all surveys with categories
      const surveys = await prisma.survey.findMany({
        select: { id: true, categories: true }, // Select only id and categories
      });
      console.log(surveys);
      const categoryOperations = [];
      
      surveys.forEach((survey) => {
        if (survey.categories) {
          console.log(survey.categories);
          // Parse categories JSON
          const categories = survey.categories;
          // Prepare upsert operations for each category
          categories.forEach((category) => {
            categoryOperations.push(
              prisma.surveyCategory.upsert({
                where: { catId: category.id },
                create: {
                  surveyId: survey.id,
                  catId: category.id,
                  title: category.title,
                },
                update: {
                  title: category.title,
                },
              })
            );
          });
        }
      });
  
      // Execute all operations in a transaction
      await prisma.$transaction(categoryOperations);
  
      console.log("Categories created or updated successfully!");
    } catch (error) {
      console.error("Error creating categories:", error);
    }
  };
  
  createCategoriesFromSurvey();
  