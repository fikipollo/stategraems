USE STATegraDB;
START TRANSACTION;
BEGIN;

CREATE TABLE IF NOT EXISTS `STATegraDB`.`external_sources` (
  `source_id` int NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `url` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`source_id`),
  INDEX `idx_ext_sources` (`source_id` ASC))
ENGINE = InnoDB;

UPDATE appVersion SET version='0.9';

COMMIT;


