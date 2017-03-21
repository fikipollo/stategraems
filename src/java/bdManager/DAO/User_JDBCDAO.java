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
import classes.User;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.ResultSet;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class User_JDBCDAO extends DAO {

    @Override
    public boolean insert(Object object) throws SQLException {
        User user = (User) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO users SET "
                + " user_id = ?, password=?, email= ?");

        ps.setString(1, user.getUserID());
        ps.setString(2, user.getPassword());
        ps.setString(3, user.getEmail());
        ps.execute();

        return true;
    }

//****************************************************************************************
//****************************************************************************************
//***UPDATERS     ************************************************************************
//****************************************************************************************
//****************************************************************************************
    /**
     *
     * @param user
     * @param nestedTransaction
     * @return
     */
    @Override
    public boolean update(Object object) throws SQLException {
        User user = (User) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE users SET "
                + "email = ? "
                + (user.getPassword() != null ? ", password = ? " : "")
                + "WHERE user_id=?");

        int pos = 1;
        ps.setString(pos, user.getEmail());
        pos++;
        if (user.getPassword() != null) {
            ps.setString(pos, user.getPassword());
            pos++;
        }
        ps.setString(pos, user.getUserID());
        ps.execute();

        return true;
    }

//****************************************************************************************
//****************************************************************************************
//***GETTER       ************************************************************************
//****************************************************************************************
//****************************************************************************************
    /**
     *
     * @param otherParams
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT user_id, email FROM users");
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> usersList = new ArrayList<Object>();
        while (rs.next()) {
            usersList.add(new User(rs.getString(1), rs.getString(2)));
        }
        return usersList;
    }

    @Override
    public User findByID(String user_id, Object[] otherParams) throws SQLException {
        String password = null;
        boolean last_experiment = false;
        boolean isEmail = false;

        if (otherParams != null) {
            password = (String) otherParams[0];
            last_experiment = (Boolean) otherParams[1];
            isEmail = (Boolean) otherParams[2];
        }
        String searchBy;
        if (isEmail) {
            searchBy = " email = ?";
        } else {
            searchBy = " user_id = ?";
        }
        
        String sqlStatement = "SELECT user_id, email FROM users WHERE" + searchBy;

        if (password != null) {
            sqlStatement += " AND password = ?";
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(sqlStatement);

        ps.setString(1, user_id);
        if (password != null) {
            ps.setString(2, password);
        }

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        User user = null;

        if (rs.first()) {
            user = new User(rs.getString(1), rs.getString(2));

            if (last_experiment) {
                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT last_experiment_id FROM users WHERE user_id = ?");
                ps.setString(1, user.getUserID());
                rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                if (rs.first() && rs.getString(1) != null) {
                    user.setLastExperimentID(rs.getString(1));
                } else {
                    ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT experiment_id FROM experiment_owners WHERE user_id = ? LIMIT 1");
                    ps.setString(1, user.getUserID());
                    rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                    if (rs.first()) {
                        user.setLastExperimentID(rs.getString(1));
                        ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                                + "UPDATE users SET last_experiment_id= ? WHERE"  + searchBy);
                        ps.setString(1, rs.getString(1));
                        ps.setString(2, user.getUserID());
                        ps.execute();
                    }
                }

                ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT title FROM experiments WHERE experiment_id=?");
                ps.setString(1, user.getLastExperimentID());
                rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
                if (rs.first()) {
                    user.setLastExperimentName(rs.getString(1));
                }
            }

        }
        return user;
    }

    /**
     *
     * @return @throws SQLException
     */
    @Override
    public String getNextObjectID(Object[] otherParams) throws SQLException {
        throw new SQLException("Function not implemented");
    }

//****************************************************************************************
//***REMOVERS     ************************************************************************
//****************************************************************************************
    /**
     *
     * @param user_id
     * @param nestedTransaction
     * @return
     */
    @Override
    public boolean remove(String user_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM users "
                + "WHERE user_id=?");
        ps.setString(1, user_id);
        ps.execute();
        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
