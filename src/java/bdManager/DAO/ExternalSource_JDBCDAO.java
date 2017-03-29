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
package bdManager.DAO;

import bdManager.DBConnectionManager;
import classes.ExternalSource;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.ResultSet;


public class ExternalSource_JDBCDAO extends DAO {

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * INSERT FUNCTIONS                                                                         *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    @Override
    public boolean insert(Object object) throws SQLException {
        ExternalSource externalSource = (ExternalSource) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO external_sources SET name=?, type=?, url=?, description=?");

        ps.setString(1, externalSource.getName());
        ps.setString(2, externalSource.getType());
        ps.setString(3, externalSource.getUrl());
        ps.setString(4, externalSource.getDescription());
        ps.execute();

        return true;
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * UPDATE FUNCTIONS                                                                         *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    @Override
    public boolean update(Object object) throws SQLException {
        ExternalSource externalSource = (ExternalSource) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE external_sources SET name = ?, type=?, url=?, description=? WHERE source_id=?");

        ps.setString(1, externalSource.getName());
        ps.setString(2, externalSource.getType());
        ps.setString(3, externalSource.getUrl());
        ps.setString(4, externalSource.getDescription());
        ps.setString(5, externalSource.getSourceID());
        ps.execute();

        return true;
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * FIND FUNCTIONS                                                                           *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String type = null;
        if (otherParams != null) {
            type = (String) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM external_sources" + (type == null ? "" : " WHERE type='" + type +"'"));
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> externalSourcesList = new ArrayList<Object>();
        ExternalSource externalSource;
        while (rs.next()) {
            externalSource = new ExternalSource();
            externalSource.setSourceID(rs.getString("source_id"));
            externalSource.setName(rs.getString("name"));
            externalSource.setType(rs.getString("type"));
            externalSource.setUrl(rs.getString("url"));
            externalSource.setDescription(rs.getString("description"));
            externalSourcesList.add(externalSource);
        }
        return externalSourcesList;
    }

    @Override
    public ExternalSource findByID(String source_id, Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM external_sources WHERE source_id=" + source_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ExternalSource externalSource = null;
        while (rs.next()) {
            externalSource = new ExternalSource();
            externalSource.setSourceID(rs.getString("source_id"));
            externalSource.setName(rs.getString("name"));
            externalSource.setType(rs.getString("type"));
            externalSource.setUrl(rs.getString("url"));
            externalSource.setDescription(rs.getString("description"));
        }
        return externalSource;
    }

    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new SQLException("Function not implemented");
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE FUNCTIONS                                                                           *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/

    @Override
    public boolean remove(String source_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM external_sources WHERE source_id=?");
        ps.setString(1, source_id);
        ps.execute();
        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); 
    }
}
