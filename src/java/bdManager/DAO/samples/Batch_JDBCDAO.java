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
import bdManager.DBConnectionManager;
import classes.User;
import classes.samples.Batch;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Batch_JDBCDAO extends DAO {

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
        Batch batch = (Batch) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO batch SET "
                + "batch_id = ?, batch_name = ?, batch_creation_date = ?, description = ?");

        ps.setString(1, batch.getBatchID());
        ps.setString(2, batch.getBatch_name());
        ps.setString(3, batch.getBatch_creation_date().replaceAll("/", ""));
        ps.setString(4, batch.getDescription());
        ps.execute();

        //Add new entries into the biocondition_owners table.
        for (User user : batch.getOwners()) {
            //let's insert the relathionship USER <--> biocondition
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO batch_owners VALUES "
                    + "(?,?)");

            ps.setString(1, user.getUserID());
            ps.setString(2, batch.getBatchID());

            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        Batch batch = (Batch) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE batch SET "
                + "batch_name = ?, batch_creation_date = ?, description = ? "
                + "WHERE batch_id = ?");

        ps.setString(1, batch.getBatch_name());
        ps.setString(2, batch.getBatch_creation_date().replaceAll("/", ""));
        ps.setString(3, batch.getDescription());
        ps.setString(4, batch.getBatchID());
        ps.execute();


        //Add new entries into the biocondition_owners table.
        for (User user : batch.getOwners()) {
            //let's insert the relathionship USER <--> biocondition
            //TODO:THIS CODE DOES NOT REMOVE PREVIOUS OWNERS
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT IGNORE INTO batch_owners VALUES "
                    + "(?,?)");
            ps.setString(1, user.getUserID());
            ps.setString(2, batch.getBatchID());
            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public Object findByID(String objectID, Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM batch WHERE batch_id = ?");
        ps.setString(1, objectID);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        Batch batch = null;
        if (rs.first()) {
            batch = new Batch();
            batch.setBatchID(rs.getString("batch_id"));
            batch.setBatchCreationDate(rs.getString("batch_creation_date"));
            batch.setBatchName(rs.getString("batch_name"));
            batch.setDescription(rs.getString("description"));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM batch_owners WHERE batch_id = ?");
            ps.setString(1, batch.getBatchID());

            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            while (rs.next()) {
                owners.add(new User(rs.getString(1), ""));
            }
            batch.setOwners(owners.toArray(new User[owners.size()]));
        }

        return batch;
    }

    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM batch");
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<Object> batchList = new ArrayList<Object>();
        Batch batch;
        while (rs.next()) {
            batch = new Batch();
            batch.setBatchID(rs.getString("batch_id"));
            batch.setBatchCreationDate(rs.getString("batch_creation_date"));
            batch.setBatchName(rs.getString("batch_name"));
            batch.setDescription(rs.getString("description"));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM batch_owners WHERE batch_id = ?");
            ps.setString(1, batch.getBatchID());

            ResultSet rs1 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            while (rs1.next()) {
                owners.add(new User(rs1.getString(1), ""));
            }
            batch.setOwners(owners.toArray(new User[owners.size()]));
            batchList.add(batch);
        }

        return batchList;
    }

    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        //TODO: RETRUN ONLY THE FIRST
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT batch_id FROM batch ORDER BY batch_id DESC");

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        String newID = null;
        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        if (previousID == null) {
            newID = "BT" + "0001";
        } else {
            newID = previousID.substring(previousID.length() - 4);
            newID = String.format("%04d", Integer.parseInt(newID) + 1);
            newID = "BT" + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 4);
            newID = String.format("%04d", Integer.parseInt(newID) + 1);
            newID = "BT" + newID;
        }
        return newID;
    }

    //******************************************************************************************************************************************/
    //*** REMOVERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {

        //TODO: DELETE ASSOCIATED ANALYISIS
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM batch "
                + "WHERE "
                + "batch_id= ?");

        ps.setString(1, object_id);
        ps.execute();
        return true;
    }

    public boolean remove(String[] object_id_list) throws SQLException {
        for (String analyticalReplicate_id : object_id_list) {
            remove(analyticalReplicate_id);
        }
        return true;
    }
}
