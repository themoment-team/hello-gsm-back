-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `table_name_user_idx_fk`;

-- AlterTable
ALTER TABLE `token` MODIFY `refresh_token` VARCHAR(300) NULL;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `table_name_user_idx_fk` FOREIGN KEY (`user_idx`) REFERENCES `user`(`idx`) ON DELETE CASCADE ON UPDATE RESTRICT;
