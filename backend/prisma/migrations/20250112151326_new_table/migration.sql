-- CreateTable
CREATE TABLE `internalStaff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `role` VARCHAR(191) NULL,
    `hotelName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `passcode` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `clientId` INTEGER NULL,

    UNIQUE INDEX `internalStaff_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `queryStaff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment` TEXT NULL,
    `deadline` INTEGER NULL,
    `staffId` INTEGER NULL,
    `clientId` INTEGER NULL,
    `responseId` INTEGER NULL,
    `questionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `internalStaff` ADD CONSTRAINT `internalStaff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
