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


package classes.analysis.processed_data.region_step;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class RegionElement {

    String region_name;
    String source;
    String files_location;
    String region_step_id;
    String analysis_type;

    public RegionElement() {
    }
    
    public RegionElement(String region_name, String source, String files_location, String region_step_id) {
        if(region_step_id != null){
            this.region_step_id = region_step_id;
            this.files_location = files_location;
            return;
        }
        
        this.region_name = region_name;
        this.source = source;
        this.files_location = files_location;
        this.region_step_id = region_step_id;
    }

    public String getRegion_name() {
        return (this.region_step_id == null? region_name:null);
    }

    public void setRegion_name(String region_name) {
        this.region_name = region_name;
    }

    public String getSource() {
        return (this.region_step_id == null? source:null);
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getFiles_location() {
        return files_location;
    }

    public void setFiles_location(String files_location) {
        this.files_location = files_location;
    }

    public String getRegion_step_id() {
        return region_step_id;
    }

    public void setRegion_step_id(String region_step_id) {
        this.region_step_id = region_step_id;
    }

    public String getAnalysis_type() {
        return analysis_type;
    }

    public void setAnalysis_type(String analysis_type) {
        this.analysis_type = analysis_type;
    }
    
    @Override
    public String toString() {
        return super.toString(); //To change body of generated methods, choose Tools | Templates.
    }
}