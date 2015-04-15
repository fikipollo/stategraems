/* ***************************************************************
 *  This file is part of STATegra EMS.
 *
 *  STATegra EMS is free software: you can redistribute it and/or 
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation, either version 3 of 
 *  the License, or (at your option) any later version.
 * 
 *  STATegra EMS is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  More info http://bioinfo.cipf.es/stategraems
 *  Technical contact stategraemsdev@gmail.com
 *  *************************************************************** */
package bdManager.DAO.analysis.processed_data;

import bdManager.DBConnectionManager;
import classes.analysis.processed_data.Proteomics_msquantification_step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Proteomics_msquantification_step_JDBCDAO extends ProcessedData_JDBCDAO {

    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);

        Proteomics_msquantification_step step = (Proteomics_msquantification_step) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO proteomics_msquantification SET "
                + "step_id = ?,  groups = ?, replicates = ?, labelling_protocol = ?, sample_description = ?, "
                + "sample_name = ?, sample_amount = ?, sample_labelling = ?, replicates_and_groups = ?, "
                + "isotopic_correction_coefficients = ?, internal_references = ?, input_data_type = ?, "
                + "input_data_format = ?, input_data_merging = ?, quantification_software = ?, "
                + "selection_method = ?, confidence_filter = ?, missing_values = ?, quantification_values_calculation = ?, "
                + "replicate_aggregation = ?, normalization = ?, protein_quantification_values_calculation = ?, "
                + "specific_corrections = ?, correctness_estimation_methods = ?, curves_calibration = ?, "
                + "primary_extracted_quantification_values = ?, primary_extracted_quantification_files_location = ?, "
                + "peptide_quantification_values = ?, peptide_quantification_files_location = ?, raw_quantification_values = ?, "
                + "raw_quantification_files_location = ?, transformed_quantification_values = ?, transformed_quantification_files_location = ?");

        int i = 1;
        ps.setString(i, step.getStepID());i++;
        ps.setString(i, step.getGroups());i++;
        ps.setString(i, step.getReplicates());i++;
        ps.setString(i, step.getLabelling_protocol());i++;
        ps.setString(i, step.getSampleDescription());i++;
        ps.setString(i, step.getSampleName());i++;
        ps.setString(i, step.getSampleAmount());i++;
        ps.setString(i, step.getSampleLabelling());i++;
        ps.setString(i, step.getReplicatesAndGroups());i++;
        ps.setString(i, step.getIsotopicCorrectionCoefficients());i++;
        ps.setString(i, step.getInternalReferences());i++;
        ps.setString(i, step.getInputDataType());i++;
        ps.setString(i, step.getInputDataFormat());i++;
        ps.setString(i, step.getInputDataMerging());i++;
        ps.setString(i, step.getQuantificationSoftware());i++;
        ps.setString(i, step.getSelectionMethod());i++;
        ps.setString(i, step.getConfidenceFilter());i++;
        ps.setString(i, step.getMissingValues());i++;
        ps.setString(i, step.getQuantificationValuesCalculation());i++;
        ps.setString(i, step.getReplicate_aggregation());i++;
        ps.setString(i, step.getNormalization());i++;
        ps.setString(i, step.getProtein_quantification_values_calculation());i++;
        ps.setString(i, step.getSpecific_corrections());i++;
        ps.setString(i, step.getCorrectness_estimation_methods());i++;
        ps.setString(i, step.getCurves_calibration());i++;
        ps.setString(i, step.getPrimary_extracted_quantification_values());i++;
        ps.setString(i, step.getPrimary_extracted_quantification_files_location());i++;
        ps.setString(i, step.getPeptide_quantification_values());i++;
        ps.setString(i, step.getPeptide_quantification_files_location());i++;
        ps.setString(i, step.getRaw_quantification_values());i++;
        ps.setString(i, step.getRaw_quantification_files_location());i++;
        ps.setString(i, step.getTransformed_quantification_values());i++;
        ps.setString(i, step.getTransformed_quantification_files_location());i++;
        
        //1.   Inserts a new entry in the calling_step table
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO proteomics_msinformatics SET "
                + "step_id = ?, msi_responsible_person = ?, msi_software = ?, msi_customizations = ?, msi_software_availability = ?, "
                + "msi_files_description = ?, msi_files_location = ?, msi_inputdata_description = ?, msi_database_queried = ?, "
                + "msi_taxonomical_restrictions = ?, msi_tool_description = ?, msi_cleavage_agents = ?, msi_missed_cleavages = ?, "
                + "msi_cleavage_additional_params = ?, msi_permissible_aminoacids_modifications = ?, msi_precursorion_tolerance = ?, "
                + "msi_pmf_mass_tolerance = ?, msi_thresholds = ?, msi_otherparams = ?, msi_accession_code = ?, "
                + "msi_protein_description = ?, msi_protein_scores = ?, msi_validation_status = ?, msi_different_peptide_sequences = ?, "
                + "msi_peptide_coverage = ?, msi_pmf_matched_peaks = ?, msi_other_additional_info = ?, msi_sequence = ?, "
                + "msi_peptide_scores = ?, msi_chemical_modifications = ?, msi_spectrum_locus = ?, msi_charge_assumed = ?, "
                + "msi_quantitation_approach = ?, msi_quantitation_measurement = ?, msi_quantitation_normalisation = ?, "
                + "msi_quantitation_replicates_number = ?, msi_quantitation_acceptance = ?, msi_quantitation_error_analysis = ?, "
                + "msi_quantitation_control_results = ?, msi_interpretation_assessment = ?, msi_interpretation_results = ?, "
                + "msi_interpretation_inclusion = ?");

        i = 1;
        ps.setString(i, step.getStepID());i++;
        ps.setString(i, step.getMsi_responsible_person());i++;
        ps.setString(i, step.getMsi_software());i++;
        ps.setString(i, step.getMsi_customizations());i++;
        ps.setString(i, step.getMsi_software_availability());i++;
        ps.setString(i, step.getMsi_files_description());i++;
        ps.setString(i, step.getMsi_files_location());i++;
        ps.setString(i, step.getMsi_inputdata_description());i++;
        ps.setString(i, step.getMsi_database_queried());i++;
        ps.setString(i, step.getMsi_taxonomical_restrictions());i++;
        ps.setString(i, step.getMsi_tool_description());i++;
        ps.setString(i, step.getMsi_cleavage_agents());i++;
        ps.setString(i, step.getMsi_missed_cleavages());i++;
        ps.setString(i, step.getMsi_cleavage_additional_params());i++;
        ps.setString(i, step.getMsi_permissible_aminoacids_modifications());i++;
        ps.setString(i, step.getMsi_precursorion_tolerance());i++;
        ps.setString(i, step.getMsi_pmf_mass_tolerance());i++;
        ps.setString(i, step.getMsi_thresholds());i++;
        ps.setString(i, step.getMsi_otherparams());i++;
        ps.setString(i, step.getMsi_accession_code());i++;
        ps.setString(i, step.getMsi_protein_description());i++;
        ps.setString(i, step.getMsi_protein_scores());i++;
        ps.setString(i, step.getMsi_validation_status());i++;
        ps.setString(i, step.getMsi_different_peptide_sequences());i++;
        ps.setString(i, step.getMsi_peptide_coverage());i++;
        ps.setString(i, step.getMsi_pmf_matched_peaks());i++;
        ps.setString(i, step.getMsi_other_additional_info());i++;
        ps.setString(i, step.getMsi_sequence());i++;
        ps.setString(i, step.getMsi_peptide_scores());i++;
        ps.setString(i, step.getMsi_chemical_modifications());i++;
        ps.setString(i, step.getMsi_spectrum_locus());i++;
        ps.setString(i, step.getMsi_charge_assumed());i++;
        ps.setString(i, step.getMsi_quantitation_approach());i++;
        ps.setString(i, step.getMsi_quantitation_measurement());i++;
        ps.setString(i, step.getMsi_quantitation_normalisation());i++;
        ps.setString(i, step.getMsi_quantitation_replicates_number());i++;
        ps.setString(i, step.getMsi_quantitation_acceptance());i++;
        ps.setString(i, step.getMsi_quantitation_error_analysis());i++;
        ps.setString(i, step.getMsi_quantitation_control_results());i++;
        ps.setString(i, step.getMsi_interpretation_assessment());i++;
        ps.setString(i, step.getMsi_interpretation_results());i++;
        ps.setString(i, step.getMsi_interpretation_inclusion());i++;
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);
        Proteomics_msquantification_step step = (Proteomics_msquantification_step) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE proteomics_msquantification SET "
                + "groups = ?, replicates = ?, labelling_protocol = ?, sample_description = ?, "
                + "sample_name = ?, sample_amount = ?, sample_labelling = ?, replicates_and_groups = ?, "
                + "isotopic_correction_coefficients = ?, internal_references = ?, input_data_type = ?, "
                + "input_data_format = ?, input_data_merging = ?, quantification_software = ?, "
                + "selection_method = ?, confidence_filter = ?, missing_values = ?, quantification_values_calculation = ?, "
                + "replicate_aggregation = ?, normalization = ?, protein_quantification_values_calculation = ?, "
                + "specific_corrections = ?, correctness_estimation_methods = ?, curves_calibration = ?, "
                + "primary_extracted_quantification_values = ?, primary_extracted_quantification_files_location = ?, "
                + "peptide_quantification_values = ?, peptide_quantification_files_location = ?, raw_quantification_values = ?, "
                + "raw_quantification_files_location = ?, transformed_quantification_values = ?, transformed_quantification_files_location = ? "
                + "WHERE step_id = ?");

        int i = 1;
        ps.setString(i, step.getGroups());i++;
        ps.setString(i, step.getReplicates());i++;
        ps.setString(i, step.getLabelling_protocol());i++;
        ps.setString(i, step.getSampleDescription());i++;
        ps.setString(i, step.getSampleName());i++;
        ps.setString(i, step.getSampleAmount());i++;
        ps.setString(i, step.getSampleLabelling());i++;
        ps.setString(i, step.getReplicatesAndGroups());i++;
        ps.setString(i, step.getIsotopicCorrectionCoefficients());i++;
        ps.setString(i, step.getInternalReferences());i++;
        ps.setString(i, step.getInputDataType());i++;
        ps.setString(i, step.getInputDataFormat());i++;
        ps.setString(i, step.getInputDataMerging());i++;
        ps.setString(i, step.getQuantificationSoftware());i++;
        ps.setString(i, step.getSelectionMethod());i++;
        ps.setString(i, step.getConfidenceFilter());i++;
        ps.setString(i, step.getMissingValues());i++;
        ps.setString(i, step.getQuantificationValuesCalculation());i++;
        ps.setString(i, step.getReplicate_aggregation());i++;
        ps.setString(i, step.getNormalization());i++;
        ps.setString(i, step.getProtein_quantification_values_calculation());i++;
        ps.setString(i, step.getSpecific_corrections());i++;
        ps.setString(i, step.getCorrectness_estimation_methods());i++;
        ps.setString(i, step.getCurves_calibration());i++;
        ps.setString(i, step.getPrimary_extracted_quantification_values());i++;
        ps.setString(i, step.getPrimary_extracted_quantification_files_location());i++;
        ps.setString(i, step.getPeptide_quantification_values());i++;
        ps.setString(i, step.getPeptide_quantification_files_location());i++;
        ps.setString(i, step.getRaw_quantification_values());i++;
        ps.setString(i, step.getRaw_quantification_files_location());i++;
        ps.setString(i, step.getTransformed_quantification_values());i++;
        ps.setString(i, step.getTransformed_quantification_files_location());i++;
        
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE proteomics_msinformatics SET "
                + "msi_responsible_person = ?, msi_software = ?, msi_customizations = ?, msi_software_availability = ?, "
                + "msi_files_description = ?, msi_files_location = ?, msi_inputdata_description = ?, msi_database_queried = ?, "
                + "msi_taxonomical_restrictions = ?, msi_tool_description = ?, msi_cleavage_agents = ?, msi_missed_cleavages = ?, "
                + "msi_cleavage_additional_params = ?, msi_permissible_aminoacids_modifications = ?, msi_precursorion_tolerance = ?, "
                + "msi_pmf_mass_tolerance = ?, msi_thresholds = ?, msi_otherparams = ?, msi_accession_code = ?, "
                + "msi_protein_description = ?, msi_protein_scores = ?, msi_validation_status = ?, msi_different_peptide_sequences = ?, "
                + "msi_peptide_coverage = ?, msi_pmf_matched_peaks = ?, msi_other_additional_info = ?, msi_sequence = ?, "
                + "msi_peptide_scores = ?, msi_chemical_modifications = ?, msi_spectrum_locus = ?, msi_charge_assumed = ?, "
                + "msi_quantitation_approach = ?, msi_quantitation_measurement = ?, msi_quantitation_normalisation = ?, "
                + "msi_quantitation_replicates_number = ?, msi_quantitation_acceptance = ?, msi_quantitation_error_analysis = ?, "
                + "msi_quantitation_control_results = ?, msi_interpretation_assessment = ?, msi_interpretation_results = ?, "
                + "msi_interpretation_inclusion = ? "
                + "WHERE step_id = ?");
        i = 1;      
        ps.setString(i, step.getMsi_responsible_person());i++;
        ps.setString(i, step.getMsi_software());i++;
        ps.setString(i, step.getMsi_customizations());i++;
        ps.setString(i, step.getMsi_software_availability());i++;
        ps.setString(i, step.getMsi_files_description());i++;
        ps.setString(i, step.getMsi_files_location());i++;
        ps.setString(i, step.getMsi_inputdata_description());i++;
        ps.setString(i, step.getMsi_database_queried());i++;
        ps.setString(i, step.getMsi_taxonomical_restrictions());i++;
        ps.setString(i, step.getMsi_tool_description());i++;
        ps.setString(i, step.getMsi_cleavage_agents());i++;
        ps.setString(i, step.getMsi_missed_cleavages());i++;
        ps.setString(i, step.getMsi_cleavage_additional_params());i++;
        ps.setString(i, step.getMsi_permissible_aminoacids_modifications());i++;
        ps.setString(i, step.getMsi_precursorion_tolerance());i++;
        ps.setString(i, step.getMsi_pmf_mass_tolerance());i++;
        ps.setString(i, step.getMsi_thresholds());i++;
        ps.setString(i, step.getMsi_otherparams());i++;
        ps.setString(i, step.getMsi_accession_code());i++;
        ps.setString(i, step.getMsi_protein_description());i++;
        ps.setString(i, step.getMsi_protein_scores());i++;
        ps.setString(i, step.getMsi_validation_status());i++;
        ps.setString(i, step.getMsi_different_peptide_sequences());i++;
        ps.setString(i, step.getMsi_peptide_coverage());i++;
        ps.setString(i, step.getMsi_pmf_matched_peaks());i++;
        ps.setString(i, step.getMsi_other_additional_info());i++;
        ps.setString(i, step.getMsi_sequence());i++;
        ps.setString(i, step.getMsi_peptide_scores());i++;
        ps.setString(i, step.getMsi_chemical_modifications());i++;
        ps.setString(i, step.getMsi_spectrum_locus());i++;
        ps.setString(i, step.getMsi_charge_assumed());i++;
        ps.setString(i, step.getMsi_quantitation_approach());i++;
        ps.setString(i, step.getMsi_quantitation_measurement());i++;
        ps.setString(i, step.getMsi_quantitation_normalisation());i++;
        ps.setString(i, step.getMsi_quantitation_replicates_number());i++;
        ps.setString(i, step.getMsi_quantitation_acceptance());i++;
        ps.setString(i, step.getMsi_quantitation_error_analysis());i++;
        ps.setString(i, step.getMsi_quantitation_control_results());i++;
        ps.setString(i, step.getMsi_interpretation_assessment());i++;
        ps.setString(i, step.getMsi_interpretation_results());i++;
        ps.setString(i, step.getMsi_interpretation_inclusion());i++;
        ps.setString(i, step.getStepID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //***
    //*** GETTERS                                        ***************************************************************************************/
    //***
    //******************************************************************************************************************************************/
    @Override
    public Proteomics_msquantification_step findByID(String step_id, Object[] otherParams) throws SQLException {
        Proteomics_msquantification_step step = new Proteomics_msquantification_step();

        Object[] params = {step};
        super.findByID(step_id, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.*, t2.* FROM proteomics_msquantification AS t1, proteomics_msinformatics AS t2 "
                + "WHERE t1.step_id = ? AND t1.step_id = t2.step_id");

        ps.setString(1, step_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            step.setGroups(rs.getString("groups"));
            step.setReplicates(rs.getString("replicates"));
            step.setLabelling_protocol(rs.getString("labelling_protocol"));
            step.setSampleDescription(rs.getString("sample_description"));
            step.setSampleName(rs.getString("sample_name"));
            step.setSampleAmount(rs.getString("sample_amount"));
            step.setSampleLabelling(rs.getString("sample_labelling"));
            step.setReplicatesAndGroups(rs.getString("replicates_and_groups"));
            step.setIsotopicCorrectionCoefficients(rs.getString("isotopic_correction_coefficients"));
            step.setInternalReferences(rs.getString("internal_references"));
            step.setInputDataType(rs.getString("input_data_type"));
            step.setInputDataFormat(rs.getString("input_data_format"));
            step.setInputDataMerging(rs.getString("input_data_merging"));
            step.setQuantificationSoftware(rs.getString("quantification_software"));
            step.setSelectionMethod(rs.getString("selection_method"));
            step.setConfidenceFilter(rs.getString("confidence_filter"));
            step.setMissingValues(rs.getString("missing_values"));
            step.setQuantificationValuesCalculation(rs.getString("quantification_values_calculation"));
            step.setReplicate_aggregation(rs.getString("replicate_aggregation"));
            step.setNormalization(rs.getString("normalization"));
            step.setProtein_quantification_values_calculation(rs.getString("protein_quantification_values_calculation"));
            step.setSpecific_corrections(rs.getString("specific_corrections"));
            step.setCorrectness_estimation_methods(rs.getString("correctness_estimation_methods"));
            step.setCurves_calibration(rs.getString("curves_calibration"));
            step.setPrimary_extracted_quantification_values(rs.getString("primary_extracted_quantification_values"));
            step.setPrimary_extracted_quantification_files_location(rs.getString("primary_extracted_quantification_files_location"));
            step.setPeptide_quantification_values(rs.getString("peptide_quantification_values"));
            step.setPeptide_quantification_files_location(rs.getString("peptide_quantification_files_location"));
            step.setRaw_quantification_values(rs.getString("raw_quantification_values"));
            step.setRaw_quantification_files_location(rs.getString("raw_quantification_files_location"));
            step.setTransformed_quantification_values(rs.getString("transformed_quantification_values"));
            step.setTransformed_quantification_files_location(rs.getString("transformed_quantification_files_location"));
            step.setMsi_responsible_person(rs.getString("msi_responsible_person"));
            step.setMsi_software(rs.getString("msi_software"));
            step.setMsi_customizations(rs.getString("msi_customizations"));
            step.setMsi_software_availability(rs.getString("msi_software_availability"));
            step.setMsi_files_description(rs.getString("msi_files_description"));
            step.setMsi_files_location(rs.getString("msi_files_location"));
            step.setMsi_inputdata_description(rs.getString("msi_inputdata_description"));
            step.setMsi_database_queried(rs.getString("msi_database_queried"));
            step.setMsi_taxonomical_restrictions(rs.getString("msi_taxonomical_restrictions"));
            step.setMsi_tool_description(rs.getString("msi_tool_description"));
            step.setMsi_cleavage_agents(rs.getString("msi_cleavage_agents"));
            step.setMsi_missed_cleavages(rs.getString("msi_missed_cleavages"));
            step.setMsi_cleavage_additional_params(rs.getString("msi_cleavage_additional_params"));
            step.setMsi_permissible_aminoacids_modifications(rs.getString("msi_permissible_aminoacids_modifications"));
            step.setMsi_precursorion_tolerance(rs.getString("msi_precursorion_tolerance"));
            step.setMsi_pmf_mass_tolerance(rs.getString("msi_pmf_mass_tolerance"));
            step.setMsi_thresholds(rs.getString("msi_thresholds"));
            step.setMsi_otherparams(rs.getString("msi_otherparams"));
            step.setMsi_accession_code(rs.getString("msi_accession_code"));
            step.setMsi_protein_description(rs.getString("msi_protein_description"));
            step.setMsi_protein_scores(rs.getString("msi_protein_scores"));
            step.setMsi_validation_status(rs.getString("msi_validation_status"));
            step.setMsi_different_peptide_sequences(rs.getString("msi_different_peptide_sequences"));
            step.setMsi_peptide_coverage(rs.getString("msi_peptide_coverage"));
            step.setMsi_pmf_matched_peaks(rs.getString("msi_pmf_matched_peaks"));
            step.setMsi_other_additional_info(rs.getString("msi_other_additional_info"));
            step.setMsi_sequence(rs.getString("msi_sequence"));
            step.setMsi_peptide_scores(rs.getString("msi_peptide_scores"));
            step.setMsi_chemical_modifications(rs.getString("msi_chemical_modifications"));
            step.setMsi_spectrum_locus(rs.getString("msi_spectrum_locus"));
            step.setMsi_charge_assumed(rs.getString("msi_charge_assumed"));
            step.setMsi_quantitation_approach(rs.getString("msi_quantitation_approach"));
            step.setMsi_quantitation_measurement(rs.getString("msi_quantitation_measurement"));
            step.setMsi_quantitation_normalisation(rs.getString("msi_quantitation_normalisation"));
            step.setMsi_quantitation_replicates_number(rs.getString("msi_quantitation_replicates_number"));
            step.setMsi_quantitation_acceptance(rs.getString("msi_quantitation_acceptance"));
            step.setMsi_quantitation_error_analysis(rs.getString("msi_quantitation_error_analysis"));
            step.setMsi_quantitation_control_results(rs.getString("msi_quantitation_control_results"));
            step.setMsi_interpretation_assessment(rs.getString("msi_interpretation_assessment"));
            step.setMsi_interpretation_results(rs.getString("msi_interpretation_results"));
            step.setMsi_interpretation_inclusion(rs.getString("msi_interpretation_inclusion"));
        }
        return step;
    }
}
