package net.conozco.database;

import net.conozco.core.Config;
import net.conozco.enums.DBType;
import net.conozco.helpers.CommonFunction;
import org.aeonbits.owner.ConfigCache;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class CommonDB {
    protected final QueryHelper queryHelper = new QueryHelper();
    protected final CommonFunction commonFunction = new CommonFunction();
    private final Config CONFIG = ConfigCache.getOrCreate(Config.class);

    protected Connection getConnection(DBType dbType) {
        switch (dbType) {
            case CONOZCO -> {
                return createDBConnection(dbType.getValue(), CONFIG.conozcoUser(), CONFIG.conozcoPassword());
            }
            case MYSQL -> {
                throw new Error("Add logic to MySQL");
            }
            default -> throw new Error("Can't connect to BD");
        }
    }

    protected int execSQLWithoutResult(DBType dbType, String sql) {
        commonFunction.sleep(2);
        try (Connection connection = getConnection(dbType); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setQueryTimeout(60);
            return statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private Connection createDBConnection(String url, String user, String password) {
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
