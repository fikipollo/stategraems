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

import bdManager.DAO.analysis.non_processed_data.raw_data.SequencingJDBCDAO;
import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.ChIPseq;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ChIPseq_JDBCDAO extends SequencingJDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);

        ChIPseq chipseq_rawdata = (ChIPseq) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + " is_control_sample = ?, antibody_target = ?, antibody_target_type = ?, antibody_manufacturer = ? "
                + "WHERE rawdata_id = ?");
        int i = 1;
        ps.setBoolean(i, chipseq_rawdata.is_control_sample());
        i++;
        ps.setString(i, chipseq_rawdata.getAntibody_target());
        i++;
        ps.setString(i, chipseq_rawdata.getAntibody_target_type());
        i++;
        ps.setString(i, chipseq_rawdata.getAntibody_manufacturer());
        i++;
        ps.setString(i, chipseq_rawdata.getRAWdataID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);
        ChIPseq chipseq_rawdata = (ChIPseq) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + "is_control_sample = ?, antibody_target = ?, antibody_target_type = ?, antibody_manufacturer = ? "
                + "WHERE rawdata_id= ?");

        ps.setBoolean(1, chipseq_rawdata.is_control_sample());
        ps.setString(2, chipseq_rawdata.getAntibody_target());
        ps.setString(3, chipseq_rawdata.getAntibody_target_type());
        ps.setString(4, chipseq_rawdata.getAntibody_manufacturer());
        ps.setString(5, chipseq_rawdata.getRAWdataID());
        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTER FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param analysis_id
     * @param nestedQuery
     * @return
     */
    @Override
    public ChIPseq findByID(String objectID, Object[] otherParams) throws SQLException {
        ChIPseq chipseq_rawdata = new ChIPseq();

        Object[] params = {chipseq_rawdata};
        super.findByID(objectID, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM sequencing_rawdata "
                + "WHERE rawdata_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            //SET CHIPSEQ RAW DATA FIELDS
            chipseq_rawdata.setIsControlSample(rs.getBoolean("is_control_sample"));
            chipseq_rawdata.setAntibodyTarget(rs.getString("antibody_target"));
            chipseq_rawdata.setAntibodyTargetType(rs.getString("antibody_target_type"));
            chipseq_rawdata.setAntibodyManufacturer(rs.getString("antibody_manufacturer"));

            return chipseq_rawdata;
        }

        return null;
    }
}
