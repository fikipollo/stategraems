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

INSERT INTO `external_sources` (`name`, `type`, `url`, `description`, `enabled`) VALUES ('FTP server','storage_system','','Enabled FTP storage in the system.',1),('Owncloud server','storage_system','','Enabled Owncloud storage in the system.',1),('Official Galaxy server','galaxy_server','https://usegalaxy.org','The official server',1);

ALTER TABLE biocondition ADD COLUMN external_sample_url varchar(200);
ALTER TABLE biocondition ADD COLUMN external_sample_type varchar(200);
ALTER TABLE biocondition ADD COLUMN external_sample_id varchar(200);


UPDATE appVersion SET version='0.9';

COMMIT;


