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

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DBConnectionManager;
import classes.analysis.NonProcessedData;
import classes.analysis.ProcessedData;
import classes.analysis.Analysis;
import classes.analysis.Step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;

//
/**
 *
 * @author Rafa Hernández de Diego
 */
public class Analysis_JDBCDAO extends DAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        Analysis analysis = (Analysis) object;
        //(1) ADD THE ANALYSIS OBJECT
        //Insert the Analysis in the analysis table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO analysis SET "
                + "analysis_id = ?, analysis_type= ?, status = ?, analysis_name = ?, tags= ?");

        ps.setString(1, analysis.getAnalysisID());
        ps.setString(2, analysis.getAnalysisType());
        ps.setString(3, analysis.getStatus());
        ps.setString(4, analysis.getAnalysisName());
        ps.setString(5, concatString(", ", analysis.getTags()));
        ps.execute();

        //Add ALL THE NON PROCESSED DATA
        //TODO: SEPARATE IN 2 ARRAYS AND ADD ALL IN ONLY ONE CALL
        //TODO: ADD MULTIPLE ELEMENTS COULD BE DONE IN ONLY ONE STATEMENT
        for (NonProcessedData non_processed_data : analysis.getNonProcessedData()) {
            if (non_processed_data.getAnalysisID().equals(analysis.getAnalysisID())) {
                DAOProvider.getDAO(non_processed_data).insert(non_processed_data);
            } else {
                //ADD THE ASSOCIATION analysis <--> non_processed_data
                ((Step_JDBCDAO) DAOProvider.getDAOByName("NonProcessedData")).insertNewStepAssociation(non_processed_data.getStepID(), analysis.getAnalysisID());
            }
        }

        //Add ALL THE PROCESSED DATA
        for (ProcessedData processed_data : analysis.getProcessedData()) {
            if (processed_data.getAnalysisID().equals(analysis.getAnalysisID())) {
                DAOProvider.getDAO(processed_data).insert(processed_data);
            } else {
                //ADD THE ASSOCIATION analysis <--> non_processed_data
                ((Step_JDBCDAO) DAOProvider.getDAOByName("ProcessedData")).insertNewStepAssociation(processed_data.getStepID(), analysis.getAnalysisID());
            }
        }

        //Add a new entry into the experiments_contains_analysis table.
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO experiments_contains_analysis "
                + "VALUES "
                + "(?,?)");

        ps.setString(1, analysis.getAssociatedExperiment());
        ps.setString(2, analysis.getAnalysisID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        Analysis analysis = (Analysis) object;

        //Insert the Experiment in the experiments table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE analysis SET "
                + "  analysis_type= ?, status = ?, analysis_name = ?, tags= ? "
                + "WHERE analysis_id = ?");

        ps.setString(1, analysis.getAnalysisType());
        ps.setString(2, analysis.getStatus());
        ps.setString(3, analysis.getAnalysisName());
        ps.setString(4, concatString(", ", analysis.getTags()));
        ps.setString(5, analysis.getAnalysisID());

        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS                                        ***************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param analysis_id
     * @param otherParams, an array with loadRecursive flag
     * @return
     */
    @Override
    public Analysis findByID(String analysis_id, Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        if (otherParams != null) {
            loadRecursive = (Boolean) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM analysis WHERE analysis_id = ?");
        ps.setString(1, analysis_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        Analysis analysis = null;
        if (rs.first()) {
            analysis = new Analysis();
            analysis.setAnalysisID(rs.getString("analysis_id"));
            analysis.setAnalysisType(rs.getString("analysis_type"));
            analysis.setAnalysisName(rs.getString("analysis_name"));
            analysis.setStatus(rs.getString("status"));
            analysis.setTags(rs.getString("tags"));
            analysis.setRemoveRequests(rs.getString("remove_requests"));

            if (loadRecursive) {
                Object[] params = {analysis.getAnalysisID(), analysis.getAnalysisType()};
                ArrayList<Object> stepList = DAOProvider.getDAOByName("Step").findAll(params);
                ArrayList<NonProcessedData> nonProcessedDataList = new ArrayList<NonProcessedData>();
                ArrayList<ProcessedData> processedDataList = new ArrayList<ProcessedData>();

                for (Object stepInstance : stepList) {
                    if (stepInstance instanceof NonProcessedData) {
                        nonProcessedDataList.add((NonProcessedData) stepInstance);
                    } else if (stepInstance instanceof ProcessedData) {
                        processedDataList.add((ProcessedData) stepInstance);
                    }
                }

                analysis.setNonProcessedData(nonProcessedDataList.toArray(new NonProcessedData[nonProcessedDataList.size()]));
                analysis.setProcessedData(processedDataList.toArray(new ProcessedData[processedDataList.size()]));
            }
        }

        return analysis;
    }

    /**
     *
     * @param otherParams an array with loadRecursive flags
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        String experiment_id = null;
        if (otherParams != null) {
            loadRecursive = (Boolean) otherParams[0];
            experiment_id = (String) otherParams[1];
        }
        String queryStatement = "SELECT t1.* FROM analysis AS t1";

        if (experiment_id != null) {
            queryStatement += ", experiments_contains_analysis AS t2 WHERE experiment_id = ? AND t1.analysis_id = t2.analysis_id";
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(queryStatement);
        if (experiment_id != null) {
            ps.setString(1, experiment_id);
        }

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<Object> analysisList = new ArrayList<Object>();
        Analysis analysis;

        while (rs.next()) {
            analysis = new Analysis();
            analysis.setAnalysisID(rs.getString("analysis_id"));
            analysis.setAnalysisType(rs.getString("analysis_type"));
            analysis.setAnalysisName(rs.getString("analysis_name"));
            analysis.setStatus(rs.getString("status"));
            analysis.setTags(rs.getString("tags"));
            analysis.setRemoveRequests(rs.getString("remove_requests"));

            if (loadRecursive) {
                Object[] params = {analysis.getAnalysisID(), analysis.getAnalysisType()};
                ArrayList<Object> stepList = DAOProvider.getDAOByName("Step").findAll(params);
                ArrayList<NonProcessedData> nonProcessedDataList = new ArrayList<NonProcessedData>();
                ArrayList<ProcessedData> processedDataList = new ArrayList<ProcessedData>();

                for (Object stepInstance : stepList) {
                    if (stepInstance instanceof NonProcessedData) {
                        nonProcessedDataList.add((NonProcessedData) stepInstance);
                    } else if (stepInstance instanceof ProcessedData) {
                        processedDataList.add((ProcessedData) stepInstance);
                    }
                }

                analysis.setNonProcessedData(nonProcessedDataList.toArray(new NonProcessedData[nonProcessedDataList.size()]));
                analysis.setProcessedData(processedDataList.toArray(new ProcessedData[processedDataList.size()]));
            }
            analysisList.add(analysis);
        }

        return analysisList;
    }

    /**
     * This function queries the ANALYSIS table looking for the next ANALYSIS
     * ID.
     *
     * @return next analysis_id, pattern: AN + [0-9]{8}
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT analysis_id FROM analysis ORDER BY analysis_id DESC");

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        String newID = "";
        if (previousID == null) {
            newID = "AN" + "0001";
        } else {
            newID = previousID.substring(previousID.length() - 4);
            newID = String.format("%04d", Integer.parseInt(newID) + 1);
            newID = "AN" + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 4);
            newID = String.format("%04d", Integer.parseInt(newID) + 1);
            newID = "AN" + newID;
        }
        return newID;
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    public boolean remove(Analysis analysis) throws SQLException {
        //STEP 1. FOR EACH STEP: CHECK IF STEP IS BEING USED BY OTHER ANALYSIS
        // IF SO, JUST UNLINK STEP
        // OTHERWISE, REMOVE THE STEP
        Step_JDBCDAO daoInstance = new Step_JDBCDAO();
        for (Step step : analysis.getNonProcessedData()) {
            if (step.getAnalysisID().equalsIgnoreCase(analysis.getAnalysisID())) {
                ((Step_JDBCDAO) daoInstance).remove(step.getStepID());
            } else {
                ((Step_JDBCDAO) daoInstance).removeStepAssociation(step.getStepID(), analysis.getAnalysisID());
            }
        }

        for (Step step : analysis.getProcessedData()) {
            if (step.getAnalysisID().equalsIgnoreCase(analysis.getAnalysisID())) {
                ((Step_JDBCDAO) daoInstance).remove(step.getStepID());
            } else {
                ((Step_JDBCDAO) daoInstance).removeStepAssociation(step.getStepID(), analysis.getAnalysisID());
            }
        }

        //STEP 2. REMOVE THE ANALYSIS
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM analysis WHERE analysis_id = ?");
        ps.setString(1, analysis.getAnalysisID());
        ps.execute();

        return true;
    }

    @Override
    public boolean remove(String object_id) throws SQLException {
        Analysis analysis = this.findByID(object_id, null);
        return this.remove(analysis);
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        for(String object_id : object_id_list){
            this.remove(object_id);
        }
        return true;
    }

    public boolean updateRemoveRequests(String object_id, String[] remove_requests) throws SQLException {
        //Insert the Experiment in the experiments table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE analysis SET remove_requests= ? WHERE analysis_id = ?");

        ps.setString(1, concatString(", ", remove_requests));
        ps.setString(2, object_id);
        ps.execute();
        return true;
    }
}
