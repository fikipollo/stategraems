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

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DAO.analysis.Step_JDBCDAO;
import bdManager.DBConnectionManager;
import classes.analysis.ProcessedData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ProcessedData_JDBCDAO extends Step_JDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws java.sql.SQLException
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        ProcessedData processedData = (ProcessedData) object;

        //FIRST CALL TO PARENT INSERT FUNCTION
        super.insert(processedData);

        //1.   Inserts a new entry in the ProcessedData table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO processed_data SET "
                + "step_id = ?, processed_data_type = ?, software = ?, software_version = ?,"
                + "software_configuration = ?, results = ?");

        ps.setString(1, processedData.getStepID());
        ps.setString(2, processedData.getProcessedDataType());
        ps.setString(3, processedData.getSoftware());
        ps.setString(4, processedData.getSoftwareVersion());
        ps.setString(5, processedData.getSoftwareConfiguration());
        ps.setString(6, processedData.getResults());
        ps.execute();

        //1.   Inserts a new entry in the calling_step table
        if (processedData.getUsedData() != null) {
            for (String used_data_step_id : processedData.getUsedData()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO step_use_step SET "
                        + "step_id = ?, used_data_id = ?");

                ps.setString(1, processedData.getStepID());
                ps.setString(2, used_data_step_id);
                ps.execute();
            }
        }

        return true;
    }

    /**
     * This function manages the NonProcessedData insertion
     * <p/>
     * @param non_processed_data_list
     * @return
     * @throws SQLException
     */
    public boolean insert(ProcessedData[] non_processed_data_list) throws SQLException {
        boolean status = true;
        for (ProcessedData processedData : non_processed_data_list) {
            status &= DAOProvider.getDAO(processedData).insert(processedData);
        }
        return status;
    }

    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);

        ProcessedData step = (ProcessedData) object;
        //1.   Inserts a new entry in the ProcessedData table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE processed_data SET "
                + " processed_data_type = ?, software = ?, software_version = ?,"
                + " software_configuration = ?, results = ? WHERE step_id = ?");

        ps.setString(1, step.getProcessedDataType());
        ps.setString(2, step.getSoftware());
        ps.setString(3, step.getSoftwareVersion());
        ps.setString(4, step.getSoftwareConfiguration());
        ps.setString(5, step.getResults());
        ps.setString(6, step.getStepID());
        ps.execute();

        //1.   REMOVE THE PREVIOUS ENTRIES
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_use_step WHERE step_id = ?");
        ps.setString(1, step.getStepID());
        ps.execute();

        //1.   Inserts a new entry step_use_step table
        for (String used_data_step_id : step.getUsedData()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_use_step SET step_id = ?, used_data_id = ?");
            ps.setString(1, step.getStepID());
            ps.setString(2, used_data_step_id);
            ps.execute();
        }

        //3.Due to the step could be used in more than 1 analysis (imported step), 
        //we have to include the new used steps in all the analysis
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

    public boolean update(ProcessedData[] processed_data_list) throws SQLException {
        boolean status = true;
        for (ProcessedData processedData : processed_data_list) {
            status &= DAOProvider.getDAO(processedData).update(processedData);
        }
        return status;
    }

//    /**
//     *
//     * @param non_processed_data
//     * @return
//     * @throws SQLException
//     */
////    @Override
//    @Override
//    public boolean remove(String object_id) throws SQLException {
//        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                + "DELETE FROM processed_data "
//                + "WHERE analysis_id = ? ");
//
//        ps.setString(1, object_id);
//        boolean status = ps.execute();
//        return true;
//    }
//
//    public boolean remove(String[] processed_data_id_list) throws SQLException {
//        if (processed_data_id_list == null) {
//            return false;
//        }
//
//        boolean status = true;
//        for (String processed_data_id : processed_data_id_list) {
//            status &= remove(processed_data_id);
//        }
//        return status;
//    }
    //******************************************************************************************************************************************/
    //*** GETTERS                                        ***************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param step_id
     * @param otherParams
     * @return
     * @throws java.sql.SQLException
     */
    @Override
    public ProcessedData findByID(String step_id, Object[] otherParams) throws SQLException {
        ProcessedData processedDataInstance = null;
        if (otherParams != null) {
            processedDataInstance = (ProcessedData) otherParams[0];
        }

        //GET STEP DETAILS
        super.findByID(step_id, otherParams);

        //GET PROCESSED DATA FIELDS
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM processed_data "
                + "WHERE step_id = ? ");

        ps.setString(1, step_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        if (rs.first()) {
            processedDataInstance.setSoftware(rs.getString("processed_data_type"));
            processedDataInstance.setSoftware(rs.getString("software"));
            processedDataInstance.setSoftware_version(rs.getString("software_version"));
            processedDataInstance.setSoftware_configuration(rs.getString("software_configuration"));
            processedDataInstance.setResults(rs.getString("results"));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT used_data_id FROM step_use_step "
                    + "WHERE step_id = ? ");

            ps.setString(1, step_id);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
            ArrayList<String> usedData = new ArrayList<String>();
            while (rs.next()) {
                usedData.add(rs.getString(1));
            }
            processedDataInstance.setUsedData(usedData.toArray(new String[]{}));

            return processedDataInstance;
        }

        return processedDataInstance;
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
//        String[] subtypes = new String[]{
//             "Region_intersection_step", "Region_consolidation_step",
//             "Data_matrix_step",  ""           
//        };
        String[] subtypes = new String[]{
            "Quantification_step", "Merging_step", "Calling_step", "Region_calling_step", "Proteomics_msquantification_step", "region_intersection_step", "region_consolidation_step"
        };

        ArrayList<Object> processed_data_list = new ArrayList<Object>();

        for (String subType : subtypes) {
            processed_data_list.addAll(this.findAll(subType, otherParams));
        }

        return processed_data_list;
    }

    /**
     *
     * @param subType
     * @param otherParams
     * @return
     * @throws SQLException
     */
    public ArrayList<Object> findAll(String subType, Object[] otherParams) throws SQLException {
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.*  FROM processed_data as t1, analysis_has_steps as t3 "
                + "WHERE "
                + (analysis_id != null ? "t3.analysis_id = ? AND t1.step_id = t3.step_id AND " : "")
                + "t1.processed_data_type = ?");

        int i = 1;
        if (analysis_id != null) {
            ps.setString(i, analysis_id);
            i++;
        }
        ps.setString(i, subType.toLowerCase());

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> processedDataSteps = new ArrayList<Object>();
        DAO dao = DAOProvider.getDAOByName(subType);
        ProcessedData processedDatainstance;
        while (rs.next()) {
            processedDatainstance = (ProcessedData) dao.findByID(rs.getString("step_id"), otherParams);
            processedDataSteps.add(processedDatainstance);
        }

        return processedDataSteps;
    }

    /**
     *
     * @return @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new SQLException("Function not implemented");
    }
}
