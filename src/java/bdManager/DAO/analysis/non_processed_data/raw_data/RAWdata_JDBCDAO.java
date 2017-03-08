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
package bdManager.DAO.analysis.non_processed_data.raw_data;

import bdManager.DAO.DAOProvider;
import bdManager.DAO.analysis.Step_JDBCDAO;
import bdManager.DBConnectionManager;
import classes.analysis.non_processed_data.RAWdata;
import classes.analysis.non_processed_data.raw_data.ExtractionMethod;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class RAWdata_JDBCDAO extends Step_JDBCDAO {

//******************************************************************************************************************************************/
//*** INSERT FUNCTIONS *********************************************************************************************************************/
//******************************************************************************************************************************************/
    /**
     *
     * @param object
     * @return
     * @throws SQLException
     */
    @Override
    public boolean insert(Object object) throws SQLException {
        RAWdata rawdata = (RAWdata) object;

        //FIRST CALL TO PARENT INSERT FUNCTION
        super.insert(rawdata);

        //Inserts a new entry in the rawdata table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "INSERT INTO rawdata SET rawdata_id = ?, analyticalReplicate_id = ?, raw_data_type = ?");

        ps.setString(1, rawdata.getRAWdataID());
        ps.setString(2, rawdata.getAnalyticalReplicate_id());
        ps.setString(3, rawdata.getRAWdataType());
        ps.execute();

        //Inserts a new entry for the EXTRACTION METHOD associated to the RAW DATA
        DAOProvider.getDAO(rawdata.getExtractionMethod()).insert(rawdata.getExtractionMethod());

        return true;
    }

    //******************************************************************************************************************************************/
    //*** UPDATE FUNCTIONS *********************************************************************************************************************/
    //******************************************************************************************************************************************/
    @Override
    public boolean update(Object object) throws SQLException {
        RAWdata rawdata = (RAWdata) object;

        //FIRST CALL TO PARENT INSERT FUNCTION
        super.update(rawdata);

        //Inserts a new entry in the rawdata table
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "UPDATE rawdata SET "
                + " analyticalReplicate_id = ? "
                + "WHERE rawdata_id = ?");

        ps.setString(1, rawdata.getAnalyticalReplicate_id());
        ps.setString(2, rawdata.getRAWdataID());
        ps.execute();

        //Updates the EXTRACTION METHOD associated to the RAW DATA
        DAOProvider.getDAO(rawdata.getExtractionMethod()).update(rawdata.getExtractionMethod());

        return true;
    }

    //******************************************************************************************************************************************/
    //*** GETTERS    ***************************************************************************************************************************/
    //******************************************************************************************************************************************/
    /**
     *
     * @param otherParams, an array with the analysis ID
     * @return
     * @throws SQLException
     */
    @Override
    public ArrayList<Object> findAll(Object[] otherParams) throws SQLException {
        String analysis_id = null;
        if (otherParams != null) {
            analysis_id = (String) otherParams[0];
        }
        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT t1.* FROM rawdata as t1, analysis_has_steps as t2 "
                + "WHERE t2.analysis_id = ? "
                + "AND t1.rawdata_id = t2.step_id ");

        ps.setString(1, analysis_id);
        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<Object> rawdata_list = new ArrayList<Object>();
        RAWdata rawdata = null;
        while (rs.next()) {
            rawdata = new RAWdata(rs.getString("rawdata_id"));

            Object[] params = {rawdata};
            //RETRIEVE THE INFORMATION HERITED FROM NON PROCESSED DATA
            super.findByID(rawdata.getRAWdataID(), params);

            //SET THE INFORMATION OF THE RAW DATA
            rawdata.setAnalyticalSampleID(rs.getString("analyticalReplicate_id"));
            rawdata.setRawDataType(rs.getString("raw_data_type"));

            //GET THE ASSOCIATED EXTRACTION METHOD
            ExtractionMethod extractionMethod = (ExtractionMethod) DAOProvider.getDAOByName(rawdata.getRAWdataType().replace("-", "").replace("_", "")).findByID(rawdata.getRAWdataID(), null);
            rawdata.setExtractionMethod(extractionMethod);

            rawdata_list.add(rawdata);
        }

        return rawdata_list;
    }

    public ArrayList<String> findBy(String[] fieldNames, String[] fieldValues) throws SQLException {
        if(fieldNames.length < 1){
            return null;
        }
        
        String searchParams =  fieldNames[0] + " LIKE \"" + fieldValues[0] + "\"";
        
        for (int i =1; i < fieldNames.length; i++) {
            searchParams +=  "AND " + fieldNames[i] + " LIKE \"" + fieldValues[i] + "\"";
        }

        PreparedStatement ps = (PreparedStatement) DBConnectionManager.getConnectionManager().prepareStatement(""
                + "SELECT rawdata_id FROM rawdata WHERE " + searchParams);

        ResultSet rs = (ResultSet) DBConnectionManager.getConnectionManager().execute(ps, true);

        ArrayList<String> rawdataIdList = new ArrayList<String>();
        while (rs.next()) {
            rawdataIdList.add(rs.getString("rawdata_id"));
        }

        return rawdataIdList;
    }

}
