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
ALTER TABLE biocondition ADD COLUMN tags TEXT;
ALTER TABLE biocondition ADD COLUMN public BOOLEAN DEFAULT TRUE;

ALTER TABLE analyticalReplicate MODIFY COLUMN treatment_id VARCHAR(50);

ALTER TABLE analysis CHANGE analysisType analysis_type varchar(200);
ALTER TABLE analysis CHANGE analysisName analysis_name varchar(200);
ALTER TABLE analysis ADD COLUMN tags TEXT;

COMMIT;

