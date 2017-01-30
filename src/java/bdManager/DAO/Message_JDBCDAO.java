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
import classes.Message;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.ResultSet;


public class Message_JDBCDAO extends DAO {

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * INSERT FUNCTIONS                                                                         *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    @Override
    public boolean insert(Object object) throws SQLException {
        Message message = (Message) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO messages SET user_id = ?, type=?, sender=?, subject= ?, content=?, date=?, is_read=?");

        ps.setString(1, message.getUserID());
        ps.setString(2, message.getType());
        ps.setString(3, message.getSender());
        ps.setString(4, message.getSubject());
        ps.setString(5, message.getContent());
        ps.setString(6, message.getDate());
        ps.setBoolean(7, message.isRead());
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
        Message message = (Message) object;

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE messages SET user_id = ?, type=?, sender=?, subject= ?, content=?, date=?, is_read=? WHERE message_id=?");

        ps.setString(1, message.getUserID());
        ps.setString(2, message.getType());
        ps.setString(3, message.getSender());
        ps.setString(4, message.getSubject());
        ps.setString(5, message.getContent());
        ps.setString(6, message.getDate());
        ps.setBoolean(7, message.isRead());
        ps.setString(8, message.getMessageID());
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
        String user_id = null;
        if (otherParams != null) {
            user_id = (String) otherParams[0];
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM messages" + (user_id == null ? "" : " WHERE user_id='" + user_id +"'"));
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        ArrayList<Object> messagesList = new ArrayList<Object>();
        Message message;
        while (rs.next()) {
            message = new Message();
            message.setUserID(rs.getString("user_id"));
            message.setMessageID(rs.getString("message_id"));
            message.setType(rs.getString("type"));
            message.setSender(rs.getString("sender"));
            message.setSubject(rs.getString("subject"));
            message.setContent(rs.getString("content"));
            message.setDate(rs.getString("date"));
            message.setRead(rs.getBoolean("is_read"));
            messagesList.add(message);
        }
        return messagesList;
    }

    @Override
    public Message findByID(String message_id, Object[] otherParams) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement("SELECT * FROM messages WHERE message_id=" + message_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);
        Message message = null;
        while (rs.next()) {
            message = new Message();
            message.setUserID(rs.getString("user_id"));
            message.setMessageID(rs.getString("message_id"));
            message.setType(rs.getString("type"));
            message.setSender(rs.getString("sender"));
            message.setSubject(rs.getString("subject"));
            message.setContent(rs.getString("content"));
            message.setDate(rs.getString("date"));
            message.setRead(rs.getBoolean("is_read"));
        }
        return message;
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
    public boolean remove(String message_id) throws SQLException {
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "DELETE FROM messages WHERE message_id=?");
        ps.setString(1, message_id);
        ps.execute();
        return true;
    }

    @Override
    public boolean remove(String[] object_id_list) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); 
    }
}
