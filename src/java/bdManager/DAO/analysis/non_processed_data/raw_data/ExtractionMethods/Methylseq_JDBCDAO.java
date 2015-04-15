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
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.Methylseq;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Methylseq_JDBCDAO extends SequencingJDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);

        Methylseq methylseq_rawdata = (Methylseq) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + " protocol = ?, strand_specificity = ?, selection = ? "
                + "WHERE rawdata_id = ?");
        int i = 1;
        ps.setString(i, methylseq_rawdata.getProtocol());
        i++;
        ps.setString(i, methylseq_rawdata.getStrand_specificity());
        i++;
        ps.setString(i, methylseq_rawdata.getSelection());
        i++;
        ps.setString(i, methylseq_rawdata.getRAWdataID());

        ps.execute();

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);

        Methylseq methylseq_rawdata = (Methylseq) object;

        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + "protocol = ?, strand_specificity = ?, selection = ? "
                + "WHERE rawdata_id= ?");

        ps.setString(1, methylseq_rawdata.getProtocol());
        ps.setString(2, methylseq_rawdata.getStrand_specificity());
        ps.setString(3, methylseq_rawdata.getSelection());
        ps.setString(4, methylseq_rawdata.getRAWdataID());
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
    public Methylseq findByID(String objectID, Object[] otherParams) throws SQLException {
        Methylseq methylseq_rawdata = new Methylseq();

        Object[] params = {methylseq_rawdata};
        super.findByID(objectID, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM sequencing_rawdata "
                + "WHERE rawdata_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            methylseq_rawdata.setProtocol(rs.getString("protocol"));
            methylseq_rawdata.setStrand_specificity(rs.getString("strand_specificity"));
            methylseq_rawdata.setSelection(rs.getString("selection"));

            return methylseq_rawdata;
        }

        return null;
    }
}
