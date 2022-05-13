/*
  Warnings:

  - The values [equal opportunity,social diversity] on the enum `application_social_screening` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `third_wanted_major` to the `application_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `application` MODIFY `social_screening` ENUM('equal_opportunity', 'social_diversity', 'NONE') NOT NULL;

-- AlterTable
ALTER TABLE `application_details` ADD COLUMN `third_wanted_major` SMALLINT NOT NULL;
