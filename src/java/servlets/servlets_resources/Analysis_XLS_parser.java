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
import classes.analysis.Analysis;
import classes.analysis.non_processed_data.RAWdata;
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.MassSpectrometry;
import classes.analysis.non_processed_data.raw_data.SeparationMethods.ColumnChromatography;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class Analysis_XLS_parser {

    /**
     * ******************************************************************************************************************************
     * RAW DATA STEP XLS PARSERS
     * *******************************************************************************************************************************
     */
    /**
     *
     * @param rawDataType
     * @param file
     * @param owners
     * @return
     * @throws Exception
     */
    public static RAWdata parse_RAWData_XLSfile(String rawDataType, File file, String[] owners) throws Exception {
        RAWdata rawDataInstance = null;

        if ("ChIP-seq".equals(rawDataType)) {

        } else if ("DNase-seq".equals(rawDataType)) {
        } else if ("Methyl-seq".equals(rawDataType)) {
        } else if ("mRNA-seq".equals(rawDataType)) {
        } else if ("smallRNA-seq".equals(rawDataType)) {
        } else if ("GC-MS".equals(rawDataType)) {
            return parse_GCMS_XLSfile(file, owners);
        } else if ("LC-MS".equals(rawDataType)) {
            return parse_GCMS_XLSfile(file, owners);
        } else if ("CE-MS".equals(rawDataType)) {
        } else if ("MassSpectrometry".equals(rawDataType)) {
        } else if ("NuclearMagneticResonance".equals(rawDataType)) {
        }

        if (rawDataInstance != null) {
            Date dateAux = new Date();
            String today = String.format("%02d", dateAux.getYear() + 1900) + String.format("%02d", dateAux.getMonth() + 1) + String.format("%02d", dateAux.getDate());
            rawDataInstance.setLastEditionDate(today);
            rawDataInstance.setSubmissionDate(today);

            //TODO: CAMBIAR ESTO!!
            for (String owner : owners) {
                rawDataInstance.addOwner(new User(owner, ""));
            }
        }
        return rawDataInstance;
    }

    /**
     *
     * @param file
     * @param owners
     * @return
     * @throws Exception
     */
    public static RAWdata parse_GCMS_XLSfile(File file, String[] owners) throws Exception {
        InputStream input = new BufferedInputStream(new FileInputStream(file));
        POIFSFileSystem fs = new POIFSFileSystem(input);
        HSSFWorkbook wb = new HSSFWorkbook(fs);

        int sheetNumber = wb.getNumberOfSheets();
        if (sheetNumber < 2) {
            throw new Exception("Error trying to insert the GC-MS information: Invalid File, template file must have 2 sheets.");
        }

        RAWdata rawDataInstance = new RAWdata("STxxxxx.1");
        rawDataInstance.setRawDataType("Proteomics");

        ColumnChromatography columnChromatography = parse_ColumnChromatography_XLSfile(wb.getSheetAt(0), rawDataInstance);
        MassSpectrometry massSpectrometry = parse_MassSpectrometry_XLSfile(wb.getSheetAt(1), rawDataInstance);

        massSpectrometry.setSeparationMethod(columnChromatography);
        rawDataInstance.setExtractionMethod(massSpectrometry);

        return rawDataInstance;
    }

    /**
     *
     * @param sheet
     * @param rawDataInstance
     * @return
     * @throws Exception
     */
    public static ColumnChromatography parse_ColumnChromatography_XLSfile(HSSFSheet sheet, RAWdata rawDataInstance) throws Exception {

        ColumnChromatography columnChromatography = new ColumnChromatography();
        //**************************************************************************************************************************************
        //**PARSING THE MIAPE-GC INFORMATION****************************************************************************************************
        //**************************************************************************************************************************************
        if ("MIAPE-GC".equals(sheet.getSheetName())) {
            columnChromatography.setColumnChromatographyType("Gas");
        } else if ("MIAPE-LC".equals(sheet.getSheetName())) {
            columnChromatography.setColumnChromatographyType("Liquid");
        } else {
            throw new Exception("Error trying to insert the GC-MS / LC-MS information: Invalid File, expected MIAPE-CC sheet not found.");
        }
        int i = 2;
        //General features																													
        rawDataInstance.setStepName(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        rawDataInstance.setAnalyticalSampleID(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setSampleDescription(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setSampleProcessing(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setSampleInjection(sheet.getRow(i).getCell(1).getStringCellValue());
        //Equipment - Column: Product details																													
        i += 2;
        columnChromatography.setColumnManufacturer(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setColumnModel(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setSeparationMode(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDimensions(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDescriptionOfStationaryPhase(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setAdditionalAccessories(sheet.getRow(i).getCell(1).getStringCellValue());
        //Equipment - Chromatography system used for separation																													
        i += 2;
        columnChromatography.setCombinedUnitManufacturer(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setCombinedUnitModel(sheet.getRow(i).getCell(1).getStringCellValue());

        //Mobile phases (Describe all the mobile phases of the run)																													
        i += 2;
        int columnPosition = 1;
        HSSFRow namesRow = sheet.getRow(i);
        HSSFRow descriptionRow = sheet.getRow(i + 1);
        String mobilePhaseName = namesRow.getCell(columnPosition).getStringCellValue();
        ColumnChromatography.MobilePhase mobilePhase = null;

        while (mobilePhaseName != "") {
            mobilePhase = columnChromatography.getNewMobilePhase();
            mobilePhase.setName(mobilePhaseName);
            mobilePhase.setDescription(descriptionRow.getCell(columnPosition).getStringCellValue());
            columnChromatography.addMobilePhase(mobilePhase);

            columnPosition++;
            mobilePhaseName = namesRow.getCell(columnPosition).getStringCellValue();
        }

        //Column Run properties																													
        i += 3;
        columnChromatography.setTime(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setGradient(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setFlowRate(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setTemperature(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setTemperature(sheet.getRow(i).getCell(1).getStringCellValue());

        //Pre and Post Run processes																													
        i += 2;
        columnChromatography.setPreRunProcessType(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setPreRunProcessSubstance(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setPreRunProcessTime(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setPreRunProcessFlowrate(sheet.getRow(i).getCell(1).getStringCellValue());

        //Column outputs - Detection																													
        i += 2;
        columnChromatography.setDetectionEquipment(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDetectionType(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDetectionEquipmentSettings(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDetectionTimescale(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        columnChromatography.setDetectionTrace(sheet.getRow(i).getCell(1).getStringCellValue());

        //Mobile phases (Describe all the mobile phases of the run)																													
        i += 2;
        columnPosition = 1;
        namesRow = sheet.getRow(i);
        descriptionRow = sheet.getRow(i + 1);
        String fractionName = namesRow.getCell(columnPosition).getStringCellValue();
        ColumnChromatography.Fraction fraction = null;

        while (fractionName != "") {
            fraction = columnChromatography.getNewFraction();
            fraction.setName(fractionName);
            fraction.setDescription(descriptionRow.getCell(columnPosition).getStringCellValue());
            columnChromatography.addFraction(fraction);

            columnPosition++;
            fractionName = namesRow.getCell(columnPosition).getStringCellValue();
        }

        return columnChromatography;
    }

    /**
     *
     * @param sheet
     * @param rawDataInstance
     * @return
     * @throws Exception
     */
    public static MassSpectrometry parse_MassSpectrometry_XLSfile(HSSFSheet sheet, RAWdata rawDataInstance) throws Exception {

        MassSpectrometry massSpectrometry = new MassSpectrometry();
        //**************************************************************************************************************************************
        //**PARSING THE MIAPE-MS INFORMATION****************************************************************************************************
        //**************************************************************************************************************************************
        if (!"MIAPE-MS".equals(sheet.getSheetName())) {
            throw new Exception("Error trying to insert the GC-MS / LC-MS information: Invalid File, expected MIAPE-MS sheet not found.");
        }

        int i = 2;
        //Equipment details	
        massSpectrometry.setMassSpectrometerManufacturer(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setCustomizations(sheet.getRow(i).getCell(1).getStringCellValue());
        i += 3;
        if (!"".equals(sheet.getRow(i).getCell(1).getStringCellValue())) {
            massSpectrometry.setIonizationSource("Electrospray Ionisation (ESI)");
            massSpectrometry.setSupplyType(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setInterfaceManufacturerAndModel(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setSprayerTypeManufacturerAndModel(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setOtherElectrosprayIonisation(sheet.getRow(i).getCell(1).getStringCellValue());
        } else if (!"".equals(sheet.getRow(i + 5).getCell(1).getStringCellValue())) {
            i += 5;
            massSpectrometry.setIonizationSource("MALDI");
            massSpectrometry.setPlateComposition(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setMatrixComposition(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setPsdSummary(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setLaserTypeAndWavelength(sheet.getRow(i).getCell(1).getStringCellValue());
            i++;
            massSpectrometry.setOtherMALDI(sheet.getRow(i).getCell(1).getStringCellValue());
        } else {
            i += 11;
            massSpectrometry.setIonizationSource("Other ion source");
            massSpectrometry.setOtherIonizationDescription(sheet.getRow(i).getCell(1).getStringCellValue());
        }
        //Post source component details (analyser)
        i = 19;
        massSpectrometry.setMassAnalyzerType(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setReflectronStatus(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setActivationLocation(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setGasType(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setActivationType(sheet.getRow(i).getCell(1).getStringCellValue());
        //Spectrum and peak list generation and annotation (data acquisition)
        i += 2;
        massSpectrometry.setAcquisitionSoftware(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setAcquisitionParameters(sheet.getRow(i).getCell(1).getStringCellValue());
        //Spectrum and peak list generation and annotation (data analysis)
        i += 2;
        massSpectrometry.setAnalysisSoftware(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setAnalysisParameters(sheet.getRow(i).getCell(1).getStringCellValue());
        //Spectrum and peak list generation and annotation (resulting data
        i += 2;
        String fileLocations = sheet.getRow(i).getCell(1).getStringCellValue();
        fileLocations = fileLocations.replaceAll("\n", "\\$\\$");
        rawDataInstance.setFilesLocation(fileLocations);
        i++;
        massSpectrometry.setIntensityValues(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setMSlevel(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setIonMode(sheet.getRow(i).getCell(1).getStringCellValue());
        i++;
        massSpectrometry.setAdditionalInfo(sheet.getRow(i).getCell(1).getStringCellValue());

        return massSpectrometry;
    }

    public static void main(String[] args) {
        try {
            //TODO: INDICAR TIPO ANALYSIS EN LA VENTANA DE IMPORTAR XLS
            Analysis analysisInstance = new Analysis();
            analysisInstance.setAnalysisID("ANxxxxx");
            analysisInstance.setAnalysisType("Proteomics");
            analysisInstance.setAnalysisName("test");
            analysisInstance.setStatus("open");

            String[] owners = new String[]{"rafa"};
            RAWdata rawdata = parse_GCMS_XLSfile(new File("/home/rhernandez/Dropbox/CIPF/Proyectos/Proyecto STATegra/LIMS Documentation/STATegraEMS - Tutorials/STATegra_EMS_tutorials/Proteomics/MIAPE-LCMS_example.xls"), owners);

            PrintWriter writer = new PrintWriter("/home/rhernandez/Desktop/caca", "UTF-8");

            writer.println(rawdata.toJSON());
            writer.close();

        } catch (Exception ex) {
            Logger.getLogger(Analysis_XLS_parser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
