/*
  Warnings:

  - You are about to drop the column `image` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `blogs` DROP COLUMN `image`,
    ADD COLUMN `path` ENUM('HOME', 'ABOUT', 'GALLERY') NOT NULL DEFAULT 'HOME',
    MODIFY `content` LONGTEXT NOT NULL;

-- CreateTable
CREATE TABLE `photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `blogId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `photos` ADD CONSTRAINT `photos_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blogs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
