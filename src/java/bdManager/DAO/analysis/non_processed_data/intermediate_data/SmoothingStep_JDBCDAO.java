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
import classes.analysis.non_processed_data.intermediate_data.Smoothing_step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class SmoothingStep_JDBCDAO extends IntermediateData_JDBCDAO {

    //******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        //FIRST CALL TO PARENT FUNCTIONS
        super.insert(object);

        Smoothing_step smoothing_step = (Smoothing_step) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + " sliding_window_length = ?, steps_length = ? "
                + "WHERE step_id = ?");
        int i = 1;
        ps.setInt(i, smoothing_step.getSlidingWindowLength());i++;
        ps.setInt(i, smoothing_step.getStepLength());i++;
        ps.setString(i, smoothing_step.getStepID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        //FIRST CALL TO PARENT FUNCTIONS
        super.update(object);

        Smoothing_step smoothing_step = (Smoothing_step) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + "sliding_window_length = ?, steps_length = ? "
                + "WHERE step_id = ?");

        ps.setInt(1, smoothing_step.getSlidingWindowLength());
        ps.setInt(2, smoothing_step.getStepLength());
        ps.setString(3, smoothing_step.getStepID());
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
                + "AND t1.intermediate_data_type = 'smoothing_step'");

        ps.setString(1, analysis_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> smoothing_step_list = new ArrayList<Object>();
        Smoothing_step intermediate_data_instance = null;

        DAO quality_report_dao = DAOProvider.getDAOByName("QualityReport");
        while (rs.next()) {
            //SET THE INTERMEDIATE DATA FIELDS
            intermediate_data_instance = new Smoothing_step();
            intermediate_data_instance.setStepID(rs.getString("step_id"));

            //RETRIEVE THE INFORMATION HERITED FROM NON PROCESSED DATA
            Object[] params = {intermediate_data_instance};
            //FIRST CALL TO PARENT FUNCTIONS
            super.findByID(intermediate_data_instance.getStepID(), params);

            intermediate_data_instance.setSoftware(rs.getString("software"));
            intermediate_data_instance.setSoftwareVersion(rs.getString("software_version"));
            intermediate_data_instance.setSoftwareConfiguration(rs.getString("software_configuration"));
            intermediate_data_instance.setMotivation(rs.getString("motivation"));
            intermediate_data_instance.setResults(rs.getString("results"));

            //SET THE SPECIFIC DETAILS
            intermediate_data_instance.setSliding_window_length(rs.getInt("sliding_window_length"));
            intermediate_data_instance.setStep_length(rs.getInt("steps_length"));

            //GET THE ASSOCIATED DATA
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT used_data_id FROM step_use_step "
                    + "WHERE step_id = ? ");

            ps.setString(1, intermediate_data_instance.getStepID());

            ResultSet rs1 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);;
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

            smoothing_step_list.add(intermediate_data_instance);
        }

        return smoothing_step_list;

    }
}
