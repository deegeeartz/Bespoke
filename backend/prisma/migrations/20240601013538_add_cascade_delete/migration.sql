-- DropForeignKey
ALTER TABLE `Audit` DROP FOREIGN KEY `Audit_inspectorId_fkey`;

-- DropForeignKey
ALTER TABLE `Audit` DROP FOREIGN KEY `Audit_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `Client` DROP FOREIGN KEY `Client_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Inspector` DROP FOREIGN KEY `Inspector_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `Response` DROP FOREIGN KEY `Response_auditId_fkey`;

-- DropForeignKey
ALTER TABLE `Response` DROP FOREIGN KEY `Response_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Survey` DROP FOREIGN KEY `Survey_clientId_fkey`;

-- AlterTable
ALTER TABLE `Audit` MODIFY `inspectorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Survey` MODIFY `clientId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inspector` ADD CONSTRAINT `Inspector_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey` ADD CONSTRAINT `Survey_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `Inspector`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Response` ADD CONSTRAINT `Response_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Response` ADD CONSTRAINT `Response_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `Audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
