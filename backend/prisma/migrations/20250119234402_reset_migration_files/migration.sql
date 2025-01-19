-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `question_categoryId_fkey`;

-- AlterTable
ALTER TABLE `inspector` ADD COLUMN `clientId` INTEGER NULL,
    ADD COLUMN `type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'EXTERNAL';

-- AlterTable
ALTER TABLE `question` MODIFY `categoryId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `response` ADD COLUMN `optionText` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `survey` ADD COLUMN `categories` JSON NULL,
    ADD COLUMN `type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'EXTERNAL';

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `inspector_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
