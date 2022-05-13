/*
  Warnings:

  - You are about to drop the column `eamil` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `eamil` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `eamil`,
    ADD COLUMN `email` VARCHAR(500) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `email` ON `user`(`email`);
