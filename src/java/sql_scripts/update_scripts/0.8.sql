USE STATegraDB;
START TRANSACTION;
BEGIN;

CREATE TABLE IF NOT EXISTS `STATegraDB`.`messages` (
  `user_id` VARCHAR(50) NOT NULL,
  `message_id` int NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL,
  `sender` VARCHAR(200) NOT NULL,
  `send_to` TEXT NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `date` VARCHAR(14) NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`message_id`),
  INDEX `idx_messages` (`user_id` ASC),
  CONSTRAINT `fk_message_owners_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

UPDATE users SET email = 'emsadminuser@email.com' WHERE email IS NULL AND user_id = 'admin';
ALTER TABLE users ADD COLUMN apicode varchar(200);
ALTER TABLE users ADD COLUMN apicode_date VARCHAR(8) NOT NULL DEFAULT "19870729";

ALTER TABLE experiments CHANGE sample_tags tags TEXT;
UPDATE experiments SET tags = CONCAT("Case-Control, ", tags) WHERE is_case_control_type = TRUE;
UPDATE experiments SET tags = CONCAT("Multiple conditions, ", tags) WHERE is_multiple_conditions = TRUE;
UPDATE experiments SET tags = CONCAT("Single condition, ", tags) WHERE is_single_condition = TRUE;
UPDATE experiments SET tags = CONCAT("Survival, ", tags) WHERE is_survival_type = TRUE;
UPDATE experiments SET tags = CONCAT("Time course, ", tags) WHERE is_time_course_type = TRUE;
ALTER TABLE experiments DROP COLUMN is_case_control_type;
ALTER TABLE experiments DROP COLUMN is_multiple_conditions;
ALTER TABLE experiments DROP COLUMN is_single_condition;
ALTER TABLE experiments DROP COLUMN is_survival_type;
ALTER TABLE experiments DROP COLUMN is_time_course_type;

UPDATE biocondition SET biocondition_id=REPLACE(biocondition_id, 'BC', 'BC00');
UPDATE bioreplicate SET bioreplicate_id=REPLACE(bioreplicate_id, 'BR', 'BR00');
UPDATE analyticalReplicate SET analytical_rep_id=REPLACE(analytical_rep_id, 'AR', 'AR00');

ALTER TABLE biocondition MODIFY COLUMN name VARCHAR(200);
ALTER TABLE biocondition ADD COLUMN tags TEXT;
ALTER TABLE biocondition ADD COLUMN public BOOLEAN DEFAULT TRUE;
ALTER TABLE biocondition ADD COLUMN external BOOLEAN DEFAULT FALSE;
ALTER TABLE biocondition MODIFY COLUMN external_links TEXT;

ALTER TABLE analyticalReplicate MODIFY COLUMN treatment_id VARCHAR(50);

ALTER TABLE analysis CHANGE analysisType analysis_type varchar(200);
ALTER TABLE analysis CHANGE analysisName analysis_name varchar(200);
ALTER TABLE analysis ADD COLUMN tags TEXT;
ALTER TABLE analysis ADD COLUMN remove_requests TEXT;

ALTER TABLE rawdata MODIFY COLUMN analyticalReplicate_id VARCHAR(50);
ALTER TABLE rawdata DROP foreign key fk_rawdata_30;

ALTER TABLE sequencing_rawdata MODIFY COLUMN platform_family VARCHAR(200);
ALTER TABLE sequencing_rawdata MODIFY COLUMN platform_model VARCHAR(200);

ALTER TABLE other_fields DROP PRIMARY KEY;
ALTER TABLE other_fields ADD PRIMARY KEY (step_id, field_name);  
ALTER TABLE other_fields ADD COLUMN label VARCHAR(200);
ALTER TABLE other_fields ADD COLUMN section  VARCHAR(200);
ALTER TABLE other_fields CHANGE value value TEXT;

INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'sliding_window_length', sliding_window_length, NULL, NULL FROM intermediate_data WHERE sliding_window_length IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'steps_length', steps_length, NULL, NULL FROM intermediate_data WHERE steps_length IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'genome_specie', genome_specie, NULL, NULL FROM intermediate_data WHERE genome_specie IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'genome_version', genome_version, NULL, NULL FROM intermediate_data WHERE genome_version IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'genome_source', genome_source, NULL, NULL FROM intermediate_data WHERE genome_source IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'feature_type', feature_type, NULL, NULL FROM intermediate_data WHERE feature_type IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'files_description', files_description, NULL, NULL FROM intermediate_data WHERE files_description IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'reference_files', reference_files, NULL, NULL FROM intermediate_data WHERE reference_files IS NOT NULL;
INSERT INTO other_fields (step_id, field_name, value, label, section) SELECT step_id, 'preprocessing_type', preprocessing_type, NULL, NULL FROM intermediate_data WHERE preprocessing_type IS NOT NULL;

ALTER TABLE intermediate_data DROP COLUMN sliding_window_length;
ALTER TABLE intermediate_data DROP COLUMN steps_length;
ALTER TABLE intermediate_data DROP COLUMN genome_specie;
ALTER TABLE intermediate_data DROP COLUMN genome_version;
ALTER TABLE intermediate_data DROP COLUMN genome_source;
ALTER TABLE intermediate_data DROP COLUMN feature_type;
ALTER TABLE intermediate_data DROP COLUMN files_description;
ALTER TABLE intermediate_data DROP COLUMN reference_files;
ALTER TABLE intermediate_data DROP COLUMN preprocessing_type;

ALTER TABLE processed_data MODIFY COLUMN software VARCHAR(200);

ALTER TABLE step_use_step ADD COLUMN type VARCHAR(50) DEFAULT 'input';

CREATE FUNCTION SPLIT_STR(
  x VARCHAR(255),
  delim VARCHAR(12),
  pos INT
)
RETURNS VARCHAR(255)
RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos),
       LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1),
       delim, '');

DELIMITER $$
CREATE PROCEDURE update_regions()
   BEGIN
      DECLARE done INT DEFAULT FALSE;
      DECLARE id VARCHAR(50);
      DECLARE idpart1 VARCHAR(50);
      DECLARE idpart2 VARCHAR(50);
      DECLARE origLength INT;
      DECLARE analysisid VARCHAR(50);
      DECLARE str VARCHAR(500) default '';
      DECLARE name VARCHAR(200);
      DECLARE source VARCHAR(200);
      DECLARE date VARCHAR(8);
      DECLARE files TEXT;
      DECLARE userid VARCHAR(50);
      DECLARE cursor_i CURSOR FOR SELECT step_id, region_name, source, files_location FROM region_elements;
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

      OPEN cursor_i;
       read_loop: LOOP
         FETCH cursor_i INTO id, name, source, files;
         IF done THEN
           LEAVE read_loop;
         END IF;
         SET analysisid = SPLIT_STR(id, '.', 1);
         SET analysisid = REPLACE(analysisid, 'ST', 'AN');
         
         SELECT t1.step_id INTO id FROM step AS t1, analysis_has_steps as t2 WHERE t1.step_id = t2.step_id AND t2.analysis_id =analysisid ORDER BY step_id DESC LIMIT 1;
         SELECT CURDATE() + 0 INTO date;
         SELECT user_id INTO userid FROM step_owners WHERE step_id=id LIMIT 1;

         SET idpart1 = SPLIT_STR(id, '.', 1);
         SET idpart2 = SPLIT_STR(id, '.', 2);
         SET origLength = CHAR_LENGTH(idpart2) * -1;
         SET idpart2 = CONVERT(idpart2, UNSIGNED INTEGER) + 1;
         SET idpart2 = CONCAT('0000000000', '', idpart2);
         SET idpart2 = SUBSTRING(idpart2, origLength);
         SET idpart1 = CONCAT(idpart1,'.',idpart2);
         
         INSERT INTO step SET step_id=idpart1, step_name=name, type='external_source', submission_date=date, last_edition_date=date, files_location=files;
         INSERT INTO other_fields SET step_id=idpart1, field_name='description', value=source; 
         INSERT INTO step_use_step SET step_id=id, used_data_id=idpart1, type='reference';
         INSERT INTO analysis_has_steps SET step_id=idpart1, analysis_id=analysisid;
         INSERT INTO step_owners SET step_id=idpart1, user_id=userid;

         SET str = CONCAT(str, idpart1, ','); 
       END LOOP;
      CLOSE cursor_i;
      select str;
END $$
DELIMITER ;

CALL update_regions;
DROP PROCEDURE update_regions;

UPDATE appVersion SET version='0.8';

COMMIT;

