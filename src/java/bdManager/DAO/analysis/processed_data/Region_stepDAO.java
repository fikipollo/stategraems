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
//
//
//package bdManager.DAO.analysis.processed_data;
//
//import bdManager.DBConnectionManager;
//import classes.analysis.processed_data.region_step.Region_calling_step;
//import java.sql.PreparedStatement;
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.util.ArrayList;
//
///**
// *
// * @author Rafa Hernández de Diego
// */
//public class Region_stepDAO extends ProcessedData_JDBCDAO {
//
//    /**
//     *
//     * @param otherParams, an array with "loadRecursive" flag
//     * @return
//     * @throws SQLException
//     */
//    @Override
//    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
//
//        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
//                + "SELECT t1.step_id, t2.analysis_id, t3.analysis_type FROM processed_data AS t1, "
//                + " analysis_has_steps AS t2, analysis as t3 WHERE t1.step_id = t2.step_id AND"
//                + " t1.processed_data_type LIKE 'region_%' AND t2.analysis_id = t3.analysis_id;");
//        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);
//
//        Region_calling_step step = null;
//        ArrayList<Object> regionList = new ArrayList<Object>();
//        while (rs.next()) {
//            step = new Region_calling_step();
//            step.setStepID(rs.getString("step_id"));
//            step.setAnalysisType(rs.getString("analysis_type"));
//            regionList.add(step);
//        }
//
//        return regionList;
//    }
//}
