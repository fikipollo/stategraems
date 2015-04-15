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
package bdManager.DAO.samples;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DBConnectionManager;
import classes.samples.Bioreplicate;
import classes.samples.BioCondition;
import classes.Experiment;
import classes.User;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class BioCondition_JDBCDAO extends DAO {

    //******************************************************************************************************************************************/
    //*** INSERT FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        BioCondition biocondition = (BioCondition) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO biocondition SET "
                + "  biocondition_id = ?, organism = ?, title = ?, name = ?, cell_type = ?, "
                + "  tissue_type = ?, cell_line = ?, gender = ?, genotype = ?, other_biomaterial = ?, "
                + "  treatment = ?, dosis = ?, time = ?, other_exp_cond = ?, protocol_description = ?, "
                + "  submission_date = ?, last_edition_date = ?, external_links = ? ");

        ps.setString(1, biocondition.getBioConditionID());
        ps.setString(2, biocondition.getOrganism());
        ps.setString(3, biocondition.getTitle());
        ps.setString(4, biocondition.getName());
        ps.setString(5, biocondition.getCellType());
        ps.setString(6, biocondition.getTissueType());
        ps.setString(7, biocondition.getCellLine());
        ps.setString(8, biocondition.getGender());
        ps.setString(9, biocondition.getGenotype());
        ps.setString(10, biocondition.getOtherBiomat());
        ps.setString(11, biocondition.getTreatment());
        ps.setString(12, biocondition.getDosis());
        ps.setString(13, biocondition.getTime());
        ps.setString(14, biocondition.getOtherExpCond());
        ps.setString(15, biocondition.getProtocolDescription());
        ps.setString(16, biocondition.getSubmissionDate().replaceAll("/", ""));
        ps.setString(17, biocondition.getLastEditionDate().replaceAll("/", ""));
        ps.setString(18, biocondition.getExternalLinks());
        ps.execute();

        if (biocondition.getAssociatedBioreplicates() != null) {
            DAOProvider.getDAOByName("Bioreplicate").insert((Bioreplicate[]) biocondition.getAssociatedBioreplicates());
        }
        //Add new entries into the biocondition_owners table.
        for (User user : biocondition.getOwners()) {
            //let's insert the relathionship USER <--> biocondition
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO biocondition_owners VALUES "
                    + "(?,?)");

            ps.setString(1, user.getUserID());
            ps.setString(2, biocondition.getBioConditionID());

            ps.execute();
        }

        //Add new entries into the experiment_use_biocondition table.
        if (biocondition.getAssociatedExperiments() != null) {
            for (Experiment experiment : biocondition.getAssociatedExperiments()) {
                //let's insert the relathionship USER <--> biocondition
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO experiment_use_biocondition "
                        + "VALUES "
                        + "(?,?)");

                ps.setString(1, experiment.getExperimentID());
                ps.setString(2, biocondition.getBioConditionID());
                ps.execute();
            }
        }

        return true;
    }

    /**
     * This function inserts new association between a given list of
     * BioCondition IDs and a given Experiment ID
     *
     * @param bioconditions_ids a list of biocondition IDs [BCxxxxxxxx,
     * BCxxxxxxxx, ... ]
     * @param experiment_id the Experiment ID EXPxxxxxxxx
     * @return true if inserting successfully, false cc.
     */
    public static boolean insertNewExperimentAssociation(String[] biocondition_ids, String experiment_id, boolean nestedTransaction) {
//        try {
//
//            //SET THE AUTOCOMMIT OPTION TO FALSE (START TRANSACTION)
//            if (!nestedTransaction) {
//                DBConnectionManager.getConnectionManager().setAutoCommit(false);
//            }
//
//            //INSERT NEW ASSOCIATION STATEMENT IGNORING REPEATED ENTRIES
//            PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                    + "INSERT IGNORE INTO experiment_use_biocondition "
//                    + "VALUES "
//                    + "(?,?)");
//
//            //Add new entries into the biocondition_owners.
//            for (String biocondition_id : biocondition_ids) {
//                //let's insert the relathionship USER <--> biocondition
//                ps.setString(1, experiment_id);
//                ps.setString(2, biocondition_id);
//                ps.execute();
//            }
//
//            if (!nestedTransaction) {
//                DBConnectionManager.getConnectionManager().commit();
//            }
//
//            return true;
//
//        } catch (Exception ex) {
//            handleException(ex, BioCondition_JDBCDAO.class.getName(), "insertNewExperimentAssociation", !nestedTransaction);
        return false;
//        } finally {
//            //TODO: IS A PROBLEM WITH MULTIUSER??
//            if (!nestedTransaction) {
//                DBConnectionManager.getConnectionManager().closeConnection();
//            }
//        }
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        BioCondition biocondition = (BioCondition) object;

        //Insert the BioCondition in the bioconditions table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE biocondition SET "
                + "  organism = ?, title = ?, name = ?, cell_type = ?, tissue_type = ?, cell_line = ?, gender = ?, "
                + "  genotype = ?, other_biomaterial = ?, treatment = ?, dosis = ?, time = ?, other_exp_cond = ?, "
                + "  protocol_description = ?, last_edition_date = ?, external_links = ? "
                + "WHERE biocondition_id = ?");

        ps.setString(1, biocondition.getOrganism());
        ps.setString(2, biocondition.getTitle());
        ps.setString(3, biocondition.getName());
        ps.setString(4, biocondition.getCellType());
        ps.setString(5, biocondition.getTissueType());
        ps.setString(6, biocondition.getCellLine());
        ps.setString(7, biocondition.getGender());
        ps.setString(8, biocondition.getGenotype());
        ps.setString(9, biocondition.getOtherBiomat());
        ps.setString(10, biocondition.getTreatment());
        ps.setString(11, biocondition.getDosis());
        ps.setString(12, biocondition.getTime());
        ps.setString(13, biocondition.getOtherExpCond());
        ps.setString(14, biocondition.getProtocolDescription());
        ps.setString(15, biocondition.getLastEditionDate().replaceAll("/", ""));
        ps.setString(16, biocondition.getExternalLinks());
        ps.setString(17, biocondition.getBioConditionID());
        ps.execute();

        //Remove all the previous entries in the experiment_owners table
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM biocondition_owners WHERE biocondition_id = ?");
        ps.setString(1, biocondition.getBioConditionID());
        ps.execute();

        //Add new entries into the biocondition_owners table.
        for (User user : biocondition.getOwners()) {
            //let's insert the relathionship USER <--> biocondition
            //TODO:THIS CODE DOES NOT REMOVE PREVIOUS OWNERS
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT IGNORE INTO biocondition_owners VALUES "
                    + "(?,?)");
            ps.setString(1, user.getUserID());
            ps.setString(2, biocondition.getBioConditionID());
            ps.execute();
        }

        return true;
    }
    //******************************************************************************************************************************************/
    //*** GETTERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/

    /**
     *
     * @param biocondition_id
     * @param otherParams, an array with the "loadRecursive" flag
     * @return
     * @throws SQLException
     */
    @Override
    public Object findByID(String biocondition_id, Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        if (otherParams != null) {
            loadRecursive = (Boolean) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM biocondition WHERE biocondition_id = ?");
        ps.setString(1, biocondition_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        BioCondition biocondition = null;
        if (rs.first()) {
            biocondition = new BioCondition();
            biocondition.setBioConditionID(biocondition_id);
            biocondition.setOrganism(rs.getString("organism"));
            biocondition.setTitle(rs.getString("title"));
            biocondition.setName(rs.getString("name"));
            biocondition.setCellType(rs.getString("cell_type"));
            biocondition.setTissueType(rs.getString("tissue_type"));
            biocondition.setCellLine(rs.getString("cell_line"));
            biocondition.setGender(rs.getString("gender"));
            biocondition.setGenotype(rs.getString("genotype"));
            biocondition.setOtherBiomat(rs.getString("other_biomaterial"));
            biocondition.setTreatment(rs.getString("treatment"));
            biocondition.setDosis(rs.getString("dosis"));
            biocondition.setTime(rs.getString("time"));
            biocondition.setOtherExpCond(rs.getString("other_exp_cond"));
            biocondition.setProtocolDescription(rs.getString("protocol_description"));
            biocondition.setLastEditionDate(rs.getString("last_edition_date"));
            biocondition.setSubmissionDate(rs.getString("submission_date"));
            biocondition.setExternalLinks(rs.getString("external_links"));
        }

        if (biocondition != null && loadRecursive) {
            Object[] params = {biocondition_id, loadRecursive};

            ArrayList<Object> bioreplicates = new Bioreplicate_JDBCDAO().findAll(params);
            biocondition.setAssociatedBioreplicates(bioreplicates.toArray(new Bioreplicate[bioreplicates.size()]));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM biocondition_owners WHERE biocondition_id = ?");
            ps.setString(1, biocondition_id);

            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            while (rs.next()) {
                owners.add(new User(rs.getString(1), ""));
            }
            biocondition.setOwners(owners.toArray(new User[owners.size()]));
        }

        return biocondition;
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
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM biocondition");

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<Object> bioconditionsList = new ArrayList<Object>();
        BioCondition biocondition = null;
        while (rs.next()) {
            biocondition = new BioCondition();
            biocondition.setBioConditionID(rs.getString("biocondition_id"));
            biocondition.setOrganism(rs.getString("organism"));
            biocondition.setTitle(rs.getString("title"));
            biocondition.setName(rs.getString("name"));
            biocondition.setCellType(rs.getString("cell_type"));
            biocondition.setTissueType(rs.getString("tissue_type"));
            biocondition.setCellLine(rs.getString("cell_line"));
            biocondition.setGender(rs.getString("gender"));
            biocondition.setGenotype(rs.getString("genotype"));
            biocondition.setOtherBiomat(rs.getString("other_biomaterial"));
            biocondition.setTreatment(rs.getString("treatment"));
            biocondition.setDosis(rs.getString("dosis"));
            biocondition.setTime(rs.getString("time"));
            biocondition.setOtherExpCond(rs.getString("other_exp_cond"));
            biocondition.setProtocolDescription(rs.getString("protocol_description"));
            biocondition.setLastEditionDate(rs.getString("last_edition_date"));
            biocondition.setSubmissionDate(rs.getString("submission_date"));
            biocondition.setExternalLinks(rs.getString("external_links"));

            bioconditionsList.add(biocondition);
        }

        if (!bioconditionsList.isEmpty() && loadRecursive) {
            for (Object object : bioconditionsList) {
                Object[] params = {((BioCondition) object).getBioConditionID(), loadRecursive};
                ArrayList<Object> bioreplicates = new Bioreplicate_JDBCDAO().findAll(params);
                ((BioCondition) object).setAssociatedBioreplicates(bioreplicates.toArray(new Bioreplicate[bioreplicates.size()]));
            }
        }

        return bioconditionsList;
    }

    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        //TODO: RETRUN ONLY THE FIRST
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT biocondition_id FROM biocondition ORDER BY biocondition_id DESC");
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        String newID = "";
        if (previousID == null) {
            newID = "BC" + "001";
        } else {
            newID = previousID.substring(previousID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "BC" + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "BC" + newID;
        }

        return newID;
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM biocondition WHERE biocondition_id = ?");
        ps.setString(1, object_id);
        ps.execute();

        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
