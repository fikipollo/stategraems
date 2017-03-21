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
//import classes.analysis.processed_data.Merging_step;
//import java.sql.SQLException;
///**
// *
// * @author Rafa Hernández de Diego
// */
//public class Merging_step_JDBCDAO extends ProcessedData_JDBCDAO {
//    //******************************************************************************************************************************************/
//    //*** GETTERS ******************************************************************************************************************************/
//    //******************************************************************************************************************************************/
//     @Override
//    public Merging_step findByID(String step_id, Object[] otherParams) throws SQLException {
//        Merging_step merging_step = new Merging_step();
//        Object[] params = {merging_step};
//        super.findByID(step_id, params);
//        return merging_step;
//    }
//}
