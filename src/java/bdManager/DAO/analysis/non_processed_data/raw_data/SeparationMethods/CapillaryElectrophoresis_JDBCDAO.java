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


package bdManager.DAO.analysis.non_processed_data.raw_data.SeparationMethods;

import bdManager.DAO.DAO;
import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.raw_data.SeparationMethods.CapillaryElectrophoresis;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class CapillaryElectrophoresis_JDBCDAO extends DAO {

    @Override
    public boolean insert(Object object) throws SQLException {
        CapillaryElectrophoresis capillaryElectrophoresis = (CapillaryElectrophoresis) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO capillary_electrophoresis_rawdata SET "
                + "rawdata_id= ?, experiment_type = ?, experiment_aim= ?, sample_description= ?, sample_solution= ?, sample_preparation= ?, "
                + "capillary_description= ?, capillary_source= ?, capillary_dimensions= ?, ce_temperature= ?, "
                + "auxiliary_data_channels= ?, duration= ?, run_description= ?");

        ps.setString(1, capillaryElectrophoresis.getRAWdataID());
        ps.setString(2, capillaryElectrophoresis.getExperimentType());
        ps.setString(3, capillaryElectrophoresis.getExperimentAim());
        ps.setString(4, capillaryElectrophoresis.getSampleDescription());
        ps.setString(5, capillaryElectrophoresis.getSampleSolution());
        ps.setString(6, capillaryElectrophoresis.getSamplePreparation());
        ps.setString(7, capillaryElectrophoresis.getCapillaryDescription());
        ps.setString(8, capillaryElectrophoresis.getCapillarySource());
        ps.setString(9, capillaryElectrophoresis.getCapillaryDimensions());
        ps.setString(10, capillaryElectrophoresis.getCEtemperature());
        ps.setString(11, capillaryElectrophoresis.getAuxiliaryDataChannels());
        ps.setString(12, capillaryElectrophoresis.getDuration());
        ps.setString(13, capillaryElectrophoresis.getRunDescription());
        ps.execute();

        return true;
    }

    @Override
    public boolean update(Object object) throws SQLException {
        CapillaryElectrophoresis capillaryElectrophoresis = (CapillaryElectrophoresis) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE capillary_electrophoresis_rawdata SET "
                + "experiment_type = ?, experiment_aim= ?, sample_description= ?, sample_solution= ?, sample_preparation= ?, "
                + "capillary_description= ?, capillary_source= ?, capillary_dimensions= ?, ce_temperature= ?, "
                + "auxiliary_data_channels= ?, duration= ?, run_description= ? "
                + "WHERE rawdata_id= ?");

        ps.setString(1, capillaryElectrophoresis.getExperimentType());
        ps.setString(2, capillaryElectrophoresis.getExperimentAim());
        ps.setString(3, capillaryElectrophoresis.getSampleDescription());
        ps.setString(4, capillaryElectrophoresis.getSampleSolution());
        ps.setString(5, capillaryElectrophoresis.getSamplePreparation());
        ps.setString(6, capillaryElectrophoresis.getCapillaryDescription());
        ps.setString(7, capillaryElectrophoresis.getCapillarySource());
        ps.setString(8, capillaryElectrophoresis.getCapillaryDimensions());
        ps.setString(9, capillaryElectrophoresis.getCEtemperature());
        ps.setString(10, capillaryElectrophoresis.getAuxiliaryDataChannels());
        ps.setString(11, capillaryElectrophoresis.getDuration());
        ps.setString(12, capillaryElectrophoresis.getRunDescription());
        ps.setString(13, capillaryElectrophoresis.getRAWdataID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTER FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/  
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public Object findByID(String objectID, Object[] otherParams) throws SQLException {
        CapillaryElectrophoresis capillaryElectrophoresis = null;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM capillary_electrophoresis_rawdata WHERE rawdata_id= ? ");
        ps.setString(1, objectID);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        if (rs.first()) {
            capillaryElectrophoresis = new CapillaryElectrophoresis();
            capillaryElectrophoresis.setRawdataID(objectID);
            capillaryElectrophoresis.setExperimentType(rs.getString("experiment_type"));
            capillaryElectrophoresis.setExperimentAim(rs.getString("experiment_aim"));
            capillaryElectrophoresis.setSampleDescription(rs.getString("sample_description"));
            capillaryElectrophoresis.setSampleSolution(rs.getString("sample_solution"));
            capillaryElectrophoresis.setSamplepreparation(rs.getString("sample_preparation"));
            capillaryElectrophoresis.setCapillaryDescription(rs.getString("capillary_description"));
            capillaryElectrophoresis.setCapillarySource(rs.getString("capillary_source"));
            capillaryElectrophoresis.setCapillaryDimensions(rs.getString("capillary_dimensions"));
            capillaryElectrophoresis.setCEtemperature(rs.getString("ce_temperature"));
            capillaryElectrophoresis.setAuxiliaryDataChannels(rs.getString("auxiliary_data_channels"));
            capillaryElectrophoresis.setDuration(rs.getString("duration"));
            capillaryElectrophoresis.setRunDescription(rs.getString("run_description"));
        }
        return capillaryElectrophoresis;
    }

    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    //******************************************************************************************************************************************/
    //*** REMOvE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/ 
    @Override
    public boolean remove(String object_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM capillary_electrophoresis_rawdata WHERE rawdata_id= ?");
        ps.setString(1, object_id);
        ps.execute();
        return true;
    }
            
    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
