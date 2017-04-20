package resources.extensions;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.io.File;
import java.util.ArrayList;
import java.util.Map;

/**
 *
 * @author rhernandez
 */
public abstract class FileSystemManager {
    String type;
    String host;
    String port;
    String user;
    String pass;
    String root;


    public void loadSettings(Map<String, String> settings) {
        type = settings.get("type");
        host = settings.get("host");
        port = settings.get("port");
        user = settings.get("user");
        pass = settings.get("pass");
        root = settings.get("root");
    }

    public abstract boolean saveFile(File file, String path) throws Exception;

    public abstract boolean removeFile(String filePath) throws Exception;

    public abstract String getFile(String filePath, String destinationDir) throws Exception;

    public abstract String getDirectoryContent(String dirPath) throws Exception;

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
