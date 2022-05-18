-- CreateTable
CREATE TABLE `user` (
    `user_idx` INTEGER NOT NULL,
    `user_img` VARCHAR(500) NULL,
    `name` VARCHAR(20) NULL,
    `birth` DATE NULL,
    `gender` VARCHAR(20) NULL,
    `cellphone_number` VARCHAR(20) NULL,

    PRIMARY KEY (`user_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `is_final_submission` BOOLEAN NULL,
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
    `screening` VARCHAR(20) NOT NULL,
    `social_screening` VARCHAR(20) NOT NULL,
    `user_idx` INTEGER NOT NULL,

    UNIQUE INDEX `application_registration_number_uindex`(`registration_number`),
    INDEX `application_user_user_idx_fk`(`user_idx`),
    PRIMARY KEY (`application_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_details` (
    `application_idx` INTEGER NOT NULL,
    `address` VARCHAR(50) NOT NULL,
    `telephone_number` VARCHAR(20) NOT NULL,
    `guardian_relation` VARCHAR(20) NOT NULL,
    `education_status` VARCHAR(20) NOT NULL,
    `graduation_year` VARCHAR(20) NOT NULL,
    `graduation_month` VARCHAR(20) NOT NULL,
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
    `first_wanted_major` VARCHAR(20) NOT NULL,
    `second_wanted_major` VARCHAR(20) NOT NULL,
    `third_wanted_major` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`application_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `user_idx` INTEGER NOT NULL,
    `refresh_token` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`user_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `application` ADD CONSTRAINT `application_user_user_idx_fk` FOREIGN KEY (`user_idx`) REFERENCES `user`(`user_idx`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `application_details` ADD CONSTRAINT `application_details_application_application_idx_fk` FOREIGN KEY (`application_idx`) REFERENCES `application`(`application_idx`) ON DELETE CASCADE ON UPDATE RESTRICT;
