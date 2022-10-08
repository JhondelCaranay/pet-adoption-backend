/*
  Warnings:

  - You are about to drop the column `animal_id` on the `pets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pets` DROP COLUMN `animal_id`,
    ADD COLUMN `animalId` VARCHAR(191) NULL;
