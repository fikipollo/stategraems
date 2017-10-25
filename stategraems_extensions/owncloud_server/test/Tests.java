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
            settings.put("port", "80");
            settings.put("user", "admin");
            settings.put("pass", "123123");
            settings.put("root", "/Documents");

            server.loadSettings(settings);
            
            File file = new File("/home/foo/Documents/test.txt");

            //Upload to specific dir
            boolean success = server.saveFile(file, "/test_dir/", true);
            
            //Upload to specific dir, change the name
            success = server.saveFile(file, "/", "newfile.txt", true);
             
            success = server.removeFile("/test_dir/test.txt");

            String content = server.getDirectoryContent("/newfile.txt");

            content = server.getFile("/newfile.txt", "/tmp/");

            return;
        } catch (Exception ex) {
            Logger.getLogger(Tests.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
