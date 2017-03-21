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
import classes.samples.AnalyticalReplicate;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class AnalyticalReplicate_JDBCDAO extends DAO {

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
        AnalyticalReplicate analyticalReplicate = (AnalyticalReplicate) object;
        analyticalReplicate.setProtocolID("Unknown".equalsIgnoreCase(analyticalReplicate.getProtocolID()) ? null : analyticalReplicate.getProtocolID());

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO analyticalReplicate "
                + "VALUES "
                + "(?,?,?,?)");

        ps.setString(1, analyticalReplicate.getAnalytical_rep_id());
        ps.setString(2, analyticalReplicate.getAnalyticalReplicateName());
        ps.setString(3, analyticalReplicate.getBioreplicateID());
        ps.setString(4, analyticalReplicate.getProtocolID());
        ps.execute();

        return true;
    }

    public boolean insert(AnalyticalReplicate[] associatedAnalyticalReplicates) throws SQLException {
        boolean success = true;
        for (AnalyticalReplicate analyticalReplicate : associatedAnalyticalReplicates) {
            success &= insert(analyticalReplicate);
        }

        return success;
    }

    //******************************************************************************************************************************************/
    //*** UPDATERS    **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        AnalyticalReplicate analyticalReplicate = (AnalyticalReplicate) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE analyticalReplicate SET "
                + "analytical_rep_name = ?, treatment_id = ? "
                + "WHERE analytical_rep_id = ?");

        ps.setString(1, analyticalReplicate.getAnalyticalReplicateName());
        ps.setString(2, analyticalReplicate.getProtocolID());
        ps.setString(3, analyticalReplicate.getAnalytical_rep_id());
        ps.execute();

        return true;
    }

    public boolean update(AnalyticalReplicate[] associatedAnalyticalReplicates) throws SQLException {
        boolean success = true;
        for (AnalyticalReplicate analyticalReplicate : associatedAnalyticalReplicates) {
            success &= update(analyticalReplicate);
        }

        return success;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS     **************************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public Object findByID(String objectID, Object[] otherParams) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    /**
     *
     * @param otherParams, an array with the bioreplicate id
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String bioreplicate_id = null;
        if (otherParams != null) {
            bioreplicate_id = (String) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM analyticalReplicate WHERE bioreplicate_id = ?");
        ps.setString(1, bioreplicate_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);

        ArrayList<Object> analyticalReplicateList = new ArrayList<Object>();
        while (rs.next()) {
            analyticalReplicateList.add(new AnalyticalReplicate(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4)));
        }

        return analyticalReplicateList;
    }
    
    
    public ArrayList<String> findBy(String[] fieldNames, String[] fieldValues) throws SQLException {
        if(fieldNames.length < 1){
            return null;
        }
        
        String searchParams =  fieldNames[0] + " LIKE \"" + fieldValues[0] + "\"";
        
        for (int i =1; i < fieldNames.length; i++) {
            searchParams +=  "AND " + fieldNames[i] + " LIKE \"" + fieldValues[i] + "\"";
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT analytical_rep_id FROM analyticalReplicate WHERE " + searchParams);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<String> rawdataIdList = new ArrayList<String>();
        while (rs.next()) {
            rawdataIdList.add(rs.getString("analytical_rep_id"));
        }

        return rawdataIdList;
    }

    
    /**
     *
     * @param otherParams, an array with the bioreplicate id
     * @return
     * @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        String bioreplicate_id = null;
        if (otherParams != null) {
            bioreplicate_id = (String) otherParams[0];
        }

        //TODO: RETRUN ONLY THE FIRST
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT analytical_rep_id FROM analyticalReplicate WHERE bioreplicate_id = ? ORDER BY analytical_rep_id DESC ");
        ps.setString(1, bioreplicate_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);

        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        String newID = "";
        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        if (previousID == null) {
            newID = "AR" + bioreplicate_id.substring(2) + "." + "001";
        } else {
            newID = previousID.substring(previousID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "AR" + bioreplicate_id.substring(2) + "." + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "AR" + bioreplicate_id.substring(2) + "." + newID;
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
                + "DELETE FROM analyticalReplicate "
                + "WHERE "
                + "analytical_rep_id= ?");

        ps.setString(1, object_id);
        ps.execute();
        return true;
    }

    public boolean remove(String[] analyticalReplicate_id_list) throws SQLException {
        if (analyticalReplicate_id_list == null) {
            return false;
        }
        for (String analyticalReplicate_id : analyticalReplicate_id_list) {
            remove(analyticalReplicate_id);
        }
        return true;
    }
}
