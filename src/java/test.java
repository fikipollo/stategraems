
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.util.EntityUtils;

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
            URI uri = new URIBuilder("http://localhost:8084/rest/messages/").addParameter("key", "bf9e1fdf024320fc9f709def87480ca0").build();
//            URI uri = new URIBuilder("http://localhost:8090/api/tools/").addParameter("key", "bf9e1fdf024320fc9f709def87480ca0").build();
            HttpPost post = new HttpPost(uri);
            FileBody fileBody = new FileBody(new File("/home/rhernandez/Desktop/caca/unnamed.jpg"));

            MultipartEntityBuilder builder = MultipartEntityBuilder.create();
            builder.addPart("tool_id", new StringBody("upload1"));
            builder.addPart("history_id", new StringBody("f597429621d6eb2b"));
            builder.addPart("files_0|file_data'", fileBody);
            post.setEntity(builder.build());

            CloseableHttpClient httpclient = HttpClients.createDefault();
            HttpResponse response = httpclient.execute(post);
            String caca = org.apache.http.util.EntityUtils.toString(response.getEntity());

            HttpGet get = new HttpGet(uri);

            httpclient = HttpClients.createDefault();
            response = httpclient.execute(get);

            caca = org.apache.http.util.EntityUtils.toString(response.getEntity());
            httpclient.close();

            System.out.println("test.main()");
        } catch (Exception ex) {
            Logger.getLogger(test.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
