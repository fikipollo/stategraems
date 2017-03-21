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


package bdManager.DAO.analysis.non_processed_data.raw_data;

import bdManager.DAO.DAO;
import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.Sequencing;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class SequencingJDBCDAO extends DAO {

    @Override
    public boolean insert(Object object) throws SQLException {
        Sequencing sequencing = (Sequencing) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO sequencing_rawdata SET "
                + "rawdata_id = ?, layout= ?,  orientation= ?,  nominal_length= ?,  nominal_length_stdev= ?,  "
                + "avg_sequence_length= ?,  avg_sequencing_deep= ?,  platform_family= ?,  platform_model= ?,  base_calls= ?, "
                + "pooling_strategy= ?,  pooling_strategy_description= ?,  slide_id= ?,  lane_number= ?,  library_construction_protocol= ?");

        ps.setString(1, sequencing.getRAWdataID());
        ps.setString(2, sequencing.getLayout());
        ps.setString(3, sequencing.getOrientation());
        ps.setInt(4, sequencing.getNominal_length());
        ps.setInt(5, sequencing.getNominal_length_stdev());
        ps.setInt(6, sequencing.getAvg_sequence_length());
        ps.setDouble(7, sequencing.getAvg_sequencing_depth());
        ps.setString(8, sequencing.getPlatform_family());
        ps.setString(9, sequencing.getPlatform_model());
        ps.setString(10, sequencing.getBase_calls());
        ps.setString(11, sequencing.getPooling_strategy());
        ps.setString(12, sequencing.getPooling_strategy_description());
        ps.setString(13, sequencing.getSlide_id());
        ps.setString(14, sequencing.getLane_number());
        ps.setString(15, sequencing.getLibrary_construction_protocol());
        ps.execute();
        return true;
    }

    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        Sequencing sequencing = (Sequencing) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + "layout= ?,  orientation= ?,  nominal_length= ?,  nominal_length_stdev= ?,  "
                + "avg_sequence_length= ?,  avg_sequencing_deep= ?,  platform_family= ?,  platform_model= ?,  base_calls= ?, "
                + "pooling_strategy= ?,  pooling_strategy_description= ?,  slide_id= ?,  lane_number= ?,  library_construction_protocol= ? "
                + "WHERE rawdata_id = ?");

        ps.setString(1, sequencing.getLayout());
        ps.setString(2, sequencing.getOrientation());
        ps.setInt(3, sequencing.getNominal_length());
        ps.setInt(4, sequencing.getNominal_length_stdev());
        ps.setInt(5, sequencing.getAvg_sequence_length());
        ps.setDouble(6, sequencing.getAvg_sequencing_depth());
        ps.setString(7, sequencing.getPlatform_family());
        ps.setString(8, sequencing.getPlatform_model());
        ps.setString(9, sequencing.getBase_calls());
        ps.setString(10, sequencing.getPooling_strategy());
        ps.setString(11, sequencing.getPooling_strategy_description());
        ps.setString(12, sequencing.getSlide_id());
        ps.setString(13, sequencing.getLane_number());
        ps.setString(14, sequencing.getLibrary_construction_protocol());
        ps.setString(15, sequencing.getRAWdataID());
        ps.execute();
        return true;
    }

    /**
     *
     * @return
     * @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new SQLException("Function not implemented");
    }

    /**
     * 
     * @param objectID
     * @param otherParams, an array with a already created sequencing instance
     * @return
     * @throws SQLException 
     */
    @Override
    public Object findByID(String objectID,  Object[] otherParams) throws SQLException {
        Sequencing sequencing_instance = null;
        if(otherParams != null){
            sequencing_instance = (Sequencing) otherParams[0];
        }else{
            sequencing_instance = new Sequencing();
        }
        
         PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM sequencing_rawdata "
                + "WHERE rawdata_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true); 

        if (rs.first()) {         //SET SEQUENCING RAW DATA FIELDS
            sequencing_instance.setLayout(rs.getString("layout"));
            sequencing_instance.setOrientation(rs.getString("orientation"));
            sequencing_instance.setNominal_length(rs.getInt("nominal_length"));
            sequencing_instance.setNominal_length_stdev(rs.getInt("nominal_length_stdev"));
            sequencing_instance.setAvg_sequence_length(rs.getInt("avg_sequence_length"));
            sequencing_instance.setAvg_sequencing_depth(rs.getDouble("avg_sequencing_deep"));
            sequencing_instance.setPlatformFamily(rs.getString("platform_family"));
            sequencing_instance.setPlatformModel(rs.getString("platform_model"));
            sequencing_instance.setBaseCalls(rs.getString("base_calls"));
            sequencing_instance.setPoolingStrategy(rs.getString("pooling_strategy"));
            sequencing_instance.setPoolingStrategyDescription(rs.getString("pooling_strategy_description"));
            sequencing_instance.setSlideID(rs.getString("slide_ID"));
            sequencing_instance.setLane_number(rs.getString("lane_number"));
            sequencing_instance.setLibrary_construction_protocol(rs.getString("library_construction_protocol"));

            return sequencing_instance;
        }

        return null;
    }


    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        //NOT NEEDED BECAUSE OF THE FOREIGN KEYS
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
