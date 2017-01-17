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
package servlets.servlets_resources;

import classes.User;
import classes.samples.AnalyticalReplicate;
import classes.samples.Batch;
import classes.samples.Bioreplicate;
import classes.samples.BioCondition;
import classes.samples.Treatment;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class BioCondition_XLS_parser {

    public static Object[] parseXLSfile(File file, String owner) throws Exception {

        HashMap<String, Batch> batchesTable = new HashMap<String, Batch>();
        HashMap<String, Treatment> treatmentTable = new HashMap<String, Treatment>();
        HashMap<String, Bioreplicate> bioreplicatesTable = new HashMap<String, Bioreplicate>();
        ArrayList<BioCondition> biocondition_list = new ArrayList<BioCondition>();

        InputStream input = new BufferedInputStream(new FileInputStream(file));
        POIFSFileSystem fs = new POIFSFileSystem(input);
        HSSFWorkbook wb = new HSSFWorkbook(fs);

        int sheetNumber = wb.getNumberOfSheets();
        if (sheetNumber < 3) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, template file must have 3 sheets.");
        }

        //PARSE THE COMMON BIOLOGICAL CONDITION INFORMATION
        HSSFSheet sheet = wb.getSheetAt(0);
        if (!"COMMON BIOLOGICAL CONDITION INF".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, expected COMMON BIOLOGICAL CONDITION INF sheet not found.");
        }

        BioCondition biocondition_common = new BioCondition();
        biocondition_common.setTitle(sheet.getRow(3).getCell(1).getStringCellValue());
        biocondition_common.setName(sheet.getRow(4).getCell(1).getStringCellValue());
        biocondition_common.setOrganism(sheet.getRow(5).getCell(1).getStringCellValue());
        biocondition_common.setTissueType(sheet.getRow(6).getCell(1).getStringCellValue());
        biocondition_common.setCellType(sheet.getRow(7).getCell(1).getStringCellValue());
        biocondition_common.setCellLine(sheet.getRow(8).getCell(1).getStringCellValue());
        biocondition_common.setGender(sheet.getRow(9).getCell(1).getStringCellValue());
        biocondition_common.setGenotype(sheet.getRow(10).getCell(1).getStringCellValue());
        biocondition_common.setOtherBiomat(sheet.getRow(11).getCell(1).getStringCellValue());
        biocondition_common.setTreatment(sheet.getRow(13).getCell(1).getStringCellValue());
        biocondition_common.setDosis(sheet.getRow(14).getCell(1).getStringCellValue());
        biocondition_common.setTime(sheet.getRow(15).getCell(1).getStringCellValue());
        biocondition_common.setOtherExpCond(sheet.getRow(16).getCell(1).getStringCellValue());
        biocondition_common.setProtocolDescription(sheet.getRow(17).getCell(1).getStringCellValue());
        biocondition_common.setExternalLinks(sheet.getRow(19).getCell(1).getStringCellValue());

        Date date_aux = new Date();
        String today = String.format("%02d", date_aux.getYear() + 1900) + String.format("%02d", date_aux.getMonth() + 1) + String.format("%02d", date_aux.getDate());
        biocondition_common.setLastEditionDate(today);
        biocondition_common.setSubmissionDate(today);
        biocondition_common.setBioConditionID("BC" + (biocondition_list.size() + 1));
        //TODO: CAMBIAR ESTO!!
        biocondition_common.addOwner(new User(owner, ""));

        //**************************************************************************************************************************************
        //**BATCHES PARSING*********************************************************************************************************************
        //**************************************************************************************************************************************
        sheet = wb.getSheetAt(1);
        if (!"BATCHES INFO".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, expected BATCHES INFO sheet not found.");
        }

        Iterator rows = sheet.rowIterator();
        //IGNORE THE FIRST 4 ROWS
        for (int i = 0; i < 4; i++) {
            rows.next();
        }

        Batch batch;
        while (rows.hasNext()) {
            HSSFRow row = (HSSFRow) rows.next();
            String batch_id = row.getCell(0).getStringCellValue();
            String batch_name = row.getCell(1).getStringCellValue();
            if (batch_name.isEmpty()) {
                break;
            }
            Date batch_date = row.getCell(2).getDateCellValue();
            String batch_date_string = String.format("%02d", batch_date.getYear() + 1900) + String.format("%02d", batch_date.getMonth() + 1) + String.format("%02d", batch_date.getDate());
            String batch_description = row.getCell(3).getStringCellValue();
            batch = new Batch();
            batch.setBatchID(batch_id);
            batch.setBatchName(batch_name);
            batch.setBatchCreationDate(batch_date_string);
            batch.setDescription(batch_description);
            batch.addOwner(new User(owner, ""));
            batchesTable.put(batch_id, batch);
        }

        //**************************************************************************************************************************************
        //**PROTOCOL PARSING*********************************************************************************************************************
        //**************************************************************************************************************************************
        sheet = wb.getSheetAt(3);
        if (!"PROTOCOLS INFO".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, expected PROTOCOLS INFO sheet not found.");
        }

        rows = sheet.rowIterator();
        //IGNORE THE FIRST 4 ROWS
        for (int i = 0; i < 4; i++) {
            rows.next();
        }

        Treatment treatment;
        while (rows.hasNext()) {
            HSSFRow row = (HSSFRow) rows.next();
            String treatment_id = row.getCell(0).getStringCellValue();
            String protocol_name = row.getCell(1).getStringCellValue();
            if (protocol_name.isEmpty()) {
                break;
            }
            String extracted_molecule = row.getCell(2).getStringCellValue();
            String treatment_description = row.getCell(3).getStringCellValue();
            treatment = new Treatment();
            treatment.setTreatmentID(treatment_id);
            treatment.setTreatment_name(protocol_name);
            treatment.setBiomolecule(extracted_molecule);
            treatment.setDescription(treatment_description);
            treatment.addOwner(new User(owner, ""));
            treatmentTable.put(treatment_id, treatment);
        }

        //PARSE THE BIOLOGICAL CONDITION INFORMATION
        sheet = wb.getSheetAt(2);
        if (!"BIOLOGICAL REPLICATES INFO".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, expected BIOLOGICAL REPLICATES INFO sheet not found.");
        }

        Bioreplicate bioreplicateInstance = null;
        rows = sheet.rowIterator();
        //IGNORE THE FIRST 6 ROWS
        for (int i = 0; i < 6; i++) {
            rows.next();
        }

        while (rows.hasNext()) {
            //GET THE ROW 
            HSSFRow row = (HSSFRow) rows.next();
            if (row.getCell(0) == null) {
                break;
            }
            //GET THE FIRST 3 FIELDS
            String bioreplicate_id = row.getCell(0).getStringCellValue();
            String bioreplicate_name = row.getCell(1).getStringCellValue();
            if (bioreplicate_name.isEmpty()) {
                break;
            }

            bioreplicateInstance = new Bioreplicate("", "", bioreplicate_name);

            String batch_id = row.getCell(2).getStringCellValue();
            if (!batch_id.isEmpty()) {
                Batch associatedBatch = batchesTable.get(batch_id);
                //If the specified batch is not a to-be-added batch it should be added previously in the db
                if (associatedBatch == null) {
                    associatedBatch = new Batch();
                    associatedBatch.setBatchID(batch_id);
                }
                bioreplicateInstance.setAssociatedBatch(associatedBatch);
            }

            bioreplicatesTable.put(bioreplicate_id, bioreplicateInstance);

            //PARSE THE VARITIONS IN BIOLOGICAL CONDITION (IF EXISTS)
            BioCondition biocondition_tmp = (BioCondition) biocondition_common.clone();
            if (!row.getCell(3).getStringCellValue().isEmpty()) {
                biocondition_tmp.setTitle(row.getCell(3).getStringCellValue());
            }
            if (!row.getCell(4).getStringCellValue().isEmpty()) {
                biocondition_tmp.setName(row.getCell(4).getStringCellValue());
            }
            if (!row.getCell(5).getStringCellValue().isEmpty()) {
                biocondition_tmp.setOrganism(row.getCell(5).getStringCellValue());
            }
            if (!row.getCell(6).getStringCellValue().isEmpty()) {
                biocondition_tmp.setTissueType(row.getCell(6).getStringCellValue());
            }
            if (!row.getCell(7).getStringCellValue().isEmpty()) {
                biocondition_tmp.setCellType(row.getCell(7).getStringCellValue());
            }
            if (!row.getCell(8).getStringCellValue().isEmpty()) {
                biocondition_tmp.setCellLine(row.getCell(8).getStringCellValue());
            }
            if (!row.getCell(9).getStringCellValue().isEmpty()) {
                biocondition_tmp.setGender(row.getCell(9).getStringCellValue());
            }
            if (!row.getCell(10).getStringCellValue().isEmpty()) {
                biocondition_tmp.setGenotype(row.getCell(10).getStringCellValue());
            }
            if (!row.getCell(11).getStringCellValue().isEmpty()) {
                biocondition_tmp.setOtherBiomat(row.getCell(11).getStringCellValue());
            }
            if (!row.getCell(12).getStringCellValue().isEmpty()) {
                biocondition_tmp.setTreatment(row.getCell(12).getStringCellValue());
            }
            if (!row.getCell(13).getStringCellValue().isEmpty()) {
                biocondition_tmp.setDosis(row.getCell(13).getStringCellValue());
            }
            if (!row.getCell(14).getStringCellValue().isEmpty()) {
                biocondition_tmp.setTime(row.getCell(14).getStringCellValue());
            }
            if (!row.getCell(15).getStringCellValue().isEmpty()) {
                biocondition_tmp.setOtherExpCond(row.getCell(15).getStringCellValue());
            }
            if (!row.getCell(16).getStringCellValue().isEmpty()) {
                biocondition_tmp.setProtocolDescription(row.getCell(16).getStringCellValue());
            }

            //CHECK IF NO ONE FIELD WAS FILLED, IF SO THE BIOREPLICATE SHOULD BE ADDED TO THE
            //COMMON BIOLOGICAL CONDITION's BIOREPLICATE LIST
            int i = 0;
            for (i = 0; i < biocondition_list.size(); i++) {
                if (biocondition_list.get(i).hasSameValues(biocondition_tmp)) {
                    biocondition_list.get(i).addAssociatedBioreplicate(bioreplicateInstance);
                    break;
                }
            }
            //IF NO SIMILAR biocondition WAS FOUND, WE SHOULD ADD A NEW ONE
            if (i == biocondition_list.size()) {
                biocondition_tmp.addAssociatedBioreplicate(bioreplicateInstance);
                biocondition_tmp.setBioConditionID("BS" + (biocondition_list.size() + 1));
                biocondition_list.add(biocondition_tmp);
            }
        }

        //**************************************************************************************************************************************
        //**PROTOCOL PARSING*********************************************************************************************************************
        //**************************************************************************************************************************************
        sheet = wb.getSheetAt(4);
        if (!"ANALYTICAL SAMPLES INFO".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the Sample information: Invalid File, expected PROTOCOLS INFO sheet not found.");
        }

        rows = sheet.rowIterator();
        //IGNORE THE FIRST 4 ROWS
        for (int i = 0; i < 4; i++) {
            rows.next();
        }

        AnalyticalReplicate analyticalSampleInstance;
        while (rows.hasNext()) {
            HSSFRow row = (HSSFRow) rows.next();
            String bioreplicateID = row.getCell(0).getStringCellValue();
            String treatmentID = row.getCell(1).getStringCellValue();
            String analyticalSampleName = row.getCell(2).getStringCellValue();
            if (analyticalSampleName.isEmpty()) {
                break;
            }
            bioreplicateInstance = bioreplicatesTable.get(bioreplicateID);

            analyticalSampleInstance = new AnalyticalReplicate();
            analyticalSampleInstance.setBioreplicateID(bioreplicateInstance.getBioreplicateID());
            analyticalSampleInstance.setTreatmentID(treatmentID);
            analyticalSampleInstance.setAnalyticalReplicateName(analyticalSampleName);

            bioreplicateInstance.addAssociatedAnalyticalReplicate(analyticalSampleInstance);
        }

        Object[] data = new Object[3];
        data[0] = biocondition_list;
        data[1] = batchesTable;
        data[2] = treatmentTable;
        return data;
    }
}
