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
package bdManager.DAO.analysis;

import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.ExternalData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ExternalData_JDBCDAO extends Step_JDBCDAO {

    //******************************************************************************************************************************************/
    //*** GETTERS    ***************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param otherParams
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        //STEP 1. GET THE LIST OF ALL THE INTERMEDIATE STEPS ASSOCIATED TO GIVEN ANALYSIS;
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.step_id FROM step as t1, analysis_has_steps as t3 "
                + "WHERE t3.analysis_id = ? "
                + "AND t1.step_id = t3.step_id "
                + "AND t1.type = 'external_source'");
        ps.setString(1, analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        //FOR EACH STEP
        ArrayList<Object> steps = new ArrayList<Object>();
        ExternalData step = null;
        while (rs.next()) {
            //STEP 2. GET THE DETAILS FOR THE STEP FROM DATABASE
            step = new ExternalData();
            step.setStepID(rs.getString("step_id"));
            Object[] params = {step};
            super.findByID(step.getStepID(), params); //FIRST CALL TO PARENT FUNCTIONS

            //STEP 5. ADD THE NEW STEP TO THE LIST
            steps.add(step);
        }

        //STEP 6. RETURN THE LIST OF STEPS
        return steps;
    }
}
