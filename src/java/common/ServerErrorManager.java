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
    private HashMap<Long, Error> errorsInstances = null;

    private ServerErrorManager() {
        errorsInstances = new HashMap<Long, Error>();
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
    public Error getErrorMessages(boolean reset) {
        long threadID = Thread.currentThread().getId();
        Error error = null;
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
     * @param errorCode
     * @param errorMessage
     */
    public void setErrorMessages(String errorCode, String errorMessage) {
        long threadID = Thread.currentThread().getId();
        errorsInstances.put(threadID, new Error(errorCode, errorMessage));
        System.err.println(String.format("%tc", new Date()) + " STATEGRAEMS LOG > THREAD " + threadID + " NEW ERROR DETECTED: Error " + errorCode + ", " + errorMessage);
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
            ServerErrorManager.addErrorMessage(2, className, functionName, errorMessage != null ? errorMessage : exception.getMessage());
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
    }

    public static void addErrorMessage(int errorType, String className, String functionName, String errorMessage) {
        ServerErrorManager serverErrorManager = ServerErrorManager.getServerErrorManager();

        Error errorLog = serverErrorManager.getErrorMessages(false);
        String errorCode = "";

        if (errorMessage == null) {
            errorMessage = "Unknown Error";
        }

        errorMessage = errorMessage.replaceAll("'", "");
        if (errorType == 0) {
            errorCode = "00000";
        } else if (errorType == 1) {
            errorCode = "00001";
            errorMessage = "SQL ERROR, FAILED TRYING TO QUERY THE DATABASE AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 2) {
            errorCode = "00002";
            errorMessage = "REQUEST ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 3) {
            if (errorMessage.contains("User not found")) {
                errorCode = "00003a";
            } else {
                errorCode = "00003";
            }
            errorMessage = "SESSION ERROR: AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else if (errorType == 4) {
            errorCode = "00004";
            errorMessage = "INTERNAL PROCESSING ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        } else {
            errorCode = "0000A";
            errorMessage = "ERROR AT " + className + " ." + functionName + ". ERROR MESSAGE: " + errorMessage;
        }

        if (errorLog != null) {
            String extra = "Besides, the following errors were detected: ";
            if (!errorLog.getMessage().contains(extra)) {
                errorLog.setMessage(errorLog.getMessage() + ". " + extra);
            }
            errorLog.setMessage(errorLog.getMessage() + "Error " + errorCode + " - " + errorMessage + ". ");
        } else {
            serverErrorManager.setErrorMessages(errorCode, errorMessage);
        }
    }

    /**
     * Return the HTTP response as JSON object for the current thread.
     * <p/>
     * @return an HTTP response
     */
    public static String getErrorResponse() {
        ServerErrorManager serverErrorManager = ServerErrorManager.getServerErrorManager();
        JsonObject obj = new JsonObject();
        Error error = serverErrorManager.getErrorMessages(true);
        obj.add("code", new JsonPrimitive(error.getErrorCode()));
        obj.add("reason", new JsonPrimitive(error.getMessage()));
        return obj.toString();
    }

    public class Error {

        private String errorCode = "";
        private String message = "";

        public Error(String x, String y) {
            this.errorCode = x;
            this.message = y;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public void setErrorCode(String errorCode) {
            this.errorCode = errorCode;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
