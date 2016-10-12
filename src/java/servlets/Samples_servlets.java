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
import bdManager.DAO.analysis.non_processed_data.raw_data.RAWdata_JDBCDAO;
import bdManager.DAO.samples.AnalyticalReplicate_JDBCDAO;
import bdManager.DAO.samples.BioCondition_JDBCDAO;
import bdManager.DAO.samples.Bioreplicate_JDBCDAO;
import classes.samples.AnalyticalReplicate;
import classes.samples.Batch;
import classes.samples.Bioreplicate;
import classes.samples.BioCondition;
import classes.samples.Treatment;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import common.BlockedElementsManager;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.security.AccessControlException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import servlets.servlets_resources.BioCondition_XLS_parser;

/**
 * This class implements the servlet used to manage all BioCondition,
 * Bioreplicates and Analytical Replicates requests. All requests should be
 * carried out only via POST.
 * <p/>
 * SERVLET FOR: - Get a list of all bioconditions /get_all_bioconditions - Get a
 * specified biocondition /get_biocondition
 * <p/>
 * - Get a list of all bioreplicates /get_all_bioreplicates - Get the treatment
 * document for a biocondition /get_treatment_document - Send treatment document
 * for a biocondition /send_treatment_document
 * <p/>
 * - Add a new biocondition /add_biocondition - Add a list of new bioreplicate
 * /add_new_bioreplicates - Add a list of new analytical replicate
 * /add_new_analytical_rep
 * <p/>
 * - Unlock a biocondition /unlock_biocondition
 * <p/>
 * - Associate biocondition and experiment /associate_biocondition_experiment
 * <p/>
 * TODO - Update a biocondition /update_biocondition - Update a list of
 * bioreplicate /update_bioreplicates - Update a list of analytical replicate
 * /update_analytical_replicates - Remove a list of biocondition
 * /remove_bioconditions - Remove a list of bioreplicate /remove_bioreplicates -
 * Remove a list of analytical replicate /remove_analytical_reps
 * <p/>
 * @author Rafa Hernández de Diego
 */
public class Samples_servlets extends Servlet {

    String TREATMENT_DOCUMENTS_LOCATION = File.separator + "treatment_documents" + File.separator;

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        //response.setContentType("text/html");

        if (request.getServletPath().equals("/get_all_bioconditions")) {
            get_all_bioconditions_handler(request, response);
        } else if (request.getServletPath().equals("/remove_biocondition")) {
            remove_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/get_biocondition")) {
            get_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/get_all_bioreplicates")) {
            get_all_bioreplicates_handler(request, response);
        } else if (request.getServletPath().equals("/add_biocondition")) {
            add_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/update_biocondition")) {
            update_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/send_treatment_document")) {
            send_treatment_document_handler(request, response);
        } else if (request.getServletPath().equals("/send_biocondition_template_document")) {
            send_biocondition_template_document_handler(request, response);
        } else if (request.getServletPath().equals("/lock_biocondition")) {
            lock_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/unlock_biocondition")) {
            unlock_biocondition_handler(request, response);
        } else if (request.getServletPath().equals("/associate_biocondition_experiment")) {
            associate_biocondition_experiment(request, response);
        } else if (request.getServletPath().equals("/check_removable_sample")) {
            check_removable_sample(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Samples_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //*****SAMPLES SERVLET HANDLERS     **************************************************
    //************************************************************************************
    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void add_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            String BLOCKED_ID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;

            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the new ID for the BIOCONDITION. IF ERROR -->
                 * throws SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("BioCondition");
                String newID = dao_instance.getNextObjectID(null);
                BLOCKED_ID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                BioCondition biocondition = BioCondition.fromJSON(requestData.get("biocondition_json_data"));

                /**
                 * *******************************************************
                 * STEP 4 Set the object and children ID. IF ERROR --> throws
                 * JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                //TODO: CAMBIAR COMO EN ANALYSIS (CAMBIAR IDs internamente en BioCondition)
                biocondition.setBioConditionID(newID);

                if (biocondition.getAssociatedBioreplicates() != null) {
                    int nBioReplicate = 1;
                    for (Bioreplicate bioreplicate : biocondition.getAssociatedBioreplicates()) {
                        bioreplicate.setBioreplicateID(newID, nBioReplicate);
                        nBioReplicate++;
                    }
                }

                /**
                 * *******************************************************
                 * STEP 5 Add the new Object in the DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP 6b ELSE --> GO TO STEP 6
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.insert(biocondition);

                /**
                 * *******************************************************
                 * STEP 6 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 6b ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "add_biocondition_handler", e.getMessage());
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
                    JsonObject obj = new JsonObject();
                    obj.add("newID", new JsonPrimitive(BLOCKED_ID));
                    response.getWriter().print(obj.toString());
                }

                if (BLOCKED_ID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(BLOCKED_ID);
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
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "add_biocondition_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void update_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            ArrayList<String> BLOCKED_IDs = new ArrayList<String>();
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 6b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String loggedUserID = requestData.get("loggedUserID").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                BioCondition biocondition = BioCondition.fromJSON(requestData.get("biocondition_json_data"));

                dao_instance = DAOProvider.getDAOByName("BioCondition");
                //CHECK IF CURRENT USER IS A VALID OWNER (AVOID HACKING)
                boolean loadRecursive = false;
                BioCondition bioconditionAux = (BioCondition) dao_instance.findByID(biocondition.getBioConditionID(), new Object[]{loadRecursive});
                if (!bioconditionAux.isOwner(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot update selected Biological Condition. Current user has not privileges over this Biological Condition.");
                }

                /**
                 * *******************************************************
                 * STEP 4 READ ALL BIOREPLICATES AND AS AND CREATE THE LIST OF
                 * TASKS.
                 * *******************************************************
                 */
                Bioreplicate_JDBCDAO bioreplicateDAO = (Bioreplicate_JDBCDAO) (DAOProvider.getDAOByName("Bioreplicate"));
                AnalyticalReplicate_JDBCDAO analyticalSampleDAO = (AnalyticalReplicate_JDBCDAO) (DAOProvider.getDAOByName("AnalyticalReplicate"));

                ArrayList<Bioreplicate> to_be_created_BR = new ArrayList<Bioreplicate>();
                ArrayList<Bioreplicate> to_be_updated_BR = new ArrayList<Bioreplicate>();
                ArrayList<String> to_be_deleted_BR = new ArrayList<String>();

                ArrayList<AnalyticalReplicate> to_be_created_AS = new ArrayList<AnalyticalReplicate>();
                ArrayList<AnalyticalReplicate> to_be_updated_AS = new ArrayList<AnalyticalReplicate>();
                ArrayList<String> to_be_deleted_AS = new ArrayList<String>();

                for (Bioreplicate bioreplicate : biocondition.getAssociatedBioreplicates()) {
                    if ("new_deleted".equals(bioreplicate.getStatus())) {
                        continue; //ignore
                    } else if ("deleted".equals(bioreplicate.getStatus()) || "edited_deleted".equals(bioreplicate.getStatus())) {
                        to_be_deleted_BR.add(bioreplicate.getBioreplicateID()); //DELETES THE AS
                    } else if ("new".equals(bioreplicate.getStatus())) {
                        Object[] params = {biocondition.getBioConditionID()};
                        String nextID = bioreplicateDAO.getNextObjectID(params);
                        bioreplicate.setBioreplicate_id(nextID);
                        bioreplicate.setBioConditionID(biocondition.getBioConditionID());
                        to_be_created_BR.add(bioreplicate); //CREATES THE AS
                    } else {
                        if ("edited".equals(bioreplicate.getStatus())) {
                            to_be_updated_BR.add(bioreplicate);
                        }
                        for (AnalyticalReplicate analyticalReplicate : bioreplicate.getAssociatedAnalyticalReplicates()) {
                            if ("new_deleted".equals(analyticalReplicate.getStatus())) {
                                continue; //ignore
                            } else if ("deleted".equals(analyticalReplicate.getStatus()) || "edited_deleted".equals(analyticalReplicate.getStatus())) {
                                to_be_deleted_AS.add(analyticalReplicate.getAnalytical_rep_id());
                            } else if ("new".equals(analyticalReplicate.getStatus())) {
                                Object[] params = {bioreplicate.getBioreplicateID()};
                                String nextID = analyticalSampleDAO.getNextObjectID(params);
                                analyticalReplicate.setAnalyticalReplicateID(nextID);
                                analyticalReplicate.setBioreplicate_id(bioreplicate.getBioreplicateID());
                                to_be_created_AS.add(analyticalReplicate); //CREATES THE AS
                            } else if ("edited".equals(analyticalReplicate.getStatus())) {
                                to_be_updated_AS.add(analyticalReplicate);
                            }
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 5 UPDATE THE BIOCONDITION IN DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                dao_instance.update(biocondition);

                /**
                 * *******************************************************
                 * STEP 6 APPLY THE BIOREPLICATE TASKS IN DATABASE. IF ERROR -->
                 * throws SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 8
                 * *******************************************************
                 */
                bioreplicateDAO.insert(to_be_created_BR.toArray(new Bioreplicate[]{}));
                bioreplicateDAO.update(to_be_updated_BR.toArray(new Bioreplicate[]{}));
                bioreplicateDAO.remove(to_be_deleted_BR.toArray(new String[]{}));

                /**
                 * *******************************************************
                 * STEP 7 APPLY THE ANALYTICAL REP TASKS IN DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 9
                 * *******************************************************
                 */
                analyticalSampleDAO.insert(to_be_created_AS.toArray(new AnalyticalReplicate[]{}));
                analyticalSampleDAO.update(to_be_updated_AS.toArray(new AnalyticalReplicate[]{}));
                analyticalSampleDAO.remove(to_be_deleted_AS.toArray(new String[]{}));

                /**
                 * *******************************************************
                 * STEP 9 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 10
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to update the Biological condition information.</br>One or more Analysis are associated with at least a deleted element.</br>Remove or Edit first those Analysis or change the associated Analytical sample and try again later.");
                } else {
                    ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "update_biocondition_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 9b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    for (String BLOCKED_ID : BLOCKED_IDs) {
                        BlockedElementsManager.getBlockedElementsManager().unlockID(BLOCKED_ID);
                    }
                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }
                /**
                 * *******************************************************
                 * STEP 11 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "update_biocondition_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void send_biocondition_template_document_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {

            ArrayList<String> BLOCKED_IDs = new ArrayList<String>();
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;

            try {
                if (!ServletFileUpload.isMultipartContent(request)) {
                    throw new Exception("Erroneus request.");
                }

                String user_id = "";
                String sessionToken = "";
                File xls_file = null;

                /**
                 * *******************************************************
                 * STEP 1 Get the request params: read the params and the XLS
                 * file. IF ERROR --> throws SQL Exception, GO TO STEP ? ELSE
                 * --> GO TO STEP 9
                 * *******************************************************
                 */
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.setContentType("text/html");

                //Get the data as a JSON format string
                final String CACHE_PATH = "/tmp/";
                final int CACHE_SIZE = 100 * (int) Math.pow(10, 6);
                final int MAX_REQUEST_SIZE = 20 * (int) Math.pow(10, 6);
                final int MAX_FILE_SIZE = 20 * (int) Math.pow(10, 6);

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
                    if (!item.isFormField()) {
                        if (!item.getName().equals("")) {
                            //First check if the file already exists -> error, probably a previous treatmente exists with the same treatment_id
                            xls_file = new File(CACHE_PATH + "tmp.xls");
                            item.write(xls_file);
                        }
                    } else {
                        String name = item.getFieldName();
                        String value = item.getString();
                        if ("loggedUser".equals(name)) {
                            user_id = value;
                        } else if ("sessionToken".equals(name)) {
                            sessionToken = value;
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 2 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP AND
                 * IF FILE IS CORRECTLY UPDATED. IF ERROR --> throws exception
                 * if not valid session, GO TO STEP 6b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                if (!checkAccessPermissions(user_id, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }
                if (xls_file == null) {
                    throw new Exception("XLS file was not uploaded correctly.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Parse the XLS file and get the information. IF ERROR
                 * --> throws Exception, GO TO STEP ? ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                Object[] parsingResult = BioCondition_XLS_parser.parseXLSfile(xls_file, user_id);

                ArrayList<BioCondition> biocondition_list = (ArrayList<BioCondition>) parsingResult[0];
                HashMap<String, Batch> batchesTable = (HashMap<String, Batch>) parsingResult[1];
                HashMap<String, Treatment> treatmentsTable = (HashMap<String, Treatment>) parsingResult[2];

                /**
                 * *******************************************************
                 * STEP 3 IF FILE WAS PARSED CORRECTLY ADD THE INFORMATION TO
                 * DATABASE. IF ERROR --> throws SQLException, GO TO STEP ? ELSE
                 * --> GO TO STEP 4
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Batch");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                //IF WE ARE HERE IT MEANS THAT APARENTLY EVERTHING WAS OK
                //therefore WE SHOULD START ADDING THE INFORMATION INTO THE DB
                for (Batch batch : batchesTable.values()) {
                    String batch_id = dao_instance.getNextObjectID(null);
                    BLOCKED_IDs.add(batch_id);
                    batch.setBatchID(batch_id);
                    //THE BATCH ID SHOULD BE UPDATED IN ALL THE BIOREPLICATES (BECAUSE IS THE SAME OBJECT)
                    dao_instance.insert(batch);
                }

                dao_instance = DAOProvider.getDAOByName("Treatment");
                //IF WE ARE HERE IT MEANS THAT APARENTLY EVERTHING WAS OK
                //therefore WE SHOULD START ADDING THE INFORMATION INTO THE DB
                for (Treatment treatment : treatmentsTable.values()) {
                    String treatmentID = dao_instance.getNextObjectID(null);
                    BLOCKED_IDs.add(treatmentID);
                    treatment.setTreatmentID(treatmentID);
                    //THE BATCH ID SHOULD BE UPDATED IN ALL THE BIOREPLICATES (BECAUSE IS THE SAME OBJECT)
                    dao_instance.insert(treatment);
                }

                dao_instance = DAOProvider.getDAOByName("BioCondition");

                for (BioCondition biocondition : biocondition_list) {
                    String newID = dao_instance.getNextObjectID(null);
                    BLOCKED_IDs.add(newID);
                    biocondition.setBioConditionID(newID);
                    //THE biocondition ID SHOULD BE UPDATED IN ALL THE BIOREPLICATES
                    dao_instance.insert(biocondition);
                }

                /**
                 * *******************************************************
                 * STEP 4 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 5
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "send_biocondition_template_document_handler", e.getMessage());
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
                    response.getWriter().print("{success: " + true + "}");
                }

                for (String blocked_id : BLOCKED_IDs) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(blocked_id);
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
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "send_xls_creation_document_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void send_treatment_document_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: A PROBLEM WITH SENCHA MAKES THAT THE RESPONSE DOESN'T RETURN THE REPONSE_TEXT AND SENCHA ALWAYS GET A SUCCESSFUL STATUS... FIX IT!!
        //TODO: FILE SIZE LIMITATIONS??
        String filePath = "";
        boolean REMOVE_FILE_NEEDED = false;
        try {

            if (!ServletFileUpload.isMultipartContent(request)) {
                throw new Exception("Erroneus request.");
            }

            //Get the data as a JSON format string
            String biocondition_id = "";
            String user_id = "";
            String sessionToken = "";
            FileItem pdfFile = null;
            /**
             * *******************************************************
             * STEP 1 Get the request params: read the params and the PDF file.
             * IF ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
             * STEP 9 *******************************************************
             */
            final String CACHE_PATH = "/tmp/";
            final int CACHE_SIZE = 100 * (int) Math.pow(10, 6);
            final int MAX_REQUEST_SIZE = 50 * (int) Math.pow(10, 6);
            final int MAX_FILE_SIZE = 20 * (int) Math.pow(10, 6);

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
                if (!item.isFormField()) {
                    if (!item.getName().equals("")) {
                        pdfFile = item;
                    }
                } else {
                    String name = item.getFieldName();
                    String value = item.getString();
                    if ("biocondition_id".equals(name)) {
                        biocondition_id = value;
                    } else if ("loggedUser".equals(name)) {
                        user_id = value;
                    } else if ("sessionToken".equals(name)) {
                        sessionToken = value;
                    }
                }
            }
            /**
             * *******************************************************
             * STEP 2 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP AND IF
             * FILE IS CORRECTLY UPDATED. IF ERROR --> throws exception if not
             * valid session, GO TO STEP 6b ELSE --> GO TO STEP 3
             * *******************************************************
             */
            if (!checkAccessPermissions(user_id, sessionToken)) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }
            if (pdfFile == null) {
                throw new Exception("PDF file was not uploaded correctly.");
            }
            /**
             * *******************************************************
             * STEP 3 SAVE THE PEF FILE IN THE SERVER. IF ERROR --> throws
             * exception if not valid session, GO TO STEP 6b ELSE --> GO TO STEP
             * 3 *******************************************************
             */
            filePath = DATA_LOCATION + TREATMENT_DOCUMENTS_LOCATION + biocondition_id + "_treatment.pdf";
            //First check if the file already exists -> error, probably a previous treatmente exists with the same treatment_id
            File file = new File(filePath);
            try {
                pdfFile.write(file);
                REMOVE_FILE_NEEDED = true;
            } catch (IOException e) {
                // Directory creation failed
                throw new Exception("Unable to save the uploded file. Please check if the Tomcat user has read/write permissions over the data application directory.");
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "send_treatment_document_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setContentType("text/html");
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());

                if (REMOVE_FILE_NEEDED) {
                    File file = new File(filePath);
                    if (file.exists()) {
                        file.delete();
                    }
                }
            } else {
                response.setContentType("text/html");
                response.getWriter().print("{success: " + true + "}");
            }
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_all_bioconditions_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> bioconditionsList = null;
            try {

                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("BioCondition");
                boolean loadRecursive = false;
                if (requestData.has("recursive")) {
                    loadRecursive = requestData.get("loggedUser").getAsBoolean();
                }

                Object[] params = {loadRecursive};
                bioconditionsList = dao_instance.findAll(params);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_all_bioconditions_handler", e.getMessage());
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
                    String bioconditionsJSON = "[";
                    for (int i = 0; i < bioconditionsList.size(); i++) {
                        bioconditionsJSON += ((BioCondition) bioconditionsList.get(i)).toJSON() + ((i < bioconditionsList.size() - 1) ? "," : "");
                    }
                    bioconditionsJSON += "]";

                    response.getWriter().print(bioconditionsJSON);
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
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_all_bioconditions_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            BioCondition biocondition = null;
            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                String loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("BioCondition");
                boolean loadRecursive = requestData.get("recursive").getAsBoolean();;
                Object[] params = {loadRecursive};

                String biocondition_id = requestData.get("biocondition_id").getAsString();
                biocondition = (BioCondition) dao_instance.findByID(biocondition_id, params);

                /**
                 * *******************************************************
                 * STEP 3 Check if exists an associated treatment file. IF ERROR
                 * --> throws MySQL exception, GO TO STEP 4b ELSE --> GO TO STEP
                 * 5 *******************************************************
                 */
                File file = new File(DATA_LOCATION + TREATMENT_DOCUMENTS_LOCATION + biocondition_id + "_treatment.pdf");
                if (file.exists()) {
                    biocondition.setHasTreatmentDocument(true);
                }

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_biocondition_handler", e.getMessage());
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
                     * STEP 4A WRITE RESPONSE ERROR. GO TO STEP 5
                     * *******************************************************
                     */
                    response.getWriter().print(biocondition.toJSON());
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
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_biocondition_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     */
    private void lock_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        String locker_id = "";

        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP 5b ELSE -->
             * GO TO STEP 2
             * *******************************************************
             */
            JsonParser parser = new JsonParser();
            JsonObject requestData = (JsonObject) parser.parse(request.getReader());

            String loggedUser = requestData.get("loggedUser").getAsString();
            String sessionToken = requestData.get("sessionToken").getAsString();

            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(loggedUser, sessionToken)) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String biocondition_id = requestData.get("biocondition_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(biocondition_id, loggedUser);
            if (alreadyLocked) {
                locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(biocondition_id);
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "lock_biocondition_handler", e.getMessage());
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
                 * STEP 3A WRITE RESPONSE .
                 * *******************************************************
                 */
                JsonObject obj = new JsonObject();
                if (alreadyLocked) {
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive(BlockedElementsManager.getErrorMessage()));
                    obj.add("user_id", new JsonPrimitive(locker_id));
                } else {
                    obj.add("success", new JsonPrimitive(true));
                }
                response.getWriter().print(obj.toString());
            }
        }

    }

    /**
     *
     * @param request
     * @param response
     */
    private void unlock_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        try {
            JsonParser parser = new JsonParser();
            JsonObject requestData = (JsonObject) parser.parse(request.getReader());

            String loggedUser = requestData.get("loggedUser").getAsString();
            String sessionToken = requestData.get("sessionToken").getAsString();

            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(loggedUser, sessionToken)) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }
            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String biocondition_id = requestData.get("biocondition_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(biocondition_id, loggedUser);
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "unlock_biocondition_handler", e.getMessage());
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
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                JsonObject obj = new JsonObject();
                if (alreadyLocked) {
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive(BlockedElementsManager.getErrorMessage()));
                } else {
                    obj.add("success", new JsonPrimitive(true));
                }
                response.getWriter().print(obj.toString());
            }
        }
    }

    /**
     *
     * @param request
     * @param response
     */
    private void remove_biocondition_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String biocondition_id = "";
            String loggedUser = "";
            boolean ROLLBACK_NEEDED = false;
            DAO dao_instance = null;
            try {
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                loggedUser = requestData.get("loggedUser").getAsString();
                String loggedUserID = requestData.get("loggedUserID").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 4b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Try to lock the Object . IF FAILED --> throws
                 * exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                biocondition_id = requestData.get("biocondition_id").getAsString();
                boolean alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(biocondition_id, loggedUserID);
                if (alreadyLocked) {
                    String locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(biocondition_id);
                    if (!locker_id.equals(loggedUser)) {
                        throw new Exception("Sorry but this biological condition is being edited by other user. Please try later.");
                    }
                }

                dao_instance = DAOProvider.getDAOByName("Biocondition");
                dao_instance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                BioCondition bioCondition = (BioCondition) dao_instance.findByID(biocondition_id, params);

                //Check if user is member or owner
                if (bioCondition.isOwner(loggedUserID) || "admin".equals(loggedUserID)) {
                    if (bioCondition.getOwners().length == 1 || "admin".equals(loggedUserID)) {
                        //If is the last owner or the admin, remove the entire experiment
                        dao_instance.remove(biocondition_id);
                    } else {
                        //else just remove the entry in the table of ownerships
                        ((BioCondition_JDBCDAO) dao_instance).removeOwnership(loggedUserID, biocondition_id);
                    }
                }

                /**
                 * *******************************************************
                 * STEP 9 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 10
                 * *******************************************************
                 */
                dao_instance.doCommit();

            } catch (Exception e) {
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to remove the selected Biocondition.</br>This Biocondition contains one or more Analytical samples that are being used by some Raw data.</br>Remove first those Raw data and try again later.");
                } else if (e.getClass().getSimpleName().equals("AccessControlException")) {
                    ServerErrorManager.handleException(null, null, null, e.getMessage());
                } else {
                    ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "remove_biocondition_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 4b CATCH ERROR. GO TO STEP 5
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    if (ROLLBACK_NEEDED) {
                        dao_instance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                BlockedElementsManager.getBlockedElementsManager().unlockObject(biocondition_id, loggedUser);

                /**
                 * *******************************************************
                 * STEP 11 Close connection.
                 * ********************************************************
                 */
                if (dao_instance != null) {
                    dao_instance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "remove_biocondition_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
    //************************************************************************************
    //************************************************************************************
    //*****BIOREPLICATE SERVLET HANDLERS *************************************************
    //************************************************************************************
    //************************************************************************************

    /**
     * This function returns all the bioreplicates stored in the DB for a given
     * BioReplicateID
     *
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_all_bioreplicates_handler(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> bioreplicatesList = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE Object from DB. IF ERROR --> throws MySQL
                 * exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Bioreplicate");
                String biocondition_id = request.getParameter("biocondition_id");
                boolean loadRecursive = false;
                Object[] params = {biocondition_id, loadRecursive};
                bioreplicatesList = dao_instance.findAll(params);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_all_bioreplicates_handler", e.getMessage());
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
                    String bioreplicatesJSON = "bioreplicatesList : [";

                    for (Object bioreplicate : bioreplicatesList) {
                        bioreplicatesJSON += ((Bioreplicate) bioreplicate).toJSON() + ", ";
                    }
                    bioreplicatesJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + bioreplicatesJSON + " }");
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
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "get_all_bioreplicates_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //*****OTHER SERVLET HANDLERS ********************************************************
    //************************************************************************************
    /**
     * This function insert new associations between some bioconditions and a
     * given Experiment.
     *
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void associate_biocondition_experiment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //FIRST CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP.
        if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
            return;
        }

        String[] bioconditions_ids = request.getParameter("selected_bioconditions_id").split(",");
        String experiment_id = request.getParameter("currentExperimentID");

        BioCondition_JDBCDAO.insertNewExperimentAssociation(bioconditions_ids, experiment_id, false);

        //If some errors occurred
        if (ServerErrorManager.errorStatus()) {
            //TODO: RESPONSE STATUS CODE??
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        } else {
            response.getWriter().print("{success: " + true + "}");
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
    private void check_removable_sample(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //FIRST CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP.
        if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
            return;
        }
        DAO dao_instance = null;
        ArrayList<String> rawdata_ids = null;
        try {
            try {
                String object_id = request.getParameter("object_id");
                String object_type = request.getParameter("object_type");

                if ("biocondition".equalsIgnoreCase(object_type)) {
                    object_id = object_id.replaceFirst("BC", "AR") + ".%";
                } else if ("bioreplicate".equalsIgnoreCase(object_type)) {
                    object_id = object_id.replaceFirst("BR", "AR") + ".%";
                } else if (!"analytical_sample".equalsIgnoreCase(object_type)) {
                    return;
                }

                dao_instance = DAOProvider.getDAOByName("RAWData");

                String[] fieldNames = {"analyticalReplicate_id"};
                String[] fieldValues = {object_id};

                rawdata_ids = ((RAWdata_JDBCDAO) dao_instance).findBy(fieldNames, fieldValues);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Samples_servlets.class.getName(), "check_removable", e.getMessage());
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
                    String rawdataIds = "rawdataIds : [";

                    if (rawdata_ids != null) {
                        for (String id : rawdata_ids) {
                            rawdataIds += ",\"" + id + "\"";
                        }
                    }
                    rawdataIds = rawdataIds.replaceFirst(",", "");
                    rawdataIds += "]";

                    response.getWriter().print("{success: " + (rawdata_ids == null || rawdata_ids.isEmpty()) + ", " + rawdataIds + " }");
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
            ServerErrorManager.addErrorMessage(4, Samples_servlets.class.getName(), "check_removable", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //*****HTTP GET REQUESTS HANDLERS*****************************************************
    //************************************************************************************
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");

        if (request.getServletPath().equals("/get_treatment_document")) {
            get_treatment_document_handler(request, response);
        } else {
            ServerErrorManager.addErrorMessage(3, Samples_servlets.class.getName(), "doGet", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_treatment_document_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String biocondition_id = request.getParameter("biocondition_id");

        try {
            File file = new File(DATA_LOCATION + TREATMENT_DOCUMENTS_LOCATION + biocondition_id + "_treatment.pdf");

            if (file.exists()) {
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.setContentType("application/pdf");
                response.addHeader("Content-Disposition", "attachment; filename=" + biocondition_id + "_treatment.pdf");
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
            ServerErrorManager.addErrorMessage(4, Samples_servlets.class.getName(), "get_treatment_document_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }
}
