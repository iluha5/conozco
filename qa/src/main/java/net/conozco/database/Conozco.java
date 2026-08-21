package net.conozco.database;

import net.conozco.enums.DBType;
import net.conozco.models.User;
import org.junit.jupiter.api.Assertions;

import java.util.Date;

public class Conozco extends CommonDB {
    public void submitUserAccount(User user) {
        String sql = queryHelper.getDBQuery("SET_EMAIL_VERIFIED", commonFunction.toStringDate(new Date()), user.getEmail());

        Assertions.assertTrue(execSQLWithoutResult(DBType.CONOZCO, sql) > 0, "Submit account doesn't successful");
    }

    public void deleteUser(User user) {
        String sql = queryHelper.getDBQuery("DELETE_USER", user.getEmail());

        Assertions.assertTrue(execSQLWithoutResult(DBType.CONOZCO, sql) > 0, "User hasn't been deleted");
    }
}

