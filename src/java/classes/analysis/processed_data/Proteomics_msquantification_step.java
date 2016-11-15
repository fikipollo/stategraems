///* ***************************************************************
// *  This file is part of STATegra EMS.
// *
// *  STATegra EMS is free software: you can redistribute it and/or 
// *  modify it under the terms of the GNU General Public License as
// *  published by the Free Software Foundation, either version 3 of 
// *  the License, or (at your option) any later version.
// * 
// *  STATegra EMS is distributed in the hope that it will be useful,
// *  but WITHOUT ANY WARRANTY; without even the implied warranty of
// *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// *  GNU General Public License for more details.
// * 
// *  You should have received a copy of the GNU General Public License
// *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
// * 
// *  More info http://bioinfo.cipf.es/stategraems
// *  Technical contact stategraemsdev@gmail.com
// *  *************************************************************** */
//package classes.analysis.processed_data;
//
//import classes.analysis.ProcessedData;
//import com.google.gson.Gson;
//
///**
// *
// * @author Rafa Hernández de Diego
// */
//public class Proteomics_msquantification_step extends ProcessedData {
//////Herited from ProcessedData 
//////    protected String analysis_id;processed_data_type
//////    protected String type;//ENUM('data_matrix','region_step','calling_step','quantification_step', 'merging_step', 'protID-Q_quantification')
//////    protected String software;
//////    protected String software_version;
//////    protected Software_configuration[] software_configuration;
//////    protected String results;
//////    protected String files;
//
//    String groups;
//    String replicates;
//    String labelling_protocol;
//    String sample_description;
//    String sample_name;
//    String sample_amount;
//    String sample_labelling;
//    String replicates_and_groups;
//    String isotopic_correction_coefficients;
//    String internal_references;
//    String input_data_type;
//    String input_data_format;
//    String input_data_merging;
////    String quantified_data;
//    String quantification_software;
//    String selection_method;
//    String confidence_filter;
//    String missing_values;
//    String quantification_values_calculation;
//    String replicate_aggregation;
//    String normalization;
//    String protein_quantification_values_calculation;
//    String specific_corrections;
//    String correctness_estimation_methods;
//    String curves_calibration;
//    String primary_extracted_quantification_values;
//    String primary_extracted_quantification_files_location;
//    String peptide_quantification_values;
//    String peptide_quantification_files_location;
//    String raw_quantification_values;
//    String raw_quantification_files_location;
//    String transformed_quantification_values;
//    String transformed_quantification_files_location;
//    //MIAPE MS INFORMATICS FIELDS
//    String msi_responsible_person;
//    String msi_software;
//    String msi_customizations;
//    String msi_software_availability;
//    String msi_files_description;
//    String msi_files_location;
//    String msi_inputdata_description;
//    String msi_database_queried;
//    String msi_taxonomical_restrictions;
//    String msi_tool_description;
//    String msi_cleavage_agents;
//    String msi_missed_cleavages;
//    String msi_cleavage_additional_params;
//    String msi_permissible_aminoacids_modifications;
//    String msi_precursorion_tolerance;
//    String msi_pmf_mass_tolerance;
//    String msi_thresholds;
//    String msi_otherparams;
//    String msi_accession_code;
//    String msi_protein_description;
//    String msi_protein_scores;
//    String msi_validation_status;
//    String msi_different_peptide_sequences;
//    String msi_peptide_coverage;
//    String msi_pmf_matched_peaks;
//    String msi_other_additional_info;
//    String msi_sequence;
//    String msi_peptide_scores;
//    String msi_chemical_modifications;
//    String msi_spectrum_locus;
//    String msi_charge_assumed;
//    String msi_quantitation_approach;
//    String msi_quantitation_measurement;
//    String msi_quantitation_normalisation;
//    String msi_quantitation_replicates_number;
//    String msi_quantitation_acceptance;
//    String msi_quantitation_error_analysis;
//    String msi_quantitation_control_results;
//    String msi_interpretation_assessment;
//    String msi_interpretation_results;
//    String msi_interpretation_inclusion;
//
//    public Proteomics_msquantification_step() {
//        this.processed_data_type = "proteomics_msquantification_step";
//    }
//
//    /**
//     * This static function returns a new object using the data contained in the
//     * given JSON object (as String).
//     *
//     * @param jsonString the JSON object
//     * @return the new Object.
//     */
//    public static Proteomics_msquantification_step fromJSON(String jsonString) {
//        Gson gson = new Gson();
//        Proteomics_msquantification_step protID_Q_Quantification = gson.fromJson(jsonString, Proteomics_msquantification_step.class);
//
//        return protID_Q_Quantification;
//    }
//
//    @Override
//    public String toJSON() {
//        Gson gson = new Gson();
//        String jsonString = gson.toJson(this);
//
//        return jsonString;
//    }
//
//    //**********************************************************************
//    //* GETTERS AND SETTERS ************************************************
//    //**********************************************************************
//    public String getGroups() {
//        return groups;
//    }
//
//    public void setGroups(String groups) {
//        this.groups = groups;
//    }
//
//    public String getReplicates() {
//        return replicates;
//    }
//
//    public void setReplicates(String replicates) {
//        this.replicates = replicates;
//    }
//
//    public String getLabelling_protocol() {
//        return labelling_protocol;
//    }
//
//    public void setLabelling_protocol(String labelling_protocol) {
//        this.labelling_protocol = labelling_protocol;
//    }
//
//    public String getSampleDescription() {
//        return sample_description;
//    }
//
//    public void setSampleDescription(String sample_description) {
//        this.sample_description = sample_description;
//    }
//
//    public String getSampleName() {
//        return sample_name;
//    }
//
//    public void setSampleName(String sample_name) {
//        this.sample_name = sample_name;
//    }
//
//    public String getSampleAmount() {
//        return sample_amount;
//    }
//
//    public void setSampleAmount(String sample_amount) {
//        this.sample_amount = sample_amount;
//    }
//
//    public String getSampleLabelling() {
//        return sample_labelling;
//    }
//
//    public void setSampleLabelling(String sample_labelling) {
//        this.sample_labelling = sample_labelling;
//    }
//
//    public String getReplicatesAndGroups() {
//        return replicates_and_groups;
//    }
//
//    public void setReplicatesAndGroups(String replicates_and_groups) {
//        this.replicates_and_groups = replicates_and_groups;
//    }
//
//    public String getIsotopicCorrectionCoefficients() {
//        return isotopic_correction_coefficients;
//    }
//
//    public void setIsotopicCorrectionCoefficients(String isotopic_correction_coefficients) {
//        this.isotopic_correction_coefficients = isotopic_correction_coefficients;
//    }
//
//    public String getInternalReferences() {
//        return internal_references;
//    }
//
//    public void setInternalReferences(String internal_references) {
//        this.internal_references = internal_references;
//    }
//
//    public String getInputDataType() {
//        return input_data_type;
//    }
//
//    public void setInputDataType(String input_data_type) {
//        this.input_data_type = input_data_type;
//    }
//
//    public String getInputDataFormat() {
//        return input_data_format;
//    }
//
//    public void setInputDataFormat(String input_data_format) {
//        this.input_data_format = input_data_format;
//    }
//
//    public String getInputDataMerging() {
//        return input_data_merging;
//    }
//
//    public void setInputDataMerging(String input_data_merging) {
//        this.input_data_merging = input_data_merging;
//    }
//
////    public String getQuantifiedData() {
////        return quantified_data;
////    }
////
////    public void setQuantifiedData(String quantified_data) {
////        this.quantified_data = quantified_data;
////    }
//    public String getQuantificationSoftware() {
//        return quantification_software;
//    }
//
//    public void setQuantificationSoftware(String quantification_software) {
//        this.quantification_software = quantification_software;
//    }
//
//    public String getSelectionMethod() {
//        return selection_method;
//    }
//
//    public void setSelectionMethod(String selection_method) {
//        this.selection_method = selection_method;
//    }
//
//    public String getConfidenceFilter() {
//        return confidence_filter;
//    }
//
//    public void setConfidenceFilter(String confidence_filter) {
//        this.confidence_filter = confidence_filter;
//    }
//
//    public String getMissingValues() {
//        return missing_values;
//    }
//
//    public void setMissingValues(String missing_values) {
//        this.missing_values = missing_values;
//    }
//
//    public String getQuantificationValuesCalculation() {
//        return quantification_values_calculation;
//    }
//
//    public void setQuantificationValuesCalculation(String quantification_values_calculation) {
//        this.quantification_values_calculation = quantification_values_calculation;
//    }
//
//    public String getReplicate_aggregation() {
//        return replicate_aggregation;
//    }
//
//    public void setReplicate_aggregation(String replicate_aggregation) {
//        this.replicate_aggregation = replicate_aggregation;
//    }
//
//    public String getNormalization() {
//        return normalization;
//    }
//
//    public void setNormalization(String normalization) {
//        this.normalization = normalization;
//    }
//
//    public String getProtein_quantification_values_calculation() {
//        return protein_quantification_values_calculation;
//    }
//
//    public void setProtein_quantification_values_calculation(String protein_quantification_values_calculation) {
//        this.protein_quantification_values_calculation = protein_quantification_values_calculation;
//    }
//
//    public String getSpecific_corrections() {
//        return specific_corrections;
//    }
//
//    public void setSpecific_corrections(String specific_corrections) {
//        this.specific_corrections = specific_corrections;
//    }
//
//    public String getCorrectness_estimation_methods() {
//        return correctness_estimation_methods;
//    }
//
//    public void setCorrectness_estimation_methods(String correctness_estimation_methods) {
//        this.correctness_estimation_methods = correctness_estimation_methods;
//    }
//
//    public String getCurves_calibration() {
//        return curves_calibration;
//    }
//
//    public void setCurves_calibration(String curves_calibration) {
//        this.curves_calibration = curves_calibration;
//    }
//
//    public String getPrimary_extracted_quantification_values() {
//        return primary_extracted_quantification_values;
//    }
//
//    public void setPrimary_extracted_quantification_values(String primary_extracted_quantification_values) {
//        this.primary_extracted_quantification_values = primary_extracted_quantification_values;
//    }
//
//    public String getPrimary_extracted_quantification_files_location() {
//        return primary_extracted_quantification_files_location;
//    }
//
//    public void setPrimary_extracted_quantification_files_location(String primary_extracted_quantification_files_location) {
//        this.primary_extracted_quantification_files_location = primary_extracted_quantification_files_location;
//    }
//
//    public String getPeptide_quantification_values() {
//        return peptide_quantification_values;
//    }
//
//    public void setPeptide_quantification_values(String peptide_quantification_values) {
//        this.peptide_quantification_values = peptide_quantification_values;
//    }
//
//    public String getPeptide_quantification_files_location() {
//        return peptide_quantification_files_location;
//    }
//
//    public void setPeptide_quantification_files_location(String peptide_quantification_files_location) {
//        this.peptide_quantification_files_location = peptide_quantification_files_location;
//    }
//
//    public String getRaw_quantification_values() {
//        return raw_quantification_values;
//    }
//
//    public void setRaw_quantification_values(String raw_quantification_values) {
//        this.raw_quantification_values = raw_quantification_values;
//    }
//
//    public String getRaw_quantification_files_location() {
//        return raw_quantification_files_location;
//    }
//
//    public void setRaw_quantification_files_location(String raw_quantification_files_location) {
//        this.raw_quantification_files_location = raw_quantification_files_location;
//    }
//
//    public String getTransformed_quantification_values() {
//        return transformed_quantification_values;
//    }
//
//    public void setTransformed_quantification_values(String transformed_quantification_values) {
//        this.transformed_quantification_values = transformed_quantification_values;
//    }
//
//    public String getTransformed_quantification_files_location() {
//        return transformed_quantification_files_location;
//    }
//
//    public void setTransformed_quantification_files_location(String transformed_quantification_files_location) {
//        this.transformed_quantification_files_location = transformed_quantification_files_location;
//    }
//
//    public String getMsi_responsible_person() {
//        return msi_responsible_person;
//    }
//
//    public void setMsi_responsible_person(String msi_responsible_person) {
//        this.msi_responsible_person = msi_responsible_person;
//    }
//
//    public String getMsi_software() {
//        return msi_software;
//    }
//
//    public void setMsi_software(String msi_software) {
//        this.msi_software = msi_software;
//    }
//
//    public String getMsi_customizations() {
//        return msi_customizations;
//    }
//
//    public void setMsi_customizations(String msi_customizations) {
//        this.msi_customizations = msi_customizations;
//    }
//
//    public String getMsi_software_availability() {
//        return msi_software_availability;
//    }
//
//    public void setMsi_software_availability(String msi_software_availability) {
//        this.msi_software_availability = msi_software_availability;
//    }
//
//    public String getMsi_files_description() {
//        return msi_files_description;
//    }
//
//    public void setMsi_files_description(String msi_files_description) {
//        this.msi_files_description = msi_files_description;
//    }
//
//    public String getMsi_files_location() {
//        return msi_files_location;
//    }
//
//    public void setMsi_files_location(String msi_files_location) {
//        this.msi_files_location = msi_files_location;
//    }
//
//    public String getMsi_inputdata_description() {
//        return msi_inputdata_description;
//    }
//
//    public void setMsi_inputdata_description(String msi_inputdata_description) {
//        this.msi_inputdata_description = msi_inputdata_description;
//    }
//
//    public String getMsi_database_queried() {
//        return msi_database_queried;
//    }
//
//    public void setMsi_database_queried(String msi_database_queried) {
//        this.msi_database_queried = msi_database_queried;
//    }
//
//    public String getMsi_taxonomical_restrictions() {
//        return msi_taxonomical_restrictions;
//    }
//
//    public void setMsi_taxonomical_restrictions(String msi_taxonomical_restrictions) {
//        this.msi_taxonomical_restrictions = msi_taxonomical_restrictions;
//    }
//
//    public String getMsi_tool_description() {
//        return msi_tool_description;
//    }
//
//    public void setMsi_tool_description(String msi_tool_description) {
//        this.msi_tool_description = msi_tool_description;
//    }
//
//    public String getMsi_cleavage_agents() {
//        return msi_cleavage_agents;
//    }
//
//    public void setMsi_cleavage_agents(String msi_cleavage_agents) {
//        this.msi_cleavage_agents = msi_cleavage_agents;
//    }
//
//    public String getMsi_missed_cleavages() {
//        return msi_missed_cleavages;
//    }
//
//    public void setMsi_missed_cleavages(String msi_missed_cleavages) {
//        this.msi_missed_cleavages = msi_missed_cleavages;
//    }
//
//    public String getMsi_cleavage_additional_params() {
//        return msi_cleavage_additional_params;
//    }
//
//    public void setMsi_cleavage_additional_params(String msi_cleavage_additional_params) {
//        this.msi_cleavage_additional_params = msi_cleavage_additional_params;
//    }
//
//    public String getMsi_permissible_aminoacids_modifications() {
//        return msi_permissible_aminoacids_modifications;
//    }
//
//    public void setMsi_permissible_aminoacids_modifications(String msi_permissible_aminoacids_modifications) {
//        this.msi_permissible_aminoacids_modifications = msi_permissible_aminoacids_modifications;
//    }
//
//    public String getMsi_precursorion_tolerance() {
//        return msi_precursorion_tolerance;
//    }
//
//    public void setMsi_precursorion_tolerance(String msi_precursorion_tolerance) {
//        this.msi_precursorion_tolerance = msi_precursorion_tolerance;
//    }
//
//    public String getMsi_pmf_mass_tolerance() {
//        return msi_pmf_mass_tolerance;
//    }
//
//    public void setMsi_pmf_mass_tolerance(String msi_pmf_mass_tolerance) {
//        this.msi_pmf_mass_tolerance = msi_pmf_mass_tolerance;
//    }
//
//    public String getMsi_thresholds() {
//        return msi_thresholds;
//    }
//
//    public void setMsi_thresholds(String msi_thresholds) {
//        this.msi_thresholds = msi_thresholds;
//    }
//
//    public String getMsi_otherparams() {
//        return msi_otherparams;
//    }
//
//    public void setMsi_otherparams(String msi_otherparams) {
//        this.msi_otherparams = msi_otherparams;
//    }
//
//    public String getMsi_accession_code() {
//        return msi_accession_code;
//    }
//
//    public void setMsi_accession_code(String msi_accession_code) {
//        this.msi_accession_code = msi_accession_code;
//    }
//
//    public String getMsi_protein_description() {
//        return msi_protein_description;
//    }
//
//    public void setMsi_protein_description(String msi_protein_description) {
//        this.msi_protein_description = msi_protein_description;
//    }
//
//    public String getMsi_protein_scores() {
//        return msi_protein_scores;
//    }
//
//    public void setMsi_protein_scores(String msi_protein_scores) {
//        this.msi_protein_scores = msi_protein_scores;
//    }
//
//    public String getMsi_validation_status() {
//        return msi_validation_status;
//    }
//
//    public void setMsi_validation_status(String msi_validation_status) {
//        this.msi_validation_status = msi_validation_status;
//    }
//
//    public String getMsi_different_peptide_sequences() {
//        return msi_different_peptide_sequences;
//    }
//
//    public void setMsi_different_peptide_sequences(String msi_different_peptide_sequences) {
//        this.msi_different_peptide_sequences = msi_different_peptide_sequences;
//    }
//
//    public String getMsi_peptide_coverage() {
//        return msi_peptide_coverage;
//    }
//
//    public void setMsi_peptide_coverage(String msi_peptide_coverage) {
//        this.msi_peptide_coverage = msi_peptide_coverage;
//    }
//
//    public String getMsi_pmf_matched_peaks() {
//        return msi_pmf_matched_peaks;
//    }
//
//    public void setMsi_pmf_matched_peaks(String msi_pmf_matched_peaks) {
//        this.msi_pmf_matched_peaks = msi_pmf_matched_peaks;
//    }
//
//    public String getMsi_other_additional_info() {
//        return msi_other_additional_info;
//    }
//
//    public void setMsi_other_additional_info(String msi_other_additional_info) {
//        this.msi_other_additional_info = msi_other_additional_info;
//    }
//
//    public String getMsi_sequence() {
//        return msi_sequence;
//    }
//
//    public void setMsi_sequence(String msi_sequence) {
//        this.msi_sequence = msi_sequence;
//    }
//
//    public String getMsi_peptide_scores() {
//        return msi_peptide_scores;
//    }
//
//    public void setMsi_peptide_scores(String msi_peptide_scores) {
//        this.msi_peptide_scores = msi_peptide_scores;
//    }
//
//    public String getMsi_chemical_modifications() {
//        return msi_chemical_modifications;
//    }
//
//    public void setMsi_chemical_modifications(String msi_chemical_modifications) {
//        this.msi_chemical_modifications = msi_chemical_modifications;
//    }
//
//    public String getMsi_spectrum_locus() {
//        return msi_spectrum_locus;
//    }
//
//    public void setMsi_spectrum_locus(String msi_spectrum_locus) {
//        this.msi_spectrum_locus = msi_spectrum_locus;
//    }
//
//    public String getMsi_charge_assumed() {
//        return msi_charge_assumed;
//    }
//
//    public void setMsi_charge_assumed(String msi_charge_assumed) {
//        this.msi_charge_assumed = msi_charge_assumed;
//    }
//
//    public String getMsi_quantitation_approach() {
//        return msi_quantitation_approach;
//    }
//
//    public void setMsi_quantitation_approach(String msi_quantitation_approach) {
//        this.msi_quantitation_approach = msi_quantitation_approach;
//    }
//
//    public String getMsi_quantitation_measurement() {
//        return msi_quantitation_measurement;
//    }
//
//    public void setMsi_quantitation_measurement(String msi_quantitation_measurement) {
//        this.msi_quantitation_measurement = msi_quantitation_measurement;
//    }
//
//    public String getMsi_quantitation_normalisation() {
//        return msi_quantitation_normalisation;
//    }
//
//    public void setMsi_quantitation_normalisation(String msi_quantitation_normalisation) {
//        this.msi_quantitation_normalisation = msi_quantitation_normalisation;
//    }
//
//    public String getMsi_quantitation_replicates_number() {
//        return msi_quantitation_replicates_number;
//    }
//
//    public void setMsi_quantitation_replicates_number(String msi_quantitation_replicates_number) {
//        this.msi_quantitation_replicates_number = msi_quantitation_replicates_number;
//    }
//
//    public String getMsi_quantitation_acceptance() {
//        return msi_quantitation_acceptance;
//    }
//
//    public void setMsi_quantitation_acceptance(String msi_quantitation_acceptance) {
//        this.msi_quantitation_acceptance = msi_quantitation_acceptance;
//    }
//
//    public String getMsi_quantitation_error_analysis() {
//        return msi_quantitation_error_analysis;
//    }
//
//    public void setMsi_quantitation_error_analysis(String msi_quantitation_error_analysis) {
//        this.msi_quantitation_error_analysis = msi_quantitation_error_analysis;
//    }
//
//    public String getMsi_quantitation_control_results() {
//        return msi_quantitation_control_results;
//    }
//
//    public void setMsi_quantitation_control_results(String msi_quantitation_control_results) {
//        this.msi_quantitation_control_results = msi_quantitation_control_results;
//    }
//
//    public String getMsi_interpretation_assessment() {
//        return msi_interpretation_assessment;
//    }
//
//    public void setMsi_interpretation_assessment(String msi_interpretation_assessment) {
//        this.msi_interpretation_assessment = msi_interpretation_assessment;
//    }
//
//    public String getMsi_interpretation_results() {
//        return msi_interpretation_results;
//    }
//
//    public void setMsi_interpretation_results(String msi_interpretation_results) {
//        this.msi_interpretation_results = msi_interpretation_results;
//    }
//
//    public String getMsi_interpretation_inclusion() {
//        return msi_interpretation_inclusion;
//    }
//
//    public void setMsi_interpretation_inclusion(String msi_interpretation_inclusion) {
//        this.msi_interpretation_inclusion = msi_interpretation_inclusion;
//    }
//    
//    
//}
