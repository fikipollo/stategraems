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
package bdManager;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.PreparedStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;
import java.util.Properties;
import javax.sql.DataSource;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.dbcp.BasicDataSourceFactory;

/**
 *
 * @author
 */
public class DBConnectionManager {

    private static DBConnectionManager connectionManager_instance = null;
    private HashMap<Long, Connection> connections = null;
    private DataSource connectionPool;
    private static String data_location;
    Properties properties;
    
    private DBConnectionManager() throws SQLException {
        initConnectionManager();
    }

    private void initConnectionManager() throws SQLException {
        try {
            connections = new HashMap<Long, Connection>();
            properties = new Properties();
            properties.load(new FileReader(this.data_location + "/db_config.properties"));
            properties.setProperty("password", new String(Base64.decodeBase64(properties.getProperty("password"))));
            connectionPool = BasicDataSourceFactory.createDataSource(properties);
        } catch (Exception ex) {
            System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > FAILED TRYING TO OPEN A NEW CONNECTIONS POOL");
            StringWriter sw = new StringWriter();
            ex.printStackTrace(new PrintWriter(sw));
            String exceptionTraceAsString = sw.toString();
            System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > Exception " + ex.getClass().getName() + " TRACE: " + exceptionTraceAsString);

            throw new SQLException("Unable to connect with DATABASE");
        }
    }

//    private void cleanConnectionManager() throws SQLException {
//        try {
//            //CLOSE ALL CONENCTIONS
//            for (Long id : connections.keySet()) {
//                this.connections.get(id).close();
//            }
//
//            this.connections.clear();
//            connectionPool = null;
//        } catch (Exception ex) {
//            System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > FAILED TRYING TO CLOSE ALL CONNECTIONS POOL");
//            StringWriter sw = new StringWriter();
//            ex.printStackTrace(new PrintWriter(sw));
//            String exceptionTraceAsString = sw.toString();
//            System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > Exception " + ex.getClass().getName() + " TRACE: " + exceptionTraceAsString);
//
//            throw new SQLException("Unable to close the DATABASE connection");
//        }
//    }

    public static String getDataLocation() {
        return DBConnectionManager.data_location;
    }

    public static void setDataLocation(String data_location) {
        DBConnectionManager.data_location = data_location;
    }

    public Properties getProperties() {
        return properties;
    }

    private synchronized static void createConnectionManager() throws SQLException {
        if (connectionManager_instance == null) {
            connectionManager_instance = new DBConnectionManager();
        }
    }

    public static DBConnectionManager getConnectionManager() throws SQLException {
        if (connectionManager_instance == null) {
            createConnectionManager();
        }
        return connectionManager_instance;
    }

//    public synchronized static void reloadConnectionManager() throws SQLException {
//        if (connectionManager_instance == null) {
//            connectionManager_instance = new DBConnectionManager();
//            return;
//        }
//        connectionManager_instance.cleanConnectionManager();
//        connectionManager_instance.initConnectionManager();
//    }

    public void closeConnection() throws SQLException {
        long threadID = Thread.currentThread().getId();
        Connection connection = this.connections.get(threadID);

        if (connection != null) {
            if (!connection.isClosed()) {
                connection.close();
            }
            this.connections.remove(threadID);
        } else {
            throw new SQLException("Session for thread " + threadID + " is not opened.");
        }
    }

    public synchronized Connection openConnection() throws SQLException {
        long threadID = Thread.currentThread().getId();
        Connection connection = this.connectionPool.getConnection();
        connections.put(threadID, connection);
        return connection;
    }

    public Connection getConnection() throws SQLException {
        long threadID = Thread.currentThread().getId();
        Connection connection = this.connections.get(threadID);
        if (connection != null) {
            if (connection.isClosed()) {
                return null;
            }
            return connection;
        } else {
            return openConnection();
        }
    }

    public java.sql.PreparedStatement prepareStatement(String query) throws SQLException {
        java.sql.PreparedStatement ps;
        Connection connection = getConnection();
        ps = connection.prepareStatement(query);
        return ps;
    }

    public ResultSet execute(PreparedStatement statement, boolean isQuery) throws SQLException {
        if (isQuery) {
            ResultSet rs = null;
            rs = statement.executeQuery();
            return rs;
        } else {
            statement.execute();
        }
        return null;
    }

    public void setAutoCommit(boolean state) throws SQLException {
        getConnection().setAutoCommit(state);
    }

    public void rollback() throws SQLException {
        getConnection().rollback();
    }

    public void commit() throws SQLException {
        getConnection().commit();
    }

    public String doDatabaseDump(String filePath) throws Exception {
        PrintWriter out = null;
        Properties properties = new Properties();
        properties.load(new FileReader(data_location + "/db_config.properties"));

//        String dumpCommand = "mysqldump  "
//                + "--complete-insert --insert-ignore --force "
//                + "--single-transaction --no-create-info --skip-comments "
//                + "--user=" + properties.getProperty("username")
//                + " --password=" + properties.getProperty("password")
//                + " " + properties.getProperty("databasename");
        String dumpCommand = "mysqldump  "
                + " --host " + properties.getProperty("host")
                + " --complete-insert --insert-ignore --force"
                + " --single-transaction --add-drop-table --skip-comments"
                + " --user=" + properties.getProperty("username")
                + " --password=" + new String(Base64.decodeBase64(properties.getProperty("password")))
                + " " + properties.getProperty("databasename");
        Runtime rt = Runtime.getRuntime();
//        dumpCommand+= " >> " + filePath;
//        System.out.println(dumpCommand);
        Process dumpProcess = rt.exec(dumpCommand);

        BufferedReader br = new BufferedReader(new InputStreamReader(dumpProcess.getInputStream()));
        String line = br.readLine();
        String output = "";
        // Mientras se haya leido alguna linea 
        while (line != null) {
            output += "\n" + line;
            line = br.readLine();
        }
        int exitCode = dumpProcess.waitFor();

        if (exitCode != 0) {
            throw new Exception("Failed while executing mysql dump commands. Error: " + output);
        }

        String fileHeader = "USE " + properties.getProperty("databasename") + ";";
        fileHeader += "\nSTART TRANSACTION;";
        fileHeader += "\nBEGIN;";
        fileHeader += "\n    set FOREIGN_KEY_CHECKS = 1;\n";

        String fileFooter = "\n    set FOREIGN_KEY_CHECKS = 0;";
        fileFooter += "\nCOMMIT;";

        out = new PrintWriter(new BufferedWriter(new FileWriter(filePath, true)));
        out.println(fileHeader);
        out.println(output);
//        BufferedReader br = new BufferedReader(new InputStreamReader(dumpProcess.getInputStream()));
//        String line = br.readLine();
//        while (line != null) {
//            out.println(line);
//            line = br.readLine();
//        }
        out.println(fileFooter);
        out.close();

        return filePath;
    }
}
