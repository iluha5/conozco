package ui;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import net.conozco.database.DBFunctions;

public class DefaultTest {
    protected static DBFunctions dbFunctions = new DBFunctions();

    public void openBrowser() {
        Configuration.timeout = 60 * 1000;
        Selenide.open("http://localhost:8000");
    }
}
