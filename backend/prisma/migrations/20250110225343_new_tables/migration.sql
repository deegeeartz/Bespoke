-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CLIENT', 'INSPECTOR') NOT NULL,
    `name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `hotelName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `additionalNotes` TEXT NULL,
    `passcode` VARCHAR(191) NULL,

    UNIQUE INDEX `client_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspector` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `location` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `passcode` VARCHAR(191) NULL,
    `type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'EXTERNAL',
    `clientId` INTEGER NULL,

    UNIQUE INDEX `inspector_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotelName` VARCHAR(191) NOT NULL,
    `campaign` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `inspectors` JSON NULL,
    `clientName` VARCHAR(191) NULL,
    `clientId` INTEGER NULL,
    `categories` JSON NULL,
    `sortedCategories` JSON NULL,
    `type` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'EXTERNAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `surveyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expense` TEXT NULL,
    `brandStandard` TEXT NULL,
    `detailedSummary` TEXT NULL,
    `executiveSummary` TEXT NULL,
    `scenario` TEXT NULL,
    `status` VARCHAR(191) NULL,
    `feedback` TEXT NULL,
    `uploads` JSON NULL,
    `inspectorId` INTEGER NULL,
    `surveyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `response` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer` VARCHAR(191) NULL,
    `optionAnswer` VARCHAR(191) NULL,
    `optionText` VARCHAR(191) NULL,
    `files` JSON NULL,
    `skip` BOOLEAN NULL,
    `questionId` INTEGER NOT NULL,
    `auditId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
