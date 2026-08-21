package net.conozco.database;

import net.conozco.models.User;

public class DBFunctions {
    public void deleteUser(User user) {
        new Conozco().deleteUser(user);
    }

    public void submitUserAccount(User user) {
        new Conozco().submitUserAccount(user);
    }
}
