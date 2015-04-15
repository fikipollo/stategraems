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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`biocondition` (
  `biocondition_id` VARCHAR(50) NOT NULL ,
  `organism` VARCHAR(200) NOT NULL ,
  `title` VARCHAR(200) NOT NULL ,
  `name` VARCHAR(200) NOT NULL ,
  `cell_type` VARCHAR(200) NULL ,
  `tissue_type` VARCHAR(200) NULL ,
  `cell_line` VARCHAR(200) NULL ,
  `gender` VARCHAR(200) NULL ,
  `genotype` VARCHAR(200) NULL ,
  `other_biomaterial` TEXT NULL ,
  `treatment` VARCHAR(200) NULL ,
  `dosis` VARCHAR(100) NULL ,
  `time` VARCHAR(200) NULL ,
  `other_exp_cond` TEXT NULL ,
  `protocol_description` TEXT NULL ,
  `submission_date` VARCHAR(8) NOT NULL ,
  `last_edition_date` VARCHAR(8) NOT NULL ,
  `external_links` TEXT NOT NULL ,
  PRIMARY KEY (`biocondition_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiments` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`experiments` (
  `experiment_id` VARCHAR(50) NOT NULL DEFAULT '' ,
  `title` VARCHAR(200) NOT NULL ,
  `experiment_description` TEXT NOT NULL ,
  `is_time_course_type` TINYINT(1) NULL ,
  `is_case_control_type` TINYINT(1) NULL ,
  `is_survival_type` TINYINT(1) NULL ,
  `is_single_condition` TINYINT(1) NULL ,
  `is_multiple_conditions` TINYINT(1) NULL ,
  `is_other_type` TINYINT(1) NULL ,
  `biological_rep_no` VARCHAR(45) NULL ,
  `technical_rep_no` VARCHAR(45) NULL ,
  `contains_chipseq` TINYINT(1) NULL ,
  `contains_dnaseseq` TINYINT(1) NULL ,
  `contains_methylseq` TINYINT(1) NULL ,
  `contains_mrnaseq` TINYINT(1) NULL ,
  `contains_mirnaseq` TINYINT(1) NULL ,
  `contains_metabolomics` TINYINT(1) NULL ,
  `contains_proteomics` TINYINT(1) NULL ,
  `contains_other` TINYINT(1) NULL ,
  `public_references` TEXT NULL ,
  `submission_date` VARCHAR(8) NOT NULL ,
  `last_edition_date` VARCHAR(8) NOT NULL ,
  PRIMARY KEY (`experiment_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`users` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`users` (
  `user_id` VARCHAR(50) NOT NULL ,
  `password` VARCHAR(200) NOT NULL ,
  `email` VARCHAR(200) NULL ,
  `last_experiment_id` VARCHAR(50) NULL ,
  PRIMARY KEY (`user_id`) ,
  INDEX `fk_users_1_idx` (`last_experiment_id` ASC) ,
  CONSTRAINT `fk_users_1`
    FOREIGN KEY (`last_experiment_id` )
    REFERENCES `STATegraDB`.`experiments` (`experiment_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`biocondition_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`biocondition_owners` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`biocondition_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `biocondition_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`user_id`, `biocondition_id`) ,
  INDEX `idx_biocondition_owners_1` (`biocondition_id` ASC) ,
  INDEX `idx_biocondition_owners_2` (`user_id` ASC) ,
  CONSTRAINT `fk_biocondition_owners_1`
    FOREIGN KEY (`biocondition_id` )
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_2`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`experiment_use_biocondition` (
  `experiment_id` VARCHAR(50) NOT NULL ,
  `biocondition_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`experiment_id`, `biocondition_id`) ,
  INDEX `fk_BiosampleUsedByExperiment_BioSamples1_idx` (`biocondition_id` ASC) ,
  INDEX `fk_BiosampleUsedByExperiment_Experiments1_idx` (`experiment_id` ASC) ,
  CONSTRAINT `fk_BiosampleUsedByExperiment_BioSamples1`
    FOREIGN KEY (`biocondition_id` )
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_BiosampleUsedByExperiment_Experiments1`
    FOREIGN KEY (`experiment_id` )
    REFERENCES `STATegraDB`.`experiments` (`experiment_id` )
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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`experiment_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `experiment_id` VARCHAR(50) NOT NULL ,
  `role` INT(11) NOT NULL ,
  PRIMARY KEY (`user_id`, `experiment_id`) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx` (`experiment_id` ASC) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx1` (`experiment_id` ASC) ,
  INDEX `fk_ExperimentOwners_Users1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_ExperimentOwners_Experiments1`
    FOREIGN KEY (`experiment_id` )
    REFERENCES `STATegraDB`.`experiments` (`experiment_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ExperimentOwners_Users1`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`batch` (
  `batch_id` VARCHAR(50) NOT NULL ,
  `batch_name` VARCHAR(200) NULL ,
  `batch_creation_date` VARCHAR(8) NULL ,
  `description` TEXT NULL ,
  PRIMARY KEY (`batch_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`bioreplicate`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`bioreplicate` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`bioreplicate` (
  `biocondition_id` VARCHAR(50) NOT NULL ,
  `bioreplicate_id` VARCHAR(50) NOT NULL ,
  `bioreplicate_name` VARCHAR(200) NOT NULL ,
  `batch_id` VARCHAR(50) NULL ,
  PRIMARY KEY (`bioreplicate_id`) ,
  INDEX `idx_bioreplicate_1` (`biocondition_id` ASC) ,
  INDEX `idx_bioreplicate_2` (`batch_id` ASC) ,
  CONSTRAINT `fk_bioreplicate_1`
    FOREIGN KEY (`biocondition_id` )
    REFERENCES `STATegraDB`.`biocondition` (`biocondition_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_bioreplicate_2`
    FOREIGN KEY (`batch_id` )
    REFERENCES `STATegraDB`.`batch` (`batch_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
PACK_KEYS = DEFAULT;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`non_processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`non_processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`non_processed_data` (
  `step_id` VARCHAR(50) NOT NULL ,
  `step_name` VARCHAR(50) NULL ,
  `step_number` INT NULL ,
  `type` VARCHAR(200) NULL ,
  `submission_date` VARCHAR(8) NULL ,
  `last_edition_date` VARCHAR(8) NULL ,
  `files_location` TEXT NULL ,
  PRIMARY KEY (`step_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`treatment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`treatment` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`treatment` (
  `treatment_id` VARCHAR(50) NOT NULL ,
  `treatment_name` VARCHAR(50) NOT NULL ,
  `description` TEXT NULL ,
  `biomolecule` VARCHAR(45) NULL ,
  PRIMARY KEY (`treatment_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analyticalReplicate`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analyticalReplicate` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`analyticalReplicate` (
  `analytical_rep_id` VARCHAR(50) NOT NULL ,
  `analytical_rep_name` VARCHAR(200) NULL ,
  `bioreplicate_id` VARCHAR(50) NOT NULL ,
  `treatment_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`analytical_rep_id`) ,
  INDEX `idx_analyticalReplicate_1` (`bioreplicate_id` ASC) ,
  INDEX `idx_analyticalReplicate_2` (`treatment_id` ASC) ,
  CONSTRAINT `fk_analyticalReplicate_1`
    FOREIGN KEY (`bioreplicate_id` )
    REFERENCES `STATegraDB`.`bioreplicate` (`bioreplicate_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_analyticalReplicate_2`
    FOREIGN KEY (`treatment_id` )
    REFERENCES `STATegraDB`.`treatment` (`treatment_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `analyticalReplicate_id` VARCHAR(50) NOT NULL ,
  `technical_rep_set_id` VARCHAR(50) NULL ,
  `raw_data_type` VARCHAR(200) NOT NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_rawdata_1` (`rawdata_id` ASC) ,
  INDEX `idx_rawdata_3` (`analyticalReplicate_id` ASC) ,
  CONSTRAINT `fk_rawdata_10`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_rawdata_30`
    FOREIGN KEY (`analyticalReplicate_id` )
    REFERENCES `STATegraDB`.`analyticalReplicate` (`analytical_rep_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`sequencing_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`sequencing_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`sequencing_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `layout` VARCHAR(200) NULL ,
  `orientation` VARCHAR(200) NULL ,
  `nominal_length` INT NULL ,
  `nominal_length_stdev` INT NULL ,
  `avg_sequence_length` INT NULL ,
  `avg_sequencing_deep` DOUBLE NULL ,
  `platform_family` VARCHAR(200) NOT NULL ,
  `platform_model` VARCHAR(200) NOT NULL ,
  `base_calls` VARCHAR(200) NULL ,
  `pooling_strategy` VARCHAR(200) NULL ,
  `pooling_strategy_description` TEXT NULL ,
  `slide_ID` VARCHAR(200) NULL ,
  `lane_number` VARCHAR(200) NULL ,
  `library_construction_protocol` TEXT NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_rawdata_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_rawdata_1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`rnaseq_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`rnaseq_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`rnaseq_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `extracted_molecule` VARCHAR(200) NULL ,
  `rna_type` VARCHAR(200) NULL ,
  `strand_specificity` VARCHAR(200) NOT NULL ,
  `selection` VARCHAR(200) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_rnaseq_rawdata_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_rnaseq_rawdata_1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`sequencing_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`chipseq_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`chipseq_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`chipseq_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `is_control_sample` TINYINT(1) NOT NULL ,
  `antibody_target` VARCHAR(200) NOT NULL ,
  `antibody_target_type` VARCHAR(200) NOT NULL ,
  `antibody_manufacturer` VARCHAR(200) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_chipseq_rawdata_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_chipseq_rawdata_1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`sequencing_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`dnaseseq_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`dnaseseq_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`dnaseseq_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `is_for_footprinting` TINYINT(1) NOT NULL ,
  `restriction_enzyme` VARCHAR(200) NOT NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_dnaseseq_rawdata_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_dnaseseq_rawdata_1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`sequencing_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`methylseq_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`methylseq_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`methylseq_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `protocol` VARCHAR(200) NOT NULL ,
  `strand_specificity` VARCHAR(200) NOT NULL ,
  `selection` VARCHAR(200) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_methylseq_rawdata_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_methylseq_rawdata_1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`sequencing_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`quality_report`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`quality_report` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`quality_report` (
  `studied_step_id` VARCHAR(50) NOT NULL ,
  `software` VARCHAR(200) NULL ,
  `software_version` VARCHAR(200) NULL ,
  `software_configuration` TEXT NULL ,
  `results` TEXT NULL ,
  `files_location` TEXT NULL ,
  `submission_date` VARCHAR(8) NULL ,
  INDEX `idx_quality_report_1` (`studied_step_id` ASC) ,
  PRIMARY KEY (`studied_step_id`) ,
  CONSTRAINT `fk_quality_report_non_process_data1`
    FOREIGN KEY (`studied_step_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`intermediate_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`intermediate_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`intermediate_data` (
  `step_id` VARCHAR(50) NOT NULL ,
  `intermediate_data_type` VARCHAR(200) NULL ,
  `software` VARCHAR(200) NULL ,
  `software_version` VARCHAR(200) NULL ,
  `software_configuration` TEXT NULL ,
  `motivation` TEXT NULL ,
  `results` TEXT NULL ,
  PRIMARY KEY (`step_id`) ,
  INDEX `idx_intermediate_data_1` (`step_id` ASC) ,
  CONSTRAINT `fk_intermediate_data_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analysis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analysis` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`analysis` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `analysisType` VARCHAR(200) NOT NULL ,
  `status` VARCHAR(200) NOT NULL ,
  PRIMARY KEY (`analysis_id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`experiments_contains_analysis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`experiments_contains_analysis` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`experiments_contains_analysis` (
  `experiment_id` VARCHAR(50) NOT NULL ,
  `analysis_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`experiment_id`, `analysis_id`) ,
  INDEX `idx_experiments_contains_analysis_1` (`analysis_id` ASC) ,
  INDEX `idx_experiments_contains_analysis_2` (`experiment_id` ASC) ,
  CONSTRAINT `fk_experiments_contains_analysis_1`
    FOREIGN KEY (`experiment_id` )
    REFERENCES `STATegraDB`.`experiments` (`experiment_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_experiments_contains_analysis_2`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`analysis` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`analysis_has_non_processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`analysis_has_non_processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`analysis_has_non_processed_data` (
  `non_processed_data_step_id` VARCHAR(50) NOT NULL ,
  `analysis_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`non_processed_data_step_id`, `analysis_id`) ,
  INDEX `idx_analysis_has_non_processed_data_1` (`analysis_id` ASC) ,
  INDEX `idx_analysis_has_non_processed_data_2` (`non_processed_data_step_id` ASC) ,
  CONSTRAINT `fk_analysis_has_non_processed_data_1`
    FOREIGN KEY (`non_processed_data_step_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_analysis_has_non_processed_data_2`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`analysis` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`preprocessing_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`preprocessing_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`preprocessing_step` (
  `step_id` VARCHAR(50) NOT NULL ,
  `preprocessing_type` VARCHAR(200) NOT NULL ,
  PRIMARY KEY (`step_id`) ,
  CONSTRAINT `fk_preprocessing_step_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`mapping_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`mapping_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`mapping_step` (
  `step_id` VARCHAR(50) NOT NULL ,
  `genome_specie` VARCHAR(200) NOT NULL ,
  `genome_version` VARCHAR(200) NOT NULL ,
  `genome_source` VARCHAR(200) NOT NULL ,
  PRIMARY KEY (`step_id`) ,
  CONSTRAINT `fk_mapping_step_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`smoothing_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`smoothing_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`smoothing_step` (
  `step_id` VARCHAR(50) NOT NULL ,
  `sliding_window_length` INT NOT NULL ,
  `steps_length` INT NOT NULL ,
  PRIMARY KEY (`step_id`) ,
  CONSTRAINT `fk_smoothing_step_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`intermediate_data_use_non_processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`intermediate_data_use_non_processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`intermediate_data_use_non_processed_data` (
  `step_id` VARCHAR(50) NOT NULL ,
  `used_data_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`step_id`, `used_data_id`) ,
  INDEX `idx_unify_1` (`used_data_id` ASC) ,
  INDEX `idx_unify_2` (`step_id` ASC) ,
  CONSTRAINT `fk_unify_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_union_step_2`
    FOREIGN KEY (`used_data_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`processed_data` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `processed_data_type` VARCHAR(200) NOT NULL ,
  `step_name` VARCHAR(50) NULL ,
  `software` VARCHAR(200) NOT NULL ,
  `software_version` VARCHAR(200) NULL ,
  `software_configuration` TEXT NULL ,
  `results` TEXT NULL ,
  `files` TEXT NOT NULL ,
  `submission_date` VARCHAR(8) NOT NULL ,
  `last_edition_date` VARCHAR(8) NOT NULL ,
  PRIMARY KEY (`analysis_id`) ,
  CONSTRAINT `fk_processed_data_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`analysis` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`processed_data_use_non_processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`processed_data_use_non_processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`processed_data_use_non_processed_data` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `used_data_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`analysis_id`, `used_data_id`) ,
  INDEX `idx_calling_step_1` (`used_data_id` ASC) ,
  CONSTRAINT `fk_calling_step_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calling_step_2`
    FOREIGN KEY (`used_data_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`region_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`region_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`region_step` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `region_step_type` VARCHAR(45) NULL ,
  `motivation` TEXT NULL ,
  PRIMARY KEY (`analysis_id`) ,
  CONSTRAINT `fk_region_step_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`region_calling_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`region_calling_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`region_calling_step` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `control_sample_id` VARCHAR(50) NULL ,
  PRIMARY KEY (`analysis_id`) ,
  INDEX `idx_region_calling_step_1` (`analysis_id` ASC) ,
  INDEX `idx_region_calling_step_3` (`control_sample_id` ASC) ,
  CONSTRAINT `fk_region_calling_step_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_region_calling_step_3`
    FOREIGN KEY (`control_sample_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`region_elements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`region_elements` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`region_elements` (
  `region_element_id` INT NOT NULL AUTO_INCREMENT ,
  `analysis_id` VARCHAR(50) NOT NULL ,
  `region_name` VARCHAR(200) NULL ,
  `source` VARCHAR(200) NULL ,
  `files_location` TEXT NULL ,
  `region_step_id` VARCHAR(50) NULL ,
  PRIMARY KEY (`region_element_id`, `analysis_id`) ,
  INDEX `idx_region_elements_1` (`region_step_id` ASC) ,
  INDEX `idx_region_elements_2` (`analysis_id` ASC) ,
  CONSTRAINT `fk_region_elements_1`
    FOREIGN KEY (`region_step_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_region_elements_2`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`unify_processed_data`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`unify_processed_data` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`unify_processed_data` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `unified_data_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`analysis_id`, `unified_data_id`) ,
  INDEX `idx_unify_processed_data_1` (`unified_data_id` ASC) ,
  INDEX `idx_unify_processed_data_2` (`analysis_id` ASC) ,
  CONSTRAINT `fk_unify_processed_data_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unify_processed_data_2`
    FOREIGN KEY (`unified_data_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`mass_spectrometry_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`mass_spectrometry_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`mass_spectrometry_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `mass_spectrometer_manufacturer` VARCHAR(200) NULL ,
  `mass_spectrometer_model` VARCHAR(200) NULL ,
  `software_package` VARCHAR(200) NULL ,
  `ionization_source` VARCHAR(200) NULL ,
  `supply_type` VARCHAR(200) NULL ,
  `interface_manufacturer_and_model` VARCHAR(200) NULL ,
  `sprayer_type_manufacturer_and_model` VARCHAR(200) NULL ,
  `other_electrospray_ionisation` TEXT NULL ,
  `plate_composition` VARCHAR(200) NULL ,
  `matrix_composition` VARCHAR(200) NULL ,
  `psd_summary` VARCHAR(200) NULL ,
  `laser_type_and_wavelength` VARCHAR(200) NULL ,
  `other_maldi` TEXT NULL ,
  `other_ionization_description` TEXT NULL ,
  `mass_analyzer_type` VARCHAR(200) NULL ,
  `reflectron_status` VARCHAR(200) NULL ,
  `activation_location` VARCHAR(200) NULL ,
  `gas_type` VARCHAR(200) NULL ,
  `activation_type` VARCHAR(200) NULL ,
  `acquisition_software` VARCHAR(200) NULL ,
  `acquisition_description` TEXT NULL ,
  `separation_method_type` VARCHAR(50) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_proteomics_Peptide_3`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`maxquant_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`maxquant_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`maxquant_step` (
  `step_id` VARCHAR(50) NOT NULL ,
  `path_mqpar_file` VARCHAR(200) NULL ,
  `protein_groups_table_id` VARCHAR(200) NULL ,
  INDEX `idx_maxquant_step_1` (`step_id` ASC) ,
  PRIMARY KEY (`step_id`) ,
  CONSTRAINT `fk_maxquant_step_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`feature_quantification`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`feature_quantification` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`feature_quantification` (
  `analysis_id` VARCHAR(50) NOT NULL ,
  `feature_type` VARCHAR(100) NOT NULL ,
  INDEX `idx_ProtID-Q_Quantification_1` (`analysis_id` ASC) ,
  PRIMARY KEY (`analysis_id`) ,
  CONSTRAINT `fk_ProtID-Q_Quantification_1`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`extract_relevant_features_step`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`extract_relevant_features_step` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`extract_relevant_features_step` (
  `step_id` VARCHAR(50) NOT NULL ,
  `files_description` TEXT NULL ,
  `reference_files` TEXT NOT NULL ,
  `feature_type` VARCHAR(100) NULL ,
  PRIMARY KEY (`step_id`) ,
  INDEX `idx_extract_relevant_features_step_1` (`step_id` ASC) ,
  CONSTRAINT `fk_extract_relevant_features_step_1`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`intermediate_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`column_chromatography_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`column_chromatography_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`column_chromatography_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `column_chromatography_type` VARCHAR(200) NOT NULL ,
  `column_manufacturer` VARCHAR(200) NULL ,
  `column_model` VARCHAR(200) NULL ,
  `separation_mode` VARCHAR(200) NULL ,
  `dimensions` VARCHAR(200) NULL ,
  `description_of_stationary_phase` VARCHAR(200) NULL ,
  `additional_accessories` VARCHAR(200) NULL ,
  `time` VARCHAR(200) NULL ,
  `gradient` VARCHAR(200) NULL ,
  `flow_rate` VARCHAR(200) NULL ,
  `temperature` VARCHAR(200) NULL ,
  `pre_run_process_description` VARCHAR(200) NULL ,
  `post_run_process_description` VARCHAR(200) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_proteomics_Peptide_30`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`mobile_phase`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`mobile_phase` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`mobile_phase` (
  `mobile_phase_id` INT NOT NULL AUTO_INCREMENT ,
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `name` VARCHAR(200) NOT NULL ,
  `description` TEXT NOT NULL ,
  PRIMARY KEY (`mobile_phase_id`, `rawdata_id`) ,
  INDEX `idx_mobile_phase_proteomics_1` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_mobile_phase_proteomics_Peptide1`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`column_chromatography_rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`nuclear_magnetic_resonance`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`nuclear_magnetic_resonance` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`nuclear_magnetic_resonance` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `instrument_manufacturer` VARCHAR(200) NULL ,
  `instrument_model` VARCHAR(200) NULL ,
  `strength` VARCHAR(200) NULL ,
  `console_description` TEXT NULL ,
  `vt_control` VARCHAR(200) NULL ,
  `pulsed_field_strength` VARCHAR(200) NULL ,
  `max_gradient_strength` VARCHAR(200) NULL ,
  `n_shims` INT NULL ,
  `n_channels` INT NULL ,
  `probe_type` VARCHAR(200) NULL ,
  `sample_state` VARCHAR(200) NULL ,
  `operation_mode` VARCHAR(200) NULL ,
  `tune_mode` VARCHAR(200) NULL ,
  `probe_gas` VARCHAR(200) NULL ,
  `volume` VARCHAR(200) NULL ,
  `final_sample_status` VARCHAR(200) NULL ,
  `nmr_tube_type` VARCHAR(200) NULL ,
  `pH` VARCHAR(200) NULL ,
  `solvent` VARCHAR(200) NULL ,
  `buffer` VARCHAR(200) NULL ,
  `resonant_frequency` VARCHAR(200) NULL ,
  `acquisition_description` TEXT NULL ,
  `separation_method_type` VARCHAR(50) NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_proteomics_Peptide_31`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`processed_data_quality_report`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`processed_data_quality_report` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`processed_data_quality_report` (
  `studied_step_id` VARCHAR(50) NOT NULL ,
  `software` VARCHAR(200) NULL ,
  `software_version` VARCHAR(200) NULL ,
  `software_configuration` TEXT NULL ,
  `results` TEXT NULL ,
  `files_location` TEXT NULL ,
  `submission_date` VARCHAR(8) NULL ,
  INDEX `idx_quality_report_1` (`studied_step_id` ASC) ,
  PRIMARY KEY (`studied_step_id`) ,
  CONSTRAINT `fk_quality_report_non_process_data10`
    FOREIGN KEY (`studied_step_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`capillary_electrophoresis_rawdata`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`capillary_electrophoresis_rawdata` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`capillary_electrophoresis_rawdata` (
  `rawdata_id` VARCHAR(50) NOT NULL ,
  `experiment_type` VARCHAR(200) NOT NULL ,
  `experiment_aim` VARCHAR(200) NULL ,
  `sample_description` TEXT NULL ,
  `sample_solution` TEXT NULL ,
  `sample_preparation` TEXT NULL ,
  `capillary_description` TEXT NULL ,
  `capillary_source` TEXT NULL ,
  `capillary_dimensions` TEXT NULL ,
  `ce_temperature` TEXT NULL ,
  `auxiliary_data_channels` TEXT NULL ,
  `duration` TEXT NULL ,
  `run_description` TEXT NULL ,
  PRIMARY KEY (`rawdata_id`) ,
  INDEX `idx_proteomics_Peptide_3` (`rawdata_id` ASC) ,
  CONSTRAINT `fk_proteomics_Peptide_300`
    FOREIGN KEY (`rawdata_id` )
    REFERENCES `STATegraDB`.`rawdata` (`rawdata_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`non_processed_data_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`non_processed_data_owners` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`non_processed_data_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `step_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`user_id`, `step_id`) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx` (`step_id` ASC) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx1` (`step_id` ASC) ,
  INDEX `fk_ExperimentOwners_Users1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_ExperimentOwners_Experiments10`
    FOREIGN KEY (`step_id` )
    REFERENCES `STATegraDB`.`non_processed_data` (`step_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ExperimentOwners_Users10`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = '\n';

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `STATegraDB`.`processed_data_owners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `STATegraDB`.`processed_data_owners` ;

SHOW WARNINGS;
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`processed_data_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `analysis_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`user_id`, `analysis_id`) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx` (`analysis_id` ASC) ,
  INDEX `fk_ExperimentOwners_Experiments1_idx1` (`analysis_id` ASC) ,
  INDEX `fk_ExperimentOwners_Users1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_ExperimentOwners_Experiments100`
    FOREIGN KEY (`analysis_id` )
    REFERENCES `STATegraDB`.`processed_data` (`analysis_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ExperimentOwners_Users100`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`batch_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `batch_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`user_id`, `batch_id`) ,
  INDEX `idx_biocondition_owners_1` (`batch_id` ASC) ,
  INDEX `idx_biocondition_owners_2` (`user_id` ASC) ,
  CONSTRAINT `fk_biocondition_owners_10`
    FOREIGN KEY (`batch_id` )
    REFERENCES `STATegraDB`.`batch` (`batch_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_20`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
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
CREATE  TABLE IF NOT EXISTS `STATegraDB`.`treatment_owners` (
  `user_id` VARCHAR(50) NOT NULL ,
  `treatment_id` VARCHAR(50) NOT NULL ,
  PRIMARY KEY (`user_id`, `treatment_id`) ,
  INDEX `idx_biocondition_owners_1` (`treatment_id` ASC) ,
  INDEX `idx_biocondition_owners_2` (`user_id` ASC) ,
  CONSTRAINT `fk_biocondition_owners_100`
    FOREIGN KEY (`treatment_id` )
    REFERENCES `STATegraDB`.`treatment` (`treatment_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_biocondition_owners_200`
    FOREIGN KEY (`user_id` )
    REFERENCES `STATegraDB`.`users` (`user_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Users_userID';

SHOW WARNINGS;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

use mysql;
INSERT IGNORE INTO mysql.user (Host,User,Password) VALUES('localhost','limsuser',PASSWORD('limsuser#123'));
flush privileges;

GRANT SELECT, INSERT, UPDATE, DELETE ON STATegraDB.* TO 'limsuser'@'localhost';
flush privileges;
