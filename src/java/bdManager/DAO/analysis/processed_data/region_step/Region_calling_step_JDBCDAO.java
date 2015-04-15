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
package bdManager.DAO.analysis.processed_data.region_step;

import bdManager.DAO.analysis.processed_data.ProcessedData_JDBCDAO;
import bdManager.DBConnectionManager;
import classes.analysis.processed_data.region_step.RegionElement;
import classes.analysis.processed_data.region_step.Region_calling_step;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Region_calling_step_JDBCDAO extends ProcessedData_JDBCDAO {

    //******************************************************************************************************************************************/
    //*** INSERT FUNCTIONS *********************************************************************************************************************/
    //*****************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);
        Region_calling_step region_calling_step = (Region_calling_step) object;
        PreparedStatement ps;

        for (RegionElement region_element : region_calling_step.getReferenceRegion()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO region_elements SET "
                    + "step_id = ?, region_name = ?, source = ?, files_location= ?, region_step_id = ?");
            ps.setString(1, region_calling_step.getStepID());
            ps.setString(2, region_element.getRegion_name());
            ps.setString(3, region_element.getSource());
            ps.setString(4, region_element.getFiles_location());
            ps.setString(5, region_element.getRegion_step_id());
            ps.execute();
        }

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);

        Region_calling_step region_calling_step = (Region_calling_step) object;
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM region_elements WHERE step_id = ?");
        ps.setString(1, region_calling_step.getStepID());
        ps.execute();

        for (RegionElement region_element : region_calling_step.getReferenceRegion()) {
            ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                    + "INSERT INTO region_elements SET "
                    + "step_id = ?, region_name = ?, source = ?, files_location= ?,region_step_id = ?");
            ps.setString(1, region_calling_step.getStepID());
            ps.setString(2, region_element.getRegion_name());
            ps.setString(3, region_element.getSource());
            ps.setString(4, region_element.getFiles_location());
            ps.setString(5, region_element.getRegion_step_id());
            ps.execute();
        }
        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS                                        ***************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public Region_calling_step findByID(String step_id, Object[] otherParams) throws SQLException {
        Region_calling_step step = new Region_calling_step();
        Object[] params = {step};
        super.findByID(step_id, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM region_elements WHERE step_id = ?");

        ps.setString(1, step_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<RegionElement> regions = new ArrayList<RegionElement>();
        RegionElement regionElement;
        while (rs.next()) {
            regionElement = new RegionElement();
            regionElement.setSource(rs.getString("source"));
            regionElement.setRegion_name(rs.getString("region_name"));
            regionElement.setFiles_location(rs.getString("files_location"));
            regionElement.setRegion_step_id(rs.getString("region_step_id"));

            regions.add(regionElement);
        }

        step.setReferenceRegion(regions.toArray(new RegionElement[]{}));

        return step;
    }
}
