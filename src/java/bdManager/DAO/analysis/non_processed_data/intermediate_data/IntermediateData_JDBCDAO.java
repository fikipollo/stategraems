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

import bdManager.DAO.DAOProvider;
import bdManager.DAO.analysis.Step_JDBCDAO;
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
        IntermediateData intermediate_data = (IntermediateData) object;

        //FIRST CALL TO PARENT INSERT FUNCTION
        super.insert(intermediate_data);

        //1. Inserts a new entry in the intermediate_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO intermediate_data SET "
                + " step_id = ?, intermediate_data_type = ?, software = ?, software_version = ?, "
                + " software_configuration= ?, motivation = ?, results = ? ");

        ps.setString(1, intermediate_data.getStepID());
        ps.setString(2, intermediate_data.getIntermediateDataType());
        ps.setString(3, intermediate_data.getSoftware());
        ps.setString(4, intermediate_data.getSoftwareVersion());
        ps.setString(5, intermediate_data.getSoftwareConfiguration());
        ps.setString(6, intermediate_data.getMotivation());
        ps.setString(7, intermediate_data.getResults());
        ps.execute();

        //1.   Inserts a new entry in the calling_step table
        for (String used_data_step_id : intermediate_data.getUsedData()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET "
                    + "step_id = ?, used_data_id = ?");

            ps.setString(1, intermediate_data.getStepID());
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
        IntermediateData intermediate_data = (IntermediateData) object;

        //FIRST CALL TO PARENT update FUNCTION
        super.update(intermediate_data);

        //1. Inserts a new entry in the intermediate_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE intermediate_data SET "
                + " intermediate_data_type = ?, software = ?, software_version = ?, "
                + " software_configuration= ?, motivation = ?, results = ? "
                + "WHERE step_id = ?");

        ps.setString(1, intermediate_data.getIntermediateDataType());
        ps.setString(2, intermediate_data.getSoftware());
        ps.setString(3, intermediate_data.getSoftwareVersion());
        ps.setString(4, intermediate_data.getSoftwareConfiguration());
        ps.setString(5, intermediate_data.getMotivation());
        ps.setString(6, intermediate_data.getResults());
        ps.setString(7, intermediate_data.getStepID());
        ps.execute();

        //1.   REMOVE THE PREVIOUS ENTRIES
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_use_step WHERE "
                + "step_id = ?");

        ps.setString(1, intermediate_data.getStepID());
        ps.execute();

        //2.   Inserts a new entries
        for (String used_data_step_id : intermediate_data.getUsedData()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET "
                    + "step_id = ?, used_data_id = ?");

            ps.setString(1, intermediate_data.getStepID());
            ps.setString(2, used_data_step_id);
            ps.execute();
        }

        //3.Due to the step could be used in more than 1 analysis, we have to include the new used files
        //in all analysis 
        //TODO: If a previous step A was used by the step B when the step B was imported, the step A was imported too.
        //However if after update step A is no longer used by B, the step A will not be desassoated and from the others analysis
        //in spite of the association could not have sense.

        //First get all analysis that use the step
        String owner_analysis_id = "AN" + intermediate_data.getStepID().substring(2).split("\\.")[0];

        //FIRST CHECK IF THERE IS MORE THAN ONE ANALYSIS USING THIS STEP
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT analysis_id FROM analysis_has_steps WHERE step_id = ? AND analysis_id != ?");
        ps.setString(1, intermediate_data.getStepID());
        ps.setString(2, owner_analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        //IF SO
        while (rs.next()) {
            insertNewStepAssociation(intermediate_data.getUsedData(), rs.getString("analysis_id"));
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS    ***************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param otherParams and array with the analysis id
     * @return
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String[] subtypes = new String[]{
            "Preprocessing_step", "Mapping_step", "Union_step",
            "Smoothing_step", "Extract_relevant_features"
        };

        ArrayList<Object> intermediate_data_list = new ArrayList<Object>();

        for (String subType : subtypes) {
            intermediate_data_list.addAll(DAOProvider.getDAOByName(subType).findAll(otherParams));
        }

        return intermediate_data_list;
    }
}
