/*
  Warnings:

  - The primary key for the `access_token_blacklist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `application` DROP FOREIGN KEY `application_user_user_idx_fk`;

-- AlterTable
ALTER TABLE `access_token_blacklist` DROP PRIMARY KEY,
    MODIFY `user_idx` BIGINT NOT NULL,
    ADD PRIMARY KEY (`user_idx`);

-- AlterTable
ALTER TABLE `application` MODIFY `user_idx` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `refresh_token` DROP PRIMARY KEY,
    MODIFY `user_idx` BIGINT NOT NULL,
    ADD PRIMARY KEY (`user_idx`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `user_idx` BIGINT NOT NULL,
    ADD PRIMARY KEY (`user_idx`);

-- AddForeignKey
ALTER TABLE `application` ADD CONSTRAINT `application_user_user_idx_fk` FOREIGN KEY (`user_idx`) REFERENCES `user`(`user_idx`) ON DELETE CASCADE ON UPDATE RESTRICT;
