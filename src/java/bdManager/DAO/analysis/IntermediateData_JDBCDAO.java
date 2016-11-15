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
import classes.analysis.non_processed_data.IntermediateData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class IntermediateData_JDBCDAO extends Step_JDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        IntermediateData step = (IntermediateData) object;

        //FIRST CALL TO PARENT INSERT FUNCTION
        super.insert(step);

        //1. Inserts a new entry in the intermediate_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO intermediate_data SET "
                + " step_id = ?, intermediate_data_type = ?, software = ?, software_version = ?, "
                + " software_configuration= ?, motivation = ?, results = ? ");

        ps.setString(1, step.getStepID());
        ps.setString(2, step.getIntermediateDataType());
        ps.setString(3, step.getSoftware());
        ps.setString(4, step.getSoftwareVersion());
        ps.setString(5, step.getSoftwareConfiguration());
        ps.setString(6, step.getMotivation());
        ps.setString(7, step.getResults());
        ps.execute();

        //2. Register the used data files for the step
        for (String used_data_step_id : step.getUsedData()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET "
                    + "step_id = ?, used_data_id = ?, type='input'");

            ps.setString(1, step.getStepID());
            ps.setString(2, used_data_step_id);
            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        IntermediateData step = (IntermediateData) object;

        //FIRST CALL TO PARENT update FUNCTION
        super.update(step);

        //1. Inserts a new entry in the intermediate_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + " intermediate_data_type = ?, software = ?, software_version = ?, "
                + " software_configuration= ?, motivation = ?, results = ? "
                + "WHERE step_id = ?");

        ps.setString(1, step.getIntermediateDataType());
        ps.setString(2, step.getSoftware());
        ps.setString(3, step.getSoftwareVersion());
        ps.setString(4, step.getSoftwareConfiguration());
        ps.setString(5, step.getMotivation());
        ps.setString(6, step.getResults());
        ps.setString(7, step.getStepID());
        ps.execute();

        //2.   REMOVE THE PREVIOUS ENTRIES
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_use_step WHERE step_id = ?");
        ps.setString(1, step.getStepID());
        ps.execute();

        //3a.   Inserts a new entries
        for (String used_data_step_id : step.getUsedData()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET step_id = ?, used_data_id = ?, type='input'");
            ps.setString(1, step.getStepID());
            ps.setString(2, used_data_step_id);
            ps.execute();
        }

        //3.Due to the step could be used in more than 1 analysis, we have to include the new used files
        //in all analysis 
        //TODO: If a previous step A was used by the step B when the step B was imported, the step A was imported too.
        //However if after update step A is no longer used by B, the step A will not be desassoated and from the others analysis
        //in spite of the association could not have sense.
        //First get all analysis that use the step
        String owner_analysis_id = "AN" + step.getStepID().substring(2).split("\\.")[0];

        //FIRST CHECK IF THERE IS MORE THAN ONE ANALYSIS USING THIS STEP
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT analysis_id FROM analysis_has_steps WHERE step_id = ? AND analysis_id != ?");
        ps.setString(1, step.getStepID());
        ps.setString(2, owner_analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        //IF SO
        while (rs.next()) {
            insertNewStepAssociation(step.getUsedData(), rs.getString("analysis_id"));
        }

        return true;
    }

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
                + "SELECT t1.*  FROM intermediate_data as t1, analysis_has_steps as t3 "
                + "WHERE t3.analysis_id = ? "
                + "AND t1.step_id = t3.step_id");
        ps.setString(1, analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        //FOR EACH STEP
        ArrayList<Object> steps = new ArrayList<Object>();
        IntermediateData step = null;
        while (rs.next()) {
            //STEP 2. GET THE DETAILS FOR THE STEP FROM DATABASE
            step = new IntermediateData();
            step.setStepID(rs.getString("step_id"));
            Object[] params = {step};
            super.findByID(step.getStepID(), params); //FIRST CALL TO PARENT FUNCTIONS
            
            //STEP 3. FILL THE SPECIFIC DETAILS FOR THE INTERMEDIATE STEP
            step.setIntermediateDataType(rs.getString("intermediate_data_type"));
            step.setSoftware(rs.getString("software"));
            step.setSoftwareVersion(rs.getString("software_version"));
            step.setSoftwareConfiguration(rs.getString("software_configuration"));
            step.setMotivation(rs.getString("motivation"));
            step.setResults(rs.getString("results"));
            
            //STEP 4. GET THE INPUT FILES FOR THE STEP
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT used_data_id FROM step_use_step WHERE step_id = ? and type='input'");
            ps.setString(1, step.getStepID());
            ResultSet rs1 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
            
            ArrayList<String> used_data_id_list = new ArrayList<String>();
            while (rs1.next()) {
                used_data_id_list.add(rs1.getString(1));
            }
            step.setUsedData(used_data_id_list.toArray(new String[used_data_id_list.size()]));

            //STEP 5. ADD THE NEW STEP TO THE LIST
            steps.add(step);
        }
        
        //STEP 6. RETURN THE LIST OF STEPS
        return steps;
    }
}
