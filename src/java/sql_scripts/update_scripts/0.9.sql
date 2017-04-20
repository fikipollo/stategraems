USE STATegraDB;
START TRANSACTION;
BEGIN;

UPDATE experiments SET data_dir_type = 'local_directory' WHERE data_dir_type = 'local_dir';

CREATE TABLE IF NOT EXISTS `STATegraDB`.`external_sources` (
  `source_id` int NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `url` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`source_id`),
  INDEX `idx_ext_sources` (`source_id` ASC))
ENGINE = InnoDB;

UPDATE appVersion SET version='0.9';

COMMIT;


