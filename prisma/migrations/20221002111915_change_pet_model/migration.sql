/*
  Warnings:

  - You are about to drop the column `publicId` on the `pets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pets` DROP COLUMN `publicId`,
    ADD COLUMN `imageId` VARCHAR(191) NULL;
