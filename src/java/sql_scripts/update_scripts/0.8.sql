USE STATegraDB;
START TRANSACTION;
BEGIN;

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
ALTER TABLE analysis ADD COLUMN remove_requests TEXT DEFAULT "";

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

UPDATE appVersion SET version='0.8';

COMMIT;

