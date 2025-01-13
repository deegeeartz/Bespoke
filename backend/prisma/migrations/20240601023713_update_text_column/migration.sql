-- AlterTable
ALTER TABLE `Audit` MODIFY `expense` TEXT NULL,
    MODIFY `brandStandard` TEXT NULL,
    MODIFY `detailedSummary` TEXT NULL,
    MODIFY `executiveSummary` TEXT NULL,
    MODIFY `scenario` TEXT NULL,
    MODIFY `feedback` TEXT NULL;

-- AlterTable
ALTER TABLE `Client` MODIFY `additionalNotes` TEXT NULL;
