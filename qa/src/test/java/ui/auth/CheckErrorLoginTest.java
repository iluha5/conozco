package ui.auth;

import net.conozco.pages.HomePage;
import net.conozco.pages.auth.LoginPage;
import org.junit.jupiter.api.Test;
import ui.DefaultTest;

import static com.codeborne.selenide.Condition.visible;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CheckErrorLoginTest extends DefaultTest {
    private final LoginPage loginPage = new LoginPage();
    private final HomePage homePage = new HomePage();

    @Test
    public void registerWithEmptyFieldTest() {
        openBrowser();
        homePage.clickOn(homePage.getLoginHeaderBtn());

        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertTrue(loginPage.elementShouldBe(loginPage.getErrorLoginAlert(), visible), "Alert doesn't appear");
        assertTrue(loginPage.checkText(loginPage.getErrorLoginAlert(), "Fill all fields"));
    }

    @Test
    public void loginWithInvalidEmil() {
        openBrowser();
        homePage.clickOn(homePage.getLoginHeaderBtn());

        loginPage.inputText(loginPage.getEmailLoginInput(), "1");
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertEquals("Адрес электронной почты должен содержать символ \"@\". В адресе \"1\" отсутствует символ \"@\".", loginPage.getEmailLoginInput().getAttribute("validationMessage"), "Error text wrong");

        loginPage.inputText(loginPage.getEmailLoginInput(), "ава@отвсювыc.cd");
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertEquals("Часть адреса до символа \"@\" не должна содержать символ \"а\".", loginPage.getEmailLoginInput().getAttribute("validationMessage"), "Error text wrong");
    }
}
