package ui.register;

import net.conozco.models.User;
import net.conozco.pages.HomePage;
import net.conozco.pages.TrainingPage;
import net.conozco.pages.auth.LoginPage;
import net.conozco.pages.auth.register.RegisterPage;
import net.conozco.pages.auth.register.RegisterSuccessPage;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import ui.DefaultTest;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

import static com.codeborne.selenide.Condition.visible;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RegisterTest extends DefaultTest {
    private final HomePage homePage = new HomePage();
    private final RegisterPage registerPage = new RegisterPage();
    private final RegisterSuccessPage registerSuccessPage = new RegisterSuccessPage();
    private final LoginPage loginPage = new LoginPage();
    private final TrainingPage trainingPage = new TrainingPage();
    private static List<User> CREATED_USERS = new ArrayList<>();

    @Test
    public void registerTest() {
        User user = User.builder()
                .email(RandomStringUtils.insecure().nextAlphabetic(7).toLowerCase() + "@test.ru")
                .password("Qwerty1!")
                .name("qaQA")
                .build();

        openBrowser();
        homePage.clickOn(registerPage.getRegisterHeaderBtn());
        registerPage.inputText(registerPage.getEmailRegisterInput(), user.getEmail());
        registerPage.inputText(registerPage.getNameRegisterInput(), user.getName());
        registerPage.inputText(registerPage.getPasswordRegisterInput(), user.getPassword());
        registerPage.clickOn(registerPage.getCreateAccountBtn());

        assertTrue(trainingPage.elementShouldBe(registerSuccessPage.getRegisterSuccessHeader(), visible), "Registration failed");
        assertTrue(registerSuccessPage.checkText(registerSuccessPage.getRegisterSuccessHeader(), "Check your email"), "Header isn't correct on register success page");

        CREATED_USERS.add(user);

        registerSuccessPage.clickOn(registerSuccessPage.getBackToLoginBtn());

        dbFunctions.submitUserAccount(user);
        homePage.clickOn(homePage.getLoginHeaderBtn());
        loginPage.inputText(loginPage.getEmailLoginInput(), user.getEmail());
        loginPage.inputText(loginPage.getPasswordLoginInput(), user.getPassword());
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertTrue(trainingPage.elementShouldBe(trainingPage.getUserEmailHeader(), visible), "User isn't authorized");
        assertTrue(trainingPage.checkText(trainingPage.getUserEmailHeader(), user.getEmail()), "User doesn't match in header"); // падает, потому что юзер не ацепнут
    }

    @Test
    public void registerFromLoginPageTest() {
        User user = User.builder()
                .email(RandomStringUtils.insecure().nextAlphabetic(7).toLowerCase() + "@test.ru")
                .password("Qwerty1!")
                .name("qaQ")
                .build();

        openBrowser();
        homePage.clickOn(homePage.getLoginHeaderBtn());

        loginPage.clickOn(loginPage.getSignUpBtn());
        registerPage.inputText(registerPage.getEmailRegisterInput(), user.getEmail());
        registerPage.inputText(registerPage.getNameRegisterInput(), user.getName());
        registerPage.inputText(registerPage.getPasswordRegisterInput(), user.getPassword());
        registerPage.clickOn(registerPage.getCreateAccountBtn());

        assertTrue(trainingPage.elementShouldBe(registerSuccessPage.getRegisterSuccessHeader(), visible), "Registration failed");
        assertTrue(registerSuccessPage.checkText(registerSuccessPage.getRegisterSuccessHeader(), "Check your email"), "Header isn't correct on register success page");

        CREATED_USERS.add(user);

        registerSuccessPage.clickOn(registerSuccessPage.getBackToLoginBtn());

        dbFunctions.submitUserAccount(user);
        homePage.clickOn(homePage.getLoginHeaderBtn());
        loginPage.inputText(loginPage.getEmailLoginInput(), user.getEmail());
        loginPage.inputText(loginPage.getPasswordLoginInput(), user.getPassword());
        loginPage.clickOn(loginPage.getSubmitLoginBtn());

        assertTrue(trainingPage.elementShouldBe(trainingPage.getUserEmailHeader(), visible), "User isn't authorized");
        assertTrue(trainingPage.checkText(trainingPage.getUserEmailHeader(), user.getEmail()), "User doesn't match in header"); // падает, потому что юзер не ацепнут
    }

    @AfterAll
    public static void tearDown() {
        for (User createdUser : CREATED_USERS) {
            dbFunctions.deleteUser(createdUser);
        }
    }
}
