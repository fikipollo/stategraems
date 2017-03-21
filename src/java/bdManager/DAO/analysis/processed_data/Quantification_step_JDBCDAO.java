///* ***************************************************************
// *  This file is part of STATegra EMS.
// *
// *  STATegra EMS is free software: you can redistribute it and/or 
// *  modify it under the terms of the GNU General Public License as
// *  published by the Free Software Foundation, either version 3 of 
// *  the License, or (at your option) any later version.
// * 
// *  STATegra EMS is distributed in the hope that it will be useful,
// *  but WITHOUT ANY WARRANTY; without even the implied warranty of
// *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// *  GNU General Public License for more details.
// * 
// *  You should have received a copy of the GNU General Public License
// *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
// * 
// *  More info http://bioinfo.cipf.es/stategraems
// *  Technical contact stategraemsdev@gmail.com
// *  *************************************************************** */
//package bdManager.DAO.analysis.processed_data;
//
//import bdManager.DBConnectionManager;
//import classes.analysis.processed_data.Quantification_step;
//import classes.analysis.processed_data.region_step.RegionElement;
//import java.sql.PreparedStatement;
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.util.ArrayList;
//
///**
// *
// * @author Rafa Hernández de Diego
// */
//public class Quantification_step_JDBCDAO extends ProcessedData_JDBCDAO {
//
//    //******************************************************************************************************************************************/
//    //*** INSERT FUNCTIONS *********************************************************************************************************************/
//    //******************************************************************************************************************************************/
//    @Override
//    public boolean insert(Object object) throws SQLException {
//        super.insert(object);
//        Quantification_step quantification_step = (Quantification_step) object;
//        PreparedStatement ps;
//
//        for (RegionElement region_element : quantification_step.getReferenceRegion()) {
//            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                    + "INSERT INTO region_elements SET "
//                    + "step_id = ?, region_name = ?, source = ?, files_location= ?, region_step_id = ?");
//            ps.setString(1, quantification_step.getStepID());
//            ps.setString(2, region_element.getRegion_name());
//            ps.setString(3, region_element.getSource());
//            ps.setString(4, region_element.getFiles_location());
//            ps.setString(5, region_element.getRegion_step_id());
//            ps.execute();
//        }
//
//        return true;
//    }
//
//    //******************************************************************************************************************************************/
//    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
//    //******************************************************************************************************************************************/
//    @Override
//    public boolean update(Object object) throws SQLException {
//        super.update(object);
//        Quantification_step quantification_step = (Quantification_step) object;
//        //TODO: NO SE ACTUALZIA EL FEATURE TYPE!!
//        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                + "DELETE FROM region_elements WHERE step_id = ?");
//        ps.setString(1, quantification_step.getStepID());
//        ps.execute();
//
//        for (RegionElement region_element : quantification_step.getReferenceRegion()) {
//            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                    + "INSERT INTO region_elements SET "
//                    + "step_id = ?, region_name = ?, source = ?, files_location= ?,region_step_id = ?");
//            ps.setString(1, quantification_step.getStepID());
//            ps.setString(2, region_element.getRegion_name());
//            ps.setString(3, region_element.getSource());
//            ps.setString(4, region_element.getFiles_location());
//            ps.setString(5, region_element.getRegion_step_id());
//            ps.execute();
//        }
//        return true;
//    }
//
//    //******************************************************************************************************************************************/
//    //*** GETTERS ******************************************************************************************************************************/
//    //******************************************************************************************************************************************/
//    @Override
//    public Quantification_step findByID(String step_id, Object[] otherParams) throws SQLException {
//        Quantification_step quantification_step = new Quantification_step();
//
//        Object[] params = {quantification_step};
//        super.findByID(step_id, params);
//
//        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                + "SELECT * FROM region_elements WHERE step_id = ?");
//
//        ps.setString(1, step_id);
//        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
//
//        ArrayList<RegionElement> regions = new ArrayList<RegionElement>();
//        RegionElement regionElement;
//        while (rs.next()) {
//            regionElement = new RegionElement();
//            regionElement.setSource(rs.getString("source"));
//            regionElement.setRegion_name(rs.getString("region_name"));
//            regionElement.setFiles_location(rs.getString("files_location"));
//            regionElement.setRegion_step_id(rs.getString("region_step_id"));
//
//            regions.add(regionElement);
//        }
//
//        quantification_step.setReferenceRegion(regions.toArray(new RegionElement[]{}));
//        return quantification_step;
//    }
//}
