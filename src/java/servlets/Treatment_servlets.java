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
package servlets;

import bdManager.DAO.DAO;
import bdManager.DAO.DAOProvider;
import bdManager.DAO.samples.AnalyticalReplicate_JDBCDAO;
import classes.User;
import classes.samples.Treatment;
import common.BlockedElementsManager;
import common.ServerErrorManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

/**
 * @author Rafa Hernández de Diego
 */
public class Treatment_servlets extends Servlet {

    String SOP_FILES_LOCATION = File.separator + "SOP_documents" + File.separator;

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("text/html");
//        response.setContentType("application/json");

        //TODO: CONTROL NEW IDS => AVOID DUPLICATED IDs (e.g. IF AN USER IS CREATING A NEW TREATMENT, THE GIVEN ID MUST BE BLOCKED
        if (request.getServletPath().equals("/get_all_treatments")) {
            get_all_treatments_handler(request, response);
        } else if (request.getServletPath().equals("/get_treatment")) {
            get_treatment_handler(request, response);
        } else if (request.getServletPath().equals("/add_treatment")) {
            add_treatment_handler(request, response);
        } else if (request.getServletPath().equals("/update_treatment")) {
            update_treatment_handler(request, response);
        } else if (request.getServletPath().equals("/remove_treatment")) {
            remove_treatment_handler(request, response);
        } else if (request.getServletPath().equals("/check_removable_treatment")) {
            check_removable_treatment(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Treatment_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_all_treatments_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> treatmentList = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 4b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE Object from DB. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 4b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Treatment");
                treatmentList = dao_instance.findAll(null);

                /**
                 * *******************************************************
                 * STEP 3 Get ALL THE Object from DB. ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                for (Object treatment : treatmentList) {
                    File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + ((Treatment) treatment).getTreatmentID() + "_SOP.pdf");
                    if (file.exists()) {
                        ((Treatment) treatment).setHasSOPFile(true);
                    }
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "get_all_treatments_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 4 WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    String treatmentsJSON = "treatmentList : [";

                    for (Object treatment : treatmentList) {
                        treatmentsJSON += ((Treatment) treatment).toJSON() + ", ";
                    }
                    treatmentsJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + treatmentsJSON + " }");
                }
                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "get_all_treatments_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_treatment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Treatment treatment = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 4b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE Object from DB. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 4b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Treatment");
                String treatment_id = request.getParameter("treatment_id");
                treatment = (Treatment) dao_instance.findByID(treatment_id, null);

                /**
                 * *******************************************************
                 * STEP 3 Get ALL THE Object from DB. ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + treatment.getTreatmentID() + "_SOP.pdf");
                if (file.exists()) {
                    treatment.setHasSOPFile(true);
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "get_treatment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 4 WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    String treatmentsJSON = "treatmentList : [";
                    treatmentsJSON += treatment.toJSON() + ", ";
                    treatmentsJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + treatmentsJSON + " }");
                }
                /**
                 * *******************************************************
                 * STEP 5 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "get_treatment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * <p/>
     * @param request
     * @param response
     * @throws IOException
     * @throws ServletException
     */
    private void add_treatment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            String LOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            boolean REMOVE_FILE_NEEDED = false;
            DAO dao_instance = null;

            try {
                /**
                 * *******************************************************
                 * STEP 1 READ THE PARAMS IN THE REQUEST. IF ERROR --> throws
                 * exception if not request, GO TO STEP 6b ELSE --> GO TO STEP 2
                 * ******************************************************
                 */
                String treatment_name = "";
                String description = "";
                String biomolecule = "";
                String[] owners_ids = null;
                String loggedUser = "";
                String sessionToken = "";
                FileItem SOP_file = null;

                //CHECK IF MULTIPART REQUEST
                if (!ServletFileUpload.isMultipartContent(request)) {
                    throw new Exception("Request not valid. MultiPart request expected.");
                }

                //CONFIGURE THE TEMPORAL STORAGE FOR THE REQUEST INFORMATION
                final String CACHE_PATH = "./temp/";
                final int CACHE_SIZE = 100 * (int) Math.pow(10, 6);
                final int MAX_REQUEST_SIZE = 50 * (int) Math.pow(10, 6);
                final int MAX_FILE_SIZE = 20 * (int) Math.pow(10, 6);
                boolean fileInserted = false;

                // Create a factory for disk-based file items
                DiskFileItemFactory factory = new DiskFileItemFactory();
                // Set factory constraints
                factory.setRepository(new File(CACHE_PATH));
                factory.setSizeThreshold(CACHE_SIZE);

                // Create a new file upload handler
                ServletFileUpload upload = new ServletFileUpload(factory);
                // Set overall request size constraint
                upload.setSizeMax(MAX_REQUEST_SIZE);
                upload.setFileSizeMax(MAX_FILE_SIZE);

                // Parse the request
                List<FileItem> items = upload.parseRequest(request);
                for (FileItem item : items) {
                    if (item.isFormField()) {
                        String name = item.getFieldName();
                        String value = item.getString();
                        if ("treatment_name".equals(name)) {
                            treatment_name = value;
                        } else if ("biomolecule".equals(name)) {
                            biomolecule = value;
                        } else if ("description".equals(name)) {
                            description = value;
                        } else if ("owners".equals(name)) {
                            owners_ids = value.split(",");
                        } else if ("loggedUser".equals(name)) {
                            loggedUser = value;
                        } else if ("sessionToken".equals(name)) {
                            sessionToken = value;
                        }
                    } else {
                        if (!item.getName().equals("")) {
                            SOP_file = item;
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 2 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 3 PARSE THE OBJECT. IF ERROR --> throws exception if not
                 * valid session, GO TO STEP 6b ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Treatment");
                LOCKED_ID = dao_instance.getNextObjectID(null);

                Treatment treatment = new Treatment(LOCKED_ID, treatment_name, biomolecule, description);
                treatment.setOwners(owners_ids);

                /**
                 * *******************************************************
                 * STEP 4 INSERT THE OBJECT IN DB. IF ERROR --> throws exception
                 * if not valid session, GO TO STEP 6b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(treatment);

                /**
                 * *******************************************************
                 * STEP 5 SAVE THE SOP DOCUMENT IN FOLDER. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 6b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                if (SOP_file != null) {
                    File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + LOCKED_ID + "_SOP.pdf");
                    if (file.exists()) {
                        file.delete();
                    }
                    try {
                        SOP_file.write(file);
                        REMOVE_FILE_NEEDED = true;
                    } catch (IOException e) {
                        // Directory creation failed
                        throw new Exception("Unable to save the uploded file. Please check if the Tomcat user has read/write permissions over the data application directory.");
                    }
                }

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "add_treatment_handler", e.getMessage());
            } finally {

                /**
                 * *******************************************************
                 * STEP 6b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (REMOVE_FILE_NEEDED) {
                        File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + LOCKED_ID + "_SOP.pdf");
                        if (file.exists()) {
                            file.delete();
                        }
                    }
                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    response.getWriter().print("{success: " + true + ", newID : '" + LOCKED_ID + "' }");
                }

                //Liberate the ID
                if (LOCKED_ID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(LOCKED_ID);
                }

                /**
                 * *******************************************************
                 * STEP 8 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "add_treatment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * <p/>
     * @param request
     * @param response
     * @throws IOException
     * @throws ServletException
     */
    private void update_treatment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            boolean ROLLBACK_NEEDED = false;
            boolean REMOVE_FILE_NEEDED = false;
            DAO dao_instance = null;

            try {
                /**
                 * *******************************************************
                 * STEP 1 READ THE PARAMS IN THE REQUEST. IF ERROR --> throws
                 * exception if not request, GO TO STEP 6b ELSE --> GO TO STEP 2
                 * ******************************************************
                 */
                String treatment_id = "";
                String treatment_name = "";
                String description = "";
                String biomolecule = "";
                String[] owners_ids = null;
                String loggedUser = "";
                String sessionToken = "";
                FileItem SOP_file = null;

                //CHECK IF MULTIPART REQUEST
                if (!ServletFileUpload.isMultipartContent(request)) {
                    throw new Exception("Request not valid. MultiPart request expected.");
                }

                //CONFIGURE THE TEMPORAL STORAGE FOR THE REQUEST INFORMATION
                final String CACHE_PATH = "./temp/";
                final int CACHE_SIZE = 100 * (int) Math.pow(10, 6);
                final int MAX_REQUEST_SIZE = 50 * (int) Math.pow(10, 6);
                final int MAX_FILE_SIZE = 20 * (int) Math.pow(10, 6);
                boolean fileInserted = false;

                // Create a factory for disk-based file items
                DiskFileItemFactory factory = new DiskFileItemFactory();
                // Set factory constraints
                factory.setRepository(new File(CACHE_PATH));
                factory.setSizeThreshold(CACHE_SIZE);

                // Create a new file upload handler
                ServletFileUpload upload = new ServletFileUpload(factory);
                // Set overall request size constraint
                upload.setSizeMax(MAX_REQUEST_SIZE);
                upload.setFileSizeMax(MAX_FILE_SIZE);

                // Parse the request
                List<FileItem> items = upload.parseRequest(request);
                for (FileItem item : items) {
                    if (item.isFormField()) {
                        String name = item.getFieldName();
                        String value = item.getString();
                        if ("treatment_name".equals(name)) {
                            treatment_name = value;
                        } else if ("treatment_id".equals(name)) {
                            treatment_id = value;
                        } else if ("biomolecule".equals(name)) {
                            biomolecule = value;
                        } else if ("description".equals(name)) {
                            description = value;
                        } else if ("owners".equals(name)) {
                            owners_ids = value.split(",");
                        } else if ("loggedUser".equals(name)) {
                            loggedUser = value;
                        } else if ("sessionToken".equals(name)) {
                            sessionToken = value;
                        }
                    } else {
                        if (!item.getName().equals("")) {
                            SOP_file = item;
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 2 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                dao_instance = DAOProvider.getDAOByName("Treatment");
                Treatment treatmentAux = (Treatment) dao_instance.findByID(treatment_id, new Object[]{true});
                if (!treatmentAux.isOwner(loggedUser) && !loggedUser.equals("admin")) {
                    throw new AccessControlException("Cannot update selected Protocol. Current user has not privileges over this element.");
                }
                /**
                 * *******************************************************
                 * STEP 3 PARSE THE OBJECT. IF ERROR --> throws exception if not
                 * valid session, GO TO STEP 6b ELSE --> GO TO STEP 4
                 * *******************************************************
                 */

                Treatment treatment = new Treatment(treatment_id, treatment_name, biomolecule, description);
                treatment.setOwners(owners_ids);

                boolean valid_user = false;
                for (User owner : treatment.getOwners()) {
                    if (loggedUser.equals(owner.getUserID())) {
                        valid_user = true;
                        break;
                    }
                }
                if (!valid_user && !loggedUser.equals("admin")) {
                    throw new AccessControlException("User " + loggedUser + " can not remove the edit the selected protocol because of is not in the owners list.");
                }

                /**
                 * *******************************************************
                 * STEP 4 INSERT THE OBJECT IN DB. IF ERROR --> throws exception
                 * if not valid session, GO TO STEP 6b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.update(treatment);

                /**
                 * *******************************************************
                 * STEP 5 SAVE THE SOP DOCUMENT IN FOLDER. IF ERROR --> throws
                 * exception if not valid session, GO TO STEP 6b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                //TODO: REMOVE FILE?
                //TODO: RESTORE PREVIOUS FILE IN CASE THAT COMMIT CAUSES ERROR
                if (SOP_file != null) {
                    File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + treatment_id + "_SOP.pdf");
                    if (file.exists()) {
                        file.delete();
                    }
                    try {
                        SOP_file.write(file);
                        REMOVE_FILE_NEEDED = true;
                    } catch (IOException e) {
                        // Directory creation failed
                        throw new Exception("Unable to save the uploded file. Please check if the Tomcat user has read/write permissions over the data application directory.");
                    }
                }

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "update_treatment_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 6b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
                /**
                 * *******************************************************
                 * STEP 8 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "update_treatment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void remove_treatment_handler(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                String loggedUser = request.getParameter("loggedUser");
                if (!checkAccessPermissions(loggedUser, request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the object DTO by parsing the JSON data. IF ERROR
                 * --> throws JsonParseException, GO TO STEP 5b ELSE --> GO TO
                 * STEP 3
                 * *******************************************************
                 */
                //Get parameters
                String treatment_id = request.getParameter("treatment_id");

                /**
                 * *******************************************************
                 * STEP 3 Check if the logged user is in the owner list of the
                 * batch Object. If so, check if the batch is no being used by
                 * any analytical replicates. If not, remove the batch. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Treatment");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                Treatment treatment_aux = (Treatment) dao_instance.findByID(treatment_id, null);
                boolean valid_user = false;
                for (User owner : treatment_aux.getOwners()) {
                    if (loggedUser.equals(owner.getUserID())) {
                        valid_user = true;
                        break;
                    }
                }

                if (!valid_user && !loggedUser.equals("admin")) {
                    throw new AccessControlException("User " + loggedUser + " can not remove the selected protocol because of is not in the owners list.");
                }

                dao_instance.remove(treatment_id);

                /**
                 * *******************************************************
                 * STEP 5 REMOVE THE ASSOCIATED. GO TO STEP 6
                 * *******************************************************
                 */
                //TODO: RESTORE THE PREVIOUS FILE IN CASE OF ERROR
                File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + treatment_id + "_SOP.pdf");
                if (file.exists()) {
                    file.delete();
                }

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 7b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                //CHECK IF IS A FOREIGN KEY CONSTRAIT EXCEPTION
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to remove the selected protocol.</br>One or more Analytical samples are associated with selected protocol.</br>Remove first those Analytical samples or change the associated protocol and try again later.");
                } else if (e.getClass().getSimpleName().equals("AccessControlException")) {
                    ServerErrorManager.handleException(null, null, null, e.getMessage());
                } else {
                    ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "remove_treatment_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
                /**
                 * *******************************************************
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "remove_treatment_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //*****OTHER SERVLET HANDLERS ********************************************************
    //************************************************************************************
    /**
     * This function checks if a given object is removable or other items depend
     * on this instance
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void check_removable_treatment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //FIRST CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP.
        if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
            return;
        }
        DAO dao_instance = null;
        ArrayList<String> analyticalSampleIds = null;
        try {
            try {
                String object_id = request.getParameter("object_id");
                String object_type = request.getParameter("object_type");

                if (!"treatment".equalsIgnoreCase(object_type)) {
                    return;
                }

                dao_instance = DAOProvider.getDAOByName("AnalyticalReplicate");

                String[] fieldNames = {"treatment_id"};
                String[] fieldValues = {object_id};

                analyticalSampleIds = ((AnalyticalReplicate_JDBCDAO) dao_instance).findBy(fieldNames, fieldValues);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Treatment_servlets.class.getName(), "check_removable", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 3b CATCH ERROR. GO TO STEP 4
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                } else {
                    /**
                     * *******************************************************
                     * STEP 3A WRITE RESPONSE ERROR. GO TO STEP 4
                     * *******************************************************
                     */
                    String analyticalSampleIdsJSON = "analyticalSampleIds : [";

                    if (analyticalSampleIds != null) {
                        for (String id : analyticalSampleIds) {
                            analyticalSampleIdsJSON += ",\"" + id + "\"";
                        }
                    }
                    analyticalSampleIdsJSON = analyticalSampleIdsJSON.replaceFirst(",", "");
                    analyticalSampleIdsJSON += "]";

                    response.getWriter().print("{success: " + (analyticalSampleIds == null || analyticalSampleIds.isEmpty()) + ", " + analyticalSampleIdsJSON + " }");
                }
                /**
                 * *******************************************************
                 * STEP 4 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Treatment_servlets.class.getName(), "check_removable", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");

        if (request.getServletPath().equals("/get_sop_file")) {
            get_SOP_file_handler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Treatment_servlets.class.getName(), "doGet", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_SOP_file_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String treatment_id = request.getParameter("treatment_id");

        try {
            File file = new File(DATA_LOCATION + SOP_FILES_LOCATION + treatment_id + "_SOP.pdf");

            if (file.exists()) {
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");

                response.setContentType("application/pdf");
                response.addHeader("Content-Disposition", "attachment; filename=" + treatment_id + "_SOP.pdf");
                response.setContentLength((int) file.length());

                FileInputStream fileInputStream = new FileInputStream(file);
                OutputStream responseOutputStream = response.getOutputStream();
                int bytes;
                while ((bytes = fileInputStream.read()) != -1) {
                    responseOutputStream.write(bytes);
                }
                responseOutputStream.close();
            }
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Treatment_servlets.class.getName(), "get_SOP_file_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
