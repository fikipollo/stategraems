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
import classes.analysis.processed_data.Data_matrix_step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Data_matrix_step_JDBCDAO extends ProcessedData_JDBCDAO {

    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);
        Data_matrix_step data_matrix_step = (Data_matrix_step) object;
        PreparedStatement ps;

        for (String unified_data_id : data_matrix_step.getUnified_data()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET "
                    + "step_id = ?, used_data_id = ?");
            ps.setString(1, data_matrix_step.getStepID());
            ps.setString(2, unified_data_id);
            ps.execute();
        }
        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);
        Data_matrix_step data_matrix_step = (Data_matrix_step) object;
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_use_step "
                + "WHERE step_id = ?");
        ps.setString(1, data_matrix_step.getStepID());
        ps.execute();

        for (String unified_data_id : data_matrix_step.getUnified_data()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET "
                    + "step_id = ?, used_data_id = ?");
            ps.setString(1, data_matrix_step.getStepID());
            ps.setString(2, unified_data_id);
            ps.execute();
        }
        return true;
    }

    //******************************************************************************************************************************************/
    //******************************************************************************************************************************************/
    //*** GETTERS                                        ***************************************************************************************/
    //******************************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public Data_matrix_step findByID(String step_id, Object[] otherParams) throws SQLException {
        Data_matrix_step step = new Data_matrix_step();
        Object[] params = {step};
        super.findByID(step_id, params);

        return step;
    }

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
                + "SELECT t1.*  FROM processed_data as t1, analysis_has_steps as t3 "
                + "WHERE t3.analysis_id = ? "
                + "AND t1.step_id = t3.step_id "
                + "AND t1.processed_data_type = 'data_matrix'");

        ps.setString(1, analysis_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> processedDataSteps = new ArrayList<Object>();
        Data_matrix_step processedDatainstance = null;

        while (rs.next()) {
            //SET THE INTERMEDIATE DATA FIELDS
            processedDatainstance = this.findByID(rs.getString("step_id"), otherParams);
            processedDataSteps.add(processedDatainstance);
        }

        return processedDataSteps;
    }
}