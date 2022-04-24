-- CreateTable
CREATE TABLE `token` (
    `user_idx` SMALLINT NOT NULL,
    `refresh_token` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`user_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `idx` SMALLINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(320) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `name` VARCHAR(10) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `user_id_uindex`(`email`),
    PRIMARY KEY (`idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `table_name_user_idx_fk` FOREIGN KEY (`user_idx`) REFERENCES `user`(`idx`) ON DELETE RESTRICT ON UPDATE RESTRICT;
