package net.conozco.database;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.conozco.models.DBQuery;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class QueryHelper {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<DBQuery> dbQueryList;

    private List<DBQuery> writeDatabaseQuery() {
        File file = new File(getClass().getClassLoader().getResource("DatabaseQuery.json").getFile());

        try {
            return objectMapper.readValue(file, objectMapper.getTypeFactory().constructCollectionType(List.class, DBQuery.class));
        } catch (IOException e) {
            throw new AssertionError("Can't read the file");
        }
    }

    public QueryHelper() {
        dbQueryList = writeDatabaseQuery();
    }

    public String getDBQuery(String key, String... params) {
        return getValue(key, params);
    }

    public String getDBQuery(String key) {
        return getValue(key);
    }

    private String formatString(String string, String... params) {
        for (int i = 0; i < params.length; i++) {
            string = string.replaceAll("\\{" + i + "}", params[i]);
        }
        return string;
    }

    private String getValue(String key, String... params) {
        String result = dbQueryList.stream()
                .filter(item -> item.getKey().equals(key))
                .findFirst().orElseThrow(() -> new AssertionError("Query doesn't find by key =" + key)).getQuery();
        if (params.length > 0) {
            result = formatString(result, params);
        }
        return result;
    }
}
