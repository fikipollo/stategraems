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


package bdManager.DAO.analysis.non_processed_data.raw_data.ExtractionMethods;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.NuclearMagneticResonance;
import classes.analysis.non_processed_data.raw_data.SeparationMethods.SeparationMethod;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class NuclearMagneticResonance_JDBCDAO extends DAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {

        NuclearMagneticResonance nuclearMagneticResonance = (NuclearMagneticResonance) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO nuclear_magnetic_resonance SET "
                + "rawdata_id= ?, instrument_manufacturer= ?, instrument_model= ?, strength= ?, console_description= ?, "
                + "vt_control= ?, pulsed_field_strength= ?, max_gradient_strength= ?, n_shims= ?, n_channels= ?,"
                + "probe_type= ?, sample_state= ?, operation_mode= ?, tune_mode= ?, probe_gas= ?, "
                + "volume= ?, final_sample_status= ?, nmr_tube_type= ?, pH= ?, solvent= ?, "
                + "buffer= ?, resonant_frequency= ?, acquisition_description= ?, separation_method_type = ?");

        ps.setString(1, nuclearMagneticResonance.getRAWdataID());
        ps.setString(2, nuclearMagneticResonance.getInstrumentManufacturer());
        ps.setString(3, nuclearMagneticResonance.getInstrumentModel());
        ps.setString(4, nuclearMagneticResonance.getStrength());
        ps.setString(5, nuclearMagneticResonance.getConsoleDescription());
        ps.setString(6, nuclearMagneticResonance.getVtControl());
        ps.setString(7, nuclearMagneticResonance.getPulsedFieldStrength());
        ps.setString(8, nuclearMagneticResonance.getMaxGradientStrength());
        ps.setInt(9, nuclearMagneticResonance.getNshims());
        ps.setInt(10, nuclearMagneticResonance.getNchannels());
        ps.setString(11, nuclearMagneticResonance.getProbeType());
        ps.setString(12, nuclearMagneticResonance.getSampleState());
        ps.setString(13, nuclearMagneticResonance.getOperationMode());
        ps.setString(14, nuclearMagneticResonance.getTuneMode());
        ps.setString(15, nuclearMagneticResonance.getProbeGas());
        ps.setString(16, nuclearMagneticResonance.getVolume());
        ps.setString(17, nuclearMagneticResonance.getFinalSampleStatus());
        ps.setString(18, nuclearMagneticResonance.getNMRtubeType());
        ps.setString(19, nuclearMagneticResonance.getpH());
        ps.setString(20, nuclearMagneticResonance.getSolvent());
        ps.setString(21, nuclearMagneticResonance.getBuffer());
        ps.setString(22, nuclearMagneticResonance.getResonantFrequency());
        ps.setString(23, nuclearMagneticResonance.getAcquisitionDescription());
        ps.setString(24, nuclearMagneticResonance.getSeparationMethodType());
        ps.execute();

        SeparationMethod separationMethod = nuclearMagneticResonance.getSeparationMethod();
        if (separationMethod != null) {
            separationMethod.setRawdataID(nuclearMagneticResonance.getRAWdataID());
            DAOProvider.getDAO(separationMethod).insert(separationMethod);
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {

        NuclearMagneticResonance nuclearMagneticResonance = (NuclearMagneticResonance) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE nuclear_magnetic_resonance SET "
                + "instrument_manufacturer= ?, instrument_model= ?, strength= ?, console_description= ?, "
                + "vt_control= ?, pulsed_field_strength= ?, max_gradient_strength= ?, n_shims= ?, n_channels= ?,"
                + "probe_type= ?, sample_state= ?, operation_mode= ?, tune_mode= ?, probe_gas= ?, "
                + "volume= ?, final_sample_status= ?, nmr_tube_type= ?, pH= ?, solvent= ?, "
                + "buffer= ?, resonant_frequency= ?, acquisition_description= ?, separation_method_type = ? "
                + "WHERE rawdata_id= ?");

        ps.setString(1, nuclearMagneticResonance.getInstrumentManufacturer());
        ps.setString(2, nuclearMagneticResonance.getInstrumentModel());
        ps.setString(3, nuclearMagneticResonance.getStrength());
        ps.setString(4, nuclearMagneticResonance.getConsoleDescription());
        ps.setString(5, nuclearMagneticResonance.getVtControl());
        ps.setString(6, nuclearMagneticResonance.getPulsedFieldStrength());
        ps.setString(7, nuclearMagneticResonance.getMaxGradientStrength());
        ps.setInt(8, nuclearMagneticResonance.getNshims());
        ps.setInt(9, nuclearMagneticResonance.getNchannels());
        ps.setString(10, nuclearMagneticResonance.getProbeType());
        ps.setString(11, nuclearMagneticResonance.getSampleState());
        ps.setString(12, nuclearMagneticResonance.getOperationMode());
        ps.setString(13, nuclearMagneticResonance.getTuneMode());
        ps.setString(14, nuclearMagneticResonance.getProbeGas());
        ps.setString(15, nuclearMagneticResonance.getVolume());
        ps.setString(16, nuclearMagneticResonance.getFinalSampleStatus());
        ps.setString(17, nuclearMagneticResonance.getNMRtubeType());
        ps.setString(18, nuclearMagneticResonance.getpH());
        ps.setString(19, nuclearMagneticResonance.getSolvent());
        ps.setString(20, nuclearMagneticResonance.getBuffer());
        ps.setString(21, nuclearMagneticResonance.getResonantFrequency());
        ps.setString(22, nuclearMagneticResonance.getAcquisitionDescription());
        ps.setString(23, nuclearMagneticResonance.getSeparationMethodType());
        ps.setString(24, nuclearMagneticResonance.getRAWdataID());
        ps.execute();

        SeparationMethod separationMethod = nuclearMagneticResonance.getSeparationMethod();
        if (separationMethod != null) {
            separationMethod.setRawdataID(nuclearMagneticResonance.getRAWdataID());
            DAOProvider.getDAO(separationMethod).update(separationMethod);
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
        NuclearMagneticResonance nuclearMagneticResonance = null;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM nuclear_magnetic_resonance WHERE rawdata_id= ?");
        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true); 

        if (rs.first()) {
            nuclearMagneticResonance = new NuclearMagneticResonance();
            nuclearMagneticResonance.setRawdataID(objectID);
            nuclearMagneticResonance.setInstrumentManufacturer(rs.getString("instrument_manufacturer"));
            nuclearMagneticResonance.setInstrumentModel(rs.getString("instrument_model"));
            nuclearMagneticResonance.setStrength(rs.getString("strength"));
            nuclearMagneticResonance.setConsoleDescription(rs.getString("console_description"));
            nuclearMagneticResonance.setVtControl(rs.getString("vt_control"));
            nuclearMagneticResonance.setPulsedFieldStrength(rs.getString("pulsed_field_strength"));
            nuclearMagneticResonance.setMaxGradientStrength(rs.getString("max_gradient_strength"));
            nuclearMagneticResonance.setNshims(rs.getInt("n_shims"));
            nuclearMagneticResonance.setNchannels(rs.getInt("n_channels"));
            nuclearMagneticResonance.setProbeType(rs.getString("probe_type"));
            nuclearMagneticResonance.setSampleState(rs.getString("sample_state"));
            nuclearMagneticResonance.setOperationMode(rs.getString("operation_mode"));
            nuclearMagneticResonance.setTuneMode(rs.getString("tune_mode"));
            nuclearMagneticResonance.setProbeGas(rs.getString("probe_gas"));
            nuclearMagneticResonance.setVolume(rs.getString("volume"));
            nuclearMagneticResonance.setFinalSampleStatus(rs.getString("final_sample_status"));
            nuclearMagneticResonance.setNMRtubeType(rs.getString("nmr_tube_type"));
            nuclearMagneticResonance.setpH(rs.getString("pH"));
            nuclearMagneticResonance.setSolvent(rs.getString("solvent"));
            nuclearMagneticResonance.setBuffer(rs.getString("buffer"));
            nuclearMagneticResonance.setResonantFrequency(rs.getString("resonant_frequency"));
            nuclearMagneticResonance.setAcquisitionDescription(rs.getString("acquisition_description"));
            nuclearMagneticResonance.setSeparationMethodType(rs.getString("separation_method_type"));
        }

        //GET THE ASSOCIATED EXTRACTION METHOD
        if (!"None".equals(nuclearMagneticResonance.getSeparationMethodType())) {
            SeparationMethod separationMethod = (SeparationMethod) DAOProvider.getDAOByName(nuclearMagneticResonance.getSeparationMethodType()).findByID(nuclearMagneticResonance.getRAWdataID(), null);
            nuclearMagneticResonance.setSeparationMethod(separationMethod);
        }
        return nuclearMagneticResonance;
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
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM nuclear_magnetic_resonance WHERE rawdata_id= ?");
        ps.setString(1, object_id);
        ps.execute();
        return true;
    }
            
    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
