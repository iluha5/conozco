package ui.auth;

import net.conozco.models.User;
import net.conozco.pages.HomePage;
import net.conozco.pages.TrainingPage;
import net.conozco.pages.auth.LoginPage;
import net.conozco.pages.auth.register.RegisterPage;
import org.junit.jupiter.api.Test;
import ui.DefaultTest;

import static com.codeborne.selenide.Condition.visible;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginTest extends DefaultTest {
    private final LoginPage loginPage = new LoginPage();
    private final HomePage homePage = new HomePage();
    private final TrainingPage trainingPage = new TrainingPage();
    private final RegisterPage registerPage = new RegisterPage();

    private final User user = User.builder()
            .email("e.zaraiskaia@gmail.com")
            .password("Qwerty1!")
            .build();

    @Test
    public void loginTest() {
        openBrowser();
        homePage.clickOn(homePage.getLoginHeaderBtn());
        loginPage.inputText(loginPage.getEmailLoginInput(), user.getEmail());
        loginPage.inputText(loginPage.getPasswordLoginInput(), user.getPassword());
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertTrue(trainingPage.elementShouldBe(trainingPage.getUserEmailHeader(), visible), "User isn't authorized");
        assertTrue(trainingPage.checkText(trainingPage.getUserEmailHeader(), user.getEmail()), "User doesn't match in header");
    }

    @Test
    public void loginFromRegisterPageTest() {
        openBrowser();
        homePage.acceptAllCookie();
        homePage.clickOn(homePage.getRegisterHeaderBtn());
        registerPage.clickOn(registerPage.getSignInBtn());

        loginPage.inputText(loginPage.getEmailLoginInput(), user.getEmail());
        loginPage.inputText(loginPage.getPasswordLoginInput(), user.getPassword());
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertTrue(trainingPage.elementShouldBe(trainingPage.getUserEmailHeader(), visible), "User isn't authorized");
        assertTrue(trainingPage.checkText(trainingPage.getUserEmailHeader(), user.getEmail()), "User doesn't match");
    }
}
