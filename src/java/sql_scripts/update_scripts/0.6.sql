USE STATegraDB;
START TRANSACTION;
BEGIN;
    set FOREIGN_KEY_CHECKS = 1;

    -- -----------------------------------------------------
    -- Table `STATegraDB`.`proteomics_msinformatics`
    -- -----------------------------------------------------
    DROP TABLE IF EXISTS `STATegraDB`.`proteomics_msinformatics` ;

    SHOW WARNINGS;
    CREATE TABLE IF NOT EXISTS `STATegraDB`.`proteomics_msinformatics` (
      `step_id` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
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
      INDEX `idx_step_id_1` (`step_id` ASC),
      CONSTRAINT `proteomics_msinformatics0`
        FOREIGN KEY (`step_id`)
        REFERENCES `STATegraDB`.`processed_data` (`step_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE)
    ENGINE = InnoDB;

    SHOW WARNINGS;

    INSERT INTO proteomics_msinformatics 
    (step_id, msi_responsible_person, msi_software, msi_customizations, msi_software_availability, 
    msi_files_description, msi_files_location, msi_inputdata_description, msi_database_queried, msi_taxonomical_restrictions, msi_tool_description, 
    msi_cleavage_agents, msi_missed_cleavages, msi_cleavage_additional_params, msi_permissible_aminoacids_modifications, msi_precursorion_tolerance, 
    msi_pmf_mass_tolerance, msi_thresholds, msi_otherparams, msi_accession_code, msi_protein_description, msi_protein_scores, msi_validation_status, 
    msi_different_peptide_sequences, msi_peptide_coverage, msi_pmf_matched_peaks, msi_other_additional_info, msi_sequence, msi_peptide_scores, 
    msi_chemical_modifications, msi_spectrum_locus, msi_charge_assumed,  msi_quantitation_approach, msi_quantitation_measurement, 
    msi_quantitation_normalisation, msi_quantitation_replicates_number, msi_quantitation_acceptance, msi_quantitation_error_analysis, 
    msi_quantitation_control_results, msi_interpretation_assessment, msi_interpretation_results, msi_interpretation_inclusion) 
    SELECT step_id, msi_responsible_person, msi_software, msi_customizations, msi_software_availability, msi_files_description, msi_files_location,
     msi_inputdata_description, msi_database_queried, msi_taxonomical_restrictions, msi_tool_description, msi_cleavage_agents, msi_missed_cleavages, msi_cleavage_additional_params,
     msi_permissible_aminoacids_modifications, msi_precursorion_tolerance, msi_pmf_mass_tolerance, msi_thresholds, msi_otherparams, msi_accession_code, msi_protein_description, msi_protein_scores, 
    msi_validation_status, msi_different_peptide_sequences, msi_peptide_coverage, msi_pmf_matched_peaks, msi_other_additional_info, msi_sequence, msi_peptide_scores, msi_chemical_modifications,
     msi_spectrum_locus, msi_charge_assumed, msi_quantitation_approach, msi_quantitation_measurement, msi_quantitation_normalisation, msi_quantitation_replicates_number, msi_quantitation_acceptance, 
    msi_quantitation_error_analysis, msi_quantitation_control_results, msi_interpretation_assessment, msi_interpretation_results, msi_interpretation_inclusion 
    FROM proteomics_msquantification;

    LOCK TABLES `proteomics_msquantification` WRITE;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_responsible_person;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_software;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_customizations;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_software_availability;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_files_description;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_files_location;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_inputdata_description;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_database_queried;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_taxonomical_restrictions;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_tool_description;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_cleavage_agents;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_missed_cleavages;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_cleavage_additional_params;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_permissible_aminoacids_modifications;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_precursorion_tolerance;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_pmf_mass_tolerance;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_thresholds;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_otherparams;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_accession_code;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_protein_description;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_protein_scores;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_validation_status;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_different_peptide_sequences;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_peptide_coverage;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_pmf_matched_peaks;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_other_additional_info;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_sequence;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_peptide_scores;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_chemical_modifications;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_spectrum_locus;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_charge_assumed;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_approach;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_measurement;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_normalisation;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_replicates_number;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_acceptance;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_error_analysis;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_quantitation_control_results;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_interpretation_assessment;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_interpretation_results;
        ALTER TABLE proteomics_msquantification DROP COLUMN msi_interpretation_inclusion;
    UNLOCK TABLES;

    -- -----------------------------------------------------
    -- Table `STATegraDB`.`analysis`
    -- -----------------------------------------------------
    LOCK TABLES `analysis` WRITE;
        ALTER IGNORE TABLE `analysis` ADD `analysisName` VARCHAR(200) NULL ;
    UNLOCK TABLES;

    -- -----------------------------------------------------
    -- Table `STATegraDB`.`appVersion`
    -- -----------------------------------------------------
    DROP TABLE IF EXISTS `STATegraDB`.`appVersion` ;
    SHOW WARNINGS;
    CREATE TABLE IF NOT EXISTS `STATegraDB`.`appVersion` (
      `version` VARCHAR(50) NOT NULL,
      PRIMARY KEY (`version`))
    ENGINE = InnoDB;

    INSERT IGNORE INTO `STATegraDB`.`appVersion` (version) VALUES('0.6');

    SHOW WARNINGS;

set FOREIGN_KEY_CHECKS = 0;

COMMIT;

