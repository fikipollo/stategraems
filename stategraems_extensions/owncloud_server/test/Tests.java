/*
 * ownCloud client module
 * Makes it possible to access files on a remote ownCloud instance,
 * share them or access application attributes.
 */

import java.io.File;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Rafa Hernandez <https://github.com/fikipollo>
 */
public class Tests {

    public static void main(String[] args) {
        try {

            owncloud_server server = new owncloud_server();

            HashMap<String, String> settings = new HashMap<>();
            settings.put("host", "localhost");
            settings.put("port", "8085");
            settings.put("user", "rafa");
            settings.put("pass", "123123");
            settings.put("root", "/Documents");

            server.loadSettings(settings);
            
            
            server.getDirectoryContent("/");

            server.saveFile(new File("/data/test/test.txt"), "/test");
            
            server.removeFile("/test/test.txt");
//
            server.getFile("/Example.odt", "/data/test/");

            return;
        } catch (Exception ex) {
            Logger.getLogger(Tests.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
