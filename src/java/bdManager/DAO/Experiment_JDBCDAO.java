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
package bdManager.DAO;

import bdManager.DBConnectionManager;
import classes.Experiment;
import classes.User;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Iterator;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Experiment_JDBCDAO extends DAO {

    //******************************************************************************************************************************************/
    //*** INSERT FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        Experiment experiment = (Experiment) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO experiments SET "
                + "  experiment_id = ?, title = ?, experiment_description = ?, is_time_course_type = ?, is_case_control_type = ?, "
                + "  is_survival_type = ?, is_single_condition = ?, is_multiple_conditions = ?, is_other_type = ?, biological_rep_no = ?,"
                + "  technical_rep_no = ?, contains_chipseq = ?, "
                + "  contains_dnaseseq = ?, contains_metabolomics = ?, contains_methylseq = ?, contains_mirnaseq = ?, contains_mrnaseq = ?,  "
                + "  contains_proteomics = ?, contains_other = ?, public_references = ?, submission_date = ?, last_edition_date = ?,"
                + "  experimentDataDirectory = ? ");

        ps.setString(1, experiment.getExperimentID());
        ps.setString(2, experiment.getTitle());
        ps.setString(3, experiment.getExperimentDescription());
        ps.setBoolean(4, experiment.isTimeCourseType());
        ps.setBoolean(5, experiment.isCaseControlType());
        ps.setBoolean(6, experiment.isSurvivalType());
        ps.setBoolean(7, experiment.isSingleCondition());
        ps.setBoolean(8, experiment.isMultipleConditions());
        ps.setBoolean(9, experiment.isOtherType());
        ps.setInt(10, experiment.getBiologicalRepNo());
        ps.setInt(11, experiment.getTechnicalRepNo());
        ps.setBoolean(12, (experiment.getContainsChipseq() == 2 || experiment.getContainsChipseq() == 3));
        ps.setBoolean(13, (experiment.getContainsDNaseseq() == 2 || experiment.getContainsDNaseseq() == 3));
        ps.setBoolean(14, (experiment.getContainsMetabolomics() == 2 || experiment.getContainsMetabolomics() == 3));
        ps.setBoolean(15, (experiment.getContainsMethylseq() == 2 || experiment.getContainsMethylseq() == 3));
        ps.setBoolean(16, (experiment.getContainsSmallRNAseq() == 2 || experiment.getContainsSmallRNAseq() == 3));
        ps.setBoolean(17, (experiment.getContainsMRNAseq() == 2 || experiment.getContainsMRNAseq() == 3));
        ps.setBoolean(18, (experiment.getContainsProteomics() == 2 || experiment.getContainsProteomics() == 3));
        ps.setBoolean(19, experiment.getContainsOther());
        ps.setString(20, experiment.getPublicReferences());
        ps.setString(21, experiment.getSubmissionDate().replaceAll("/", ""));
        ps.setString(22, experiment.getLastEditionDate().replaceAll("/", ""));
        ps.setString(23, experiment.getExperimentDataDirectory());
        ps.execute();

        //Add new entries into the experiment_owners table.
        for (User owner : experiment.getExperimentOwners()) {
            //let's insert the relathionship USER <--> experiment
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO experiment_owners SET "
                    + "user_id = ?, experiment_id = ?, role = ? ");

            ps.setString(1, owner.getUserID());
            ps.setString(2, experiment.getExperimentID());
            ps.setInt(3, 0);
            ps.execute();
        }
        //Add new entries into the experiment_owners table.
        if (experiment.getExperimentMembers() != null) {
            for (User member : experiment.getExperimentMembers()) {
                //let's insert the relathionship USER <--> experiment
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT IGNORE INTO experiment_owners SET "
                        + "user_id = ?, experiment_id = ?, role = ? ");

                ps.setString(1, member.getUserID());
                ps.setString(2, experiment.getExperimentID());
                ps.setInt(3, 1);
                ps.execute();
            }
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        Experiment experiment = (Experiment) object;

        //Insert the Experiment in the experiments table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE experiments SET "
                + "  title = ?, experiment_description = ?, is_time_course_type = ?, is_case_control_type = ?, "
                + "  is_survival_type = ?, is_single_condition = ?, is_multiple_conditions = ?, is_other_type = ?, biological_rep_no = ?,"
                + "  technical_rep_no = ?, contains_chipseq = ?, "
                + "  contains_dnaseseq = ?, contains_metabolomics = ?, contains_methylseq = ?, contains_mirnaseq = ?, contains_mrnaseq = ?,  "
                + "  contains_proteomics = ?, contains_other = ?, public_references = ?, submission_date = ?, last_edition_date = ?, "
                + "  experimentDataDirectory = ? "
                + "WHERE experiment_id = ?");

        ps.setString(1, experiment.getTitle());
        ps.setString(2, experiment.getExperimentDescription());
        ps.setBoolean(3, experiment.isTimeCourseType());
        ps.setBoolean(4, experiment.isCaseControlType());
        ps.setBoolean(5, experiment.isSurvivalType());
        ps.setBoolean(6, experiment.isSingleCondition());
        ps.setBoolean(7, experiment.isMultipleConditions());
        ps.setBoolean(8, experiment.isOtherType());
        ps.setInt(9, experiment.getBiologicalRepNo());
        ps.setInt(10, experiment.getTechnicalRepNo());
        ps.setBoolean(11, (experiment.getContainsChipseq() == 2 || experiment.getContainsChipseq() == 3));
        ps.setBoolean(12, (experiment.getContainsDNaseseq() == 2 || experiment.getContainsDNaseseq() == 3));
        ps.setBoolean(13, (experiment.getContainsMetabolomics() == 2 || experiment.getContainsMetabolomics() == 3));
        ps.setBoolean(14, (experiment.getContainsMethylseq() == 2 || experiment.getContainsMethylseq() == 3));
        ps.setBoolean(15, (experiment.getContainsSmallRNAseq() == 2 || experiment.getContainsSmallRNAseq() == 3));
        ps.setBoolean(16, (experiment.getContainsMRNAseq() == 2 || experiment.getContainsMRNAseq() == 3));
        ps.setBoolean(17, (experiment.getContainsProteomics() == 2 || experiment.getContainsProteomics() == 3));
        ps.setBoolean(18, experiment.getContainsOther());
        ps.setString(19, experiment.getPublicReferences());
        ps.setString(20, experiment.getSubmissionDate().replaceAll("/", ""));
        ps.setString(21, experiment.getLastEditionDate().replaceAll("/", ""));
        ps.setString(22, experiment.getExperimentDataDirectory());
        ps.setString(23, experiment.getExperimentID());

        ps.execute();

        //Remove all the previous entries in the experiment_owners table
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM experiment_owners WHERE experiment_id = ?");
        ps.setString(1, experiment.getExperimentID());
        ps.execute();

        //Add new entries into the experiment_owners table.
        for (User owner : experiment.getExperimentOwners()) {
            //let's insert the relathionship USER <--> experiment
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO experiment_owners SET "
                    + "user_id = ?, experiment_id = ?, role = ? ");
            ps.setString(1, owner.getUserID());
            ps.setString(2, experiment.getExperimentID());
            ps.setInt(3, 0);
            ps.execute();
        }

        //TODO: REMOVE OWNERs???
        //Add new entries into the experiment_owners table.
        if (experiment.getExperimentMembers() != null) {
            for (User member : experiment.getExperimentMembers()) {
                //let's insert the relathionship USER <--> experiment
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT IGNORE INTO experiment_owners SET "
                        + "user_id = ?, experiment_id = ?, role = ? ");

                ps.setString(1, member.getUserID());
                ps.setString(2, experiment.getExperimentID());
                ps.setInt(3, 1);
                ps.execute();
            }
        }

        return true;
    }
    //******************************************************************************************************************************************/
    //*** GETTERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/

    /**
     *
     * @param experiment_id
     * @return
     * @throws SQLException
     */
    @Override
    public Object findByID(String experiment_id, Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        if (otherParams != null) {
            loadRecursive = (Boolean) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM experiments WHERE experiment_id = ?");
        ps.setString(1, experiment_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        Experiment experiment = null;
        if (rs.first()) {
            experiment = new Experiment();
            experiment.setExperimentID(experiment_id);
            experiment.setTitle(rs.getString("title"));
            experiment.setExperimentDescription(rs.getString("experiment_description"));
            experiment.setIsTimeCourseType(rs.getBoolean("is_time_course_type"));
            experiment.setIsCaseControlType(rs.getBoolean("is_case_control_type"));
            experiment.setIsSurvivalType(rs.getBoolean("is_survival_type"));
            experiment.setIsSingleCondition(rs.getBoolean("is_single_condition"));
            experiment.setIsMultipleConditions(rs.getBoolean("is_multiple_conditions"));
            experiment.setIsOtherType(rs.getBoolean("is_other_type"));
            experiment.setBiologicalRepNo(rs.getInt("biological_rep_no"));
            experiment.setTechnicalRepNo(rs.getInt("technical_rep_no"));
            experiment.setContainsChipseq((rs.getBoolean("contains_chipseq") ? 2 : 0));
            experiment.setContainsDNaseseq((rs.getBoolean("contains_dnaseseq") ? 2 : 0));
            experiment.setContainsMethylseq((rs.getBoolean("contains_methylseq") ? 2 : 0));
            experiment.setContainsMRNAseq((rs.getBoolean("contains_mrnaseq") ? 2 : 0));
            experiment.setContainsSmallRNAseq((rs.getBoolean("contains_mirnaseq") ? 2 : 0));
            experiment.setContainsMetabolomics((rs.getBoolean("contains_metabolomics") ? 2 : 0));
            experiment.setContainsProteomics((rs.getBoolean("contains_proteomics") ? 2 : 0));
            experiment.setContainsOther(rs.getBoolean("contains_other"));
            experiment.setPublicReferences(rs.getString("public_references"));
            experiment.setSubmissionDate(rs.getString("submission_date"));
            experiment.setLastEditionDate(rs.getString("last_edition_date"));
            experiment.setExperimentDataDirectory(rs.getString("experimentDataDirectory"));
        }

        if (experiment != null && loadRecursive) {
            String[] analysisTypes = {"ChIP-seq", "DNAse-seq", "Methyl-seq", "mRNA-seq", "smallRNA-seq", "Metabolomics", "Proteomics"};
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT t1.analysis_id FROM analysis AS t1, experiments_contains_analysis AS t2 "
                    + "WHERE t2.experiment_id = ? AND t2.analysis_id = t1.analysis_id AND t1.analysisType = ?");
            for (String analysisType : analysisTypes) {
                ps.setString(1, experiment_id);
                ps.setString(2, analysisType);
                rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                if (rs.first()) {
                    experiment.setContainsAnalysis(analysisType);
                }
            }

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id, role FROM experiment_owners WHERE experiment_id = ?");
            ps.setString(1, experiment_id);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            ArrayList<User> members = new ArrayList<User>();
            int role;
            while (rs.next()) {
                role = rs.getInt("role");
                if (role == 0) {
                    owners.add(new User(rs.getString(1), ""));
                } else if (role == 1) {
                    members.add(new User(rs.getString(1), ""));
                }
            }
            experiment.setExperimentOwners(owners.toArray(new User[owners.size()]));
            experiment.setExperimentMembers(members.toArray(new User[members.size()]));
        }

        return experiment;
    }

    /**
     *
     * @param otherParams an array with the loadRecursive flag
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        if (otherParams != null) {
            loadRecursive = (Boolean) otherParams[0];
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM experiments");

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<Object> experimentsList = new ArrayList<Object>();
        Experiment experiment = null;
        while (rs.next()) {
            experiment = new Experiment();
            experiment.setExperimentID(rs.getString("experiment_id"));
            experiment.setTitle(rs.getString("title"));
            experiment.setExperimentDescription(rs.getString("experiment_description"));
            experiment.setIsTimeCourseType(rs.getBoolean("is_time_course_type"));
            experiment.setIsCaseControlType(rs.getBoolean("is_case_control_type"));
            experiment.setIsSurvivalType(rs.getBoolean("is_survival_type"));
            experiment.setIsSingleCondition(rs.getBoolean("is_single_condition"));
            experiment.setIsMultipleConditions(rs.getBoolean("is_multiple_conditions"));
            experiment.setIsOtherType(rs.getBoolean("is_other_type"));
            experiment.setBiologicalRepNo(rs.getInt("biological_rep_no"));
            experiment.setTechnicalRepNo(rs.getInt("technical_rep_no"));
            experiment.setContainsChipseq((rs.getBoolean("contains_chipseq") ? 2 : 0));
            experiment.setContainsDNaseseq((rs.getBoolean("contains_dnaseseq") ? 2 : 0));
            experiment.setContainsMethylseq((rs.getBoolean("contains_methylseq") ? 2 : 0));
            experiment.setContainsMRNAseq((rs.getBoolean("contains_mrnaseq") ? 2 : 0));
            experiment.setContainsSmallRNAseq((rs.getBoolean("contains_mirnaseq") ? 2 : 0));
            experiment.setContainsMetabolomics((rs.getBoolean("contains_metabolomics") ? 2 : 0));
            experiment.setContainsProteomics((rs.getBoolean("contains_proteomics") ? 2 : 0));
            experiment.setContainsOther(rs.getBoolean("contains_other"));
            experiment.setPublicReferences(rs.getString("public_references"));
            experiment.setSubmissionDate(rs.getString("submission_date"));
            experiment.setLastEditionDate(rs.getString("last_edition_date"));
            experiment.setExperimentDataDirectory(rs.getString("experimentDataDirectory"));
            experimentsList.add(experiment);
        }

        if (!experimentsList.isEmpty() && loadRecursive) {
            Iterator<Object> it = experimentsList.iterator();
            while (it.hasNext()) {
                experiment = (Experiment) it.next();

                String[] analysisTypes = {"ChIP-seq", "DNAse-seq", "Methyl-seq", "mRNA-seq", "smallRNA-seq", "Metabolomics", "Proteomics"};
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "SELECT t1.analysis_id FROM analysis AS t1, experiments_contains_analysis AS t2 "
                        + "WHERE t2.experiment_id = ? AND t2.analysis_id = t1.analysis_id AND t1.analysisType = ?");
                for (String analysisType : analysisTypes) {
                    ps.setString(1, experiment.getExperimentID());
                    ps.setString(2, analysisType);
                    rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                    if (rs.first()) {
                        experiment.setContainsAnalysis(analysisType);
                    }
                }

                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM experiment_owners WHERE experiment_id = ?");
                ps.setString(1, experiment.getExperimentID());
                rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                ArrayList<User> owners = new ArrayList<User>();
                ArrayList<User> members = new ArrayList<User>();
                int role;
                while (rs.next()) {
                    role = rs.getInt("role");
                    if (role == 0) {
                        owners.add(new User(rs.getString(1), ""));
                    } else if (role == 1) {
                        members.add(new User(rs.getString(1), ""));
                    }
                }
                experiment.setExperimentOwners(owners.toArray(new User[owners.size()]));
                experiment.setExperimentMembers(members.toArray(new User[members.size()]));
            }
        }
        return experimentsList;
    }

    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT experiment_id FROM experiments ORDER BY experiment_id DESC");
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        String newID = "";
        if (previousID == null) {
            newID = "EXP" + "00001";
        } else {
            newID = previousID.substring(previousID.length() - 5);
            newID = String.format("%05d", Integer.parseInt(newID) + 1);
            newID = "EXP" + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 5);
            newID = String.format("%05d", Integer.parseInt(newID) + 1);
            newID = "EXP" + newID;
        }
        return newID;
    }

    public boolean checkValidExperiment(String experiment_id, String user_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM experiment_owners WHERE experiment_id = ? AND user_id = ?");
        ps.setString(1, experiment_id);
        ps.setString(2, user_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "UPDATE users SET last_experiment_id=? WHERE user_id=?");
            ps.setString(1, experiment_id);
            ps.setString(2, user_id);
            ps.execute();
            return true;
        }

        return false;
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT analysis_id FROM experiments_contains_analysis WHERE experiment_id = ?");
        ps.setString(1, object_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        String analysisId;
        ResultSet rs1;
        DAO analysisDAO = DAOProvider.getDAOByName("Analysis");
        while (rs.next()) {
            analysisId = rs.getString("analysis_id");
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT COUNT(*) FROM experiments_contains_analysis WHERE analysis_id = ?");
            ps.setString(1, analysisId);
            rs1 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
            rs1.first();
            if (rs1.getInt(1) == 1) {
                analysisDAO.remove(analysisId);
            }
        }

        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("DELETE FROM experiments WHERE experiment_id = ?");
        ps.setString(1, object_id);

        ps.execute();

        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
