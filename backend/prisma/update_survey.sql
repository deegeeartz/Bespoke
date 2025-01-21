-- -- AlterTable
-- ALTER TABLE `question` MODIFY `categoryId` VARCHAR(191) NULL;

-- -- AlterTable
-- ALTER TABLE `response` ADD COLUMN `categoryId` VARCHAR(191) NULL,
--     ALTER COLUMN `updatedAt` DROP DEFAULT;


-- -- CreateTable
-- CREATE TABLE `surveyCategory` (
--     `recId` INTEGER NOT NULL AUTO_INCREMENT,
--     `title` VARCHAR(191) NULL,
--     `id` VARCHAR(191) NULL,
--     `surveyId` INTEGER NULL,
--     `auditId` INTEGER NULL,

--     UNIQUE INDEX `surveyCategory_catId_key`(`catId`),
--     PRIMARY KEY (`id`)
-- ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -- AddForeignKey
-- ALTER TABLE `surveyCategory` ADD CONSTRAINT `surveyCategory_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE `surveyCategory` ADD CONSTRAINT `surveyCategory_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- INSERT IGNORE INTO surveyCategory (id, surveyId)
-- SELECT DISTINCT q.categoryId, q.surveyId
-- FROM question q
-- LEFT JOIN surveyCategory sc ON q.categoryId = sc.id
-- WHERE sc.id IS NULL;

-- AddForeignKey
-- ALTER TABLE `question` ADD CONSTRAINT `question_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `surveyCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE `response` ADD CONSTRAINT `response_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `surveyCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `survey` DROP COLUMN `categories`;