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
import bdManager.DAO.analysis.Step_JDBCDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import common.ServerErrorManager;
import java.util.ArrayList;
import classes.analysis.Analysis;
import classes.analysis.NonProcessedData;
import classes.analysis.ProcessedData;
import classes.analysis.processed_data.Region_step;
import common.BlockedElementsManager;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.security.AccessControlException;
import java.util.Collections;
import java.util.zip.GZIPOutputStream;
import javax.imageio.ImageIO;
import org.apache.commons.codec.binary.Base64;

/**
 *
 * <p/>
 * SERVLET FOR: - Get a list of all analysis /get_all_analysis - Get an analysis
 * /get_analysis - Add an analysis /add_analysis - Save an analysis image
 * /save_analysis_image - Get an analysis image /get_analysis_img (GET PROTOCOL)
 * - Add new non processed data /add_new_non_processed_data - Add new processed
 * data /add_new_processed_data - Edit an analysis /edit_analysis - Unblock an
 * analysis /unblock_analysis - Update a non processed data
 * /update_non_processed_data - Update a processed data /update_processed_data -
 * Remove analysis /remove_analysis - Remove non processed data
 * /remove_non_processed_data - Remove processed data /remove_processed_data
 * <p/>
 * This class implements the servlet used to manage all analysis requests from
 * non processed and processed data. All requests should be carried out only via
 * POST.
 *
 * @authors Rafa Hernández de Diego & Noemi Boix Chova
 */
public class Analysis_servlets extends Servlet {

    String IMAGE_FILES_LOCATION = File.separator + "<experiment_id>" + File.separator + "analysis_images" + File.separator;

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

        if (request.getServletPath().equals("/get_all_analysis")) {
            get_all_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/get_analysis")) {
            get_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/get_all_region_steps")) {
            get_all_region_steps_handler(request, response);
        } else if (request.getServletPath().equals("/add_analysis")) {
            add_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/save_analysis_image")) {
            save_analysis_image_handler(request, response);
        } else if (request.getServletPath().equals("/update_analysis")) {
            update_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/lock_analysis")) {
            lock_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/unlock_analysis")) {
            unlock_analysis_handler(request, response);
        } else if (request.getServletPath().equals("/remove_analysis")) {
            remove_analysis_handler(request, response);
        } else {
            common.ServerErrorManager.addErrorMessage(3, Analysis_servlets.class.getName(), "doPost", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    //************************************************************************************
    //************************************************************************************
    //*****ANALYSIS SERVLET HANDLERS ****************************************************
    //************************************************************************************
    //************************************************************************************
    /**
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void get_all_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> analysisList = null;
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
                 * STEP 2 Get ALL THE ANALYSIS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = false;
                if (request.getParameter("loadRecursive") != null) {
                    loadRecursive = Boolean.parseBoolean(request.getParameter("loadRecursive"));
                }

                String experiment_id = request.getParameter("experimentID");
                if(experiment_id == ""){
                    experiment_id = request.getParameter("currentExperimentID");
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
                    //If some errors occurred
                    String analysisJSON = "analysisList : [";

                    for (Object analysis : analysisList) {
                        analysisJSON += ((Analysis) analysis).toJSON() + ", ";
                    }
                    analysisJSON += "]";
                    
                    OutputStream out1 = response.getOutputStream();
                    PrintWriter out = new PrintWriter(new GZIPOutputStream(out1), false);

                    response.setHeader("Content-Encoding", "gzip");
                    response.setHeader("Content-Type", "application/json");
                    out.print("{success: " + true + ", " + analysisJSON + " }");
                    out.close();
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

    /**
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void get_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            Analysis analysis = null;
            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * 5b ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not valid.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get THE ANALYSIS Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                dao_instance = DAOProvider.getDAOByName("Analysis");
                String analysis_id = request.getParameter("analysis_id");
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
                    String analysisJSON = "analysisList : [";
                    analysisJSON += analysis.toJSON() + ", ";
                    analysisJSON += "]";
                    
                                        
                    OutputStream out1 = response.getOutputStream();
                    PrintWriter out = new PrintWriter(new GZIPOutputStream(out1), false);

                    response.setHeader("Content-Encoding", "gzip");
                    response.setHeader("Content-Type", "application/json");
                    out.print("{success: " + true + ", " + analysisJSON + " }");
                    out.close();
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

    /*
     * name: get_all_region_steps_handler
     * description :
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void get_all_region_steps_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DAO dao_instance = null;
            ArrayList<Object> region_step_list = null;
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
                 * STEP 2 Get ALL THE REGIONS Object from DB. IF ERROR -->
                 * throws MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = false;
                Object[] params = {loadRecursive};
                dao_instance = DAOProvider.getDAOByName("Region_step");
                region_step_list = dao_instance.findAll(params);

            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_all_region_steps_handler", e.getMessage());
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
                    String regionStepsListJSON = "regionStepsList : [";
                    for (Object region_step : region_step_list) {
                        regionStepsListJSON += ((Region_step) region_step).toJSON() + ", ";
                    }
                    regionStepsListJSON += "]";
                    response.getWriter().print("{success: " + true + ", " + regionStepsListJSON + " }");
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
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "get_all_region_steps_handler", e.getMessage());
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
        }
    }

    /**
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void add_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get the new ID for the ANALYSIS. IF ERROR --> throws
                 * SQL Exception, GO TO STEP 5b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("Analysis");
                String newID = daoInstance.getNextObjectID(null);
                lockedID = newID;

                /**
                 * *******************************************************
                 * STEP 3 Get the ANALYSIS Object by parsing the JSON data. IF
                 * ERROR --> throws JsonParseException, GO TO STEP 5b ELSE -->
                 * GO TO STEP 4
                 * *******************************************************
                 */
                //Get parameters
                String analysisJSONdata = request.getParameter("analysis_json_data");
                String experimentID = request.getParameter("currentExperimentID");
                //Parse the data
                analysis = Analysis.fromJSON(analysisJSONdata);
                analysis.updateAnalysisID(newID);
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
                    String analysisJSON = "analysisList : [";
                    analysisJSON += analysis.toJSON() + ", ";
                    analysisJSON += "]";

                    response.getWriter().print("{success: " + true + ", " + analysisJSON + " }");
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

    /**
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void update_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            ArrayList<String> lockedIDs = new ArrayList<String>();
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance1 = null;
            DAO daoInstance2 = null;

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 READ ALL PARAMETERS --> ARRAYS WITH ALL TASKS. ELSE
                 * --> GO TO STEP 3
                 * *******************************************************
                 */
                String[] toBeCreatedNPD_jsondata_list = request.getParameterValues("to_be_created_NPD");
                String[] toBeImportedNPD_jsondata_list = request.getParameterValues("to_be_imported_NPD");
                String[] toBeCreatedPD_jsondata_list = request.getParameterValues("to_be_created_PD");
                String[] toBeEditedNPD_jsondata_list = request.getParameterValues("to_be_edited_NPD");
                String[] toBeEditedPD_jsondata_list = request.getParameterValues("to_be_edited_PD");
                String[] toBeDeletedNPD_jsondata_list = request.getParameterValues("to_be_deleted_NPD");
                String[] toBeDisassociatedNPD_jsondata_list = request.getParameterValues("to_be_disassociated_NPD");
                String[] toBeDeletedPD_jsondata_list = request.getParameterValues("to_be_deleted_PD");
                String analysisID = request.getParameter("analysis_id");

                /**
                 * *******************************************************
                 * STEP 3 Get all the NON PROCESSED DATA Objects by parsing the
                 * JSON data. IF ERROR --> throws JsonParseException, GO TO STEP
                 * ? throws SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 4
                 * *******************************************************
                 */
                ArrayList<NonProcessedData> toBeCreatedNPD_instances = new ArrayList<NonProcessedData>();
                if (toBeCreatedNPD_jsondata_list != null) {
                    for (String toBeCreatedNPD_jsondata : toBeCreatedNPD_jsondata_list) {
                        toBeCreatedNPD_instances.add(NonProcessedData.fromJSON(toBeCreatedNPD_jsondata));
                    }
                }
                //ORDER THE TO BE CREATED NON PROCESSED DATA BY STEP_NUMBER (to avoid dependecies troubles)
                Collections.sort(toBeCreatedNPD_instances);

                ArrayList<NonProcessedData> toBeEditedNPD_instances = new ArrayList<NonProcessedData>();
                if (toBeEditedNPD_jsondata_list != null) {
                    for (String toBeEditedNPD_jsondata : toBeEditedNPD_jsondata_list) {
                        toBeEditedNPD_instances.add(NonProcessedData.fromJSON(toBeEditedNPD_jsondata));
                    }
                }

                /**
                 * *******************************************************
                 * STEP 4 Get all the PROCESSED DATA Objects by parsing the JSON
                 * data. IF ERROR --> throws JsonParseException, GO TO STEP ?
                 * throws SQL Exception, GO TO STEP ? ELSE --> GO TO STEP 5
                 * *******************************************************
                 */
                ArrayList<ProcessedData> toBecreatedPD_instances = new ArrayList<ProcessedData>();
                if (toBeCreatedPD_jsondata_list != null) {
                    for (String toBeCreatedPD_jsondata : toBeCreatedPD_jsondata_list) {
                        toBecreatedPD_instances.add(ProcessedData.fromJSON(toBeCreatedPD_jsondata));
                    }
                }

                ArrayList<ProcessedData> toBeEditedPD_instances = new ArrayList<ProcessedData>();
                if (toBeEditedPD_jsondata_list != null) {
                    for (String toBeEditedPD_jsondata : toBeEditedPD_jsondata_list) {
                        toBeEditedPD_instances.add(ProcessedData.fromJSON(toBeEditedPD_jsondata));
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
                daoInstance1 = DAOProvider.getDAOByName("NonProcessedData");
                daoInstance2 = DAOProvider.getDAOByName("ProcessedData");

                daoInstance1.disableAutocommit();
                ROLLBACK_NEEDED = true;
                //FIRST REMOVE ASSOCIATIONS AND STEPS:
                ((Step_JDBCDAO) daoInstance1).removeStepAssociation(toBeDisassociatedNPD_jsondata_list, analysisID);
                daoInstance1.remove(toBeDeletedNPD_jsondata_list);
//                ((Step_JDBCDAO) daoInstance2).removeStepAssociation(toBeDisassociatedPD_jsondata_list, analysisID);
                daoInstance2.remove(toBeDeletedPD_jsondata_list);

                //ADD ASSOCIATIONS BECAUSE:
                // - EDITED LATER STEPS COULD USE THE IMPORTED STEPS
                // - CREATED LATER STEPS COULD USE THE IMPORTED STEPS
                ((Step_JDBCDAO) daoInstance1).insertNewStepAssociation(toBeImportedNPD_jsondata_list, analysisID);
//                ((Step_JDBCDAO) daoInstance2).insertNewStepAssociation(toBeImportedPD_jsondata_list, analysisID);
                //THEN ADD NEW STEPS IN ORDER OF STEP NUMBER BECAUSE:
                // - EDITED LATER STEPS COULD USE THE NEW STEPS
                // - CREATED LATER STEPS COULD USE THE IMPORTED STEPS (STEP NUMBER ORDER SOLVE THIS PROBLEM)
                ((Step_JDBCDAO) daoInstance1).insert(toBeCreatedNPD_instances.toArray(new NonProcessedData[]{}));
                ((Step_JDBCDAO) daoInstance1).insert(toBecreatedPD_instances.toArray(new ProcessedData[]{}));
                //THEN EDIT STEPS BECAUSE:
                // - REMOVED LATER STEPS COULD BE USED BEFORE EDITION BY THE EDITED STEPS (SO THE RELATIONSHIPS MUST BE REMOVED PREVIOUSLY)
                // - DEASSOCIATED LATER STEPS COULD BE USED BEFORE EDITION BY THE EDITED STEPS (SO THE RELATIONSHIPS MUST BE REMOVED PREVIOUSLY)
                ((Step_JDBCDAO) daoInstance1).update(toBeEditedNPD_instances.toArray(new NonProcessedData[]{}));
                ((Step_JDBCDAO) daoInstance1).update(toBeEditedPD_instances.toArray(new ProcessedData[]{}));

                /**
                 * *******************************************************
                 * STEP 7 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 8
                 * *******************************************************
                 */
                daoInstance1.doCommit();
            } catch (Exception e) {
                ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "update_analysis_handler", e.getMessage());
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
                        daoInstance1.doRollback();
                    }
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }

                //FOR EACH LOCKED ID, LIBERATE IT
                for (String lockedID : lockedIDs) {
                    BlockedElementsManager.getBlockedElementsManager().unlockID(lockedID);
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

    /**
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void save_analysis_image_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean REMOVE_FILE_NEEDED = false;
        String filePath = "";
        String filePath2 = "";
        try {

            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP 5b ELSE -->
             * GO TO STEP 2
             * *******************************************************
             */
            if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE REQUEST PARAMETERS. IF ERROR --> throws exception
             * if not valid session, GO TO STEP 5b ELSE --> GO TO STEP 2 ***
             */
            String analysis_id = request.getParameter("analysis_id");
            String experiment_id = request.getParameter("currentExperimentID");
            String analysis_image_code = request.getParameter("analysis_image");

            //WE WILL SAVE 2 IMAGES A SMALL AND LOW QUALITY IMAGE FOR PREVIEW AND A BIGGER IMAGE
            if (analysis_image_code != null) {
                REMOVE_FILE_NEEDED = true;
                filePath = DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experiment_id) + analysis_id + ".png";
                File outputfile = new File(filePath);
                BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(Base64.decodeBase64(analysis_image_code)));
                ImageIO.write(bufferedImage, "png", outputfile);

                int height = bufferedImage.getHeight();
                int width = bufferedImage.getWidth();
                double proportion = (double) height / (double) width;

                int minWidth = Math.min(500, width);
                int minHeight = (int) Math.round(minWidth * proportion);

                minHeight = Math.min(200, minHeight);
                minWidth = (int) Math.round(minHeight / proportion);

                BufferedImage resizedImage = new BufferedImage(minWidth, minHeight, BufferedImage.TYPE_INT_RGB);
                Graphics2D g = resizedImage.createGraphics();
                g.drawImage(bufferedImage, 0, 0, minWidth, minHeight, null);
                g.dispose();
                filePath2 = DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experiment_id) + analysis_id + "_prev.jpg";
                outputfile = new File(filePath2);
                ImageIO.write(resizedImage, "jpg", outputfile);
            }

        } catch (Exception e) {
            ServerErrorManager.handleException(e, Analysis_servlets.class.getName(), "save_analysis_image_handler", e.getMessage());
        } finally {
            /**
             * *******************************************************
             * STEP 5b CATCH ERROR, CLEAN CHANGES. throws SQLException
             * *******************************************************
             */
            if (ServerErrorManager.errorStatus()) {
                response.setStatus(400);
                response.getWriter().print(ServerErrorManager.getErrorResponse());

                if (REMOVE_FILE_NEEDED) {
                    File file = new File(filePath);
                    if (file.exists()) {
                        file.delete();
                    }
                    file = new File(filePath2);
                    if (file.exists()) {
                        file.delete();
                    }
                }
            } else {
                response.getWriter().print("{success: " + true + "}");
            }
        }
    }

    /*
     * name: edit_analysis_handler
     * description :
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void lock_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyLocked = false;
        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            String loggedUser = request.getParameter("loggedUser");
            if (!checkAccessPermissions(loggedUser, request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO LOCK IT. IF ERROR --> throws
             * exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String analysisID = request.getParameter("analysis_id");
            alreadyLocked = !BlockedElementsManager.getBlockedElementsManager().lockObject(analysisID, loggedUser);
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
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                if (alreadyLocked) {
                    response.getWriter().print("{success: " + false + ", reason: '" + BlockedElementsManager.getErrorMessage() + "'}");
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
            }
        }
    }

    /*
     * name: unblock_analysis_handler
     * description :
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void unlock_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        boolean alreadyUnlocked = false;
        try {
            /**
             * *******************************************************
             * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF ERROR
             * --> throws exception if not valid session, GO TO STEP ELSE --> GO
             * TO STEP 2 *******************************************************
             */
            if (!checkAccessPermissions(request.getParameter("loggedUser"), request.getParameter("sessionToken"))) {
                throw new AccessControlException("Your session is invalid. User or session token not allowed.");
            }

            /**
             * *******************************************************
             * STEP 2 GET THE OBJECT ID AND TRY TO UNLOCK IT. IF ERROR -->
             * throws exception, GO TO STEP ELSE --> GO TO STEP 3
             * *******************************************************
             */
            String analysis_id = request.getParameter("analysis_id");
            alreadyUnlocked = !BlockedElementsManager.getBlockedElementsManager().unlockObject(analysis_id);
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
                 * STEP 3A WRITE RESPONSE ERROR.
                 * *******************************************************
                 */
                if (alreadyUnlocked) {
                    response.getWriter().print("{success: " + false + ", reason: '" + BlockedElementsManager.getErrorMessage() + "'}");
                } else {
                    response.getWriter().print("{success: " + true + " }");
                }
            }
        }
    }

    /*
     * name: remove_analysis_handler
     * description :
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void remove_analysis_handler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            boolean ROLLBACK_NEEDED = false;
            DAO daoInstance = null;
            Analysis analysis = null;
            String userName = null;
            String experimentID = null;

            try {

                /**
                 * *******************************************************
                 * STEP 1 CHECK IF THE USER IS LOGGED CORRECTLY IN THE APP. IF
                 * ERROR --> throws exception if not valid session, GO TO STEP
                 * ELSE --> GO TO STEP 2
                 * *******************************************************
                 */
                userName = request.getParameter("loggedUser");
                if (!checkAccessPermissions(userName, request.getParameter("sessionToken"))) {
                    throw new AccessControlException("Your session is invalid. User or session token not allowed.");
                }

                /**
                 * *******************************************************
                 * STEP 2 Get THE ANALYSIS Object from DB. IF ERROR --> throws
                 * MySQL exception, GO TO STEP 3b ELSE --> GO TO STEP 3
                 * *******************************************************
                 */
                boolean loadRecursive = true;
                Object[] params = {loadRecursive};
                daoInstance = DAOProvider.getDAOByName("Analysis");
                String analysisID = request.getParameter("analysis_id");
                experimentID = request.getParameter("currentExperimentID");

                analysis = (Analysis) daoInstance.findByID(analysisID, params);

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
                daoInstance = new Step_JDBCDAO();
                daoInstance.disableAutocommit();
                ROLLBACK_NEEDED = true;

                for (NonProcessedData nonProcessedData : analysis.getNonProcessedData()) {
                    if (nonProcessedData.getAnalysisID().equalsIgnoreCase(analysisID)) {
                        if (nonProcessedData.isOwner(userName) || userName.equalsIgnoreCase("admin")) {
                            ((Step_JDBCDAO) daoInstance).remove(nonProcessedData.getStepID());
                        } else {
                            throw new AccessControlException("One or more steps cannot be removed. Current user is not owner for all the steps in the pipeline.");
                        }
                    } else {
                        ((Step_JDBCDAO) daoInstance).removeStepAssociation(nonProcessedData.getStepID(), analysisID);
                    }
                }

                /**
                 * *******************************************************
                 * STEP 6 UPDATE,ADD AND REMOVE THE PD instances IN DATABASE. IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 7
                 * *******************************************************
                 */
                daoInstance = DAOProvider.getDAOByName("ProcessedData");
                daoInstance.remove(analysisID);

                daoInstance = DAOProvider.getDAOByName("Analysis");
                daoInstance.remove(analysisID);

                File file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experimentID) + analysisID + "_prev.jpg");
                file.delete();
                file = new File(DATA_LOCATION + IMAGE_FILES_LOCATION.replaceAll("<experiment_id>", experimentID) + analysisID + ".png");
                file.delete();

                /**
                 * *******************************************************
                 * STEP 7 COMMIT CHANGES TO DATABASE. throws SQLException IF
                 * ERROR --> throws SQL Exception, GO TO STEP ? ELSE --> GO TO
                 * STEP 8
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
                    response.getWriter().print("{success: " + true + " }");
                }

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
        //TODO: TEST IF THE USER HAS LOGGED IN THE APP.
        if (request.getServletPath().equals("/get_analysis_img_prev")) {
            getAnalysisPreviewImageHandler(request, response);
        } else if (request.getServletPath().equals("/get_analysis_img")) {
            getAnalysisImageHandler(request, response);
        } else {
            ServerErrorManager.addErrorMessage(3, Analysis_servlets.class.getName(), "doGet", "What are you doing here?.");
            response.setStatus(400);
            response.getWriter().print(ServerErrorManager.getErrorResponse());
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
}
