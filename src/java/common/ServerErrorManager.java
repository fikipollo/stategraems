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
package common;

import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.AccessControlException;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class ServerErrorManager {

    //THIS CLASS IMPLEMENT THE SINGLETON PATTERN
    private static ServerErrorManager serverErrorManager_instance = null;
    private HashMap<Long, String> errorsInstances = null;

    private ServerErrorManager() {
        errorsInstances = new HashMap<Long, String>();
    }

    /**
     * CREATES THE INSTANCE, ONLY ONE THREAD CAN EXECUTE THIS FUNCTION AT THE
     * SAME TIME
     */
    private synchronized static void createServerErrorManager() {
        if (serverErrorManager_instance == null) {
            serverErrorManager_instance = new ServerErrorManager();
        }
    }

    /**
     * Return the ServerErrorManager instance. If not exists, creates a new
     * instance
     * <p/>
     * @return the ServerErrorManager instance
     */
    public static ServerErrorManager getServerErrorManager() {
        if (serverErrorManager_instance == null) {
            createServerErrorManager();
        }
        return serverErrorManager_instance;
    }

    /**
     * If true some errors occurred since last error status reset
     *
     * @return boolean
     */
    public static boolean errorStatus() {
        ServerErrorManager serverErrorManager = ServerErrorManager.getServerErrorManager();
        long threadID = Thread.currentThread().getId();
        boolean errorStatus = serverErrorManager.errorsInstances.containsKey(threadID);
        System.out.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > CHECKING IF THREAD " + threadID + " HAS ERRORS -> " + errorStatus);

        return errorStatus;
    }

    /**
     * Returns the error message for the current thread.
     * <p/>
     * @param reset, if true, reset the error status.
     * @return the error message.
     */
    public String getErrorMessages(boolean reset) {
        long threadID = Thread.currentThread().getId();
        String error = "";
        if (errorsInstances.containsKey(threadID)) {
            error = errorsInstances.get(threadID);
            if (reset) {
                errorsInstances.remove(threadID);
            }
        }
        return error;
    }

    /**
     * Returns the error message for the current thread.
     * <p/>
     * @param reset, if true, reset the error status.
     * @return the error message.
     */
    public void setErrorMessages(String errorMessage) {
        long threadID = Thread.currentThread().getId();
        errorsInstances.put(threadID, errorMessage);
        System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > THREAD " + threadID + " NEW ERROR DETECTED: " + errorMessage);
    }

    /**
     * Remove the error status for the current thread
     */
    public void resetErrorStatus() {
        long threadID = Thread.currentThread().getId();

        if (errorsInstances.containsKey(threadID)) {
            errorsInstances.remove(threadID);
        }
    }

    public static void handleException(Exception exception, String className, String functionName, String errorMessage) {
        if (exception == null) {
            ServerErrorManager.addErrorMessage(0, null, null, errorMessage);
        } else if (exception instanceof SQLException) {
            ServerErrorManager.addErrorMessage(1, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
        } else if (exception instanceof JsonParseException) {
            ServerErrorManager.addErrorMessage(4, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
        } else if (exception instanceof AccessControlException) {
            ServerErrorManager.addErrorMessage(3, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
        } else if (exception instanceof IOException) {
            ServerErrorManager.addErrorMessage(4, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
        } else if (exception instanceof FileNotFoundException) {
            ServerErrorManager.addErrorMessage(4, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
        } else {
            if (errorMessage == null) {
                errorMessage = exception.getMessage();
            }

            if (errorMessage == null) {
                errorMessage = "Unknown Error " + exception.getClass().getName();
            }

            StringWriter sw = new StringWriter();
            exception.printStackTrace(new PrintWriter(sw));
            String exceptionTraceAsString = sw.toString();
            errorMessage += ". Exception trace: " + exceptionTraceAsString;

            ServerErrorManager.addErrorMessage(-1, className, functionName, errorMessage);
        }
        System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > HANDLED EXPECTION: " + (exception != null ? exception.getClass().getName() : "") + errorMessage);
    }

    public static void addErrorMessage(int errorType, String className, String functionName, String errorMessage) {
        ServerErrorManager serverErrorManager = ServerErrorManager.getServerErrorManager();

        String errorLog = serverErrorManager.getErrorMessages(false);

        if (errorMessage == null) {
            errorMessage = "Unknown Error";
        }

        errorMessage = errorMessage + "";
        errorMessage = errorMessage.replaceAll("'", "");

        if (errorType == 0) {
            errorLog += errorMessage;
        } else if (errorType == 1) {
            errorLog += "</br>ERROR 0x00001 : SQL ERROR, FAILED TRYING TO QUERY THE DATABASE AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 2) {
            errorLog += "</br>ERROR 0x00002 : REQUEST ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 3) {
            errorLog += "</br>ERROR 0x00003 : SESSION ERROR: AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 4) {
            errorLog += "</br>ERROR 0x00004 : INTERNAL PROCESSING ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else {
            errorLog += "</br>ERROR 0x0000A" + " : ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        }

        serverErrorManager.setErrorMessages(errorLog);
    }

    /**
     * Return the HTTP response as JSON object for the current thread.
     * <p/>
     * @return an HTTP response
     */
    public static String getErrorResponse() {
        ServerErrorManager serverErrorManager = ServerErrorManager.getServerErrorManager();
        JsonObject obj = new JsonObject();
        obj.add("reason", new JsonPrimitive(serverErrorManager.getErrorMessages(true)));
        return obj.toString();
    }
}
