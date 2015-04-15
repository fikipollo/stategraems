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
package bdManager.DAO.analysis.non_processed_data.intermediate_data;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DBConnectionManager;
import classes.analysis.QualityReport;
import classes.analysis.non_processed_data.intermediate_data.Extract_relevant_features_step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ExtractRelevantFeaturesStep_JDBCDAO extends IntermediateData_JDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);
        Extract_relevant_features_step extract_relevant_features_step = (Extract_relevant_features_step) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + " feature_type= ?, files_description = ?, reference_files = ? "
                + "WHERE step_id = ?");

        int i=1;
        ps.setString(i, extract_relevant_features_step.getFeatureType());i++;
        ps.setString(i, extract_relevant_features_step.getFilesDescription());i++;
        ps.setString(i, extract_relevant_features_step.getReferenceFiles());i++;
        ps.setString(i, extract_relevant_features_step.getStepID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        //CALL TO PARENTS UPDATE FUNCTION
        super.update(object);

        Extract_relevant_features_step extract_relevant_features_step = (Extract_relevant_features_step) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + "feature_type= ?, files_description = ?, reference_files = ? "
                + "WHERE step_id = ?");
        int i = 1;
        ps.setString(i, extract_relevant_features_step.getFilesDescription());i++;
        ps.setString(i, extract_relevant_features_step.getFeatureType());i++;
        ps.setString(i, extract_relevant_features_step.getReferenceFiles());i++;
        ps.setString(i, extract_relevant_features_step.getStepID());i++;
        ps.execute();

        return true;
    }
    //******************************************************************************************************************************************/
    //*** GETTERS          *********************************************************************************************************************/
    //******************************************************************************************************************************************/

    /**
     *
     * @param otherParams
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.* FROM intermediate_data as t1, analysis_has_steps as t3 "
                + "WHERE t3.analysis_id = ? "
                + "AND t1.step_id = t3.step_id "
                + "AND t1.intermediate_data_type = 'extract_relevant_features_step'");

        ps.setString(1, analysis_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> Extract_relevant_features_step_list = new ArrayList<Object>();
        Extract_relevant_features_step intermediate_data_instance = null;

        DAO quality_report_dao = DAOProvider.getDAOByName("QualityReport");
        while (rs.next()) {
            //SET THE INTERMEDIATE DATA FIELDS
            intermediate_data_instance = new Extract_relevant_features_step();
            intermediate_data_instance.setStepID(rs.getString("step_id"));

            //RETRIEVE THE INFORMATION HERITED FROM NON PROCESSED DATA
            Object[] params = {intermediate_data_instance};
            super.findByID(intermediate_data_instance.getStepID(), params);

            intermediate_data_instance.setSoftware(rs.getString("software"));
            intermediate_data_instance.setSoftwareVersion(rs.getString("software_version"));
            intermediate_data_instance.setSoftwareConfiguration(rs.getString("software_configuration"));
            intermediate_data_instance.setMotivation(rs.getString("motivation"));
            intermediate_data_instance.setResults(rs.getString("results"));

            //SET THE SPECIFIC DETAILS
            intermediate_data_instance.setFeatureType(rs.getString("feature_type"));
            intermediate_data_instance.setFilesDescription(rs.getString("files_description"));
            intermediate_data_instance.setReferenceFiles(rs.getString("reference_files"));

            //GET THE ASSOCIATED DATA
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT used_data_id FROM step_use_step "
                    + "WHERE step_id = ? ");

            ps.setString(1, intermediate_data_instance.getStepID());

            ResultSet rs1 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
            ArrayList<String> used_data_id_list = new ArrayList<String>();
            while (rs1.next()) {
                used_data_id_list.add(rs1.getString(1));
            }
            intermediate_data_instance.setUsedData(used_data_id_list.toArray(new String[used_data_id_list.size()]));

            //GET THE ASSOCIATED QUALITY REPORT
            QualityReport quality_report = (QualityReport) quality_report_dao.findByID(intermediate_data_instance.getStepID(), null);
            if (quality_report != null) {
                intermediate_data_instance.setAssociatedQualityReport(quality_report);
            }

            Extract_relevant_features_step_list.add(intermediate_data_instance);
        }

        return Extract_relevant_features_step_list;
    }
}
