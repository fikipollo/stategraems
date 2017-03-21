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
import classes.samples.Protocol;
import common.BlockedElementsManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Protocol_JDBCDAO extends DAO {

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
        Protocol protocol = (Protocol) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO treatment SET "
                + "treatment_id = ?, treatment_name = ?, description = ?, biomolecule = ?, files_location = ?");

        ps.setString(1, protocol.getProtocolID());
        ps.setString(2, protocol.getProtocolName());
        ps.setString(3, protocol.getDescription());
        ps.setString(4, protocol.getBiomolecule());
        ps.setString(5, concatString("$$", protocol.getFilesLocation()));
        ps.execute();

        //Add new entries into the treatment_owners table.
        for (User user : protocol.getOwners()) {
            //let's insert the relathionship USER <--> treatment
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO treatment_owners SET "
                    + " user_id = ?, treatment_id = ?");

            ps.setString(1, user.getUserID());
            ps.setString(2, protocol.getProtocolID());

            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        Protocol protocol = (Protocol) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE treatment SET "
                + " treatment_name = ?, description = ?, biomolecule = ?, files_location = ? "
                + "WHERE treatment_id = ?");

        ps.setString(1, protocol.getProtocolName());
        ps.setString(2, protocol.getDescription());
        ps.setString(3, protocol.getBiomolecule());
        ps.setString(4, concatString("$$", protocol.getFilesLocation()));
        ps.setString(5, protocol.getProtocolID());

        ps.execute();

        //Add new entries into the biocondition_owners table.
        for (User user : protocol.getOwners()) {
            //let's insert the relathionship USER <--> biocondition
            //TODO:THIS CODE DOES NOT REMOVE PREVIOUS OWNERS
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT IGNORE INTO treatment_owners SET "
                    + " user_id = ?, treatment_id = ?");
            ps.setString(1, user.getUserID());
            ps.setString(2, protocol.getProtocolID());
            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param objectID
     * @param otherParams
     * @return
     * @throws SQLException
     */
    @Override
    public Object findByID(String treatment_id, Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM treatment WHERE treatment_id = ?");
        ps.setString(1, treatment_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        Protocol protocol = null;
        if (rs.first()) {
            protocol = new Protocol();
            protocol.setProtocolID(rs.getString("treatment_id"));
            protocol.setProtocolName(rs.getString("treatment_name"));
            protocol.setBiomolecule(rs.getString("biomolecule"));
            protocol.setDescription(rs.getString("description"));
            protocol.setFilesLocation(rs.getString("files_location").split("\\$\\$"));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM treatment_owners WHERE treatment_id = ?");
            ps.setString(1, protocol.getProtocolID());

            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            while (rs.next()) {
                owners.add(new User(rs.getString(1), ""));
            }
            protocol.setOwners(owners.toArray(new User[owners.size()]));
        }

        return protocol;
    }

    /**
     *
     * @param otherParams
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM treatment");
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ResultSet rs2;
        ArrayList<Object> treatmentList = new ArrayList<Object>();
        Protocol protocol = null;

        while (rs.next()) {
            protocol = new Protocol();
            protocol.setProtocolID(rs.getString("treatment_id"));
            protocol.setProtocolName(rs.getString("treatment_name"));
            protocol.setBiomolecule(rs.getString("biomolecule"));
            protocol.setDescription(rs.getString("description"));
            protocol.setFilesLocation(rs.getString("files_location").split("\\$\\$"));

            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id FROM treatment_owners WHERE treatment_id = ?");
            ps.setString(1, protocol.getProtocolID());

            rs2 = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<User> owners = new ArrayList<User>();
            while (rs2.next()) {
                owners.add(new User(rs2.getString(1), ""));
            }
            protocol.setOwners(owners.toArray(new User[owners.size()]));

            treatmentList.add(protocol);
        }

        return treatmentList;
    }

    /**
     *
     * @return @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        //TODO: RETRUN ONLY THE FIRST
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT treatment_id FROM treatment ORDER BY treatment_id DESC");

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        String newID = null;
        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        if (previousID == null) {
            newID = "TR" + "00001";
        } else {
            newID = previousID.substring(previousID.length() - 5);
            newID = String.format("%05d", Integer.parseInt(newID) + 1);
            newID = "TR" + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 5);
            newID = String.format("%05d", Integer.parseInt(newID) + 1);
            newID = "TR" + newID;
        }
        return newID;
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM treatment "
                + "WHERE "
                + "treatment_id= ?");

        ps.setString(1, object_id);
        ps.execute();

        return true;
    }

    public boolean remove(String[] object_id_list) throws SQLException {
        for (String treatment_id : object_id_list) {
            remove(treatment_id);
        }
        return true;
    }
    
    public boolean removeOwnership(String user_id, String protocol_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM treatment_owners WHERE treatment_id = ? AND user_id = ?");
        ps.setString(1, protocol_id);
        ps.setString(2, user_id);
        ps.execute();
        return true;
    }
}
