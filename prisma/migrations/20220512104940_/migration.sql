/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `idx` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `gender` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Enum("user_gender")`.
  - You are about to drop the `token` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `birth` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cellphone_number` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_idx` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `table_name_user_idx_fk`;

-- DropIndex
DROP INDEX `user_id_uindex` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `email`,
    DROP COLUMN `idx`,
    DROP COLUMN `password`,
    ADD COLUMN `birth` DATE NOT NULL,
    ADD COLUMN `cellphone_number` VARCHAR(20) NOT NULL,
    ADD COLUMN `user_idx` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `name` VARCHAR(20) NOT NULL,
    MODIFY `gender` ENUM('M', 'F') NOT NULL,
    ADD PRIMARY KEY (`user_idx`);

-- DropTable
DROP TABLE `token`;

-- CreateTable
CREATE TABLE `access_token_blacklist` (
    `user_idx` INTEGER NOT NULL,
    `access_token` VARCHAR(500) NOT NULL,
    `expired_date` TIMESTAMP(0) NOT NULL DEFAULT (current_timestamp() + interval 5 minute),

    PRIMARY KEY (`user_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application` (
    `application_idx` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_number` SMALLINT NULL,
    `al_submission` BOOLEAN NULL,
    `is_document_reception` BOOLEAN NULL,
    `is_first_result` BOOLEAN NULL,
    `is_final_result` BOOLEAN NULL,
    `ID_photo_url` VARCHAR(500) NOT NULL,
    `guardian_name` VARCHAR(20) NOT NULL,
    `guardian_cellphone_number` VARCHAR(20) NOT NULL,
    `teacher_name` VARCHAR(20) NOT NULL,
    `teacher_cellephone_number` VARCHAR(20) NOT NULL,
    `school_location` VARCHAR(50) NOT NULL,
    `school_name` VARCHAR(50) NOT NULL,
    `screening` ENUM('normal', 'society', 'special') NOT NULL,
    `social_screening` ENUM('equal opportunity', 'social diversity', 'NONE') NOT NULL,

    UNIQUE INDEX `application_registration_number_uindex`(`registration_number`),
    PRIMARY KEY (`application_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_details` (
    `application_idx` INTEGER NOT NULL,
    `address` VARCHAR(50) NOT NULL,
    `telephone_number` VARCHAR(20) NOT NULL,
    `guardian_relation` VARCHAR(20) NOT NULL,
    `education_status` ENUM('planned', 'graduation', 'qualification examination') NOT NULL,
    `school_telephone_number` VARCHAR(20) NOT NULL,
    `score_1_1` SMALLINT NOT NULL,
    `score_1_2` SMALLINT NOT NULL,
    `score_2_1` SMALLINT NOT NULL,
    `score_2_2` SMALLINT NOT NULL,
    `score_3_1` SMALLINT NOT NULL,
    `general_curriculum_score_subtotal` SMALLINT NOT NULL,
    `art_sports_score` SMALLINT NOT NULL,
    `curriculum_score_subtotal` SMALLINT NOT NULL,
    `attendance_score` SMALLINT NOT NULL,
    `volunteer_score` SMALLINT NOT NULL,
    `non_curriculum_score_subtotal` SMALLINT NOT NULL,
    `score_total` SMALLINT NOT NULL,
    `first_wanted_major` SMALLINT NOT NULL,
    `second_wanted_major` SMALLINT NOT NULL,

    PRIMARY KEY (`application_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `user_idx` INTEGER NOT NULL,
    `refresh_token` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`user_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `application_details` ADD CONSTRAINT `application_details_application_application_idx_fk` FOREIGN KEY (`application_idx`) REFERENCES `application`(`application_idx`) ON DELETE CASCADE ON UPDATE CASCADE;
