
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Stack;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.file.CopyOption;
import java.util.Map;

/**
 *
 * @author rhernandez
 */
public class local_directory {

    String type = "local_directory";
    String host;
    String port;
    String user;
    String pass;
    String root;

    public local_directory() {
    }
    
    
    public void loadSettings(Map<String, String> settings) {
        type = settings.get("type");
        host = settings.get("host");
        port = settings.get("port");
        user = settings.get("user");
        pass = settings.get("pass");
        root = settings.get("root");
    }

    
    public boolean saveFile(File file, String path) throws IOException {
        path = this.adaptFilePath(path);
        path = path.replaceFirst(File.separator + "$", "");

        File parent_dir = new File(path);
        if (!parent_dir.exists()) {
            parent_dir.mkdirs();
        }

        Files.copy(file.toPath(), new File(path + File.separator + file.getName()).toPath(), (CopyOption) StandardCopyOption.REPLACE_EXISTING);

        return true;
    }

    
    public boolean removeFile(String filePath) throws IOException {
        filePath = this.adaptFilePath(filePath);
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException(filePath + " not found.");
        }
        Files.delete(file.toPath());
        return true;
    }

    
    public String getFile(String filePath, String destinationDir) throws IOException {
        filePath = this.adaptFilePath(filePath);

        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException(filePath + " not found.");
        }

        destinationDir = destinationDir.replaceFirst(File.separator + "$", "") + File.separator + file.getName();
        Files.copy(file.toPath(), new File(destinationDir).toPath(), (CopyOption) StandardCopyOption.REPLACE_EXISTING);
        return destinationDir;
    }

    
    public String getDirectoryContent(String dirPath) throws IOException, InterruptedException {
        dirPath = this.adaptFilePath(dirPath);
        dirPath = dirPath.replaceFirst("/" + "$", "") + "/";
        
        ArrayList<String> lines = new ArrayList<String>();

        if (dirPath == null) {
            throw new IOException("Invalid data directory");
        }

        File f = new File(dirPath + ".stategraems_dir");
        if (f.exists()) {
            String[] script = null;
            script = new String[]{"find", dirPath};

            Runtime rt = Runtime.getRuntime();
            Process dumpProcess = rt.exec(script);

            BufferedReader br = new BufferedReader(new InputStreamReader(dumpProcess.getInputStream()));
            String line = br.readLine();
            String output = "";
            while (line != null) {
                output += "\n" + line;
                lines.add(line);
                line = br.readLine();
            }
            BufferedReader err = new BufferedReader(new InputStreamReader(dumpProcess.getErrorStream()));
            line = err.readLine();
            while (line != null) {
                output += "\n" + line;
                line = err.readLine();
            }

            int exitCode = dumpProcess.waitFor();

            if (exitCode != 0) {
                throw new FileNotFoundException("Failed while getting directory tree . Error: " + output);
            }

        } else {
            lines.add("The data directory is not valid.");
        }

        if (lines.size() > 0) {
            Iterator it = lines.iterator();
            String line = (String) it.next();
            if (line.charAt(line.length() - 1) == '/') {
                line = line.substring(0, line.length() - 1);
            }

            Directory directory = new Directory(line);

            Stack<Directory> directoryStack = new Stack<Directory>();
            directoryStack.push(directory);

            while (it.hasNext()) {
                line = (String) it.next();
                if (line.charAt(line.length() - 1) == '/') {
                    line = line.substring(0, line.length() - 1);
                }

                directory = new Directory(line);

                //IF THE CURRENT DIR IS A DIRECT CHILD DIRECTORY
                if ((directoryStack.lastElement().getPath() + "/" + directory.getName()).equals(directory.getPath())) {
                    directoryStack.lastElement().addChild(directory);
                    directoryStack.push(directory);
                } else {
                    while (!(directoryStack.lastElement().getPath() + "/" + directory.getName()).equals(directory.getPath())) {
                        directoryStack.pop();
                    }
                    directoryStack.lastElement().addChild(directory);
                    directoryStack.push(directory);
                }
            }

            return directoryStack.get(0).toJSONString(0);
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
        filePath = filePath.replaceFirst("^" + File.separator, "");
        
        String _root = this.getRoot().replaceFirst(File.separator + "$", "");
        String dir = _root.substring(_root.lastIndexOf(File.separator) + 1);
        
        if(filePath.startsWith(dir)){
            filePath = filePath.replaceFirst(dir, "");
        }
        
        filePath = _root + File.separator + filePath.replaceFirst(_root, "");
                
        if (!filePath.startsWith(this.getRoot())) {
            throw new IOException("Invalid file path");
        }

        return filePath;
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
