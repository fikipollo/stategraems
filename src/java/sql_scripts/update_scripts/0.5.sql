USE STATegraDB;
START TRANSACTION;
BEGIN;
    set FOREIGN_KEY_CHECKS = 1;


-- -----------------------------------------------------
-- Table `STATegraDB`.`appVersion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`appVersion` ;
SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`appVersion` (
  `version` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`version`))
ENGINE = InnoDB;

INSERT IGNORE INTO `STATegraDB`.`appVersion` (version) VALUES('0.5');

set FOREIGN_KEY_CHECKS = 0;

COMMIT;

