-- DropForeignKey
ALTER TABLE `audit` DROP FOREIGN KEY `Audit_inspectorId_fkey`;

-- DropForeignKey
ALTER TABLE `audit` DROP FOREIGN KEY `Audit_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `client` DROP FOREIGN KEY `Client_userId_fkey`;

-- DropForeignKey
ALTER TABLE `inspector` DROP FOREIGN KEY `Inspector_userId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `response` DROP FOREIGN KEY `Response_auditId_fkey`;

-- DropForeignKey
ALTER TABLE `response` DROP FOREIGN KEY `Response_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `survey` DROP FOREIGN KEY `Survey_clientId_fkey`;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `inspector_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey` ADD CONSTRAINT `survey_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit` ADD CONSTRAINT `audit_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `inspector`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit` ADD CONSTRAINT `audit_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `response` ADD CONSTRAINT `response_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `response` ADD CONSTRAINT `response_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `client` RENAME INDEX `Client_userId_key` TO `client_userId_key`;

-- RenameIndex
ALTER TABLE `inspector` RENAME INDEX `Inspector_userId_key` TO `inspector_userId_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
