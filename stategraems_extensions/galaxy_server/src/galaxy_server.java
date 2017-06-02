
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;


/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author rhernandez
 */
public class galaxy_server implements ExternalToolManager {

    String type = "galaxy_server";
    String host;
    String user;
    String pass;
    String apikey;

    @Override
    public void loadSettings(Map<String, String> settings) {
        type = settings.get("type");
        host = settings.get("host");
        user = settings.get("user");
        pass = settings.get("pass");
        apikey = settings.get("apikey");
    }

    @Override
    public boolean sendFile(String filePath) throws Exception {
        String url = this.getHost() + "/api/histories/most_recently_used";

        HashMap<String, String> params = new HashMap<>();
        params.put("key", this.getApiKey());

        String response = this.sendGet(url, params);
        JsonElement jelement = new JsonParser().parse(response);
        String historyID = jelement.getAsJsonObject().get("id").getAsString();

        String charset = "UTF-8";
        url = this.getHost() + "/api/tools/";
                
        MultipartUtility multipart = new MultipartUtility(url, charset);
        multipart.addFormField("key", this.getApiKey());
        multipart.addFormField("inputs", "{\"dbkey\":\"?\",\"file_type\":\"txt\",\"files_0|type\":\"upload_dataset\",\"files_0|space_to_tab\":null,\"files_0|to_posix_lines\":\"Yes\"}");
        multipart.addFormField("tool_id", "upload1");
        multipart.addFormField("history_id", historyID);
        multipart.addFilePart("files_0|file_data", new File(filePath));
        multipart.finish();
        return true;
    }

    // HTTP GET request
    private String sendGet(String url, Map<String, String> params) throws Exception {
        if (params != null && !params.isEmpty()) {
            url += "?";
            for (String key : params.keySet()) {
                url += key + "=" + params.get(key) + "&";
            }
        }

        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod("GET");
        int responseCode = con.getResponseCode();

        if (responseCode != 200) {
            throw new Exception("Failed while sending GET request");
        }

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return response.toString();
    }

    // HTTP GET request
    private String sendFilePost(String filePath, String url, Map<String, String> params) throws Exception {
        String charset = "UTF-8";
        File binaryFile = new File(filePath);

        String boundary = Long.toHexString(System.currentTimeMillis()); // Just generate some unique random value.
        String CRLF = "\r\n"; // Line separator required by multipart/form-data.

        URLConnection connection = new URL(url).openConnection();
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try {
            OutputStream output = connection.getOutputStream();
            PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, charset), true);

            if (params != null && !params.isEmpty()) {
                for (String key : params.keySet()) {
                    // Send normal param.
                    writer.append("--" + boundary).append(CRLF);
                    writer.append("Content-Disposition: form-data; name=\"" + key + "\"").append(CRLF);
                    writer.append("Content-Type: text/plain; charset=" + charset).append(CRLF);
                    writer.append(CRLF).append(params.get(key)).append(CRLF).flush();
                }
            }

            // Send binary file.
            writer.append("--" + boundary).append(CRLF);
            writer.append("Content-Disposition: form-data; name=\"binaryFile\"; filename=\"" + binaryFile.getName() + "\"").append(CRLF);
            writer.append("Content-Type: " + URLConnection.guessContentTypeFromName(binaryFile.getName())).append(CRLF);
            writer.append("Content-Transfer-Encoding: binary").append(CRLF);
            writer.append(CRLF).flush();
            Files.copy(binaryFile.toPath(), output);
            output.flush(); // Important before continuing with writer!
            writer.append(CRLF).flush(); // CRLF is important! It indicates end of boundary.

            // End of multipart/form-data.
            writer.append("--" + boundary + "--").append(CRLF).flush();
        } catch (Exception e) {

        }

        // Request is lazily fired whenever you need to obtain information about response.
        int responseCode = ((HttpURLConnection) connection).getResponseCode();

        if (responseCode != 200) {
            throw new Exception("Failed while sending FILE request");
        }

        return "";
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public String getHost() {
        return host;
    }

    @Override
    public String getUser() {
        return user;
    }

    @Override
    public String getPass() {
        return pass;
    }

    @Override
    public String getApiKey() {
        return apikey;
    }

}
