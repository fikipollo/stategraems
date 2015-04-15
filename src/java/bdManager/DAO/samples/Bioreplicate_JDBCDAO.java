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
import classes.samples.AnalyticalReplicate;
import classes.samples.Batch;
import classes.samples.Bioreplicate;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import common.BlockedElementsManager;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Bioreplicate_JDBCDAO extends DAO {

    //******************************************************************************************************************************************/
    //*** INSERT FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param associatedBioreplicates
     * @return
     */
    public boolean insert(Bioreplicate[] associatedBioreplicates) throws SQLException {
        for (Bioreplicate bioreplicate : associatedBioreplicates) {
            insert(bioreplicate);
        }

        return true;
    }

    @Override
    public boolean insert(Object object) throws SQLException {
        if (object instanceof Bioreplicate[]) {
            return insert((Bioreplicate[]) object);
        }

        Bioreplicate bioreplicate = (Bioreplicate) object;


        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO bioreplicate "
                + "VALUES "
                + "(?,?,?,?)");

        ps.setString(1, bioreplicate.getBioConditionID());
        ps.setString(2, bioreplicate.getBioreplicateID());
        ps.setString(3, bioreplicate.getBioreplicate_name());
        ps.setString(4, bioreplicate.getAssociatedBatchID());
        ps.execute();

        //Add new entries into analytical_rep table.
        if (bioreplicate.getAssociatedAnalyticalReplicates() != null) {
            new AnalyticalReplicate_JDBCDAO().insert(bioreplicate.getAssociatedAnalyticalReplicates());
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        Bioreplicate bioreplicate = (Bioreplicate) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE bioreplicate SET "
                + "bioreplicate_name = ?, batch_id = ? "
                + "WHERE bioreplicate_id = ?");

        ps.setString(1, bioreplicate.getBioreplicate_name());
        ps.setString(2, bioreplicate.getAssociatedBatchID());
        ps.setString(3, bioreplicate.getBioreplicateID());
        ps.execute();

        //Add new entries into analytical_rep table.
//        DAOProvider.getDAOByName("AnalyticalReplicate").update(bioreplicate.getAssociatedAnalyticalReplicates());

        return true;
    }

    /**
     *
     * @param associatedBioreplicates
     * @return
     */
    public boolean update(Bioreplicate[] associatedBioreplicates) throws SQLException {
        for (Bioreplicate bioreplicate : associatedBioreplicates) {
            update(bioreplicate);
        }
        return true;
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
     * @param otherParams an array with the biocondition_id and the loadRecursive flag
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        boolean loadRecursive = false;
        String biocondition_id = null;
        if (otherParams != null) {
            biocondition_id = (String) otherParams[0];
            loadRecursive = (Boolean) otherParams[1];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM bioreplicate WHERE biocondition_id = ?");
        ps.setString(1, biocondition_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);

        ArrayList<Object> bioreplicatesList = new ArrayList<Object>();
        Bioreplicate bioreplicate_tmp = null;
        while (rs.next()) {
            bioreplicate_tmp = new Bioreplicate(rs.getString(1), rs.getString(2), rs.getString(3));
            if (rs.getString(4) != null) {
                bioreplicate_tmp.setAssociatedBatch((Batch) (DAOProvider.getDAOByName("Batch").findByID(rs.getString(4), null)));
            }
            bioreplicatesList.add(bioreplicate_tmp);
        }
        if (!bioreplicatesList.isEmpty() && loadRecursive) {
            DAO analytical_rep_dao_instance = DAOProvider.getDAOByName("AnalyticalReplicate");
            for (Object bioreplicate : bioreplicatesList) {
                Object[] params = {((Bioreplicate) bioreplicate).getBioreplicateID()};
                ArrayList<Object> associatedAnalyticalReplicates = analytical_rep_dao_instance.findAll(params);
                ((Bioreplicate) bioreplicate).setAssociatedAnalyticalReplicates(associatedAnalyticalReplicates.toArray(new AnalyticalReplicate[associatedAnalyticalReplicates.size()]));
            }
        }

        return bioreplicatesList;
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
                + "SELECT bioreplicate_id FROM bioreplicate WHERE " + searchParams);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<String> bioreplicateIdList = new ArrayList<String>();
        while (rs.next()) {
            bioreplicateIdList.add(rs.getString("bioreplicate_id"));
        }

        return bioreplicateIdList;
    }

    
    /**
     *
     * @param otherParams, an array with the biocondition_id
     * @return
     * @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        String biocondition_id = null;
        if (otherParams != null) {
            biocondition_id = (String) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT bioreplicate_id FROM bioreplicate WHERE biocondition_id = ? ORDER BY bioreplicate_id DESC ");
        ps.setString(1, biocondition_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);

        String previousID = null;

        if (rs.first()) {
            previousID = rs.getString(1);
        }

        String newID = null;
        //IF NO ENTRIES WERE FOUND IN THE DB, THEN WE RETURN THE FIRST ID 		
        if (previousID == null) {
            newID = "BR" + biocondition_id.substring(2) + "." + "001";
        } else {
            newID = previousID.substring(previousID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "BR" + biocondition_id.substring(2) + "." + newID;
        }
        while (!BlockedElementsManager.getBlockedElementsManager().lockID(newID)) {
            newID = newID.substring(newID.length() - 3);
            newID = String.format("%03d", Integer.parseInt(newID) + 1);
            newID = "BR" + biocondition_id.substring(2) + "." + newID;
        }

        return newID;
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        //TODO: DELETE ASSOCIATED ANALYTICAL REPLICATES --> ON DELETE ON CASCADE?
        //TODO: DELETE ASSOCIATED ANALYISIS --> ON DELETE ON CASCADE?
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM bioreplicate "
                + "WHERE "
                + "bioreplicate_id= ?");

        ps.setString(1, object_id);
        ps.execute();

        return true;
    }

    public boolean remove(String[] object_id_list) throws SQLException {
        if(object_id_list == null){
            return false;
        }
        for (String bioreplicate_id : object_id_list) {
            remove(bioreplicate_id);
        }

        return true;
    }
}
