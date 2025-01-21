-- AlterTable
ALTER TABLE `querystaff` ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `categoryName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `response` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `state` ENUM('NOT_SEEN', 'NOT_ADDRESSED', 'ADDRESSED') NOT NULL DEFAULT 'NOT_SEEN',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

UPDATE `response`
SET 
    `createdAt` = (
        SELECT `createdAt`
        FROM `audit`
        WHERE `audit`.`id` = `response`.`auditId`
    ),
    `state` = CASE 
        WHEN `optionText` = 'YES' THEN 'ADDRESSED'
        WHEN `optionText` = 'NO' THEN 'NOT_ADDRESSED'
        ELSE 'NOT_SEEN'
    END
WHERE `optionText` IS NOT NULL;

-- CreateIndex
CREATE INDEX `queryStaff_status_clientId_idx` ON `queryStaff`(`status`, `clientId`);

-- CreateIndex
CREATE INDEX `response_state_optionText_idx` ON `response`(`state`, `optionText`);
