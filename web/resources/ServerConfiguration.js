EMS_VERSION = "v0.6r2";
debugging = true;
SERVER_URL = window.location.pathname;
SERVER_PORT = "";

//EDITING OPTIONS
//The blocked time in MINUTES, NOTE: IF CHANGED HERE, MUST BE CHANGED IN THE SERVER (BlockedElementsManager)
LOCKED_TIME = 30;

/*********************************************************************
 * WEB SERVICES URLS         *****************************************
 *********************************************************************/
//EXPERIMENT URLS
SERVER_URL_GET_ALL_EXPERIMENTS = "/get_all_experiments";
SERVER_URL_GET_EXPERIMENT = "/get_experiment";
SERVER_URL_ADD_EXPERIMENT = "/add_experiment";
SERVER_URL_UPDATE_EXPERIMENT = "/update_experiment";
SERVER_URL_REMOVE_EXPERIMENT = "/remove_experiment";
SERVER_URL_LOCK_EXPERIMENT = "/lock_experiment";
SERVER_URL_UNLOCK_EXPERIMENT = "/unlock_experiment";
SERVER_URL_CHANGE_CURRENT_EXPERIMENT = "/change_current_experiment";
SERVER_URL_DUMPDB = "/dump_database";
SERVER_URL_GET_EXPERIMENT_DIRECTORY_CONTENT = "/get_experiment_directory_content";

//USER URLS
SERVER_URL_LOGIN = "/login";
SERVER_URL_LOGOUT = "/logout";
SERVER_URL_GET_USER_LIST = "/get_user_list";
SERVER_URL_GET_USER = "/get_user";
SERVER_URL_CREATE_USER = "/add_user";
SERVER_URL_UPDATE_USER = "/update_user";
SERVER_URL_REMOVE_USER = "/remove_user";
SERVER_URL_VALIDATE_SESSION= "/validate_session";

//ANALYSIS URLS
SERVER_URL_GET_ALL_ANALYSIS = "/get_all_analysis";
SERVER_URL_GET_ANALYSIS = "/get_analysis";
SERVER_URL_GET_ALL_REGION_STEPS = "/get_all_region_steps";
SERVER_URL_GET_IMG_PREV = "/get_analysis_img_prev";
SERVER_URL_GET_IMG = "/get_analysis_img";
SERVER_URL_ADD_ANALYSIS = "/add_analysis";
SERVER_URL_UPDATE_ANALYSIS = "/update_analysis";
SERVER_URL_REMOVE_ANALYSIS = "/remove_analysis";
SERVER_URL_SAVE_ANALYSIS_IMAGE = "/save_analysis_image";
SERVER_URL_LOCK_ANALYSIS = "/lock_analysis";
SERVER_URL_UNLOCK_ANALYSIS = "/unlock_analysis";

//SAMPLES URLS
SERVER_URL_GET_ALL_BIOCONDITIONS = "/get_all_bioconditions";
SERVER_URL_GET_BIOCONDITION = "/get_biocondition";
SERVER_URL_GET_ALL_BIOREPLICATES = "/get_all_bioreplicates";
SERVER_URL_ADD_BIOCONDITION = "/add_biocondition";
SERVER_URL_REMOVE_BIOCONDITION = "/remove_biocondition";
SERVER_URL_UPDATE_BIOCONDITION = "/update_biocondition";
SERVER_URL_GET_TREATMENT_DOCUMENT = "/get_treatment_document";
SERVER_URL_SEND_TREATMENT_DOCUMENT = "/send_treatment_document";
SERVER_URL_SEND_BIOCONDITION_TEMPLATE_DOCUMENT = "/send_biocondition_template_document";
SERVER_URL_LOCK_BIOCONDITION = "/lock_biocondition";
SERVER_URL_UNLOCK_BIOCONDITION = "/unlock_biocondition";
SERVER_URL_ASSOCIATE_BIOCONDITION_TO_EXP = "/associate_biocondition_experiment";
SERVER_URL_CHECK_REMOVABLE_SAMPLE= "/check_removable_sample";

//TREATMENT URLS
SERVER_URL_GET_ALL_TREATMENTS = "/get_all_treatments";
SERVER_URL_GET_TREATMENT = "/get_treatment";
SERVER_URL_GET_SOP_FILE = "/get_sop_file";
SERVER_URL_ADD_TREATMENT = "/add_treatment";
SERVER_URL_UPDATE_TREATMENT = "/update_treatment";
SERVER_URL_REMOVE_TREATMENT = "/remove_treatment";
SERVER_URL_CHECK_REMOVABLE_TREATMENT = "/check_removable_treatment";

//BATCH URLS
SERVER_URL_GET_ALL_BATCHS = "/get_all_batchs";
SERVER_URL_GET_BATCH = "/get_batch";
SERVER_URL_ADD_BATCH = "/add_batch";
SERVER_URL_UPDATE_BATCH = "/update_batch";
SERVER_URL_REMOVE_BATCH = "/remove_batch";
SERVER_URL_CHECK_REMOVABLE_BATCH = "/check_removable_batch";
