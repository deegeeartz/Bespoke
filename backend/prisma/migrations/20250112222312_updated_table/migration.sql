/*
  Warnings:

  - You are about to drop the column `userId` on the `internalstaff` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `internalstaff` DROP FOREIGN KEY `internalStaff_userId_fkey`;

-- AlterTable
ALTER TABLE `internalstaff` DROP COLUMN `userId`;
