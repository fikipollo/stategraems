SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `STATegraDB` ;
CREATE SCHEMA IF NOT EXISTS `STATegraDB` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
SHOW WARNINGS;
USE `STATegraDB` ;

-- -----------------------------------------------------
-- Table `STATegraDB`.`biocondition`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`biocondition` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`biocondition` (
  `biocondition_id` VARCHAR(50) NOT NULL,
  `organism` VARCHAR(200) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `cell_type` VARCHAR(200) NULL,
  `tissue_type` VARCHAR(200) NULL,
  `cell_line` VARCHAR(200) NULL,
  `gender` VARCHAR(200) NULL,
  `genotype` VARCHAR(200) NULL,
  `other_biomaterial` TEXT NULL,
  `treatment` VARCHAR(200) NULL,
  `dosis` VARCHAR(100) NULL,
  `time` VARCHAR(200) NULL,
  `other_exp_cond` TEXT NULL,
  `protocol_description` TEXT NULL,
  `submission_date` VARCHAR(8) NOT NULL,
  `last_edition_date` VARCHAR(8) NOT NULL,
  `external_links` TEXT NOT NULL,
  PRIMARY KEY (`biocondition_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiments` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`experiments` (
  `experiment_id` VARCHAR(50) NOT NULL DEFAULT '',
  `title` VARCHAR(200) NOT NULL,
  `experiment_description` TEXT NOT NULL,
  `is_time_course_type` TINYINT(1) NULL,
  `is_case_control_type` TINYINT(1) NULL,
  `is_survival_type` TINYINT(1) NULL,
  `is_single_condition` TINYINT(1) NULL,
  `is_multiple_conditions` TINYINT(1) NULL,
  `is_other_type` TINYINT(1) NULL,
  `biological_rep_no` VARCHAR(45) NULL,
  `technical_rep_no` VARCHAR(45) NULL,
  `contains_chipseq` TINYINT(1) NULL,
  `contains_dnaseseq` TINYINT(1) NULL,
  `contains_methylseq` TINYINT(1) NULL,
  `contains_mrnaseq` TINYINT(1) NULL,
  `contains_mirnaseq` TINYINT(1) NULL,
  `contains_metabolomics` TINYINT(1) NULL,
  `contains_proteomics` TINYINT(1) NULL,
  `contains_other` TINYINT(1) NULL,
  `public_references` TEXT NULL,
  `submission_date` VARCHAR(8) NOT NULL,
  `last_edition_date` VARCHAR(8) NOT NULL,
  `experimentDataDirectory` TEXT NULL,
  `sample_tags` TEXT NULL,
  PRIMARY KEY (`experiment_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`users` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`users` (
  `user_id` VARCHAR(50) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NULL,
  `last_experiment_id` VARCHAR(50) NULL,
  PRIMARY KEY (`user_id`),
  INDEX `fk_users_1_idx` (`last_experiment_id` ASC),
  CONSTRAINT `fk_users_1`
    FOREIGN KEY (`last_experiment_id`)
    REFERENCES `STATegraDB`.`experiments` (`experiment_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`biocondition_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`biocondition_owners` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`biocondition_owners` (
  `user_id` VARCHAR(50) NOT NULL,
  `biocondition_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`user_id`, `biocondition_id`),
  INDEX `idx_biocondition_owners_1` (`biocondition_id` ASC),
  INDEX `idx_biocondition_owners_2` (`user_id` ASC),
  CONSTRAINT `fk_biocondition_owners_1`
    FOREIGN KEY (`biocondition_id`)
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_2`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiment_use_biocondition`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiment_use_biocondition` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`experiment_use_biocondition` (
  `experiment_id` VARCHAR(50) NOT NULL,
  `biocondition_id` VARCHAR(50) NOT NULL,
  `sample_tags` TEXT NULL,
  PRIMARY KEY (`experiment_id`, `biocondition_id`),
  INDEX `fk_BiosampleUsedByExperiment_BioSamples1_idx` (`biocondition_id` ASC),
  INDEX `fk_BiosampleUsedByExperiment_Experiments1_idx` (`experiment_id` ASC),
  CONSTRAINT `fk_BiosampleUsedByExperiment_BioSamples1`
    FOREIGN KEY (`biocondition_id`)
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_BiosampleUsedByExperiment_Experiments1`
    FOREIGN KEY (`experiment_id`)
    REFERENCES `STATegraDB`.`experiments` (`experiment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiment_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiment_owners` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`experiment_owners` (
  `user_id` VARCHAR(50) NOT NULL,
  `experiment_id` VARCHAR(50) NOT NULL,
  `role` INT(11) NOT NULL,
  PRIMARY KEY (`user_id`, `experiment_id`),
  INDEX `fk_ExperimentOwners_Experiments1_idx` (`experiment_id` ASC),
  INDEX `fk_ExperimentOwners_Experiments1_idx1` (`experiment_id` ASC),
  INDEX `fk_ExperimentOwners_Users1_idx` (`user_id` ASC),
  CONSTRAINT `fk_ExperimentOwners_Experiments1`
    FOREIGN KEY (`experiment_id`)
    REFERENCES `STATegraDB`.`experiments` (`experiment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ExperimentOwners_Users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`batch`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`batch` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`batch` (
  `batch_id` VARCHAR(50) NOT NULL,
  `batch_name` VARCHAR(200) NULL,
  `batch_creation_date` VARCHAR(8) NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`batch_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`bioreplicate`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`bioreplicate` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`bioreplicate` (
  `biocondition_id` VARCHAR(50) NOT NULL,
  `bioreplicate_id` VARCHAR(50) NOT NULL,
  `bioreplicate_name` VARCHAR(200) NOT NULL,
  `batch_id` VARCHAR(50) NULL,
  PRIMARY KEY (`bioreplicate_id`),
  INDEX `idx_bioreplicate_1` (`biocondition_id` ASC),
  INDEX `idx_bioreplicate_2` (`batch_id` ASC),
  CONSTRAINT `fk_bioreplicate_1`
    FOREIGN KEY (`biocondition_id`)
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bioreplicate_2`
    FOREIGN KEY (`batch_id`)
    REFERENCES `STATegraDB`.`batch` (`batch_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
PACK_KEYS = DEFAULT;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`step` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`step` (
  `step_id` VARCHAR(50) NOT NULL,
  `step_name` VARCHAR(200) NULL,
  `step_number` INT NULL,
  `type` VARCHAR(200) NULL,
  `submission_date` VARCHAR(8) NULL,
  `last_edition_date` VARCHAR(8) NULL,
  `files_location` TEXT NULL,
  PRIMARY KEY (`step_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`treatment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`treatment` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`treatment` (
  `treatment_id` VARCHAR(50) NOT NULL,
  `treatment_name` VARCHAR(500) NOT NULL,
  `description` TEXT NULL,
  `biomolecule` VARCHAR(200) NULL,
  PRIMARY KEY (`treatment_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analyticalReplicate`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analyticalReplicate` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`analyticalReplicate` (
  `analytical_rep_id` VARCHAR(50) NOT NULL,
  `analytical_rep_name` VARCHAR(200) NULL,
  `bioreplicate_id` VARCHAR(50) NOT NULL,
  `treatment_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`analytical_rep_id`),
  INDEX `idx_analyticalReplicate_1` (`bioreplicate_id` ASC),
  INDEX `idx_analyticalReplicate_2` (`treatment_id` ASC),
  CONSTRAINT `fk_analyticalReplicate_1`
    FOREIGN KEY (`bioreplicate_id`)
    REFERENCES `STATegraDB`.`bioreplicate` (`bioreplicate_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_analyticalReplicate_2`
    FOREIGN KEY (`treatment_id`)
    REFERENCES `STATegraDB`.`treatment` (`treatment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`rawdata` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `analyticalReplicate_id` VARCHAR(50) NOT NULL,
  `technical_rep_set_id` VARCHAR(50) NULL,
  `raw_data_type` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_rawdata_1` (`rawdata_id` ASC),
  INDEX `idx_rawdata_3` (`analyticalReplicate_id` ASC),
  CONSTRAINT `fk_rawdata_10`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_rawdata_30`
    FOREIGN KEY (`analyticalReplicate_id`)
    REFERENCES `STATegraDB`.`analyticalReplicate` (`analytical_rep_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`sequencing_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`sequencing_rawdata` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`sequencing_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `layout` VARCHAR(200) NULL,
  `orientation` VARCHAR(200) NULL,
  `nominal_length` INT NULL,
  `nominal_length_stdev` INT NULL,
  `avg_sequence_length` INT NULL,
  `avg_sequencing_deep` DOUBLE NULL,
  `platform_family` VARCHAR(200) NOT NULL,
  `platform_model` VARCHAR(200) NOT NULL,
  `base_calls` VARCHAR(200) NULL,
  `pooling_strategy` VARCHAR(200) NULL,
  `pooling_strategy_description` TEXT NULL,
  `slide_ID` VARCHAR(200) NULL,
  `lane_number` VARCHAR(200) NULL,
  `library_construction_protocol` TEXT NULL,
  `protocol` VARCHAR(200) NULL,
  `strand_specificity` VARCHAR(200) NULL,
  `selection` VARCHAR(200) NULL,
  `is_for_footprinting` TINYINT(1) NULL,
  `restriction_enzyme` VARCHAR(200) NULL,
  `is_control_sample` TINYINT(1) NULL,
  `antibody_target` VARCHAR(200) NULL,
  `antibody_target_type` VARCHAR(200) NULL,
  `antibody_manufacturer` VARCHAR(200) NULL,
  `extracted_molecule` VARCHAR(200) NULL,
  `rna_type` VARCHAR(200) NULL,
  `other_fields` TEXT NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_rawdata_1` (`rawdata_id` ASC),
  CONSTRAINT `fk_rawdata_1`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`other_fields`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`other_fields` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`other_fields` (
  `step_id` VARCHAR(50) NOT NULL,
  `field_name` VARCHAR(200) NULL,
  `value` VARCHAR(200) NULL,
  INDEX `idx_quality_report_1` (`step_id` ASC),
  PRIMARY KEY (`step_id`),
  CONSTRAINT `fk_quality_report_non_process_data1`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`intermediate_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`intermediate_data` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`intermediate_data` (
  `step_id` VARCHAR(50) NOT NULL,
  `intermediate_data_type` VARCHAR(200) NULL,
  `software` VARCHAR(200) NULL,
  `software_version` VARCHAR(200) NULL,
  `software_configuration` TEXT NULL,
  `motivation` TEXT NULL,
  `results` TEXT NULL,
  `sliding_window_length` INT NULL,
  `steps_length` INT NULL,
  `genome_specie` VARCHAR(200) NULL,
  `genome_version` VARCHAR(200) NULL,
  `genome_source` VARCHAR(200) NULL,
  `feature_type` VARCHAR(200) NULL,
  `files_description` TEXT NULL,
  `reference_files` TEXT NULL,
  `preprocessing_type` VARCHAR(200) NULL,
  `other_fields` TEXT NULL,
  PRIMARY KEY (`step_id`),
  INDEX `idx_intermediate_data_1` (`step_id` ASC),
  CONSTRAINT `fk_intermediate_data_1`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analysis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analysis` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`analysis` (
  `analysis_id` VARCHAR(50) NOT NULL,
  `analysisType` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) NOT NULL,
  `analysisName` VARCHAR(200) NULL,
  PRIMARY KEY (`analysis_id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiments_contains_analysis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiments_contains_analysis` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`experiments_contains_analysis` (
  `experiment_id` VARCHAR(50) NOT NULL,
  `analysis_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`experiment_id`, `analysis_id`),
  INDEX `idx_experiments_contains_analysis_1` (`analysis_id` ASC),
  INDEX `idx_experiments_contains_analysis_2` (`experiment_id` ASC),
  CONSTRAINT `fk_experiments_contains_analysis_1`
    FOREIGN KEY (`experiment_id`)
    REFERENCES `STATegraDB`.`experiments` (`experiment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_experiments_contains_analysis_2`
    FOREIGN KEY (`analysis_id`)
    REFERENCES `STATegraDB`.`analysis` (`analysis_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analysis_has_steps`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analysis_has_steps` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`analysis_has_steps` (
  `step_id` VARCHAR(50) NOT NULL,
  `analysis_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`step_id`, `analysis_id`),
  INDEX `idx_analysis_has_non_processed_data_1` (`analysis_id` ASC),
  INDEX `idx_analysis_has_non_processed_data_2` (`step_id` ASC),
  CONSTRAINT `fk_analysis_has_non_processed_data_1`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_analysis_has_non_processed_data_2`
    FOREIGN KEY (`analysis_id`)
    REFERENCES `STATegraDB`.`analysis` (`analysis_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`step_use_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`step_use_step` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`step_use_step` (
  `step_id` VARCHAR(50) NOT NULL,
  `used_data_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`step_id`, `used_data_id`),
  INDEX `idx_unify_1` (`used_data_id` ASC),
  INDEX `idx_unify_2` (`step_id` ASC),
  CONSTRAINT `fk_unify_1`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_union_step_2`
    FOREIGN KEY (`used_data_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`processed_data` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`processed_data` (
  `step_id` VARCHAR(50) NOT NULL,
  `processed_data_type` VARCHAR(200) NOT NULL,
  `software` VARCHAR(200) NOT NULL,
  `software_version` VARCHAR(200) NULL,
  `software_configuration` TEXT NULL,
  `results` TEXT NULL,
  `control_sample_id` VARCHAR(50) NULL,
  `feature_type` VARCHAR(100) NULL,
  `region_step_type` VARCHAR(45) NULL,
  `motivation` TEXT NULL,
  PRIMARY KEY (`step_id`),
  INDEX `fk_processed_data_2_idx` (`control_sample_id` ASC),
  INDEX `fk_processed_data_1_idx` (`step_id` ASC),
  CONSTRAINT `fk_processed_data_2`
    FOREIGN KEY (`control_sample_id`)
    REFERENCES `STATegraDB`.`analyticalReplicate` (`analytical_rep_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_processed_data_1`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`region_elements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`region_elements` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`region_elements` (
  `region_element_id` INT NOT NULL AUTO_INCREMENT,
  `step_id` VARCHAR(50) NOT NULL,
  `region_name` VARCHAR(200) NULL,
  `source` VARCHAR(200) NULL,
  `files_location` TEXT NULL,
  `region_step_id` VARCHAR(50) NULL,
  PRIMARY KEY (`region_element_id`, `step_id`),
  INDEX `idx_region_elements_1` (`region_step_id` ASC),
  INDEX `idx_region_elements_2` (`step_id` ASC),
  CONSTRAINT `fk_region_elements_1`
    FOREIGN KEY (`region_step_id`)
    REFERENCES `STATegraDB`.`processed_data` (`step_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_region_elements_2`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`processed_data` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`mass_spectrometry_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`mass_spectrometry_rawdata` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`mass_spectrometry_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `mass_spectrometer_manufacturer` VARCHAR(200) NULL,
  `customizations` TEXT NULL DEFAULT NULL,
  `ionization_source` VARCHAR(200) NULL,
  `supply_type` VARCHAR(200) NULL,
  `interface_manufacturer_and_model` VARCHAR(200) NULL,
  `sprayer_type_manufacturer_and_model` VARCHAR(200) NULL,
  `other_electrospray_ionisation` TEXT NULL,
  `plate_composition` VARCHAR(200) NULL,
  `matrix_composition` VARCHAR(200) NULL,
  `psd_summary` VARCHAR(200) NULL,
  `laser_type_and_wavelength` VARCHAR(200) NULL,
  `other_maldi` TEXT NULL,
  `other_ionization_description` TEXT NULL,
  `mass_analyzer_type` VARCHAR(200) NULL,
  `reflectron_status` VARCHAR(200) NULL,
  `activation_location` VARCHAR(200) NULL,
  `gas_type` VARCHAR(200) NULL,
  `activation_type` VARCHAR(200) NULL,
  `acquisition_software` VARCHAR(200) NULL,
  `acquisition_parameters` TEXT NULL DEFAULT NULL,
  `separation_method_type` VARCHAR(50) NULL,
  `analysis_software` VARCHAR(200) NULL DEFAULT NULL,
  `analysis_parameters` TEXT NULL DEFAULT NULL,
  `intensity_values` VARCHAR(200) NULL DEFAULT NULL,
  `ms_level` VARCHAR(200) NULL DEFAULT NULL,
  `ion_mode` VARCHAR(200) NULL DEFAULT NULL,
  `additional_info` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC),
  CONSTRAINT `fk_proteomics_Peptide_3`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`column_chromatography_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`column_chromatography_rawdata` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`column_chromatography_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `sample_description` TEXT NULL DEFAULT NULL,
  `sample_processing` TEXT NULL DEFAULT NULL,
  `sample_injection` TEXT NULL DEFAULT NULL,
  `column_chromatography_type` VARCHAR(200) NOT NULL,
  `column_manufacturer` VARCHAR(500) NULL,
  `column_model` VARCHAR(200) NULL,
  `separation_mode` VARCHAR(200) NULL,
  `dimensions` VARCHAR(200) NULL,
  `description_of_stationary_phase` VARCHAR(200) NULL,
  `additional_accessories` VARCHAR(200) NULL,
  `combined_unit_manufacturer` TEXT NULL DEFAULT NULL,
  `combined_unit_model` TEXT NULL DEFAULT NULL,
  `time` VARCHAR(200) NULL,
  `gradient` VARCHAR(200) NULL,
  `flow_rate` VARCHAR(200) NULL,
  `temperature` VARCHAR(200) NULL,
  `pre_run_process_type` TEXT NULL DEFAULT NULL,
  `pre_run_process_substance` VARCHAR(200) NULL DEFAULT NULL,
  `pre_run_process_time` VARCHAR(200) NULL DEFAULT NULL,
  `pre_run_process_flowrate` VARCHAR(200) NULL DEFAULT NULL,
  `detection_equipment` TEXT NULL DEFAULT NULL,
  `detection_type` TEXT NULL DEFAULT NULL,
  `detection_equipment_settings` TEXT NULL DEFAULT NULL,
  `detection_timescale` TEXT NULL DEFAULT NULL,
  `detection_trace` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC),
  CONSTRAINT `fk_proteomics_Peptide_30`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`mobile_phase`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`mobile_phase` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`mobile_phase` (
  `mobile_phase_id` INT NOT NULL AUTO_INCREMENT,
  `rawdata_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`mobile_phase_id`, `rawdata_id`),
  INDEX `idx_mobile_phase_proteomics_1` (`rawdata_id` ASC),
  CONSTRAINT `fk_mobile_phase_proteomics_Peptide1`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`column_chromatography_rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`nuclear_magnetic_resonance`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`nuclear_magnetic_resonance` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`nuclear_magnetic_resonance` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `instrument_manufacturer` VARCHAR(200) NULL,
  `instrument_model` VARCHAR(200) NULL,
  `strength` VARCHAR(200) NULL,
  `console_description` TEXT NULL,
  `vt_control` VARCHAR(200) NULL,
  `pulsed_field_strength` VARCHAR(200) NULL,
  `max_gradient_strength` VARCHAR(200) NULL,
  `n_shims` INT NULL,
  `n_channels` INT NULL,
  `probe_type` VARCHAR(200) NULL,
  `sample_state` VARCHAR(200) NULL,
  `operation_mode` VARCHAR(200) NULL,
  `tune_mode` VARCHAR(200) NULL,
  `probe_gas` VARCHAR(200) NULL,
  `volume` VARCHAR(200) NULL,
  `final_sample_status` VARCHAR(200) NULL,
  `nmr_tube_type` VARCHAR(200) NULL,
  `pH` VARCHAR(200) NULL,
  `solvent` VARCHAR(200) NULL,
  `buffer` VARCHAR(200) NULL,
  `resonant_frequency` VARCHAR(200) NULL,
  `acquisition_description` TEXT NULL,
  `separation_method_type` VARCHAR(50) NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC),
  CONSTRAINT `fk_proteomics_Peptide_31`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`capillary_electrophoresis_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`capillary_electrophoresis_rawdata` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`capillary_electrophoresis_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL,
  `experiment_type` VARCHAR(200) NOT NULL,
  `experiment_aim` VARCHAR(200) NULL,
  `sample_description` TEXT NULL,
  `sample_solution` TEXT NULL,
  `sample_preparation` TEXT NULL,
  `capillary_description` TEXT NULL,
  `capillary_source` TEXT NULL,
  `capillary_dimensions` TEXT NULL,
  `ce_temperature` TEXT NULL,
  `auxiliary_data_channels` TEXT NULL,
  `duration` TEXT NULL,
  `run_description` TEXT NULL,
  PRIMARY KEY (`rawdata_id`),
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC),
  CONSTRAINT `fk_proteomics_Peptide_300`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`step_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`step_owners` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`step_owners` (
  `user_id` VARCHAR(50) NOT NULL,
  `step_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`user_id`, `step_id`),
  INDEX `fk_ExperimentOwners_Experiments1_idx` (`step_id` ASC),
  INDEX `fk_ExperimentOwners_Experiments1_idx1` (`step_id` ASC),
  INDEX `fk_ExperimentOwners_Users1_idx` (`user_id` ASC),
  CONSTRAINT `fk_ExperimentOwners_Experiments10`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ExperimentOwners_Users10`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '\n';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`batch_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`batch_owners` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`batch_owners` (
  `user_id` VARCHAR(50) NOT NULL,
  `batch_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`user_id`, `batch_id`),
  INDEX `idx_biocondition_owners_1` (`batch_id` ASC),
  INDEX `idx_biocondition_owners_2` (`user_id` ASC),
  CONSTRAINT `fk_biocondition_owners_10`
    FOREIGN KEY (`batch_id`)
    REFERENCES `STATegraDB`.`batch` (`batch_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_20`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`treatment_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`treatment_owners` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`treatment_owners` (
  `user_id` VARCHAR(50) NOT NULL,
  `treatment_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`user_id`, `treatment_id`),
  INDEX `idx_biocondition_owners_1` (`treatment_id` ASC),
  INDEX `idx_biocondition_owners_2` (`user_id` ASC),
  CONSTRAINT `fk_biocondition_owners_100`
    FOREIGN KEY (`treatment_id`)
    REFERENCES `STATegraDB`.`treatment` (`treatment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_200`
    FOREIGN KEY (`user_id`)
    REFERENCES `STATegraDB`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`fraction`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`fraction` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`fraction` (
  `fraction_id` INT NOT NULL AUTO_INCREMENT,
  `rawdata_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`fraction_id`, `rawdata_id`),
  INDEX `idx_mobile_phase_proteomics_1` (`rawdata_id` ASC),
  CONSTRAINT `fk_mobile_phase_proteomics_Peptide10`
    FOREIGN KEY (`rawdata_id`)
    REFERENCES `STATegraDB`.`column_chromatography_rawdata` (`rawdata_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`proteomics_msquantification`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`proteomics_msquantification` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`proteomics_msquantification` (
  `step_id` VARCHAR(50) NOT NULL,
  `groups` VARCHAR(1200) NULL DEFAULT NULL,
  `replicates` VARCHAR(1200) NULL DEFAULT NULL,
  `labelling_protocol` VARCHAR(1200) NULL DEFAULT NULL,
  `sample_description` VARCHAR(1200) NULL DEFAULT NULL,
  `sample_name` VARCHAR(600) NULL DEFAULT NULL,
  `sample_amount` VARCHAR(600) NULL DEFAULT NULL,
  `sample_labelling` VARCHAR(1200) NULL DEFAULT NULL,
  `replicates_and_groups` VARCHAR(1200) NULL DEFAULT NULL,
  `isotopic_correction_coefficients` VARCHAR(400) NULL DEFAULT NULL,
  `internal_references` VARCHAR(1200) NULL DEFAULT NULL,
  `input_data_type` TEXT NULL DEFAULT NULL,
  `input_data_format` TEXT NULL DEFAULT NULL,
  `input_data_merging` TEXT NULL DEFAULT NULL,
  `quantification_software` TEXT NULL DEFAULT NULL,
  `selection_method` TEXT NULL DEFAULT NULL,
  `confidence_filter` TEXT NULL DEFAULT NULL,
  `missing_values` TEXT NULL DEFAULT NULL,
  `quantification_values_calculation` TEXT NULL DEFAULT NULL,
  `replicate_aggregation` TEXT NULL DEFAULT NULL,
  `normalization` TEXT NULL DEFAULT NULL,
  `protein_quantification_values_calculation` TEXT NULL DEFAULT NULL,
  `specific_corrections` TEXT NULL DEFAULT NULL,
  `correctness_estimation_methods` TEXT NULL DEFAULT NULL,
  `curves_calibration` TEXT NULL DEFAULT NULL,
  `primary_extracted_quantification_values` TEXT NULL DEFAULT NULL,
  `primary_extracted_quantification_files_location` TEXT NULL DEFAULT NULL,
  `peptide_quantification_values` TEXT NULL DEFAULT NULL,
  `peptide_quantification_files_location` TEXT NULL DEFAULT NULL,
  `raw_quantification_values` TEXT NULL DEFAULT NULL,
  `raw_quantification_files_location` TEXT NULL DEFAULT NULL,
  `transformed_quantification_values` TEXT NULL DEFAULT NULL,
  `transformed_quantification_files_location` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`step_id`),
  CONSTRAINT `fk_proteomics_msquantification`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`processed_data` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`quality_report`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`quality_report` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`quality_report` (
  `studied_step_id` VARCHAR(50) NOT NULL,
  `software` VARCHAR(200) NULL,
  `software_version` VARCHAR(200) NULL,
  `software_configuration` TEXT NULL,
  `results` TEXT NULL,
  `files_location` TEXT NULL,
  `submission_date` VARCHAR(8) NULL,
  INDEX `idx_quality_report_1` (`studied_step_id` ASC),
  PRIMARY KEY (`studied_step_id`),
  CONSTRAINT `fk_quality_report_non_process_data10`
    FOREIGN KEY (`studied_step_id`)
    REFERENCES `STATegraDB`.`step` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`proteomics_msinformatics`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`proteomics_msinformatics` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`proteomics_msinformatics` (
  `step_id` VARCHAR(50) NOT NULL,
  `msi_responsible_person` VARCHAR(400) NULL DEFAULT NULL,
  `msi_software` VARCHAR(400) NULL DEFAULT NULL,
  `msi_customizations` VARCHAR(400) NULL DEFAULT NULL,
  `msi_software_availability` VARCHAR(400) NULL DEFAULT NULL,
  `msi_files_description` VARCHAR(500) NULL DEFAULT NULL,
  `msi_files_location` VARCHAR(500) NULL DEFAULT NULL,
  `msi_inputdata_description` TEXT NULL DEFAULT NULL,
  `msi_database_queried` VARCHAR(400) NULL DEFAULT NULL,
  `msi_taxonomical_restrictions` TEXT NULL DEFAULT NULL,
  `msi_tool_description` TEXT NULL DEFAULT NULL,
  `msi_cleavage_agents` VARCHAR(500) NULL DEFAULT NULL,
  `msi_missed_cleavages` VARCHAR(500) NULL DEFAULT NULL,
  `msi_cleavage_additional_params` VARCHAR(500) NULL DEFAULT NULL,
  `msi_permissible_aminoacids_modifications` VARCHAR(500) NULL,
  `msi_precursorion_tolerance` VARCHAR(500) NULL,
  `msi_pmf_mass_tolerance` VARCHAR(500) NULL,
  `msi_thresholds` VARCHAR(400) NULL,
  `msi_otherparams` TEXT NULL,
  `msi_accession_code` VARCHAR(400) NULL,
  `msi_protein_description` TEXT NULL,
  `msi_protein_scores` VARCHAR(500) NULL,
  `msi_validation_status` VARCHAR(500) NULL,
  `msi_different_peptide_sequences` VARCHAR(500) NULL,
  `msi_peptide_coverage` VARCHAR(500) NULL,
  `msi_pmf_matched_peaks` VARCHAR(500) NULL,
  `msi_other_additional_info` TEXT NULL,
  `msi_sequence` TEXT NULL,
  `msi_peptide_scores` TEXT NULL,
  `msi_chemical_modifications` TEXT NULL,
  `msi_spectrum_locus` VARCHAR(500) NULL,
  `msi_charge_assumed` TEXT NULL,
  `msi_quantitation_approach` TEXT NULL,
  `msi_quantitation_measurement` VARCHAR(400) NULL,
  `msi_quantitation_normalisation` TEXT NULL,
  `msi_quantitation_replicates_number` VARCHAR(500) NULL,
  `msi_quantitation_acceptance` TEXT NULL,
  `msi_quantitation_error_analysis` TEXT NULL,
  `msi_quantitation_control_results` TEXT NULL,
  `msi_interpretation_assessment` TEXT NULL,
  `msi_interpretation_results` TEXT NULL,
  `msi_interpretation_inclusion` TEXT NULL,
  PRIMARY KEY (`step_id`),
  CONSTRAINT `fk_proteomics_msquantification0`
    FOREIGN KEY (`step_id`)
    REFERENCES `STATegraDB`.`processed_data` (`step_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`appVersion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`appVersion` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `STATegraDB`.`appVersion` (
  `version` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`version`))
ENGINE = InnoDB;

SHOW WARNINGS;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT IGNORE INTO `STATegraDB`.`appVersion` (version) VALUES('0.6');
INSERT IGNORE INTO `STATegraDB`.`users` (user_id, password) VALUES('admin',SHA1('adminpassword'));

use mysql;
CREATE USER 'emsuser'@'localhost' IDENTIFIED BY 'emsuser#123';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, CREATE ROUTINE, ALTER ROUTINE, EXECUTE ON STATegraDB.* TO 'emsuser'@'localhost';
flush privileges;
