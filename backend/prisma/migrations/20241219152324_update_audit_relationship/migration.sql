-- DropIndex
DROP INDEX `audit_inspectorId_fkey` ON `audit`;

-- DropIndex
DROP INDEX `audit_surveyId_fkey` ON `audit`;

-- DropIndex
DROP INDEX `inspector_clientId_fkey` ON `inspector`;

-- DropIndex
DROP INDEX `question_surveyId_fkey` ON `question`;

-- DropIndex
DROP INDEX `response_auditId_fkey` ON `response`;

-- DropIndex
DROP INDEX `response_questionId_fkey` ON `response`;

-- DropIndex
DROP INDEX `survey_clientId_fkey` ON `survey`;

-- AlterTable
ALTER TABLE `audit` MODIFY `surveyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `inspector_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `inspector_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey` ADD CONSTRAINT `survey_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
