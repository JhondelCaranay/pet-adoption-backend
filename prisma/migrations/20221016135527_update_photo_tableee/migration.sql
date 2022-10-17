/*
  Warnings:

  - You are about to drop the column `image` on the `photos` table. All the data in the column will be lost.
  - Added the required column `imageId` to the `photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `photos` DROP COLUMN `image`,
    ADD COLUMN `imageId` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL;
