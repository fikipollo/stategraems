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
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.MassSpectrometry;
import classes.analysis.non_processed_data.raw_data.SeparationMethods.SeparationMethod;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class MassSpectrometry_JDBCDAO extends DAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {

        MassSpectrometry massSpectrometry = (MassSpectrometry) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO mass_spectrometry_rawdata SET "
                + "rawdata_id= ?, mass_spectrometer_manufacturer= ?, customizations= ?, ionization_source= ?, "
                + "supply_type= ?, interface_manufacturer_and_model= ?, sprayer_type_manufacturer_and_model= ?, other_electrospray_ionisation= ?, "
                + "plate_composition= ?, matrix_composition= ?, psd_summary= ?, laser_type_and_wavelength= ?, other_maldi= ?, "
                + "other_ionization_description= ?, mass_analyzer_type= ?, reflectron_status= ?, activation_location= ?, "
                + "gas_type= ?, activation_type= ?, acquisition_software= ?, acquisition_parameters= ?, "
                + "analysis_software= ?, analysis_parameters= ?, intensity_values= ?, ms_level= ?, "
                + "ion_mode= ?, additional_info= ?, separation_method_type = ? ");
        int i =1;
        ps.setString(i, massSpectrometry.getRAWdataID());i++;
        ps.setString(i, massSpectrometry.getMassSpectrometerManufacturer());i++;
        ps.setString(i, massSpectrometry.getCustomizations());i++;
        ps.setString(i, massSpectrometry.getIonizationSource());i++;
        ps.setString(i, massSpectrometry.getSupplyType());i++;
        ps.setString(i, massSpectrometry.getInterfaceManufacturerAndModel());i++;
        ps.setString(i, massSpectrometry.getSprayerTypeManufacturerAndModel());i++;
        ps.setString(i, massSpectrometry.getOtherElectrosprayIonisation());i++;
        ps.setString(i, massSpectrometry.getPlateComposition());i++;
        ps.setString(i, massSpectrometry.getMatrixComposition());i++;
        ps.setString(i, massSpectrometry.getPSDsummary());i++;
        ps.setString(i, massSpectrometry.getLaserTypeAndWavelength());i++;
        ps.setString(i, massSpectrometry.getOtherMALDI());i++;
        ps.setString(i, massSpectrometry.getOtherIonizationDescription());i++;
        ps.setString(i, massSpectrometry.getMassAnalyzerType());i++;
        ps.setString(i, massSpectrometry.getReflectronStatus());i++;
        ps.setString(i, massSpectrometry.getActivationLocation());i++;
        ps.setString(i, massSpectrometry.getGasType());i++;
        ps.setString(i, massSpectrometry.getActivationType());i++;
        ps.setString(i, massSpectrometry.getAcquisitionSoftware());i++;
        ps.setString(i, massSpectrometry.getAcquisitionParameters());i++;
        ps.setString(i, massSpectrometry.getAnalysisSoftware());i++;
        ps.setString(i, massSpectrometry.getAnalysisParameters());i++;
        ps.setString(i, massSpectrometry.getIntensityValues());i++;
        ps.setString(i, massSpectrometry.getMSlevel());i++;
        ps.setString(i, massSpectrometry.getIonMode());i++;
        ps.setString(i, massSpectrometry.getAdditionalInfo());i++;
        ps.setString(i, massSpectrometry.getSeparationMethodType());i++;
        ps.execute();

        SeparationMethod separationMethod = massSpectrometry.getSeparationMethod();
        if (separationMethod != null) {
            separationMethod.setRawdataID(massSpectrometry.getRAWdataID());
            DAOProvider.getDAO(separationMethod).insert(separationMethod);
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param massSpectrometry
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        MassSpectrometry massSpectrometry = (MassSpectrometry) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE mass_spectrometry_rawdata SET "
                + "mass_spectrometer_manufacturer= ?, customizations= ?, ionization_source= ?, "
                + "supply_type= ?, interface_manufacturer_and_model= ?, sprayer_type_manufacturer_and_model= ?, other_electrospray_ionisation= ?, "
                + "plate_composition= ?, matrix_composition= ?, psd_summary= ?, laser_type_and_wavelength= ?, other_maldi= ?, "
                + "other_ionization_description= ?, mass_analyzer_type= ?, reflectron_status= ?, activation_location= ?, "
                + "gas_type= ?, activation_type= ?, acquisition_software= ?, acquisition_parameters= ?, "
                + "analysis_software= ?, analysis_parameters= ?, intensity_values= ?, ms_level= ?, "
                + "ion_mode= ?, additional_info= ?, separation_method_type = ? "
                + "WHERE rawdata_id= ?");

        int i =1;
        ps.setString(i, massSpectrometry.getMassSpectrometerManufacturer());i++;
        ps.setString(i, massSpectrometry.getCustomizations());i++;
        ps.setString(i, massSpectrometry.getIonizationSource());i++;
        ps.setString(i, massSpectrometry.getSupplyType());i++;
        ps.setString(i, massSpectrometry.getInterfaceManufacturerAndModel());i++;
        ps.setString(i, massSpectrometry.getSprayerTypeManufacturerAndModel());i++;
        ps.setString(i, massSpectrometry.getOtherElectrosprayIonisation());i++;
        ps.setString(i, massSpectrometry.getPlateComposition());i++;
        ps.setString(i, massSpectrometry.getMatrixComposition());i++;
        ps.setString(i, massSpectrometry.getPSDsummary());i++;
        ps.setString(i, massSpectrometry.getLaserTypeAndWavelength());i++;
        ps.setString(i, massSpectrometry.getOtherMALDI());i++;
        ps.setString(i, massSpectrometry.getOtherIonizationDescription());i++;
        ps.setString(i, massSpectrometry.getMassAnalyzerType());i++;
        ps.setString(i, massSpectrometry.getReflectronStatus());i++;
        ps.setString(i, massSpectrometry.getActivationLocation());i++;
        ps.setString(i, massSpectrometry.getGasType());i++;
        ps.setString(i, massSpectrometry.getActivationType());i++;
        ps.setString(i, massSpectrometry.getAcquisitionSoftware());i++;
        ps.setString(i, massSpectrometry.getAcquisitionParameters());i++;
        ps.setString(i, massSpectrometry.getAnalysisSoftware());i++;
        ps.setString(i, massSpectrometry.getAnalysisParameters());i++;
        ps.setString(i, massSpectrometry.getIntensityValues());i++;
        ps.setString(i, massSpectrometry.getMSlevel());i++;
        ps.setString(i, massSpectrometry.getIonMode());i++;
        ps.setString(i, massSpectrometry.getAdditionalInfo());i++;
        ps.setString(i, massSpectrometry.getSeparationMethodType());i++;
        ps.setString(i, massSpectrometry.getRAWdataID());i++;
        ps.execute();


        //TODO: REMOVE PREVIOUS SEPARATION METHOD
        SeparationMethod separationMethod = massSpectrometry.getSeparationMethod();
        if (separationMethod != null) {
            separationMethod.setRawdataID(massSpectrometry.getRAWdataID());
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
        MassSpectrometry massSpectrometry = null;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM mass_spectrometry_rawdata WHERE rawdata_id= ?");
        ps.setString(1, objectID);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true); 

        if (rs.first()) {
            massSpectrometry = new MassSpectrometry();
            massSpectrometry.setRawdataID(objectID);
            massSpectrometry.setMassSpectrometerManufacturer(rs.getString("mass_spectrometer_manufacturer"));
            massSpectrometry.setCustomizations(rs.getString("customizations"));
            massSpectrometry.setIonizationSource(rs.getString("ionization_source"));
            massSpectrometry.setSupplyType(rs.getString("supply_type"));
            massSpectrometry.setInterfaceManufacturerAndModel(rs.getString("interface_manufacturer_and_model"));
            massSpectrometry.setSprayerTypeManufacturerAndModel(rs.getString("sprayer_type_manufacturer_and_model"));
            massSpectrometry.setOtherElectrosprayIonisation(rs.getString("other_electrospray_ionisation"));
            massSpectrometry.setPlateComposition(rs.getString("plate_composition"));
            massSpectrometry.setMatrixComposition(rs.getString("matrix_composition"));
            massSpectrometry.setPsdSummary(rs.getString("psd_summary"));
            massSpectrometry.setLaserTypeAndWavelength(rs.getString("laser_type_and_wavelength"));
            massSpectrometry.setOtherMALDI(rs.getString("other_maldi"));
            massSpectrometry.setOtherIonizationDescription(rs.getString("other_ionization_description"));
            massSpectrometry.setMassAnalyzerType(rs.getString("mass_analyzer_type"));
            massSpectrometry.setReflectronStatus(rs.getString("reflectron_status"));
            massSpectrometry.setActivationLocation(rs.getString("activation_location"));
            massSpectrometry.setGasType(rs.getString("gas_type"));
            massSpectrometry.setActivationType(rs.getString("activation_type"));
            massSpectrometry.setAcquisitionSoftware(rs.getString("acquisition_software"));
            massSpectrometry.setAcquisitionParameters(rs.getString("acquisition_parameters"));
            massSpectrometry.setAnalysisSoftware(rs.getString("analysis_software"));
            massSpectrometry.setAnalysisParameters(rs.getString("analysis_parameters"));
            massSpectrometry.setIntensityValues(rs.getString("intensity_values"));
            massSpectrometry.setMSlevel(rs.getString("ms_level"));
            massSpectrometry.setIonMode(rs.getString("ion_mode"));
            massSpectrometry.setAdditionalInfo(rs.getString("additional_info"));
            massSpectrometry.setSeparationMethodType(rs.getString("separation_method_type"));
        }

        //GET THE ASSOCIATED EXTRACTION METHOD
        if (!"None".equals(massSpectrometry.getSeparationMethodType())) {
            SeparationMethod separationMethod = (SeparationMethod) DAOProvider.getDAOByName(massSpectrometry.getSeparationMethodType()).findByID(massSpectrometry.getRAWdataID(), null);
            massSpectrometry.setSeparationMethod(separationMethod);
        }
        return massSpectrometry;
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
                + "DELETE FROM mass_spectrometry_rawdata WHERE rawdata_id= ?");
        ps.setString(1, object_id);
        ps.execute();
        return true;
    }
            
    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
