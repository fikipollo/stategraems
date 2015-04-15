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
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.MRNAseq;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class MRNAseq_JDBCDAO extends SequencingJDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    @Override
    public boolean insert(Object object) throws SQLException {
        super.insert(object);

        MRNAseq mRNAseq_rawdata = (MRNAseq) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + " extracted_molecule = ?, rna_type = ?, strand_specificity = ?, selection = ? "
                + "WHERE rawdata_id = ?");
        int i = 1;
        ps.setString(i, mRNAseq_rawdata.getExtractedMolecule());
        i++;
        ps.setString(i, mRNAseq_rawdata.getRNAtype());
        i++;
        ps.setString(i, mRNAseq_rawdata.getStrandSpecificity());
        i++;
        ps.setString(i, mRNAseq_rawdata.getSelection());
        i++;
        ps.setString(i, mRNAseq_rawdata.getRAWdataID());
        ps.execute();
        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        super.update(object);

        MRNAseq mRNAseq_rawdata = (MRNAseq) object;
        //1.   Inserts a new entry in the calling_step table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE sequencing_rawdata SET "
                + "extracted_molecule = ?, rna_type = ?, strand_specificity = ?, selection = ? "
                + "WHERE rawdata_id= ?");

        ps.setString(1, mRNAseq_rawdata.getExtractedMolecule());
        ps.setString(2, mRNAseq_rawdata.getRNAtype());
        ps.setString(3, mRNAseq_rawdata.getStrandSpecificity());
        ps.setString(4, mRNAseq_rawdata.getSelection());
        ps.setString(5, mRNAseq_rawdata.getRAWdataID());

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
    public MRNAseq findByID(String objectID, Object[] otherParams) throws SQLException {
        MRNAseq mRNAseq = new MRNAseq();

        Object[] params = {mRNAseq};
        super.findByID(objectID, params);

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM sequencing_rawdata "
                + "WHERE rawdata_id = ?");

        ps.setString(1, objectID);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        if (rs.first()) {
            //SET CHIPSEQ RAW DATA FIELDS
            mRNAseq.setExtracted_molecule(rs.getString("extracted_molecule"));
            mRNAseq.setRNAtype(rs.getString("rna_type"));
            mRNAseq.setStrandSpecificity(rs.getString("strand_specificity"));
            mRNAseq.setSelection(rs.getString("selection"));

            return mRNAseq;
        }

        return null;
    }

}
