import java.util.Map;

public interface ExternalToolManager {
    public void loadSettings(Map<String, String> settings);
    public boolean sendFile(String filePath) throws Exception;
    public String getType();
    public String getHost();
    public String getUser();
    public String getPass();
    public String getApiKey();
}