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
import bdManager.DAO.analysis.Analysis_JDBCDAO;
import bdManager.DAO.analysis.Step_JDBCDAO;
import classes.Experiment;
import classes.Message;
import classes.User;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.util.ArrayList;
import classes.analysis.Analysis;
import classes.analysis.NonProcessedData;
import classes.analysis.ProcessedData;
import classes.analysis.Step;
import classes.analysis.non_processed_data.IntermediateData;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import common.BlockedElementsManager;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.security.AccessControlException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.Cookie;

/**
 *
 * SERVLET FOR ANALYSIS:
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | Resource             |       POST            |    GET        |                       PUT                            |        DELETE       |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/analysis       | Create a new analysis | List analysis | Replace analysis list with new analysis(Bulk update) | Delete all analysis |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/analysis/1234  |       Error           | Show analysis |       If exist update analysis else ERROR            | Delete analysis     |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 * | /rest/analysis/import| Import a new analysis |     Error     |                        Error                         |          Error      |
 * +----------------------+-----------------------+---------------+------------------------------------------------------+---------------------+
 *
 */
public class Analysis_servlets extends Servlet {

    String IMAGE_FILES_LOCATION = File.separator + "<experiment_id>" + File.separator + "analysis_images" + File.separator;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        //OLD SERVICES
        if (!matchService(request.getServletPath(), "/rest/analysis(.*)")) {
            if (request.getServletPath().equals("/get_all_analysis")) {
                get_all_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/get_analysis")) {
                get_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/get_all_region_steps")) {
//            get_all_region_steps_handler(request, response);
            } else if (request.getServletPath().equals("/add_analysis")) {
                add_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/update_analysis")) {
                update_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/lock_analysis")) {
                lock_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/unlock_analysis")) {
                unlock_analysis_handler(request, response);
            } else if (request.getServletPath().equals("/remove_analysis")) {
                delete_analysis_handler(request, response);
            }
            return;
        }

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/import")) {
            import_analysis_handler(request, response);
        } else if (matchService(request.getPathInfo(), "/(.+)")) {
            //Do nothing
        } else {
            add_analysis_handler(request, response);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        //OLD SERVICES
        if (!matchService(request.getServletPath(), "/rest/analysis(.*)")) {
            if (request.getServletPath().equals("/get_analysis_img_prev")) {
                getAnalysisPreviewImageHandler(request, response);
            } else if (request.getServletPath().equals("/get_analysis_img")) {
                getAnalysisImageHandler(request, response);
            } else if (request.getServletPath().equals("/get_step_subtypes")) {
                get_step_subtypes_handler(request, response);
            }
            return;
        }

        //NEW SERVICES
        if (matchService(request.getPathInfo(), "/(.+)")) {
            get_analysis_handler(request, response);
        } else {
            get_all_analysis_handler(request, response);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            update_analysis_handler(request, response);
        } else {
            update_all_analysis_handler(request, response);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        if (matchService(request.getPathInfo(), "/(.+)")) {
            delete_analysis_handler(request, response);
        } else {
            delete_all_analysis_handler(request, response);
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * POST REQUEST HANDLERS                                                                    *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void add_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String lockedID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            Analysis analysis = null;
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
                 * STEP 2 Get the new ID for the ANALYSIS. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Analysis");
                lockedID = daoInstance.getNextObjectID(null);

                /**
                 * *******************************************************
                 * STEP 3 Get the ANALYSIS Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP 5b ELSE -->
                 * GO TO STEP 4
                 * *******************************************************
                 */
                //Get parameters
                analysis = Analysis.fromJSON(requestData.get("analysis_json_data"));

                ArrayList<Step> steps = new ArrayList<Step>();
                for (Step step : analysis.getNonProcessedData()) {
                    if (!"new_deleted".equals(step.getStatus())) {
                        steps.add(step);
                    }
                }
                analysis.setNonProcessedData(steps.toArray(new NonProcessedData[]{}));

                steps = new ArrayList<Step>();
                for (Step step : analysis.getProcessedData()) {
                    if (!"new_deleted".equals(step.getStatus())) {
                        steps.add(step);
                    }
                }
                analysis.setProcessedData(steps.toArray(new ProcessedData[]{}));

                String experimentID = requestData.get("currentExperimentID").getAsString();

                //Parse the data
                analysis.updateAnalysisID(lockedID);
                analysis.setAssociated_experiment(experimentID);

                /**
                 * *******************************************************
                 * STEP 4 Add the new ANALYSIS Object in the DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.insert(analysis);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "add_analysis_handler", e.getMessage());
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
                        daoInstance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("newID", new JsonPrimitive(lockedID));
                    response.getWriter().print(obj.toString());
                }

                /**
                 * UNLOCK THE IDS
                 */
                if (lockedID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(lockedID);
                }
                /**
                 * *******************************************************
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "add_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void import_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String lockedID = null;
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            Analysis analysis = null;
            try {
                
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                Map<String, Cookie> cookies = this.getCookies(request);
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());
                
                String loggedUser, loggedUserID = null, sessionToken;
                if (cookies != null) {
                    loggedUser = cookies.get("loggedUser").getValue();
                    sessionToken = cookies.get("sessionToken").getValue();
                    loggedUserID = cookies.get("loggedUserID").getValue();
                } else{
                    String apicode = requestData.get("apicode").getAsString() ;
                    apicode = new String(java.util.Base64.getDecoder().decode(apicode));
                    
                    loggedUser = apicode.split(":")[0];
                    sessionToken = apicode.split(":")[1];
                }
                
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }
                                
                if(loggedUserID == null){
                    daoInstance = DAOProvider.getDAOByName("User");
                    loggedUserID = ((User) daoInstance.findByID(loggedUser, new Object[]{null, false, true})).getUserID();
                }


                String experimentID = requestData.get("experiment_id").getAsString();
                String origin = requestData.get("origin").getAsString();

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER EXISTS AND IF EXPERIMENT IS VALID
                 * *******************************************************
                 */

                daoInstance = DAOProvider.getDAOByName("Experiment");
                Experiment experiment = (Experiment) daoInstance.findByID(experimentID, null);
                if (experiment == null) {
                    throw new AccessControlException(experimentID + " is not a valid experiment identifier.");
                } else if (!experiment.isOwner(loggedUserID) && !experiment.isMember(loggedUserID)) {
                    throw new AccessControlException("User " + loggedUserID + " is not a valid member of the experiment " + experimentID + ".");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the new ID for the ANALYSIS. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Analysis");
                lockedID = daoInstance.getNextObjectID(null);
                requestData.add("analysis_id", new JsonPrimitive(lockedID));
                
                /**
                 * *******************************************************
                 * STEP 3 Get the ANALYSIS Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP 5b ELSE -->
                 * GO TO STEP 4
                 * *******************************************************
                 */
                analysis = Analysis.parseAnalysisData(origin, loggedUserID, requestData);
                analysis.updateAnalysisID(lockedID);
                analysis.setAssociated_experiment(experimentID);

                /**
                 * *******************************************************
                 * STEP 4 Add the new ANALYSIS Object in the DATABASE. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance.insert(analysis);

                /**
                 * *******************************************************
                 * STEP 4 Add a new message. IF ERROR
                 * --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                Message message = new Message();
                message.setUserID(loggedUserID);
                message.setType("info");
                message.setSender("STATegraEMS notifications");
                message.setTo(loggedUserID);
                message.setSubject("New analysis imported from " + origin);
                message.setContent(
                        "A new analysis called \"" + analysis.getAnalysisName() + "\" has been created for experiment " + experimentID
                        + " using an external tool (data imported from " + origin + ").");

                daoInstance = DAOProvider.getDAOByName("Message");
                daoInstance.insert(message);

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP 5b ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "import_analysis_handler", e.getMessage());
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
                        daoInstance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("newID", new JsonPrimitive(lockedID));
                    response.getWriter().print(obj.toString());
                }

                /**
                 * UNLOCK THE IDS
                 */
                if (lockedID != null) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(lockedID);
                }
                /**
                 * *******************************************************
                 * STEP 6 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "import_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * GET REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void get_all_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> analysisList = null;
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
                    throw new AccessControlException("Your session is invalid. Please sign in again.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = false;
                if (requestData.has("loadRecursive")) {
                    loadRecursive = requestData.get("loadRecursive").getAsBoolean();
                }

                String experiment_id = null;
                if (requestData.has("experiment_id")) {
                    experiment_id = requestData.get("experiment_id").getAsString();
                } else {
                    experiment_id = requestData.get("currentExperimentID").getAsString();
                }

                Object[] params = {loadRecursive, experiment_id};
                dao_instance = DAOProvider.getDAOByName("Analysis");
                analysisList = dao_instance.findAll(params);
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_all_analysis_handler", e.getMessage());
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
                    String analysisJSON = "[";

                    for (int i = 0; i < analysisList.size(); i++) {
                        analysisJSON += ((Analysis) analysisList.get(i)).toJSON() + ((i < analysisList.size() - 1) ? "," : "");
                    }
                    analysisJSON += "]";

                    response.getWriter().print(analysisJSON);
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
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_all_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Analysis analysis = null;
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
                 * STEP 2 Get THE ANALYSIS Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                dao_instance = DAOProvider.getDAOByName("Analysis");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                String analysis_id = requestData.get("analysis_id").getAsString();
                analysis = (Analysis) dao_instance.findByID(analysis_id, params);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_analysis_handler", e.getMessage());
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
                     * STEP 3A WRITE SUCCESS RESPONSE. GO TO STEP 4
                     * *******************************************************
                     */
                    response.getWriter().print(analysis.toJSON());
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
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * PUT REQUEST HANDLERS                                                                     *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void update_all_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
    }

    private void update_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            ArrayList<String> BLOCKED_IDs = new ArrayList<String>();
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance1 = null;
            DAO daoInstance2 = null;

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

                Map<String, Cookie> cookies = this.getCookies(request);
                String loggedUser = cookies.get("loggedUser").getValue();
                String sessionToken = cookies.get("sessionToken").getValue();
                String loggedUserID = cookies.get("loggedUserID").getValue();
                
                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 3 Get the Object by parsing the JSON data. IF ERROR -->
                 * throws JsonParseException, GO TO STEP 6b ELSE --> GO TO STEP
                 * 4 *******************************************************
                 */
                Analysis analysis = Analysis.fromJSON(requestData.get("analysis_json_data"));

                daoInstance1 = DAOProvider.getDAOByName("Analysis");

                //CHECK IF CURRENT USER IS A VALID OWNER (AVOID HACKING)
                boolean loadRecursive = true;
                Analysis analysisAux = (Analysis) daoInstance1.findByID(analysis.getAnalysisID(), new Object[]{loadRecursive});
                if (!analysisAux.isOwner(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot update selected Analysis. Current user has not privileges over this element.");
                }
                
                if("pending".equalsIgnoreCase(analysis.getStatus())){
                    analysis.setStatus("open");
                }

                /**
                 * *******************************************************
                 * STEP 4 READ ALL STEPS AND CREATE THE LIST OF TASKS.
                 * *******************************************************
                 */
                ArrayList<Step> to_be_created_steps = new ArrayList<Step>();
                ArrayList<Step> to_be_updated_steps = new ArrayList<Step>();
                ArrayList<String> to_be_deleted_steps = new ArrayList<String>();

                for (Step step : analysis.getNonProcessedData()) {
                    if ("new_deleted".equals(step.getStatus())) {
                        continue; //ignore
                    } else if ("deleted".equals(step.getStatus()) || "edited_deleted".equals(step.getStatus())) {
                        to_be_deleted_steps.add(step.getStepID()); //DELETES THE STEP
                    } else if ("new".equals(step.getStatus())) {
                        to_be_created_steps.add(step); //CREATES THE STEP
                    } else {
                        if ("edited".equals(step.getStatus())) {
                            to_be_updated_steps.add(step);
                        }
                    }
                }

                for (Step step : analysis.getProcessedData()) {
                    if ("new_deleted".equals(step.getStatus())) {
                        continue; //ignore
                    } else if ("deleted".equals(step.getStatus()) || "edited_deleted".equals(step.getStatus())) {
                        to_be_deleted_steps.add(step.getStepID()); //DELETES THE STEP
                    } else if ("new".equals(step.getStatus())) {
                        to_be_created_steps.add(step); //CREATES THE STEP
                    } else {
                        if ("edited".equals(step.getStatus())) {
                            to_be_updated_steps.add(step);
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 5 GET ALL THE IDS FOR THE NEW STEPS AND UPDATE THE
                 * INFORMATION
                 * *******************************************************
                 */
                daoInstance1 = DAOProvider.getDAOByName("Analysis");
                daoInstance2 = DAOProvider.getDAOByName("Step");

                Collections.sort(to_be_created_steps);
                for (Step step : to_be_created_steps) {
                    String old_id = step.getStepID();
                    String new_id = daoInstance2.getNextObjectID(new Object[]{analysis.getAnalysisID()});
                    BLOCKED_IDs.add(new_id);

                    step.setStepID(new_id);
                    String[] usedData;
                    for (Step stepAux : analysis.getNonProcessedData()) {
                        if (stepAux instanceof IntermediateData) {
                            usedData = ((IntermediateData) stepAux).getUsedData();
                            int pos = Arrays.asList(usedData).indexOf(old_id);
                            if (pos != -1) {
                                usedData[pos] = new_id;
                            }
                        }

                    }
                    for (Step stepAux : analysis.getProcessedData()) {
                        if (stepAux instanceof ProcessedData) {
                            usedData = ((ProcessedData) stepAux).getUsedData();
                            int pos = Arrays.asList(usedData).indexOf(old_id);
                            if (pos != -1) {
                                usedData[pos] = new_id;
                            }
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 5 ADD, UPDATE AND REMOVE THE NPD instances IN DATABASE.
                 * Must be in this order because: -- If we change the used data
                 * for a specified step adding a to be created step, must be
                 * inserted first. -- If we change the used data removing an
                 * used step and then we delete this step (the used one), we
                 * must update first (because of foreign keys) With this method,
                 * when an step is removed, the step_id is lost. Because the
                 * "getNextStepID" function is called before removing ADDED
                 * steps must be ordered from less to greater step_number
                 * <p/>
                 * IF ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO
                 * TO STEP 6
                 * *******************************************************
                 */
                daoInstance1.disableAutocommit();
                ROLLBACK_NEEDED = true;
                daoInstance1.update(analysis);

                /**
                 * *******************************************************
                 * STEP 6 APPLY THE STEP TASKS IN DATABASE. IF ERROR --> throws
                 * SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 8
                 * *******************************************************
                 */
                ((Step_JDBCDAO) daoInstance2).insert(to_be_created_steps.toArray(new Step[]{}));
                ((Step_JDBCDAO) daoInstance2).remove(to_be_deleted_steps.toArray(new String[]{}));
                ((Step_JDBCDAO) daoInstance2).update(to_be_updated_steps.toArray(new Step[]{}));

                /**
                 * *******************************************************
                 * STEP 7 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 8
                 * *******************************************************
                 */
                daoInstance1.doCommit();
            } catch (Exception e) {
                if (e.getClass().getSimpleName().equals("MySQLIntegrityConstraintViolationException")) {
                    ServerErrorManager.handleException(null, null, null, "Unable to update the Analysis information.");
                } else {
                    ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "update_analysis_handler", e.getMessage());
                }
            } finally {
                /**
                 * *******************************************************
                 * STEP 7b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());

                    for (String BLOCKED_ID : BLOCKED_IDs) {
                        BlockedElementsManager.getBlockedElementsManager().unlockID(BLOCKED_ID);
                    }
                    if (ROLLBACK_NEEDED) {
                        daoInstance1.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    response.getWriter().print(obj.toString());
                }

                for (String BLOCKED_ID : BLOCKED_IDs) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(BLOCKED_ID);
                }

                /**
                 * *******************************************************
                 * STEP 9 Close connection.
                 * ********************************************************
                 */
                if (daoInstance1 != null) {
                    daoInstance1.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "update_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /*------------------------------------------------------------------------------------------*
     *                                                                                          *
     * DELETE REQUEST HANDLERS                                                                  *
     *                                                                                          *
     *------------------------------------------------------------------------------------------*/
    private void delete_all_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
    }

    private void delete_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            boolean removable = true;
            String loggedUser = null;
            String analysisID = null;

            try {
                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                JsonParser parser = new JsonParser();
                JsonObject requestData = (JsonObject) parser.parse(request.getReader());

                loggedUser = requestData.get("loggedUser").getAsString();
                String sessionToken = requestData.get("sessionToken").getAsString();

                if (!checkAccessPermissions(loggedUser, sessionToken)) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                String loggedUserID = requestData.get("loggedUserID").getAsString();
                String experimentID = requestData.get("currentExperimentID").getAsString();
                analysisID = requestData.get("analysis_id").getAsString();

                /**
                 * *******************************************************
                 * STEP 2 Get THE ANALYSIS Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                daoInstance = DAOProvider.getDAOByName("Analysis");

                Analysis analysis = (Analysis) daoInstance.findByID(analysisID, params);
                if (!analysis.isOwner(loggedUserID) && !loggedUserID.equals("admin")) {
                    throw new AccessControlException("Cannot remove selected Analysis. Current user has not privileges over this element.");
                }

                /**
                 * *******************************************************
                 * STEP 3 Check if the user + the users in the remove_requests
                 * list are the owners for all the steps. If at least one of the
                 * steps has an user not in the list and the step is not
                 * imported, then we add the user to the remove_requests.
                 * Otherwise, we can remove the steps (or unlink) and the
                 * analysis.
                 * *******************************************************
                 */
                Set<String> users = new HashSet<String>(Arrays.asList(analysis.getRemoveRequests()));
                users.add(loggedUserID);

                //TODO: add admin user !loggedUserID.equalsIgnoreCase("admin")
                for (Step step : analysis.getNonProcessedData()) {
                    if (step.getAnalysisID().equalsIgnoreCase(analysisID)) { //If not imported step
                        boolean isOwner = false;
                        for (String user : users) { //Check if at least one of the users that want to remove is owner
                            isOwner = isOwner || step.isOwner(user);
                        }
                        if (!isOwner) {
                            removable = false;
                            break;
                        }
                    }
                }

                if (removable) {
                    for (Step step : analysis.getProcessedData()) {
                        if (step.getAnalysisID().equalsIgnoreCase(analysisID)) { //If not imported step
                            boolean isOwner = false;
                            for (String user : users) { //Check if at least one of the users that want to remove is owner
                                isOwner = isOwner || step.isOwner(user);
                            }
                            if (!isOwner) {
                                removable = false;
                                break;
                            }
                        }
                    }
                }

                /**
                 * *******************************************************
                 * STEP 4 If the analysis is removable, then we proceed to
                 * remove the analysis (includes unlinking shared steps).
                 * Otherwise, we update the list of remove_requests
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Analysis");
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                if (removable) {
                    ((Analysis_JDBCDAO) daoInstance).remove(analysis);
                    //DELETE THE DATA DIRECTORY
                    File file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experimentID) + analysisID + "_prev.jpg");
                    if (file.exists()) {
                        file.delete();
                    }
                    file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experimentID) + analysisID + ".png");
                    if (file.exists()) {
                        file.delete();
                    }
                } else {
                    ((Analysis_JDBCDAO) daoInstance).updateRemoveRequests(analysisID, users.toArray(new String[]{}));
                }

                /**
                 * *******************************************************
                 * STEP 5 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 6
                 * *******************************************************
                 */
                daoInstance.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "remove_analysis_handler", e.getMessage());
            } finally {
                /**
                 * *******************************************************
                 * STEP 7b CATCH ERROR, CLEAN CHANGES. throws SQLException
                 * *******************************************************
                 */
                if (ServerErrorManager.errorStatus()) {
                    response.setStatus(400);
                    response.getWriter().print(ServerErrorManager.getErrorResponse());
                    if (ROLLBACK_NEEDED) {
                        daoInstance.doRollback();
                    }
                } else {
                    JsonObject obj = new JsonObject();
                    obj.add("success", new JsonPrimitive(true));
                    obj.add("removed", new JsonPrimitive(removable));
                    response.getWriter().print(obj.toString());
                }

                BlockedElementsManager.getBlockedElementsManager().unlockObject(analysisID, loggedUser);

                /**
                 * *******************************************************
                 * STEP 9 Close connection.
                 * ********************************************************
                 */
                if (daoInstance != null) {
                    daoInstance.closeConnection();
                }
            }
            //CATCH IF THE ERROR OCCURRED IN ROLL BACK OR CONNECTION CLOSE 
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "remove_analysis_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //************************************************************************************
    //*****OTHER SERVLET HANDLERS ****************************************************
    //************************************************************************************
    //************************************************************************************

    private void lock_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        String locker_id = "";
        ArrayList<String> notLockedSteps = new ArrayList<String>();

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
            String analysis_id = requestData.get("analysis_id").getAsString();
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(analysis_id, loggedUser);

            /**
             * *******************************************************
             * STEP 3 TRY TO LOCK THE STEPS. exception, GO TO STEP ELSE --> GO
             * TO STEP 3 *******************************************************
             */
            if (!alreadyLocked) {
                DAO dao_instance = DAOProvider.getDAOByName("Analysis");
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                Analysis analysis = (Analysis) dao_instance.findByID(analysis_id, params);
                dao_instance.closeConnection();
                String step_id;
                for (Step step : analysis.getNonProcessedData()) {
                    step_id = step.getStepID();
                    if (!BlockedElementsManager.getBlockedElementsManager().lockObject(step_id, loggedUser)) {
                        notLockedSteps.add(step_id);
                    }
                }
                for (Step step : analysis.getProcessedData()) {
                    step_id = step.getStepID();
                    if (!BlockedElementsManager.getBlockedElementsManager().lockObject(step_id, loggedUser)) {
                        notLockedSteps.add(step_id);
                    }
                }

                //UNLOCK STEPS AND ANALYSIS
                if (notLockedSteps.size() > 0) {
                    BlockedElementsManager.getBlockedElementsManager().unlockObject(analysis_id, loggedUser);
                    for (Step step : analysis.getNonProcessedData()) {
                        BlockedElementsManager.getBlockedElementsManager().unlockObject(step.getStepID(), loggedUser);
                    }
                    for (Step step : analysis.getProcessedData()) {
                        BlockedElementsManager.getBlockedElementsManager().unlockObject(step.getStepID(), loggedUser);
                    }
                }
            } else {
                locker_id = BlockedElementsManager.getBlockedElementsManager().getLockerID(analysis_id);
            }
        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "lock_analysis_handler", e.getMessage());
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
                } else if (notLockedSteps.size() > 0) {
                    JsonArray _notLockedSteps = new JsonArray();
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive("Some of the steps are locked by other users"));
                    for (String step_id : notLockedSteps) {
                        _notLockedSteps.add(new JsonPrimitive(step_id));
                    }
                    obj.add("notLockedSteps", _notLockedSteps);

                } else {
                    obj.add("success", new JsonPrimitive(true));
                }
                response.getWriter().print(obj.toString());
            }
        }
    }

    private void unlock_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyUnlocked = false;
        ArrayList<String> notUnlockedSteps = new ArrayList<String>();

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
             * STEP 2 GET THE OBJECT ID AND TRY TO UNLOCK IT. IF ERROR -->
             * throws exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String analysis_id = requestData.get("analysis_id").getAsString();
            alreadyUnlocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(analysis_id, loggedUser);

            /**
             * *******************************************************
             * STEP 3 TRY TO UNLOCK THE STEPS. exception, GO TO STEP ELSE --> GO
             * TO STEP 3 *******************************************************
             */
            DAO dao_instance = DAOProvider.getDAOByName("Analysis");
            boolean loadRecursive = true;
            Object[] params = {loadRecursive};
            Analysis analysis = (Analysis) dao_instance.findByID(analysis_id, params);
            dao_instance.closeConnection();
            if (analysis != null) {
                String step_id;
                for (Step step : analysis.getNonProcessedData()) {
                    step_id = step.getStepID();
                    if (!BlockedElementsManager.getBlockedElementsManager().unlockObject(step_id, loggedUser)) {
                        notUnlockedSteps.add(step_id);
                    }
                }
                for (Step step : analysis.getProcessedData()) {
                    step_id = step.getStepID();
                    if (!BlockedElementsManager.getBlockedElementsManager().unlockObject(step_id, loggedUser)) {
                        notUnlockedSteps.add(step_id);
                    }
                }
            }

        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "unlock_analysis_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 3b CATCH ERROR.
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
                if (alreadyUnlocked) {
                    obj.add("success", new JsonPrimitive(false));
                    obj.add("reason", new JsonPrimitive(BlockedElementsManager.getErrorMessage()));
                } else {
                    obj.add("success", new JsonPrimitive(true));

                    if (notUnlockedSteps.size() > 0) {
                        JsonArray _notUnlockedSteps = new JsonArray();
                        for (String step_id : notUnlockedSteps) {
                            _notUnlockedSteps.add(new JsonPrimitive(step_id));
                        }
                        obj.add("notUnlockedSteps", _notUnlockedSteps);
                    }
                }
                response.getWriter().print(obj.toString());
            }
        }
    }

    private void getAnalysisPreviewImageHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String analysisID = request.getParameter("analysis_id");
        String experiment_id = request.getParameter("experimentID");

        try {
            File file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experiment_id) + analysisID + "_prev.jpg");

            if (file.exists()) {
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");

                response.setContentType("image/jpeg");
                response.addHeader("Content-Disposition", "attachment; filename=" + analysisID + "_prev.jpg");
                response.setContentLength((int) file.length());

                FileInputStream fileInputStream = new FileInputStream(file);
                OutputStream responseOutputStream = response.getOutputStream();
                int bytes;
                while ((bytes = fileInputStream.read()) != -1) {
                    responseOutputStream.write(bytes);
                }
                responseOutputStream.close();
            }
        } catch (NullPointerException e) {
            ServerErrorManager.addErrorMessage(4, Analysis_servlets.class.getName(), "get_analysis_img_prev_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Analysis_servlets.class.getName(), "get_analysis_img_prev_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void getAnalysisImageHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String analysis_id = request.getParameter("analysis_id");
        String experiment_id = request.getParameter("experimentID");

        try {
            File file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experiment_id) + analysis_id + ".png");

            if (file.exists()) {
                response.reset();
                response.addHeader("Access-Control-Allow-Origin", "*");

                response.setContentType("image/png");
                response.addHeader("Content-Disposition", "attachment; filename=" + analysis_id + ".png");
                response.setContentLength((int) file.length());

                FileInputStream fileInputStream = new FileInputStream(file);
                OutputStream responseOutputStream = response.getOutputStream();
                int bytes;
                while ((bytes = fileInputStream.read()) != -1) {
                    responseOutputStream.write(bytes);
                }

                responseOutputStream.close();
            }
        } catch (NullPointerException e) {
            ServerErrorManager.addErrorMessage(4, Analysis_servlets.class.getName(), "get_analysis_img_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        } catch (Exception e) {
            ServerErrorManager.addErrorMessage(4, Analysis_servlets.class.getName(), "get_analysis_img_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    private void get_step_subtypes_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ArrayList<String> subtypes = new ArrayList<String>();
        try {
            String step_type = request.getParameter("step_type");

            String path = Analysis_servlets.class.getResource("/../../data/templates/" + step_type).getPath();
            File folder = new File(path);

            String filename;
            for (File fileEntry : folder.listFiles()) {
                if (!fileEntry.isDirectory()) {
                    filename = fileEntry.getName();
                    filename = filename.replaceAll("_", " ");
                    filename = filename.replace("-form.json", "");
//                    filename = filename.substring(0, 1).toUpperCase() + filename.substring(1);
                    subtypes.add(filename);
                }
            }

        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_step_subtypes_handler", e.getMessage());
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
                 * STEP 3A WRITE SUCCESS RESPONSE. GO TO STEP 4
                 * *******************************************************
                 */
                JsonObject obj = new JsonObject();
                JsonArray _subtypes = new JsonArray();
                for (String subtype : subtypes) {
                    _subtypes.add(new JsonPrimitive(subtype));
                }
                obj.add("subtypes", _subtypes);
                response.getWriter().print(obj.toString());
            }
        }
    }

}
