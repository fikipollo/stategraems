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
package classes.samples;

import classes.Experiment;
import classes.User;
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
import java.util.Map;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class BioCondition {

    private String biocondition_id;
    private String organism;
    private String title;
    private String name;
    //BIOMATERIAL
    private String cell_type;
    private String tissue_type;
    private String cell_line;
    private String genotype;
    private String gender;
    private String other_biomaterial;
    //EXP CONDITIONS
    private String treatment;
    private String dose;
    private String time;
    private String other_exp_cond;
    private String protocol_description;
    protected String[] files_location;
    //DATES AND USERS
    private String submission_date;
    private String last_edition_date;
    private User[] owners;
    private String external_links;
    private Bioreplicate[] associatedBioreplicates;
    private Experiment[] associatedExperiments;
    //OTHER
    String[] tags;
    boolean isPublic = true;
    boolean isExternal = false;
    private String network_host;
    private String network_service;
    private String network_sample_type;

    public BioCondition() {
    }

    /**
     * This static function returns a new BioCondition object using the data
     * contained in the given JSON object (as String).
     *
     * @param jsonString the JSON object
     * @return the new Object.
     */
    public static BioCondition fromJSON(JsonElement jsonString) {
        Gson gson = new Gson();
        BioCondition biocondition = gson.fromJson(jsonString, BioCondition.class);
        biocondition.adaptDates();

        return biocondition;
    }

    /**
     * This function returns the object as a JSON format string.
     *
     * @return the object as JSON String
     */
    public String toJSON() {
        Gson gson = new Gson();
        String jsonString = gson.toJson(this);

        return jsonString;
    }

    //**********************************************************************
    //* GETTERS AND SETTERS ************************************************
    //**********************************************************************
    public String getBioConditionID() {
        return biocondition_id;
    }

    public void setBioConditionID(String biocondition_id) {
        this.biocondition_id = biocondition_id;

        if (this.associatedBioreplicates != null) {
            int nBioReplicate = 1;
            for (Bioreplicate bioreplicate : this.getAssociatedBioreplicates()) {
                bioreplicate.setBioreplicateID(biocondition_id, nBioReplicate);
                nBioReplicate++;
            }
        }
    }

    public String getOrganism() {
        return organism;
    }

    public void setOrganism(String organism) {
        this.organism = organism;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCellType() {
        return cell_type;
    }

    public void setCellType(String cell_type) {
        this.cell_type = cell_type;
    }

    public String getTissueType() {
        return tissue_type;
    }

    public void setTissueType(String tissue_type) {
        this.tissue_type = tissue_type;
    }

    public String getCellLine() {
        return cell_line;
    }

    public void setCellLine(String cell_line) {
        this.cell_line = cell_line;
    }

    public String getGenotype() {
        return genotype;
    }

    public void setGenotype(String genotype) {
        this.genotype = genotype;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getOtherBiomat() {
        return other_biomaterial;
    }

    public void setOtherBiomat(String other_biomaterial) {
        this.other_biomaterial = other_biomaterial;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getDosis() {
        return dose;
    }

    public void setDosis(String dosis) {
        this.dose = dosis;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getProtocolDescription() {
        return protocol_description;
    }

    public void setProtocolDescription(String protocol_description) {
        this.protocol_description = protocol_description;
    }

    public String[] getFilesLocation() {
        return files_location;
    }

    public void setFilesLocation(String[] files_location) {
        this.files_location = files_location;
    }

    public String getOtherExpCond() {
        return other_exp_cond;
    }

    public void setOtherExpCond(String otherExpCond) {
        this.other_exp_cond = otherExpCond;
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

    public User[] getOwners() {
        return owners;
    }

    public void setOwners(User[] owners) {
        this.owners = owners;
    }

    public void addOwner(User owner) {
        if (this.owners == null) {
            this.owners = new User[1];
            this.owners[0] = owner;
        } else {
            this.owners = java.util.Arrays.copyOf(this.owners, this.owners.length + 1);
            this.owners[this.owners.length - 1] = owner;
        }
    }

    public boolean isOwner(String userName) {
        for (int i = 0; i < this.owners.length; i++) {
            if (this.owners[i].getUserID().equals(userName)) {
                return true;
            }
        }
        return false;
    }

    public String getExternalLinks() {
        return external_links;
    }

    public void setExternalLinks(String external_links) {
        this.external_links = external_links;
    }

    public Experiment[] getAssociatedExperiments() {
        return associatedExperiments;
    }

    public void setAssociatedExperiments(Experiment[] associatedExperiments) {
        this.associatedExperiments = associatedExperiments;
    }

    public Bioreplicate[] getAssociatedBioreplicates() {
        return associatedBioreplicates;
    }

    public void setAssociatedBioreplicates(Bioreplicate[] associatedBioRep) {
        this.associatedBioreplicates = associatedBioRep;
    }

    public void addAssociatedBioreplicate(Bioreplicate bioreplicate) {
        if (this.associatedBioreplicates == null) {
            this.associatedBioreplicates = new Bioreplicate[1];
            this.associatedBioreplicates[0] = bioreplicate;
        } else {
            this.associatedBioreplicates = java.util.Arrays.copyOf(this.associatedBioreplicates, this.associatedBioreplicates.length + 1);
            this.associatedBioreplicates[this.associatedBioreplicates.length - 1] = bioreplicate;
        }
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

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public boolean isExternal() {
        return isExternal;
    }

    public void setExternal(boolean isExternal) {
        this.isExternal = isExternal;
    }

    public String getNetworkHost() {
        return network_host;
    }

    public void setNetworkHost(String network_host) {
        this.network_host = network_host;
    }

    public String getNetworkService() {
        return network_service;
    }

    public void setNetworkService(String network_service) {
        this.network_service = network_service;
    }

    public String getNetworkSampleType() {
        return network_sample_type;
    }

    public void setNetworkSampleType(String network_sample_type) {
        this.network_sample_type = network_sample_type;
    }
    
    

    //***********************************************************************
    //* OTHER FUNCTIONS *****************************************************
    //***********************************************************************
    @Override
    public String toString() {
        return this.toJSON();
    }

    /**
     * This fucntion check if a given BioCondition has the same values for all
     * the fields (biocondition_id, owners, bioreplicates and experiments are
     * not checked)
     * <p/>
     * @param bioCondition
     * @return
     */
    public boolean hasSameValues(BioCondition bioCondition) {
        boolean isEqual = true
                && ((this.organism != null) ? this.organism.equals(bioCondition.organism) : (bioCondition.organism == null))
                && ((this.title != null) ? this.title.equals(bioCondition.title) : (bioCondition.title == null))
                && ((this.name != null) ? this.name.equals(bioCondition.name) : (bioCondition.name == null))
                && ((this.tissue_type != null) ? this.tissue_type.equals(bioCondition.tissue_type) : (bioCondition.tissue_type == null))
                && ((this.cell_type != null) ? this.cell_type.equals(bioCondition.cell_type) : (bioCondition.cell_type == null))
                && ((this.cell_line != null) ? this.cell_line.equals(bioCondition.cell_line) : (bioCondition.cell_line == null))
                && ((this.genotype != null) ? this.genotype.equals(bioCondition.genotype) : (bioCondition.genotype == null))
                && ((this.gender != null) ? this.gender.equals(bioCondition.gender) : (bioCondition.gender == null))
                && ((this.other_biomaterial != null) ? this.other_biomaterial.equals(bioCondition.other_biomaterial) : (bioCondition.other_biomaterial == null))
                && ((this.treatment != null) ? this.treatment.equals(bioCondition.treatment) : (bioCondition.treatment == null))
                && ((this.dose != null) ? this.dose.equals(bioCondition.dose) : (bioCondition.dose == null))
                && ((this.time != null) ? this.time.equals(bioCondition.time) : (bioCondition.time == null))
                && ((this.protocol_description != null) ? this.protocol_description.equals(bioCondition.protocol_description) : (bioCondition.protocol_description == null))
                && ((this.other_exp_cond != null) ? this.other_exp_cond.equals(bioCondition.other_exp_cond) : (bioCondition.other_exp_cond == null))
                && ((this.submission_date != null) ? this.submission_date.equals(bioCondition.submission_date) : (bioCondition.submission_date == null))
                && ((this.last_edition_date != null) ? this.last_edition_date.equals(bioCondition.last_edition_date) : (bioCondition.last_edition_date == null))
                && ((this.external_links != null) ? this.external_links.equals(bioCondition.external_links) : (bioCondition.external_links == null));
        return isEqual;
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        BioCondition newBiocondition = new BioCondition();
        newBiocondition.biocondition_id = biocondition_id;
        newBiocondition.organism = organism;
        newBiocondition.name = name;
        newBiocondition.title = title;
        newBiocondition.cell_type = cell_type;
        newBiocondition.tissue_type = tissue_type;
        newBiocondition.cell_line = cell_line;
        newBiocondition.genotype = genotype;
        newBiocondition.gender = gender;
        newBiocondition.other_biomaterial = other_biomaterial;
        newBiocondition.treatment = this.treatment;
        newBiocondition.dose = dose;
        newBiocondition.time = time;
        newBiocondition.protocol_description = protocol_description;
        newBiocondition.other_exp_cond = this.other_exp_cond;
        newBiocondition.submission_date = submission_date;
        newBiocondition.last_edition_date = last_edition_date;
        newBiocondition.external_links = external_links;
        if (this.owners != null) {
            newBiocondition.owners = java.util.Arrays.copyOf(this.owners, this.owners.length);
        }

        return newBiocondition; //To change body of generated methods, choose Tools | Templates.
    }

    public String export(String tmpDir, String format, String templatesDir) throws Exception {
        String content = "";
        if ("json".equalsIgnoreCase(format)) {
            content = this.toJSON();
        } else if ("xml".equalsIgnoreCase(format)) {
            content = "<?xml version=\"1.0\"?>\n";
            content += "<biocondition id=\"" + this.getBioConditionID() + "\">\n";
            JsonObject biocondition = new JsonParser().parse(this.toJSON()).getAsJsonObject();
            JsonElement bioreplicates = biocondition.remove("associatedBioreplicates");
            biocondition.remove("associatedExperiments");

            content += this.generateXMLContent(biocondition, 1);
            content += "\t<samples>\n";
            for (JsonElement subelement : bioreplicates.getAsJsonArray()) {
                content += "\t\t<sample>\n";
                content += this.generateXMLContent(subelement, 4);
                content += "\t\t</sample>\n";
            }
            content += "\t</samples>\n";
            content += "</biocondition>\n";
        } else {
            ArrayList<Pair> elements = this.processElementContent(templatesDir, this.toJSON());

            if ("html".equals(format)) {
                content = this.generateHTMLContent(elements);
            } else {
                throw new Exception(format + " is not a valid format");
            }
        }

        File file = new File(tmpDir + File.separator + this.biocondition_id + "." + format);
        PrintWriter writer = new PrintWriter(file);
        writer.println(content);
        writer.close();
        return file.getAbsolutePath();
    }

    private ArrayList<Pair> processElementContent(String templatesDir, String jsonObject) throws FileNotFoundException {
        ArrayList<Pair> elements = new ArrayList<Pair>();
        ArrayList<Pair> fields = processTemplateFile(templatesDir + File.separator + "biocondition-form.json");
        JsonObject analysis = new JsonParser().parse(jsonObject).getAsJsonObject();

        elements.add(new Pair("Biological conditions details", "", 0, "title"));
        elements.add(new Pair("", "", 1, "section"));
        for (Pair field : fields) {
            elements.add(new Pair(field.value, this.getJsonElementAsString(analysis.get(field.label)), 2, "field"));
        }

        elements.add(new Pair("Samples in the analysis", "", 0, "title"));
        elements.add(new Pair("", "", 0, "section"));
        JsonArray samples = analysis.get("associatedBioreplicates").getAsJsonArray();
        JsonObject sample;
        for (JsonElement _step : samples) {
            sample = _step.getAsJsonObject();
            elements.add(new Pair("Sample", "", 1, "title"));
            elements.add(new Pair("", "", 1, "section"));
            fields = processTemplateFile(templatesDir + File.separator + "bioreplicate-form.json");
            for (Pair field : fields) {
                elements.add(new Pair(field.value, this.getJsonElementAsString(sample.get(field.label)), 2, "field"));
            }

            elements.add(new Pair("Aliquouts", "", 2, "title"));
            elements.add(new Pair("", "", 2, "section"));
            JsonArray aliquots = sample.get("associatedAnalyticalReplicates").getAsJsonArray();
            for (JsonElement aliquot : aliquots) {
                sample = aliquot.getAsJsonObject();
                fields = processTemplateFile(templatesDir + File.separator + "analytical_replicate-form.json");
                for (Pair field : fields) {
                    elements.add(new Pair(field.value, this.getJsonElementAsString(sample.get(field.label)), 3, "field"));
                }
            }
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
