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
import classes.ExtraField;
import classes.User;
//import classes.analysis.NonProcessedData;
import classes.analysis.QualityReport;
import classes.analysis.Step;
import common.BlockedElementsManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Step_JDBCDAO extends DAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        Step step = (Step) object;

        //ADD the object in the non_processed_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO step SET "
                + " step_id = ?,  step_name = ?, step_number = ?, type = ?, submission_date = ?,"
                + " last_edition_date = ?, files_location = ?");

        ps.setString(1, step.getStepID());
        ps.setString(2, step.getStepName());
        ps.setInt(3, step.getStepNumber());
        ps.setString(4, step.getType());
        ps.setString(5, step.getSubmissionDate().replaceAll("/", ""));
        ps.setString(6, step.getLastEditionDate().replaceAll("/", ""));
        ps.setString(7, String.join("$$", step.getFilesLocation()));
        ps.execute();

        //ADD THE ASSOCIATION analysis <--> non_processed_data
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO analysis_has_steps SET "
                + "step_id = ?, analysis_id = ?");

        ps.setString(1, step.getStepID());
        ps.setString(2, step.getAnalysisID());
        ps.execute();

        //Add new entries into the experiment_owners table.
        for (User owner : step.getStepOwners()) {
            //let's insert the relathionship USER <--> analysis
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_owners SET "
                    + " user_id = ?, step_id = ?");

            ps.setString(1, owner.getUserID());
            ps.setString(2, step.getStepID());
            ps.execute();
        }

        //Add a new entry into the quality report table if the raw data has an associated quality report.
        QualityReport quality_report = step.getAssociatedQualityReport();
        if (quality_report != null) {
            DAOProvider.getDAOByName("QualityReport").insert(quality_report);
        }

        if (step.getOtherFields() != null) {

            Iterator it = step.getOtherFields().entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry pair = (Map.Entry) it.next();
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO other_fields SET "
                        + " step_id = ?, field_name = ?, value = ?");

                ps.setString(1, step.getStepID());
                ps.setString(2, ((String) pair.getKey()));
                ps.setString(3, ((String) pair.getValue()));
                ps.execute();
            }
        }

        if (step.getExtra() != null) {
            for (ExtraField extraField : step.getExtra()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO other_fields SET "
                        + " step_id = ?, field_name = ?, value = ?, label = ?, section = ?");

                ps.setString(1, step.getStepID());
                ps.setString(2, extraField.getName());
                ps.setString(3, extraField.getValue());
                ps.setString(4, extraField.getLabel());
                ps.setString(5, extraField.getSection());
                ps.execute();
            }
        }

        return true;
    }

    /**
     * This function manages the NonProcessedData insertion.
     * <p/>
     * @param step_list
     * @return
     * @throws SQLException
     */
    public boolean insert(Step[] step_list) throws SQLException {
        boolean status = true;
        for (Step step : step_list) {
            status &= DAOProvider.getDAO(step).insert(step);
        }
        return status;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        Step step = (Step) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE step SET "
                + " step_name = ?, step_number = ?, last_edition_date = ?, files_location = ? "
                + "WHERE step_id = ?");

        ps.setString(1, step.getStepName());
        ps.setInt(2, step.getStepNumber());
        ps.setString(3, step.getLastEditionDate().replaceAll("/", ""));
        ps.setString(4, String.join("$$", step.getFilesLocation()));
        ps.setString(5, step.getStepID());
        ps.execute();

        //TODO: UPDATE DE QUALITUY REPORt?
        //2.   REMOVE THE PREVIOUS USERS
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_owners WHERE "
                + "step_id = ?");

        ps.setString(1, step.getStepID());
        ps.execute();
        //Add new entries into the experiment_owners table.
        for (User owner : step.getStepOwners()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO step_owners SET "
                    + " user_id = ?, step_id = ?");

            ps.setString(1, owner.getUserID());
            ps.setString(2, step.getStepID());
            ps.execute();
        }

        //3.   UPDATE QUALITY REPORT
        DAO daoInstance = DAOProvider.getDAOByName("QualityReport");
        daoInstance.remove(step.getStepID());
        QualityReport quality_report = step.getAssociatedQualityReport();
        //Add a new entry into the quality report table if the raw data has an associated quality report.
        if (quality_report != null) {
            DAOProvider.getDAOByName("QualityReport").insert(quality_report);
        }

        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM other_fields WHERE "
                + "step_id = ?");
        ps.setString(1, step.getStepID());
        ps.execute();

        if (step.getOtherFields() != null) {
            Iterator it = step.getOtherFields().entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry pair = (Map.Entry) it.next();
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO other_fields SET "
                        + " step_id = ?, field_name = ?, value = ?");

                ps.setString(1, step.getStepID());
                ps.setString(2, ((String) pair.getKey()));
                ps.setString(3, ((String) pair.getValue()));
                ps.execute();
            }
        }
        if (step.getExtra() != null) {
            for (ExtraField extraField : step.getExtra()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO other_fields SET "
                        + " step_id = ?, field_name = ?, value = ?, label = ?, section = ?");

                ps.setString(1, step.getStepID());
                ps.setString(2, extraField.getName());
                ps.setString(3, extraField.getValue());
                ps.setString(4, extraField.getLabel());
                ps.setString(5, extraField.getSection());
                ps.execute();
            }
        }
        return true;
    }

    public boolean update(Step[] step_list) throws SQLException {
        boolean status = true;
        for (Step step : step_list) {
            status &= DAOProvider.getDAO(step).update(step);
        }
        return status;
    }

    public void insertNewStepAssociation(String step_id, String analysis_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT IGNORE INTO analysis_has_steps SET "
                + "step_id = ?, analysis_id = ?");

        ps.setString(1, step_id);
        ps.setString(2, analysis_id);
        ps.execute();
    }

    public void insertNewStepAssociation(String[] to_be_imported_stepIDs, String analysis_id) throws SQLException {
        if (to_be_imported_stepIDs == null || to_be_imported_stepIDs.length == 0) {
            return;
        }

        String statement = "INSERT IGNORE INTO analysis_has_steps (step_id, analysis_id) VALUES ";

        for (String step_id : to_be_imported_stepIDs) {
            statement += "('" + step_id + "','" + analysis_id + "') ,";
        }
        statement = statement.substring(0, statement.length() - 1);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(statement);
        ps.execute();
    }

    //******************************************************************************************************************************************/
    //*** GETTERS    ***************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param otherParams
     * @return
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }

        ArrayList<Object> stepsList = new ArrayList<Object>();

        stepsList.addAll(DAOProvider.getDAOByName("RAWData").findAll(otherParams));
        stepsList.addAll(DAOProvider.getDAOByName("ExternalData").findAll(otherParams));
        stepsList.addAll(DAOProvider.getDAOByName("IntermediateData").findAll(otherParams));
        stepsList.addAll(DAOProvider.getDAOByName("ProcessedData").findAll(otherParams));

        return stepsList;
    }

    /**
     * This function queries the non_processed_data table looking for the next
     * step ID.
     * <p/>
     * @param otherParams should contains the analysis_id
     * @return new step_id
     * @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.step_id FROM step AS t1, analysis_has_steps as t2 "
                + " WHERE t1.step_id = t2.step_id AND t2.analysis_id = ?"
                + " ORDER BY step_id DESC LIMIT 1");
        ps.setString(1, analysis_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        String previousID = null;
        if (rs.first()) {
            previousID = rs.getString(1);
        }

        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        String newID = "";
        if (previousID == null) {
            newID = "ST" + analysis_id.substring(2) + ".1";
        } else {
            newID = previousID.split("\\.")[1];
            newID = String.format("%0" + newID.length() + "d", Integer.parseInt(newID) + 1);
            newID = "ST" + analysis_id.substring(2) + "." + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.split("\\.")[1];
            newID = String.format("%0" + newID.length() + "d", Integer.parseInt(newID) + 1);
            newID = "ST" + analysis_id.substring(2) + "." + newID;
        }
        return newID;
    }

    /**
     *
     * @param objectID
     * @param otherParams, an array with an already created non processed data
     * instance
     * @return
     * @throws SQLException
     */
    @Override
    public Step findByID(String objectID, Object[] otherParams) throws SQLException {
        Step step = null;
        if (otherParams != null) {
            step = (Step) otherParams[0];
        }

        //STEP 1. GET ALL THE DETAILS FOR THE GIVEN STEP
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM step "
                + "WHERE step_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            //STEP 2. SET THE DETAILS FOR THE STEP INSTANCE
            step.setStepID(objectID);
            step.setStepName(rs.getString("step_name"));
            step.setStepNumber(rs.getInt("step_number"));
            step.setType(rs.getString("type"));
            step.setSubmissionDate(rs.getString("submission_date"));
            step.setLastEditionDate(rs.getString("last_edition_date"));
            step.setFilesLocation(rs.getString("files_location").split("$$"));

            //STEP 3. GET THE INFORMATION FOR THE STEP OWNERS
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT user_id FROM step_owners "
                    + "WHERE step_id = ?");
            ps.setString(1, objectID);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            //Add new entries into the experiment_owners table.
            ArrayList<User> owners = new ArrayList<User>();
            while (rs.next()) {
                owners.add(new User(rs.getString("user_id"), ""));
            }
            step.setStepOwners(owners.toArray(new User[]{}));

            //STEP 4. SET THE INFORMATION FOR THE QUALITY REPORT 
            QualityReport qualityReport = (QualityReport) DAOProvider.getDAOByName("QualityReport").findByID(objectID, null);
            step.setAssociatedQualityReport(qualityReport);

            //STEP 5. FILL THE OTHER_FIELDS AND THE EXTRA FIELDS FOR THE STEP
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT * FROM other_fields WHERE step_id = ?");
            ps.setString(1, objectID);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            Map<String, String> other_fields = new HashMap<String, String>();
            ArrayList<ExtraField> extra = new ArrayList<ExtraField>();
            while (rs.next()) {
                if (rs.getString("label") == null || "".equals(rs.getString("label"))) {
                    other_fields.put(rs.getString("field_name"), rs.getString("value"));
                } else {
                    extra.add(new ExtraField(rs.getString("field_name"), rs.getString("value"), rs.getString("label"), rs.getString("section")));
                }
            }

            step.setOtherFields(other_fields);
            step.setExtra(extra.toArray(new ExtraField[]{}));

            return step;
        }
        return null;
    }

    //******************************************************************************************************************************************/
    //*** REMOVERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param object_id
     * @return
     * @throws SQLException
     */
    @Override
    public boolean remove(String object_id) throws SQLException {
        String owner_analysis_id = "AN" + object_id.substring(2).split("\\.")[0];

        //FIRST CHECK IF THERE IS MORE THAN ONE ANALYSIS USING THIS STEP
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT analysis_id FROM analysis_has_steps WHERE step_id = ? AND analysis_id != ?");
        ps.setString(1, object_id);
        ps.setString(2, owner_analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        //IF SO
        if (rs.first()) {
            //FIRST REMOVE THE ASSOCIATION
            removeStepAssociation(object_id, owner_analysis_id);
            //FROM NOW, WE WILL CONSIDER THAT THE STEP IS PART OF ONE OF THE FOUND ANALYSIS
            //BUT ONLY IF THE ANALYSIS IS NOT LOCKED FOR EDITING IN THIS MOMENT
            String other_analysis;
            do {
                other_analysis = rs.getString("analysis_id");
                //Try to lock the analysis to avoid edition
                if (BlockedElementsManager.getBlockedElementsManager().lockObject(other_analysis, "admin")) {
                    //Get next step id
                    String step_id = getNextObjectID(new Object[]{other_analysis});
                    //Update the id for the step
                    try {
                        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                                + "UPDATE step SET step_id = ? WHERE step_id = ?");
                        ps.setString(1, step_id);
                        ps.setString(2, object_id);
                        ps.execute();
                    } catch (SQLException e) {
                        //Unlock analysis
                        BlockedElementsManager.getBlockedElementsManager().unlockObject(other_analysis, null);
                        throw e;
                    }
                    //All entries in in the database that use this step will automatically update the step_id because of the 
                    //foreign key.
                    //Unlock analysis
                    BlockedElementsManager.getBlockedElementsManager().unlockObject(other_analysis, null);
                    //Unlock the new id
                    BlockedElementsManager.getBlockedElementsManager().unlockObject(step_id, null);
                    break;
                } else {
                    continue;
                }
            } while (rs.next());

            //If we did not find any analysis avaliable for editing, then fail
            if (rs.isAfterLast()) {
                throw new SQLException("Failed trying to remove the step " + object_id + ", please try again later.");
            }
            //IF THERE IS NOT MORE ANALYSIS USING THIS STEP, JUST REMOVE IT  
        } else {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "DELETE FROM step WHERE step_id = ? ");
            ps.setString(1, object_id);
            ps.execute();
        }
        return true;
    }

    public boolean remove(String[] step_id_list) throws SQLException {
        if (step_id_list == null) {
            return false;
        }
        boolean status = true;
        for (String step_id : step_id_list) {
            status &= remove(step_id);
        }
        return status;
    }

    public void removeStepAssociation(String step_id, String analysis_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM analysis_has_steps WHERE "
                + "step_id = ? AND analysis_id = ?");
        ps.setString(1, step_id);
        ps.setString(2, analysis_id);
        ps.execute();

        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM step_use_step WHERE "
                + "used_data_id = ? AND step_id IN "
                + "(SELECT step_id FROM analysis_has_steps WHERE analysis_id = ?)");
        ps.setString(1, step_id);
        ps.setString(2, analysis_id);
        ps.execute();
    }

    public void removeStepAssociation(String[] to_be_disassociated_NPD, String analysis_id) throws SQLException {
        if (to_be_disassociated_NPD == null || to_be_disassociated_NPD.length == 0) {
            return;
        }

        for (String step_id : to_be_disassociated_NPD) {
            removeStepAssociation(step_id, analysis_id);
        }
    }
}
