-- CreateTable
CREATE TABLE `user` (
    `idx` SMALLINT NOT NULL,
    `id` VARCHAR(20) NOT NULL,
    `password` VARCHAR(100) NULL,
    `name` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `birth_date` DATE NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,

    UNIQUE INDEX `user_id_uindex`(`id`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
