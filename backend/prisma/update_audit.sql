-- AlterTable
ALTER TABLE `audit` ADD COLUMN `clientId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `category` MODIFY `title` VARCHAR(191) NOT NULL;

UPDATE `audit`
SET `clientId` = (
    SELECT `clientId`
    FROM `survey`
    WHERE `survey`.`id` = `audit`.`surveyId`
);


-- CreateIndex
CREATE INDEX `audit_clientId_idx` ON `audit`(`clientId`);

-- AddForeignKey
ALTER TABLE `audit` ADD CONSTRAINT `audit_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

