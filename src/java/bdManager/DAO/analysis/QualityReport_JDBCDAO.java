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


package bdManager.DAO.analysis;

import bdManager.DAO.DAO;
import bdManager.DBConnectionManager;
import classes.analysis.QualityReport;
import java.sql.PreparedStatement;
import java.sql.ResultSet; 
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class QualityReport_JDBCDAO extends DAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        QualityReport quality_report = (QualityReport) object;

        //Insert the non_processed_data in the non_processed_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO quality_report VALUES "
                + "(?,?,?,?,?,?,?)");

        ps.setString(1, quality_report.getStudied_step_id());
        ps.setString(2, quality_report.getSoftware());
        ps.setString(3, quality_report.getSoftware_version());
        ps.setString(4, quality_report.getSoftware_configuration());
        ps.setString(5, quality_report.getResults());
        ps.setString(6, quality_report.getFiles_location());
        ps.setString(7, quality_report.getSubmissionDate().replaceAll("/", ""));
        ps.execute();
        return true;
    }

    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean update(Object object) throws SQLException {
        QualityReport quality_report = (QualityReport) object;

        //Insert the non_processed_data in the non_processed_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE INTO quality_report SET "
                + "software = ?, software_version = ?, software_configuration = ?, "
                + "results = ?, files_location = ?, submission_date = ? "
                + "WHERE studied_step_id = ?");

        ps.setString(1, quality_report.getSoftware());
        ps.setString(2, quality_report.getSoftware_version());
        ps.setString(3, quality_report.getSoftware_configuration());
        ps.setString(4, quality_report.getResults());
        ps.setString(5, quality_report.getFiles_location());
        ps.setString(6, quality_report.getSubmissionDate().replaceAll("/", ""));
        ps.setString(7, quality_report.getStudied_step_id());
        ps.execute();
        return true;
    }

    /**
     *
     * @param step_id
     * @param otherParams, not used
     * @return
     * @throws SQLException
     */
    @Override
    public QualityReport findByID(String step_id, Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT * FROM quality_report WHERE studied_step_id= ?");

        ps.setString(1, step_id);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps,true);
        QualityReport qualityReport = null;
        if (rs.first()) {
            qualityReport = new QualityReport(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6), rs.getString(7));
        }
        return qualityReport;
    }

    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    /**
     *
     * @return
     * @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new SQLException("Function not implemented");
    }

    //******************************************************************************************************************************************/
    //*** REMOVE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean remove(String object_id) throws SQLException {
        //Insert the non_processed_data in the non_processed_data table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM quality_report WHERE studied_step_id = ?");

        ps.setString(1, object_id);
        ps.execute();
        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
