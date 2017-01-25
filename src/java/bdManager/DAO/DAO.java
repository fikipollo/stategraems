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
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public abstract class DAO {

    public abstract boolean insert(Object object) throws SQLException;

    public abstract boolean update(Object object) throws SQLException;

    public abstract boolean remove(String object_id) throws SQLException;

    public abstract boolean remove(String[] object_id_list) throws SQLException;

    public abstract String getNextObjectID(Object[] otherParams) throws SQLException;

    public abstract Object findByID(String objectID, Object[] otherParams) throws SQLException;

    public abstract ArrayList<Object> findAll(Object[] otherParams) throws SQLException;

    public void closeConnection() throws SQLException {
        DBConnectionManager.getConnectionManager().closeConnection();
    }

    public void disableAutocommit() throws SQLException {
        DBConnectionManager.getConnectionManager().setAutoCommit(false);
    }

    public void doCommit() throws SQLException {
        DBConnectionManager.getConnectionManager().commit();
    }

    public void doRollback() throws SQLException {
        DBConnectionManager.getConnectionManager().rollback();
    }

    protected static String concatString(String separator, String[] strings) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < strings.length; i++) {
            sb.append(strings[i]);
            if (i < strings.length - 1) {
                sb.append(separator);
            }
        }
        return sb.toString();
    }
}
