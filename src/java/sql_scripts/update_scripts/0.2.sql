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


LOCK TABLES `column_chromatography_rawdata` WRITE;
	ALTER TABLE `column_chromatography_rawdata` ADD `sample_description` TEXT NULL AFTER `rawdata_id`;
	ALTER TABLE `column_chromatography_rawdata` ADD `sample_processing` TEXT NULL AFTER `sample_description`;
	ALTER TABLE `column_chromatography_rawdata` ADD `sample_injection` TEXT NULL AFTER `sample_processing`;
/**/
	ALTER TABLE `column_chromatography_rawdata` ADD `combined_unit_manufacturer` TEXT NULL AFTER `additional_accessories`;
	ALTER TABLE `column_chromatography_rawdata` ADD `combined_unit_model` TEXT NULL AFTER `combined_unit_manufacturer`;
/**/
	ALTER TABLE `column_chromatography_rawdata` CHANGE `pre_run_process_description` `pre_run_process_type` TEXT NULL;
	ALTER TABLE `column_chromatography_rawdata` CHANGE `post_run_process_description` `pre_run_process_substance` VARCHAR(200) NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `pre_run_process_time` VARCHAR(200) NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `pre_run_process_flowrate` VARCHAR(200) NULL;
/**/
	ALTER TABLE `column_chromatography_rawdata` CHANGE `column_manufacturer` `column_manufacturer` VARCHAR(500) NULL;
/**/
	ALTER TABLE `column_chromatography_rawdata` ADD `detection_equipment` TEXT NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `detection_type` TEXT NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `detection_equipment_settings` TEXT NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `detection_timescale` TEXT NULL;
	ALTER TABLE `column_chromatography_rawdata` ADD `detection_trace` TEXT NULL;
/**/
UNLOCK TABLES;

LOCK TABLES `mobile_phase` WRITE;
	ALTER TABLE `mobile_phase` CHANGE `name` `name` VARCHAR(500) NULL;
UNLOCK TABLES;

LOCK TABLES `processed_data` WRITE;
	ALTER TABLE `processed_data` CHANGE `step_name` `step_name` VARCHAR(200) NULL;
UNLOCK TABLES;

LOCK TABLES `non_processed_data` WRITE;
	ALTER TABLE `non_processed_data` CHANGE `step_name` `step_name` VARCHAR(200) NULL;
UNLOCK TABLES;

-- -----------------------------------------------------
-- Table `STATegraDB`.`fraction`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`fraction` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`fraction` (
  `fraction_id` INT NOT NULL AUTO_INCREMENT ,
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `name` VARCHAR(200) NOT NULL ,
  `description` TEXT NOT NULL ,
  PRIMARY KEY (`fraction_id`, `rawdata_id`) ,
  INDEX `idx_fraction_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_fraction1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`column_chromatography_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;


LOCK TABLES `mass_spectrometry_rawdata` WRITE;
/**/
	ALTER TABLE `mass_spectrometry_rawdata` CHANGE `mass_spectrometer_model` `customizations` TEXT NULL;
	ALTER TABLE `mass_spectrometry_rawdata` CHANGE `acquisition_description` `acquisition_parameters` TEXT NULL;
/**/
	ALTER TABLE `mass_spectrometry_rawdata` ADD `analysis_software` VARCHAR(200) NULL;
	ALTER TABLE `mass_spectrometry_rawdata` ADD `analysis_parameters` TEXT NULL;
	ALTER TABLE `mass_spectrometry_rawdata` ADD `intensity_values` VARCHAR(200) NULL;
	ALTER TABLE `mass_spectrometry_rawdata` ADD `ms_level` VARCHAR(200) NULL;
	ALTER TABLE `mass_spectrometry_rawdata` ADD `ion_mode` VARCHAR(200) NULL;
	ALTER TABLE `mass_spectrometry_rawdata` ADD `additional_info` TEXT NULL;
/**/
	ALTER TABLE `mass_spectrometry_rawdata` DROP COLUMN `software_package`;
UNLOCK TABLES;


-- -----------------------------------------------------
-- Table `STATegraDB`.`proteomics_msquantification`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`proteomics_msquantification` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`proteomics_msquantification` (
  `analysis_id` VARCHAR(50) NOT NULL,
   `groups` TEXT NULL, 
   `replicates` TEXT NULL, 
   `labelling_protocol` TEXT NULL, 
   `sample_description` TEXT NULL, 
   `sample_name` TEXT NULL, 
   `sample_amount` TEXT NULL, 
   `sample_labelling` TEXT NULL, 
   `replicates_and_groups` TEXT NULL, 
   `isotopic_correction_coefficients` TEXT NULL, 
   `internal_references` TEXT NULL, 
   `input_data_type` TEXT NULL, 
   `input_data_format` TEXT NULL, 
   `input_data_merging` TEXT NULL, 
   `quantification_software` TEXT NULL, 
   `selection_method` TEXT NULL, 
   `confidence_filter` TEXT NULL, 
   `missing_values` TEXT NULL, 
   `quantification_values_calculation` TEXT NULL, 
   `replicate_aggregation` TEXT NULL, 
   `normalization` TEXT NULL, 
   `protein_quantification_values_calculation` TEXT NULL, 
   `specific_corrections` TEXT NULL, 
   `correctness_estimation_methods` TEXT NULL, 
   `curves_calibration` TEXT NULL, 
   `primary_extracted_quantification_values` TEXT NULL, 
   `primary_extracted_quantification_files_location` TEXT NULL, 
   `peptide_quantification_values` TEXT NULL, 
   `peptide_quantification_files_location` TEXT NULL, 
   `raw_quantification_values` TEXT NULL, 
   `raw_quantification_files_location` TEXT NULL, 
   `transformed_quantification_values` TEXT NULL, 
   `transformed_quantification_files_location` TEXT NULL, 
    `msi_responsible_person` TEXT NULL,
    `msi_software` TEXT NULL,
    `msi_customizations` TEXT NULL,
    `msi_software_availability` TEXT NULL,
    `msi_files_description` TEXT NULL,
    `msi_files_location` TEXT NULL,
    `msi_inputdata_description` TEXT NULL,
    `msi_database_queried` TEXT NULL,
    `msi_taxonomical_restrictions` TEXT NULL,
    `msi_tool_description` TEXT NULL,
    `msi_cleavage_agents` TEXT NULL,
    `msi_missed_cleavages` TEXT NULL,
    `msi_cleavage_additional_params` TEXT NULL,
    `msi_permissible_aminoacids_modifications` TEXT NULL,
    `msi_precursorion_tolerance` TEXT NULL,
    `msi_pmf_mass_tolerance` TEXT NULL,
    `msi_thresholds` TEXT NULL,
    `msi_otherparams` TEXT NULL,
    `msi_accession_code` TEXT NULL,
    `msi_protein_description` TEXT NULL,
    `msi_protein_scores` TEXT NULL,
    `msi_validation_status` TEXT NULL,
    `msi_different_peptide_sequences` TEXT NULL,
    `msi_peptide_coverage` TEXT NULL,
    `msi_pmf_matched_peaks` TEXT NULL,
    `msi_other_additional_info` TEXT NULL,
    `msi_sequence` TEXT NULL,
    `msi_peptide_scores` TEXT NULL,
    `msi_chemical_modifications` TEXT NULL,
    `msi_spectrum_locus` TEXT NULL,
    `msi_charge_assumed` TEXT NULL,
    `msi_quantitation_approach` TEXT NULL,
    `msi_quantitation_measurement` TEXT NULL,
    `msi_quantitation_normalisation` TEXT NULL,
    `msi_quantitation_replicates_number` TEXT NULL,
    `msi_quantitation_acceptance` TEXT NULL,
    `msi_quantitation_error_analysis` TEXT NULL,
    `msi_quantitation_control_results` TEXT NULL,
    `msi_interpretation_assessment` TEXT NULL,
    `msi_interpretation_results` TEXT NULL,
    `msi_interpretation_inclusion` TEXT NULL,
  PRIMARY KEY (`analysis_id`) ,
  INDEX `idx_proteomics_msquantification` (`analysis_id` ASC) ,
  CONSTRAINT `fk_proteomics_msquantification`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

DROP TABLE IF EXISTS `STATegraDB`.`maxquant_step` ;
SHOW WARNINGS;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


    set FOREIGN_KEY_CHECKS = 0;
COMMIT;
