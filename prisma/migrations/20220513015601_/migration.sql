/*
  Warnings:

  - A unique constraint covering the columns `[eamil]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eamil` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `eamil` VARCHAR(500) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `eamil` ON `user`(`eamil`);
