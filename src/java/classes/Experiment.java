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
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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
    String[] tags;
    String data_dir_type; //local_directory, ftp_server, seeddms_server...
    String data_dir_host;
    String data_dir_port;
    String data_dir_user;
    String data_dir_pass;
    String data_dir_path;

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

    public String getDataDirectoryType() {
        return data_dir_type;
    }

    public void setDataDirectoryType(String data_dir_type) {
        this.data_dir_type = data_dir_type;
    }

    public String getDataDirectoryHost() {
        return data_dir_host;
    }

    public void setDataDirectoryHost(String data_dir_host) {
        this.data_dir_host = data_dir_host;
    }

    public String getDataDirectoryPort() {
        return data_dir_port;
    }

    public void setDataDirectoryPort(String data_dir_port) {
        this.data_dir_port = data_dir_port;
    }

    public String getDataDirectoryUser() {
        return data_dir_user;
    }

    public void setDataDirectoryUser(String data_dir_user) {
        this.data_dir_user = data_dir_user;
    }

    public String getDataDirectoryPass() {
        return data_dir_pass;
    }

    public void setDataDirectoryPass(String data_dir_pass) {
        this.data_dir_pass = data_dir_pass;
    }

    public String getDataDirectoryPath() {
        if (data_dir_path != null) {
            return (data_dir_path.lastIndexOf("/") == data_dir_path.length() - 1) ? data_dir_path : data_dir_path + "/";
        }
        return null;
    }

    public void setDataDirectoryPath(String data_dir_path) {
        this.data_dir_path = data_dir_path;
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

    public Map<String, String> getDataDirectoryInformation() {
        HashMap<String, String> info = new HashMap<String, String>();
        info.put("type", this.data_dir_type);
        info.put("host", this.data_dir_host);
        info.put("port", this.data_dir_port);
        info.put("user", this.data_dir_user);
        info.put("pass", this.data_dir_pass);
        info.put("root", this.data_dir_path.replaceFirst("/$", ""));
        return info;
    }

    public String export(String tmpDir, String format, String templatesDir) throws Exception {
        String content = "";
        this.data_dir_pass = "*********";
        if ("json".equalsIgnoreCase(format)) {
            content = this.toJSON();
        } else if ("xml".equalsIgnoreCase(format)) {
            content = "<?xml version=\"1.0\"?>\n";
            content += "<experiment id=\"" + this.getExperimentID() + "\">\n";
            JsonObject experiment = new JsonParser().parse(this.toJSON()).getAsJsonObject();

            content += this.generateXMLContent(experiment, 1);
            content += "</experiment>\n";
        } else {
            ArrayList<Pair> elements = this.processElementContent(templatesDir, this.toJSON());

            if ("html".equals(format)) {
                content = this.generateHTMLContent(elements);
            } else {
                throw new Exception(format + " is not a valid format");
            }
        }

        File file = new File(tmpDir + File.separator + this.experiment_id + "." + format);
        PrintWriter writer = new PrintWriter(file);
        writer.println(content);
        writer.close();
        return file.getAbsolutePath();
    }

    private ArrayList<Pair> processElementContent(String templatesDir, String jsonObject) throws FileNotFoundException {
        ArrayList<Pair> elements = new ArrayList<Pair>();
        ArrayList<Pair> fields = processTemplateFile(templatesDir + File.separator + "experiment-form.json");
        JsonObject analysis = new JsonParser().parse(jsonObject).getAsJsonObject();

        elements.add(new Pair("Study details", "", 0, "title"));
        elements.add(new Pair("", "", 1, "section"));
        for (Pair field : fields) {
            elements.add(new Pair(field.value, this.getJsonElementAsString(analysis.get(field.label)), 2, "field"));
        }

        return elements;
    }

    private ArrayList<Pair> processTemplateFile(String template) throws FileNotFoundException {
        ArrayList<Pair> content = new ArrayList<Pair>();
        JsonParser parser = new JsonParser();
        JsonElement jsonElement = parser.parse(new FileReader(template));

        JsonArray sections = jsonElement.getAsJsonObject().get("content").getAsJsonArray();
        JsonArray fields;
        for (JsonElement element : sections) {
            fields = element.getAsJsonObject().get("fields").getAsJsonArray();
            for (JsonElement field : fields) {
                content.add(new Pair(field.getAsJsonObject().get("name").getAsString(), field.getAsJsonObject().get("label").getAsString(), 0, "field"));
            }
        }

        return content;
    }

    private String getJsonElementAsString(JsonElement element) {
        String value = "";
        if (element == null) {
            return "-";
        } else if (element.isJsonArray()) {
            JsonArray array = element.getAsJsonArray();
            for (JsonElement subelement : array) {
                value = this.getJsonElementAsString(subelement);
            }
        } else if (element.isJsonObject()) {
            JsonObject object = element.getAsJsonObject();

            for (Map.Entry<String, JsonElement> entry : object.entrySet()) {
                value += entry.getKey() + ":" + this.getJsonElementAsString(entry.getValue());
            }
        } else if (element.isJsonPrimitive()) {
            value += element.toString().replaceAll("\"", "") + "\n";
        }
        return value;
    }

    private String generateXMLContent(JsonElement jsonCode, int level) {
        String content = "";
        if (jsonCode.isJsonPrimitive()) {
            content += jsonCode.getAsString();
        } else if (jsonCode.isJsonArray()) {
            content += "\n";
            for (JsonElement subelement : jsonCode.getAsJsonArray()) {
                content += this.generateXMLContent(subelement, level + 1);
            }
            content += "\n";
            content += String.join("", Collections.nCopies(level - 1, "\t"));
        } else if (jsonCode.isJsonObject()) {
            for (Map.Entry<String, JsonElement> entry : jsonCode.getAsJsonObject().entrySet()) {
                content += String.join("", Collections.nCopies(level, "\t")) + "<" + entry.getKey() + ">" + this.generateXMLContent(entry.getValue(), level + 1) + "</" + entry.getKey() + ">\n";
            }
        }
        return content;
    }

    private String generateHTMLContent(ArrayList<Pair> elements) {
        String content
                = "<html>"
                + " <head>"
                + "  <title>STATegra EMS report</title>"
                + "  <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\">"
                + " </head>"
                + " <body style=\"background: #fbfbfb;\">"
                + "  <div style=\"max-width: 1024px; margin: auto; background: #fff; padding:50px 10px;\">"
                + "   <button value=\"Print this page\" onclick=\"window.print()\" class=\"btn-primary hidden-print btn btn-rigth pull-right\"> <span class=\"glyphicon glyphicon-print\" aria-hidden=\"true\"></span> Print this page </button>"
                + "   <table style=\" width: 100%; \"><tbody>";
        int lastLevel = 0;

        for (Pair element : elements) {

            while (lastLevel > element.level) {
                content += "</tbody></table></td></tr>";
                lastLevel--;
            }
            if ("title".equals(element.type)) {
                content += "<tr><td colspan='2'>" + "<h" + (element.level + 1) + ">" + element.label + "</h" + (element.level + 1) + ">" + "</td></tr>";
            } else if ("section".equals(element.type)) {
                content += "<tr><td style=\"width:20px;\"></td><td><table style=\" width: 100%; \" " + (element.level > 0 ? "class='table table-striped table-bordered'" : "") + " ><tbody>";
            } else {
                content += "<tr><td><b>" + element.label + "</b></td><td>" + element.value.replaceAll("\\n", "<br>") + "</td></tr>";
            }
            lastLevel = element.level;
        }
        content += "</tbody></table>";
        content += "</div></body></html>";
        return content;
    }

    private class Pair {

        String name;
        String label;
        String value;
        int level;
        String type;

        public Pair(String name, String label, String value, int level, String type) {
            this.name = name;
            this.label = label;
            this.value = value;
            this.level = level;
            this.type = type;
        }

        public Pair(String label, String value, int level, String type) {
            this.label = label;
            this.value = value;
            this.level = level;
            this.type = type;
        }

    }
}
