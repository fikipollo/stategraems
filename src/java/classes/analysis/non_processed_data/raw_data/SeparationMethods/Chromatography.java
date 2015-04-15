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


package classes.analysis.non_processed_data.raw_data.SeparationMethods;

public abstract class Chromatography extends SeparationMethod{
    String cc_sample_description;
    String cc_sample_processing;
    String cc_sample_injection;

    public String getSampleDescription() {
        return cc_sample_description;
    }

    public void setSampleDescription(String sample_description) {
        this.cc_sample_description = sample_description;
    }

    public String getSampleProcessing() {
        return cc_sample_processing;
    }

    public void setSampleProcessing(String sample_processing) {
        this.cc_sample_processing = sample_processing;
    }

    public String getSampleInjection() {
        return cc_sample_injection;
    }

    public void setSampleInjection(String sample_injection) {
        this.cc_sample_injection = sample_injection;
    }
}
