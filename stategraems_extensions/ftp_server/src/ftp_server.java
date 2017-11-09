
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Map;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;

/**
 *
 * @author rhernandez
 */
public class ftp_server {

    String type = "ftp_server";
    String host;
    String port;
    String user;
    String pass;
    String root;

    public ftp_server() {
    }

    public void loadSettings(Map<String, String> settings) {
        type = settings.get("type");
        host = settings.get("host");
        port = settings.get("port");
        user = settings.get("user");
        pass = settings.get("pass");
        root = settings.get("root");
    }

    
    public boolean saveFile(File file, String path) throws Exception {
        path = this.adaptFilePath(path);

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(this.getHost(), Integer.parseInt(this.getPort()));
            showServerReply(ftpClient);
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new Exception("Operation failed. Server reply code: " + replyCode);
            }

            ftpClient.enterLocalPassiveMode();

            boolean success = ftpClient.login(this.getUser(), this.getPass());
            showServerReply(ftpClient);

            if (!success) {
                throw new Exception("Operation failed. Could not login to the server, invalid credentials.");
            }

            this.createDirectoryTree(ftpClient, path);

            InputStream inputStream = new FileInputStream(file);
            success = ftpClient.storeFile(path + File.separator + file.getName(), inputStream);
            showServerReply(ftpClient);
            inputStream.close();
            if (!success) {
                throw new Exception("Operation failed. Could not upload the file.");
            }

        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            if (ftpClient.isConnected()) {
                ftpClient.logout();
                ftpClient.disconnect();
            }
        }

        return true;
    }

    
    public boolean removeFile(String filePath) throws Exception {
        filePath = this.adaptFilePath(filePath);

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(this.getHost(), Integer.parseInt(this.getPort()));
            showServerReply(ftpClient);
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new Exception("Operation failed. Server reply code: " + replyCode);
            }

            ftpClient.enterLocalPassiveMode();

            boolean success = ftpClient.login(this.getUser(), this.getPass());
            showServerReply(ftpClient);

            if (!success) {
                throw new Exception("Operation failed. Could not login to the server, invalid credentials.");
            }

            // Delete file
            return ftpClient.deleteFile(filePath);
        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            if (ftpClient.isConnected()) {
                ftpClient.logout();
                ftpClient.disconnect();
            }
        }

        return false;
    }

    
    public String getFile(String filePath, String destinationDir) throws Exception {
        filePath = this.adaptFilePath(filePath);

        String fileName = filePath.substring(filePath.lastIndexOf(File.separator) + 1);

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(this.getHost(), Integer.parseInt(this.getPort()));
            showServerReply(ftpClient);
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new Exception("Operation failed. Server reply code: " + replyCode);
            }

            ftpClient.enterLocalPassiveMode();

            boolean success = ftpClient.login(this.getUser(), this.getPass());
            showServerReply(ftpClient);

            if (!success) {
                throw new Exception("Operation failed. Could not login to the server, invalid credentials.");
            }

            //get output stream
            OutputStream output;
            destinationDir = destinationDir.replaceFirst(File.separator + "$", "") + File.separator + fileName;
            output = new FileOutputStream(destinationDir);
            //get the file from the remote system
            ftpClient.retrieveFile(filePath, output);
            //close output stream
            output.close();

            return destinationDir;

        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            if (ftpClient.isConnected()) {
                ftpClient.logout();
                ftpClient.disconnect();
            }
        }

        return null;
    }

    
    public String getDirectoryContent(String dirPath) throws Exception {
        dirPath = this.adaptFilePath(dirPath);
        dirPath = dirPath.replaceFirst("/" + "$", "") + "/";

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(this.getHost(), Integer.parseInt(this.getPort()));
            showServerReply(ftpClient);
            int replyCode = ftpClient.getReplyCode();
            if (!FTPReply.isPositiveCompletion(replyCode)) {
                throw new Exception("Operation failed. Server reply code: " + replyCode);
            }

            ftpClient.enterLocalPassiveMode();

            boolean success = ftpClient.login(this.getUser(), this.getPass());
            showServerReply(ftpClient);

            if (!success) {
                throw new Exception("Operation failed. Could not login to the server, invalid credentials.");
            }

            // lists files and directories in the current working directory
            Directory root = getDirectoryContentRec(ftpClient, new Directory(dirPath.replaceFirst(File.separator + "$", "")));

            return root.toJSONString(0);

        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            if (ftpClient.isConnected()) {
                ftpClient.logout();
                ftpClient.disconnect();
            }
        }

        return null;
    }

    //-------------------------------------------------------------------------------------//
    //-------------------------------------------------------------------------------------//
    // AUXILIAR FUNCTIONS                                                                  //
    //-------------------------------------------------------------------------------------//
    //-------------------------------------------------------------------------------------//
    public String adaptFilePath(String filePath) throws IOException {
        if (filePath == null) {
            throw new IOException("Invalid file path");
        }
        filePath = filePath.replaceFirst("^" + "/", "");
        
        String _root = this.getRoot().replaceFirst("/" + "$", "");
        String dir = _root.substring(_root.lastIndexOf("/") + 1);
        
        if(filePath.startsWith(dir)){
            filePath = filePath.replaceFirst(dir, "");
        }
        
        filePath = _root + "/" + filePath.replaceFirst(_root, "");
                
        if (!filePath.startsWith(this.getRoot())) {
            throw new IOException("Invalid file path");
        }

        return filePath;
    }

    private boolean checkDirectoryExists(FTPClient ftpClient, String dirPath) throws IOException {
        ftpClient.changeWorkingDirectory(dirPath);
        int returnCode = ftpClient.getReplyCode();
        if (returnCode == 550) {
            return false;
        }
        return true;
    }

    private boolean createDirectoryTree(FTPClient ftpClient, String path) throws Exception {
        String cwd = ftpClient.printWorkingDirectory();
        String[] dirPaths = path.split("/");
        for (String dirPath : dirPaths) {
            if ("".equals(dirPath)) {
                continue;
            }

            ftpClient.changeWorkingDirectory(dirPath);
            int returnCode = ftpClient.getReplyCode();
            if (returnCode == 550) {
                boolean success = ftpClient.makeDirectory(dirPath);
                ftpClient.changeWorkingDirectory(dirPath);
                if (!success) {
                    throw new Exception("Operation failed. Could not create directory " + path);
                }
            }
        }
        ftpClient.changeWorkingDirectory(cwd);
        return true;
    }

    private static void showServerReply(FTPClient ftpClient) {
        String[] replies = ftpClient.getReplyStrings();
        if (replies != null && replies.length > 0) {
            for (String aReply : replies) {
                System.out.println("SERVER: " + aReply);
            }
        }
    }

    private Directory getDirectoryContentRec(FTPClient ftpClient, Directory parentDir) throws IOException {

        FTPFile[] subFiles = ftpClient.listFiles(parentDir.getPath() + File.separator);

        for (FTPFile child : subFiles) {
            String childName = child.getName();

            if (childName.equals(".") || childName.equals("..")) {
                // skip parent directory and directory itself
                continue;
            }

            Directory d = new Directory(parentDir.getPath() + File.separator + childName);
            if (child.isDirectory()) {
                getDirectoryContentRec(ftpClient, d);
            }
            parentDir.addChild(d);
        }
        return parentDir;
    }

    
    public String getType() {
        return type;
    }

    
    public String getHost() {
        return host;
    }

    
    public String getPort() {
        return port;
    }

    
    public String getUser() {
        return user;
    }

    
    public String getPass() {
        return pass;
    }

    
    public String getRoot() {
        return root;
    }

    protected class Directory {

        String name;
        String path;
        ArrayList<Directory> children;

        public Directory(String path) {
            this.name = path.substring(path.lastIndexOf("/") + 1);
            this.path = path;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public ArrayList<Directory> getChildrens() {
            return children;
        }

        public void setChildrens(ArrayList<Directory> children) {
            this.children = children;
        }

        public void addChild(Directory child) {
            if (this.children == null) {
                this.children = new ArrayList<Directory>();
            }
            this.children.add(child);
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public String toJSONString(int level) {
            String childrenCode = "";
            if (this.children != null) {
                for (int i = 0; i < children.size(); i++) {
                    childrenCode += children.get(i).toJSONString(level + 1) + ((i + 1) < children.size() ? "," : "");
                }
            }
            return "{\"text\" : \"" + name + "\"" + (childrenCode.equals("") ? "" : ", \"nodes\" :[" + childrenCode + "]") + "}";
        }
    }
}
