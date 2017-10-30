
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author rhernandez
 */
public class owncloud_server {

    String type = "owncloud_server";
    String host;
    String port;
    String user;
    String pass;
    String root;

    public owncloud_server() {
    }

    public void loadSettings(Map<String, String> settings) {
        type = settings.get("type");
        host = settings.get("host");
        port = settings.get("port");
        user = settings.get("user");
        pass = settings.get("pass");
        root = settings.get("root");
    }

    public boolean saveFile(File file, String path, boolean recursive) throws Exception {
        boolean success = false;
        path = this.adaptFilePath(path);
        if (path.lastIndexOf("/") + 1 < path.length()) {
            path += "/";
        }

        Owncloud4j owncloudClient;
        if (port == null || "".equals(port)) {
            owncloudClient = new Owncloud4j(host, "/remote.php/webdav");
        } else {
            owncloudClient = new Owncloud4j(host, Integer.parseInt(port), "/remote.php/webdav");
        }

        try {
            owncloudClient.login(user, pass);
            success = owncloudClient.putFile(path, file.getPath(), recursive);
            if (!success) {
                throw new Exception("Operation failed. Please check if credentials are valid and if file path is a valid path in the server.");
            }
        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            owncloudClient.logout();
        }

        return success;
    }

    public boolean saveFile(File file, String path, String newName, boolean recursive) throws Exception {
        boolean success = false;

        path = this.adaptFilePath(path);
        if (path.lastIndexOf("/") + 1 < path.length()) {
            path += "/";
        }
        path = path + newName;

        Owncloud4j owncloudClient;
        if (port == null || "".equals(port)) {
            owncloudClient = new Owncloud4j(host, "/remote.php/webdav");
        } else {
            owncloudClient = new Owncloud4j(host, Integer.parseInt(port), "/remote.php/webdav");
        }

        try {
            owncloudClient.login(user, pass);
            success = owncloudClient.putFile(path, file.getPath());
            if (!success) {
                throw new Exception("Operation failed. Please check if credentials are valid and if file path is a valid path in the server.");
            }
        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            owncloudClient.logout();
        }

        return success;
    }

    public boolean saveFile(File file, String path) throws Exception {
        return saveFile(file, path, true);
    }

    public boolean removeFile(String filePath) throws Exception {
        boolean success = false;
        filePath = this.adaptFilePath(filePath);

        Owncloud4j owncloudClient;
        if (port == null || "".equals(port)) {
            owncloudClient = new Owncloud4j(host, "/remote.php/webdav");
        } else {
            owncloudClient = new Owncloud4j(host, Integer.parseInt(port), "/remote.php/webdav");
        }

        try {
            owncloudClient.login(user, pass);
            success = owncloudClient.delete(filePath);

            if (!success) {
                throw new Exception("Operation failed. Please check if credentials are valid and if file path is a valid path in the server.");
            }
        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            owncloudClient.logout();
        }

        return success;
    }

    public String getFile(String filePath, String destinationDir) throws Exception {
        filePath = this.adaptFilePath(filePath);

        Owncloud4j owncloudClient;
        if (port == null || "".equals(port)) {
            owncloudClient = new Owncloud4j(host, "/remote.php/webdav");
        } else {
            owncloudClient = new Owncloud4j(host, Integer.parseInt(port), "/remote.php/webdav");
        }

        try {
            owncloudClient.login(user, pass);

            if (owncloudClient.getFile(filePath, destinationDir)) {
                String fileName = filePath.substring(filePath.lastIndexOf(File.separator) + 1);
                return destinationDir.replaceFirst(File.separator + "$", "") + File.separator + fileName;
            } else {
                throw new Exception("Operation failed. Please check if credentials are valid and if file path is a valid path in the server.");
            }
        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            owncloudClient.logout();
        }

        return null;
    }

    public String getDirectoryContent(String dirPath) throws Exception {
        dirPath = this.adaptFilePath(dirPath);
        dirPath = dirPath.replaceFirst("/" + "$", "") + "/";

        Owncloud4j owncloudClient;
        if (port == null || "".equals(port)) {
            owncloudClient = new Owncloud4j(host, "/remote.php/webdav");
        } else {
            owncloudClient = new Owncloud4j(host, Integer.parseInt(port), "/remote.php/webdav");
        }

        try {
            owncloudClient.login(user, pass);
            WebDAVResponse response = owncloudClient.list(dirPath);

            if (!response.isSuccess()) {
                throw new Exception("Operation failed. Please check if credentials are valid and if file path is a valid path in the server.");
            }

            // Lists files and directories in the current working directory
            Directory rootDir = getDirectoryContentRec(response.getItems(), new Directory(dirPath.replaceFirst(File.separator + "$", "")));

            return rootDir.toJSONString(0);

        } catch (IOException ex) {
            System.out.println("Oops! Something wrong happened");
            ex.printStackTrace();
        } finally {
            owncloudClient.logout();
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

        if (filePath.startsWith(dir)) {
            filePath = filePath.replaceFirst(dir, "");
        }

        filePath = _root + "/" + filePath.replaceFirst(_root, "");

        if (!filePath.startsWith(this.getRoot())) {
            throw new IOException("Invalid file path");
        }

        return filePath;
    }

    private Directory getDirectoryContentRec(ArrayList<OCFile> files, Directory parentDir) throws IOException {
        HashMap<String, Directory> directories = new HashMap<>();
        directories.put(parentDir.getPath(), parentDir);

        Directory directory, parentDirectory;
        for (OCFile child : files) {
            String path = child.getPath().replace("/remote.php/webdav", "").replaceAll("\\/$", "");

            if (path.equals(parentDir.path)) {
                continue;
            }

            if (!directories.containsKey(path)) {
                directory = new Directory(child.getPath().replace("/remote.php/webdav", "").replaceAll("\\/$", ""));
                directories.put(directory.getPath(), directory);
            } else {
                directory = directories.get(path);
            }

            String parentPath = directory.getParent().replaceAll("\\/$", "");
            if (!directories.containsKey(parentPath)) {
                parentDirectory = new Directory(parentPath);
                directories.put(directory.getPath(), parentDirectory);
            } else {
                parentDirectory = directories.get(parentPath);
            }

            parentDirectory.addChild(directory);
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

        public String getParent() {
            return this.path.substring(0, this.path.replaceAll("\\/$", "").lastIndexOf("/") + 1);
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
