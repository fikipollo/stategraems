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
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.DNaseseq;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class DNaseseq_JDBCDAO extends SequencingJDBCDAO {

    //******************************************************************************************************************************************/
    //*** INSERT FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);

        DNaseseq dnaseseq_rawdata = (DNaseseq) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + " is_for_footprinting = ?, restriction_enzyme = ? "
                + "WHERE rawdata_id = ?");
        int i = 1;
        ps.setBoolean(i, dnaseseq_rawdata.isForFootprinting());
        i++;
        ps.setString(i, dnaseseq_rawdata.getRestrictionEnzyme());
        i++;
        ps.setString(i, dnaseseq_rawdata.getRAWdataID());
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

        DNaseseq dnaseseq_rawdata = (DNaseseq) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + "is_for_footprinting = ?, restriction_enzyme = ? "
                + "WHERE rawdata_id= ?");

        ps.setBoolean(1, dnaseseq_rawdata.isForFootprinting());
        ps.setString(2, dnaseseq_rawdata.getRestrictionEnzyme());
        ps.setString(3, dnaseseq_rawdata.getRAWdataID());
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
    public DNaseseq findByID(String objectID, Object[] otherParams) throws SQLException {
        DNaseseq dnaseseq_rawdata = new DNaseseq();

        Object[] params = {dnaseseq_rawdata};
        super.findByID(objectID, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM sequencing_rawdata "
                + "WHERE rawdata_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            dnaseseq_rawdata.setIsForFootprinting(rs.getBoolean("is_for_footprinting"));
            dnaseseq_rawdata.setRestrictionEnzyme(rs.getString("restriction_enzyme"));

            return dnaseseq_rawdata;
        }

        return null;
    }

}
