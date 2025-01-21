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

-- CreateTable
CREATE TABLE `internalStaff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NULL,
    `hotelName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `passcode` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `clientId` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `internalStaff_email_key`(`email`),
    INDEX `internalStaff_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `queryStaff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment` TEXT NULL,
    `deadline` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'DONE') NOT NULL DEFAULT 'PENDING',
    `staffId` INTEGER NULL,
    `clientId` INTEGER NULL,
    `responseId` INTEGER NULL,
    `questionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `inspector_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `internalStaff` ADD CONSTRAINT `internalStaff_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queryStaff` ADD CONSTRAINT `queryStaff_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `internalStaff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queryStaff` ADD CONSTRAINT `queryStaff_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queryStaff` ADD CONSTRAINT `queryStaff_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `response`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `queryStaff` ADD CONSTRAINT `queryStaff_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

