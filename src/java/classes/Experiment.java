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
package classes;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Stack;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Experiment {

    String experiment_id;
    String title;
    String experiment_description;
    int biological_rep_no;
    int technical_rep_no;
    int contains_chipseq;
    int contains_dnaseseq;
    int contains_methylseq;
    int contains_mrnaseq;
    int contains_mirnaseq;
    int contains_metabolomics;
    int contains_proteomics;
    boolean contains_other;
    String public_references;
    String submission_date;
    String last_edition_date;
    String experimentDataDirectory;
    String[] tags;

    User[] experiment_owners;
    User[] experiment_members;

    public Experiment() {
    }

    /**
     * This static function returns a new object using the data contained in the
     * given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static Experiment fromJSON(JsonElement jsonString) {
        Gson gson = new Gson();
        Experiment experiment = gson.fromJson(jsonString, Experiment.class);
        experiment.adaptDates();
        return experiment;
    }

    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getExperimentID() {
        return experiment_id;
    }

    public void setExperimentID(String experiment_id) {
        this.experiment_id = experiment_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExperimentDescription() {
        return experiment_description;
    }

    public void setExperimentDescription(String experiment_description) {
        this.experiment_description = experiment_description;
    }

    public int getBiologicalRepNo() {
        return biological_rep_no;
    }

    public void setBiologicalRepNo(int biological_rep_no) {
        this.biological_rep_no = biological_rep_no;
    }

    public int getTechnicalRepNo() {
        return technical_rep_no;
    }

    public void setTechnicalRepNo(int technical_rep_no) {
        this.technical_rep_no = technical_rep_no;
    }

    public int getContainsChipseq() {
        return contains_chipseq;
    }

    public void setContainsChipseq(int contains_chipseq) {
        this.contains_chipseq = contains_chipseq;
    }

    public int getContainsDNaseseq() {
        return contains_dnaseseq;
    }

    public void setContainsDNaseseq(int contains_dnaseseq) {
        this.contains_dnaseseq = contains_dnaseseq;
    }

    public int getContainsMethylseq() {
        return contains_methylseq;
    }

    public void setContainsMethylseq(int contains_methylseq) {
        this.contains_methylseq = contains_methylseq;
    }

    public int getContainsMRNAseq() {
        return contains_mrnaseq;
    }

    public void setContainsMRNAseq(int contains_mrnaseq) {
        this.contains_mrnaseq = contains_mrnaseq;
    }

    public int getContainsSmallRNAseq() {
        return contains_mirnaseq;
    }

    public void setContainsSmallRNAseq(int contains_mirnaseq) {
        this.contains_mirnaseq = contains_mirnaseq;
    }

    public int getContainsMetabolomics() {
        return contains_metabolomics;
    }

    public void setContainsMetabolomics(int contains_metabolomics) {
        this.contains_metabolomics = contains_metabolomics;
    }

    public int getContainsProteomics() {
        return contains_proteomics;
    }

    public void setContainsProteomics(int contains_proteomics) {
        this.contains_proteomics = contains_proteomics;
    }

    public boolean getContainsOther() {
        return contains_other;
    }

    public void setContainsOther(boolean contains_other) {
        this.contains_other = contains_other;
    }

    public void setContainsAnalysis(String analysisType) {
        if ("ChIP-seq".equals(analysisType)) {
            this.setContainsChipseq(this.getContainsChipseq() + 1);
        } else if ("DNAse-seq".equals(analysisType)) {
            this.setContainsDNaseseq(this.getContainsDNaseseq() + 1);
        } else if ("Methyl-seq".equals(analysisType)) {
            this.setContainsMethylseq(this.getContainsMethylseq() + 1);
        } else if ("mRNA-seq".equals(analysisType)) {
            this.setContainsMRNAseq(this.getContainsMRNAseq() + 1);
        } else if ("smallRNA-seq".equals(analysisType)) {
            this.setContainsSmallRNAseq(this.getContainsSmallRNAseq() + 1);
        } else if ("Metabolomics".equals(analysisType)) {
            this.setContainsMetabolomics(this.getContainsMetabolomics() + 1);
        } else if ("Proteomics".equals(analysisType)) {
            this.setContainsProteomics(this.getContainsProteomics() + 1);
        }
    }

    public String getPublicReferences() {
        return public_references;
    }

    public void setPublicReferences(String public_references) {
        this.public_references = public_references;
    }

    public String getSubmissionDate() {
        return submission_date;
    }

    public void setSubmissionDate(String submission_date) {
        this.submission_date = submission_date;
    }

    public String getLastEditionDate() {
        return last_edition_date;
    }

    public void setLastEditionDate(String last_edition_date) {
        this.last_edition_date = last_edition_date;
    }

    public void adaptDates() {
        if (this.submission_date.contains("-")) {
            String[] aux = this.submission_date.split("T");
            this.submission_date = aux[0].replaceAll("-", "");
        }
        if (this.last_edition_date.contains("-")) {
            String[] aux = this.last_edition_date.split("T");
            this.last_edition_date = aux[0].replaceAll("-", "");
        }

    }

    public User[] getExperimentOwners() {
        return experiment_owners;
    }

    public void setExperimentOwners(User[] experiment_owners) {
        this.experiment_owners = experiment_owners;
    }

    public boolean isOwner(String user_id) {
        for (User experiment_owner : experiment_owners) {
            if (experiment_owner.getUserID().equals(user_id)) {
                return true;
            }
        }
        return false;
    }

    public User[] getExperimentMembers() {
        return experiment_members;
    }

    public void setExperimentMembers(User[] experiment_members) {
        this.experiment_members = experiment_members;
    }

    public boolean isMember(String user_id) {
        for (User experiment_member : experiment_members) {
            if (experiment_member.getUserID().equals(user_id)) {
                return true;
            }
        }
        return false;
    }

    public String getExperimentDataDirectory() {
        return experimentDataDirectory;
    }

    public void setExperimentDataDirectory(String experimentDataDirectory) {
        this.experimentDataDirectory = experimentDataDirectory;
    }

    public String getExperimentDataDirectoryContent(String applicationDataDirectory) throws IOException, InterruptedException, Exception {
        String dirURL = this.getExperimentDataDirectory();
        ArrayList<String> lines = new ArrayList<String>();

        if (dirURL != null && !dirURL.equals("")) {
            String[] script = null;

            script = new String[]{"find", this.getExperimentDataDirectory()};

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
                throw new FileNotFoundException("Failed while getting directory tree for the Experiment " + this.getExperimentID() + " . Error: " + output);
            }

        } //IF THE DIRECTORY WAS NOT SPECIFIED, LETS TRY TO READ THE FILE CONTAINING THE DIRECTORY CONTENT
        //WHICH SHOULD BE CREATED BY THE ADMIN AND UPDATED PERIODICALLY
        else {
            try {
                BufferedReader br = new BufferedReader(new FileReader(applicationDataDirectory + "/" + this.getExperimentID() + "/experimentDataDirectoryContent.txt"));
                try {
                    String line = br.readLine();
                    while (line != null) {
                        lines.add(line);
                        line = br.readLine();
                    }
                } finally {
                    br.close();
                }
            } catch (FileNotFoundException e) {
            }
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

        return "'Directory not specified'";
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public void setTags(String tags) {
        if (tags != null) {
            this.tags = tags.split(", ");
        }
    }

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }
}

class Directory {

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
            for (Directory child : children) {
                childrenCode += child.toJSONString(level + 1);
            }
        }
        String tabs = "";
        return tabs + "{" + "text : '" + name + "', path : '" + path + "', " + (childrenCode.equals("") ? "leaf: true, checked: false" : "children :[" + childrenCode + "]") + "},";
    }
}
