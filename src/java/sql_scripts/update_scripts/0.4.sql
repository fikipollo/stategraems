USE STATegraDB;
START TRANSACTION;
BEGIN;
    set FOREIGN_KEY_CHECKS = 1;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


LOCK TABLES `experiments` WRITE;
    ALTER IGNORE TABLE `experiments` ADD `experimentDataDirectory` TEXT NULL AFTER `last_edition_date`;
UNLOCK TABLES;
/***********************************************************************************************************/
/* SEQUEENCING RAW DATA                                                                                   **/
/*UPDATE THE SEQUENCING RAW DATA TABLE                                                                     */
/***********************************************************************************************************/
LOCK TABLES `sequencing_rawdata` WRITE;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `protocol` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `strand_specificity` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `selection` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `is_for_footprinting` BOOLEAN NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `restriction_enzyme` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `is_control_sample` BOOLEAN NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `antibody_target` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `antibody_target_type` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `antibody_manufacturer` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `extracted_molecule` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `rna_type` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `sequencing_rawdata` ADD `other_fields` TEXT NULL ;
UNLOCK TABLES;

/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `sequencing_rawdata` INNER JOIN `methylseq_rawdata` 
   ON sequencing_rawdata.rawdata_id = methylseq_rawdata.rawdata_id 
SET 
   sequencing_rawdata.protocol = methylseq_rawdata.protocol,
   sequencing_rawdata.strand_specificity = methylseq_rawdata.strand_specificity,
   sequencing_rawdata.selection = methylseq_rawdata.selection;
/*REMOVE OLD TABLE*/
DROP TABLE methylseq_rawdata;

UPDATE `sequencing_rawdata`  INNER JOIN `dnaseseq_rawdata` 
   ON sequencing_rawdata.rawdata_id = dnaseseq_rawdata.rawdata_id 
SET 
   sequencing_rawdata.is_for_footprinting = dnaseseq_rawdata.is_for_footprinting,
   sequencing_rawdata.restriction_enzyme = dnaseseq_rawdata.restriction_enzyme;
/*REMOVE OLD TABLE*/
DROP TABLE dnaseseq_rawdata;

UPDATE `sequencing_rawdata`  INNER JOIN `chipseq_rawdata` 
   ON sequencing_rawdata.rawdata_id = chipseq_rawdata.rawdata_id 
SET 
   sequencing_rawdata.is_control_sample = chipseq_rawdata.is_control_sample,
   sequencing_rawdata.antibody_target = chipseq_rawdata.antibody_target,
   sequencing_rawdata.antibody_target_type = chipseq_rawdata.antibody_target_type,
   sequencing_rawdata.antibody_manufacturer = chipseq_rawdata.antibody_manufacturer;
/*REMOVE OLD TABLE*/
DROP TABLE chipseq_rawdata;

UPDATE `sequencing_rawdata` INNER JOIN `rnaseq_rawdata` 
   ON sequencing_rawdata.rawdata_id = rnaseq_rawdata.rawdata_id 
SET 
   sequencing_rawdata.extracted_molecule = rnaseq_rawdata.extracted_molecule,
   sequencing_rawdata.rna_type = rnaseq_rawdata.rna_type,
   sequencing_rawdata.strand_specificity = rnaseq_rawdata.strand_specificity,
   sequencing_rawdata.selection = rnaseq_rawdata.selection;

/*REMOVE OLD TABLE*/
DROP TABLE rnaseq_rawdata;


/********************************************************************************************************/
/*INTERMEDIATE DATA                                                                                    **/
/*UPDATE THE INTERMEDIATE DATA TABLE                                                                    */
/********************************************************************************************************/
LOCK TABLES `intermediate_data` WRITE;
    ALTER IGNORE TABLE `intermediate_data` ADD `sliding_window_length` INT NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `steps_length` INT NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `selection` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `genome_specie` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `genome_version` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `genome_source` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `feature_type` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `files_description` TEXT NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `reference_files` TEXT NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `preprocessing_type` VARCHAR(200) NULL ;
    ALTER IGNORE TABLE `intermediate_data` ADD `other_fields` TEXT NULL ;
UNLOCK TABLES;

/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `intermediate_data` 
INNER JOIN `smoothing_step` 
   ON intermediate_data.step_id = smoothing_step.step_id 
SET 
   intermediate_data.sliding_window_length = smoothing_step.sliding_window_length,
   intermediate_data.steps_length = smoothing_step.steps_length;

/*REMOVE OLD TABLE*/
DROP TABLE smoothing_step;

/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `intermediate_data` INNER JOIN `mapping_step` 
   ON intermediate_data.step_id = mapping_step.step_id 
SET 
   intermediate_data.genome_specie = mapping_step.genome_specie,
   intermediate_data.genome_version = mapping_step.genome_version,
   intermediate_data.genome_source = mapping_step.genome_source;

/*REMOVE OLD TABLE*/
DROP TABLE mapping_step;


/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `intermediate_data` INNER JOIN `extract_relevant_features_step` 
   ON intermediate_data.step_id = extract_relevant_features_step.step_id 
SET 
   intermediate_data.feature_type = extract_relevant_features_step.feature_type,
   intermediate_data.files_description = extract_relevant_features_step.files_description,
   intermediate_data.reference_files = extract_relevant_features_step.reference_files;

/*REMOVE OLD TABLE*/
DROP TABLE extract_relevant_features_step;


/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `intermediate_data` INNER JOIN `preprocessing_step` 
   ON intermediate_data.step_id = preprocessing_step.step_id 
SET 
   intermediate_data.preprocessing_type = preprocessing_step.preprocessing_type;

/*REMOVE OLD TABLE*/
DROP TABLE preprocessing_step;

/********************************************************************************************************/
/*PROCESSED DATA                                                                                    **/
/*UPDATE THE INTERMEDIATE DATA TABLE                                                                    */
/********************************************************************************************************/
LOCK TABLES `processed_data` WRITE;
    ALTER IGNORE TABLE `processed_data` ADD `control_sample_id` VARCHAR(50) NULL ;
    ALTER IGNORE TABLE `processed_data` ADD `feature_type` VARCHAR(100) NULL ;
    ALTER IGNORE TABLE `processed_data` ADD `region_step_type` VARCHAR(45) NULL ;
    ALTER IGNORE TABLE `processed_data` ADD `motivation` TEXT NULL ;
    ALTER IGNORE TABLE `processed_data` ADD `other_fields` TEXT NULL ;
    ALTER IGNORE TABLE `processed_data` ADD FOREIGN KEY(control_sample_id) REFERENCES analyticalReplicate(analytical_rep_id);
UNLOCK TABLES;

/*ADD DATA TO THE SEQUENCING RAW DATA TABLE*/
UPDATE `processed_data` INNER JOIN `region_calling_step` 
   ON processed_data.analysis_id = region_calling_step.analysis_id 
SET 
   processed_data.control_sample_id = region_calling_step.control_sample_id;

/*REMOVE OLD TABLE*/
DROP TABLE region_calling_step;

UPDATE `processed_data` INNER JOIN `feature_quantification` 
   ON processed_data.analysis_id = feature_quantification.analysis_id 
SET 
   processed_data.feature_type = feature_quantification.feature_type;

/*REMOVE OLD TABLE*/
DROP TABLE feature_quantification;

UPDATE `processed_data` INNER JOIN `region_step` 
   ON processed_data.analysis_id = region_step.analysis_id 
SET 
   processed_data.region_step_type = region_step.region_step_type,
   processed_data.motivation = region_step.motivation;

/*REMOVE OLD TABLE*/
DROP TABLE region_step;

/********************************************************************************************************/
/*TREATMENTS                                                                                    **/
/*UPDATE THE TREATMENTS DATA TABLE                                                                    */
/********************************************************************************************************/
LOCK TABLES `treatment` WRITE;
    ALTER TABLE treatment MODIFY treatment_name VARCHAR(500);
    ALTER TABLE treatment MODIFY biomolecule VARCHAR(200);
UNLOCK TABLES;


UPDATE analysis SET analysisType="smallRNA-seq" WHERE  analysisType="miRNA-seq";
UPDATE rawdata SET raw_data_type="smallRNA-seq" WHERE  raw_data_type="miRNA-seq";

LOCK TABLES `experiments` WRITE;
	ALTER TABLE `experiments` ADD `sample_tags` TEXT NULL AFTER `experimentDataDirectory`;
UNLOCK TABLES;


LOCK TABLES `experiment_use_biocondition` WRITE;
	ALTER TABLE `experiment_use_biocondition` ADD `sample_tags` TEXT NULL AFTER `biocondition_id`;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- -----------------------------------------------------
-- Table `STATegraDB`.`appVersion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`appVersion` ;
SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`appVersion` (
  `version` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`version`))
ENGINE = InnoDB;

INSERT IGNORE INTO `STATegraDB`.`appVersion` (version) VALUES('0.4');

    set FOREIGN_KEY_CHECKS = 0;
COMMIT;
exit