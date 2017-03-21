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
import classes.analysis.non_processed_data.raw_data.SeparationMethods.ColumnChromatography;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ColumnChromatography_JDBCDAO extends DAO {

    @Override
    public boolean insert(Object object) throws SQLException {

        ColumnChromatography columnChromatography = (ColumnChromatography) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO column_chromatography_rawdata SET "
                + "rawdata_id= ?, sample_description= ?, sample_processing= ?, sample_injection= ?, "
                + "column_chromatography_type = ?, column_manufacturer= ?, column_model= ?, separation_mode= ?, dimensions= ?, description_of_stationary_phase= ?, "
                + "additional_accessories= ?, combined_unit_manufacturer= ?, combined_unit_model= ?, "
                + "time= ?, gradient= ?, flow_rate= ?, temperature= ?, "
                + "pre_run_process_type= ?, pre_run_process_substance= ?, pre_run_process_time= ?, pre_run_process_flowrate= ?,"
                + "detection_equipment= ?, detection_type= ?, detection_equipment_settings= ?, detection_timescale= ?, detection_trace= ?");

        int i = 1;
        ps.setString(i, columnChromatography.getRAWdataID());
        i++;
        ps.setString(i, columnChromatography.getSampleDescription());
        i++;
        ps.setString(i, columnChromatography.getSampleProcessing());
        i++;
        ps.setString(i, columnChromatography.getSampleInjection());
        i++;
        ps.setString(i, columnChromatography.getColumnChromatographyType());
        i++;
        ps.setString(i, columnChromatography.getColumnManufacturer());
        i++;
        ps.setString(i, columnChromatography.getColumnModel());
        i++;
        ps.setString(i, columnChromatography.getSeparationMode());
        i++;
        ps.setString(i, columnChromatography.getDimensions());
        i++;
        ps.setString(i, columnChromatography.getDescriptionOfStationaryPhase());
        i++;
        ps.setString(i, columnChromatography.getAdditionalAccessories());
        i++;
        ps.setString(i, columnChromatography.getCombinedUnitManufacturer());
        i++;
        ps.setString(i, columnChromatography.getCombinedUnitModel());
        i++;
        ps.setString(i, columnChromatography.getTime());
        i++;
        ps.setString(i, columnChromatography.getGradient());
        i++;
        ps.setString(i, columnChromatography.getFlowRate());
        i++;
        ps.setString(i, columnChromatography.getTemperature());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessType());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessSubstance());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessTime());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessType());
        i++;
        ps.setString(i, columnChromatography.getDetectionEquipment());
        i++;
        ps.setString(i, columnChromatography.getDetectionType());
        i++;
        ps.setString(i, columnChromatography.getDetectionEquipmentSettings());
        i++;
        ps.setString(i, columnChromatography.getDetectionTimescale());
        i++;
        ps.setString(i, columnChromatography.getDetectionTrace());
        i++;
        ps.execute();

        if (columnChromatography.getMobilePhases() != null) {
            for (ColumnChromatography.MobilePhase mobilePhase : columnChromatography.getMobilePhases()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO mobile_phase SET "
                        + "rawdata_id= ?, name = ?, description= ?");

                ps.setString(1, columnChromatography.getRAWdataID());
                ps.setString(2, mobilePhase.getName());
                ps.setString(3, mobilePhase.getDescription());
                ps.execute();
            }
        }

        if (columnChromatography.getFractions() != null) {
            for (ColumnChromatography.Fraction fraction : columnChromatography.getFractions()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO fraction SET "
                        + "rawdata_id= ?, name = ?, description= ?");

                ps.setString(1, columnChromatography.getRAWdataID());
                ps.setString(2, fraction.getName());
                ps.setString(3, fraction.getDescription());
                ps.execute();
            }
        }

        return true;
    }

    @Override
    public boolean update(Object object) throws SQLException {

        ColumnChromatography columnChromatography = (ColumnChromatography) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE column_chromatography_rawdata SET "
                + "sample_description= ?, sample_processing= ?, sample_injection= ?, "
                + "column_chromatography_type = ?, column_manufacturer= ?, column_model= ?, separation_mode= ?, dimensions= ?, description_of_stationary_phase= ?, "
                + "additional_accessories= ?, combined_unit_manufacturer= ?, combined_unit_model= ?, "
                + "time= ?, gradient= ?, flow_rate= ?, temperature= ?, "
                + "pre_run_process_type= ?, pre_run_process_substance= ?, pre_run_process_time= ?, pre_run_process_flowrate= ?,"
                + "detection_equipment= ?, detection_type= ?, detection_equipment_settings= ?, detection_timescale= ?, detection_trace= ? "
                + "WHERE rawdata_id= ?");

        int i = 1;
        ps.setString(i, columnChromatography.getSampleDescription());
        i++;
        ps.setString(i, columnChromatography.getSampleProcessing());
        i++;
        ps.setString(i, columnChromatography.getSampleInjection());
        i++;
        ps.setString(i, columnChromatography.getColumnChromatographyType());
        i++;
        ps.setString(i, columnChromatography.getColumnManufacturer());
        i++;
        ps.setString(i, columnChromatography.getColumnModel());
        i++;
        ps.setString(i, columnChromatography.getSeparationMode());
        i++;
        ps.setString(i, columnChromatography.getDimensions());
        i++;
        ps.setString(i, columnChromatography.getDescriptionOfStationaryPhase());
        i++;
        ps.setString(i, columnChromatography.getAdditionalAccessories());
        i++;
        ps.setString(i, columnChromatography.getCombinedUnitManufacturer());
        i++;
        ps.setString(i, columnChromatography.getCombinedUnitModel());
        i++;
        ps.setString(i, columnChromatography.getTime());
        i++;
        ps.setString(i, columnChromatography.getGradient());
        i++;
        ps.setString(i, columnChromatography.getFlowRate());
        i++;
        ps.setString(i, columnChromatography.getTemperature());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessType());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessSubstance());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessTime());
        i++;
        ps.setString(i, columnChromatography.getPreRunProcessType());
        i++;
        ps.setString(i, columnChromatography.getDetectionEquipment());
        i++;
        ps.setString(i, columnChromatography.getDetectionType());
        i++;
        ps.setString(i, columnChromatography.getDetectionEquipmentSettings());
        i++;
        ps.setString(i, columnChromatography.getDetectionTimescale());
        i++;
        ps.setString(i, columnChromatography.getDetectionTrace());
        i++;
        ps.setString(i, columnChromatography.getRAWdataID());
        i++;

        ps.execute();

        //TODO: OTHER WWAY TO DO THIS?
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM mobile_phase WHERE rawdata_id= ?");
        ps.setString(1, columnChromatography.getRAWdataID());
        ps.execute();

        if (columnChromatography.getMobilePhases() != null) {
            for (ColumnChromatography.MobilePhase mobilePhase : columnChromatography.getMobilePhases()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO mobile_phase SET "
                        + "rawdata_id= ?, name = ?, description= ?");

                ps.setString(1, columnChromatography.getRAWdataID());
                ps.setString(2, mobilePhase.getName());
                ps.setString(3, mobilePhase.getDescription());
                ps.execute();
            }
        }

        //TODO: OTHER WWAY TO DO THIS?
        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM fraction WHERE rawdata_id= ?");
        ps.setString(1, columnChromatography.getRAWdataID());
        ps.execute();

        if (columnChromatography.getFractions() != null) {
            for (ColumnChromatography.Fraction fraction : columnChromatography.getFractions()) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                        + "INSERT INTO fraction SET "
                        + "rawdata_id= ?, name = ?, description= ?");

                ps.setString(1, columnChromatography.getRAWdataID());
                ps.setString(2, fraction.getName());
                ps.setString(3, fraction.getDescription());
                ps.execute();
            }
        }

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
        ColumnChromatography columnChromatography = null;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM column_chromatography_rawdata WHERE rawdata_id= ? ");
        ps.setString(1, objectID);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            columnChromatography = new ColumnChromatography();
            columnChromatography.setRawdataID(objectID);
            columnChromatography.setSampleDescription(rs.getString("sample_description"));
            columnChromatography.setSampleProcessing(rs.getString("sample_processing"));
            columnChromatography.setSampleInjection(rs.getString("sample_injection"));
            columnChromatography.setColumnChromatographyType(rs.getString("column_chromatography_type"));
            columnChromatography.setColumnManufacturer(rs.getString("column_manufacturer"));
            columnChromatography.setColumnModel(rs.getString("column_model"));
            columnChromatography.setSeparationMode(rs.getString("separation_mode"));
            columnChromatography.setDimensions(rs.getString("dimensions"));
            columnChromatography.setDescriptionOfStationaryPhase(rs.getString("description_of_stationary_phase"));
            columnChromatography.setAdditionalAccessories(rs.getString("additional_accessories"));
            columnChromatography.setCombinedUnitManufacturer(rs.getString("combined_unit_manufacturer"));
            columnChromatography.setCombinedUnitModel(rs.getString("combined_unit_model"));
            columnChromatography.setTime(rs.getString("time"));
            columnChromatography.setGradient(rs.getString("gradient"));
            columnChromatography.setFlowRate(rs.getString("flow_rate"));
            columnChromatography.setTemperature(rs.getString("temperature"));
            columnChromatography.setPreRunProcessType(rs.getString("pre_run_process_type"));
            columnChromatography.setPreRunProcessSubstance(rs.getString("pre_run_process_substance"));
            columnChromatography.setPreRunProcessTime(rs.getString("pre_run_process_time"));
            columnChromatography.setPreRunProcessFlowrate(rs.getString("pre_run_process_flowrate"));
            columnChromatography.setDetectionEquipment(rs.getString("detection_equipment"));
            columnChromatography.setDetectionType(rs.getString("detection_type"));
            columnChromatography.setDetectionEquipmentSettings(rs.getString("detection_equipment_settings"));
            columnChromatography.setDetectionTimescale(rs.getString("detection_timescale"));
            columnChromatography.setDetectionTrace(rs.getString("detection_trace"));

            // FIND ALL MOBILE PHASES
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT * FROM mobile_phase WHERE rawdata_id= ?");
            ps.setString(1, objectID);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<ColumnChromatography.MobilePhase> mobilePhases = new ArrayList<ColumnChromatography.MobilePhase>();
            ColumnChromatography.MobilePhase mobilePhase = null;
            while (rs.next()) {
                mobilePhase = columnChromatography.getNewMobilePhase();
                mobilePhase.setName(rs.getString("name"));
                mobilePhase.setDescription(rs.getString("description"));
                mobilePhases.add(mobilePhase);
            }
            columnChromatography.setMobilePhases(mobilePhases.toArray(new ColumnChromatography.MobilePhase[mobilePhases.size()]));

            // FIND ALL FRACTIONS
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "SELECT * FROM fraction WHERE rawdata_id= ?");
            ps.setString(1, objectID);
            rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

            ArrayList<ColumnChromatography.Fraction> fractions = new ArrayList<ColumnChromatography.Fraction>();
            ColumnChromatography.Fraction fraction = null;
            while (rs.next()) {
                fraction = columnChromatography.getNewFraction();
                fraction.setName(rs.getString("name"));
                fraction.setDescription(rs.getString("description"));
                fractions.add(fraction);
            }
            columnChromatography.setFractions(fractions.toArray(new ColumnChromatography.Fraction[fractions.size()]));
        }

        return columnChromatography;
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
                + "DELETE FROM column_chromatography_rawdata WHERE rawdata_id= ?");
        ps.setString(1, object_id);
        ps.execute();
        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
