
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.File;
import java.net.URI;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author rhernandez
 */
public class test {

    public static void main(String[] args) {
        try {
            CloseableHttpClient httpclient = HttpClients.createDefault();

            URI uri = new URIBuilder("http://localhost:8090/api/histories/most_recently_used").addParameter("key", "2b059e2a17f03406c65e5a7e429958f1").build();
            HttpGet get = new HttpGet(uri);
            HttpResponse response = httpclient.execute(get);
            JsonElement jelement = new JsonParser().parse(org.apache.http.util.EntityUtils.toString(response.getEntity()));
            
            String historyID = jelement.getAsJsonObject().get("id").getAsString();
            
            uri = new URIBuilder("http://localhost:8090/api/tools/").addParameter("key", "2b059e2a17f03406c65e5a7e429958f1").build();
            HttpPost post = new HttpPost(uri);
            FileBody fileBody = new FileBody(new File("/home/rhernandez/Desktop/caca/2.png"));

            MultipartEntityBuilder builder = MultipartEntityBuilder.create();
            builder.addPart("files_0|file_data", fileBody);
//            builder.addPart("inputs", new StringBody("{\"dbkey\":\"?\",\"file_type\":\"txt\",\"files_0|type\":\"upload_dataset\",\"files_0|space_to_tab\":null,\"files_0|to_posix_lines\":\"Yes\"}"));
            builder.addPart("tool_id", new StringBody("upload1"));
            builder.addPart("history_id", new StringBody(historyID));
            post.setEntity(builder.build());

            response = httpclient.execute(post);
            String caca = org.apache.http.util.EntityUtils.toString(response.getEntity());
            
            httpclient.close();

            System.out.println("test.main()");
        } catch (Exception ex) {
            Logger.getLogger(test.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
