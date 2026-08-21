package ui.register;

import com.codeborne.selenide.CollectionCondition;
import net.conozco.models.User;
import net.conozco.pages.HomePage;
import net.conozco.pages.auth.register.RegisterPage;
import org.junit.jupiter.api.Test;
import ui.DefaultTest;

import java.util.List;

import static com.codeborne.selenide.Condition.disabled;
import static com.codeborne.selenide.Condition.visible;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CheckErrorRegisterTest extends DefaultTest {
    private final HomePage homePage = new HomePage();
    private final RegisterPage registerPage = new RegisterPage();

    private final User user = User.builder()
            .email("qa@qa.qa")
            .password("Qwerty1!")
            .name("qaQA")
            .build();

    @Test
    public void registerWithEmptyFieldTest() {
        openBrowser();
        homePage.clickOn(homePage.getRegisterHeaderBtn());

        assertTrue(registerPage.elementShouldBe(registerPage.getCreateAccountBtn(), disabled), "Button 'Create account' isn't disabled");
    }

    @Test
    public void registerWithInvalidEmil() {
        openBrowser();
        homePage.clickOn(homePage.getRegisterHeaderBtn());

        registerPage.inputText(registerPage.getEmailRegisterInput(), "1");
        registerPage.inputText(registerPage.getPasswordRegisterInput(), user.getPassword());
        registerPage.clickOn(registerPage.getCreateAccountBtn());

        assertEquals("Адрес электронной почты должен содержать символ \"@\". В адресе \"1\" отсутствует символ \"@\".", registerPage.getEmailRegisterInput().getAttribute("validationMessage"), "Error text wrong");

        registerPage.inputText(registerPage.getEmailRegisterInput(), "ава@отвсювыc.cd");
        registerPage.inputText(registerPage.getPasswordRegisterInput(), user.getPassword());
        registerPage.clickOn(registerPage.getCreateAccountBtn());

        assertEquals("Часть адреса до символа \"@\" не должна содержать символ \"а\".", registerPage.getEmailRegisterInput().getAttribute("validationMessage"), "Error text wrong");
    }

    @Test
    public void checkErrorWithoutRequiredFieldsTest() {
        openBrowser();
        homePage.clickOn(homePage.getRegisterHeaderBtn());

        registerPage.inputText(registerPage.getPasswordRegisterInput(), user.getPassword()); // TODO: юзера вынеста в класс эт норм?
        registerPage.clickOn(registerPage.getCreateAccountBtn());

        assertTrue(registerPage.elementShouldBe(registerPage.getErrorRegisterAlert(), visible), "Alert doesn't appear");
        assertTrue(registerPage.checkText(registerPage.getErrorRegisterAlert(), "Заполните все обязательные поля"), "Error text is incorrect");
    }

    @Test
    public void checkPasswordRequirementsTest() {
        openBrowser();
        homePage.clickOn(homePage.getRegisterHeaderBtn());

        registerPage.getGreyPasswordRequirements().shouldHave(CollectionCondition.sizeGreaterThan(0));

        List<String> actualGrey = registerPage.getTextPasswordRequirements(registerPage.getGreyPasswordRequirements());
        List<String> expectedGrey = List.of("One special character", "One number", "One lowercase letter", "One uppercase letter", "At least 8 characters");

        assertTrue(actualGrey.containsAll(expectedGrey), "Gray password requirements wrong");
        assertEquals(actualGrey.size(), expectedGrey.size(), "Quantity of gray password requirement wrong");

        registerPage.inputText(registerPage.getPasswordRegisterInput(), "@");

        List<String> actualGreen = registerPage.getTextPasswordRequirements(registerPage.getGreenPasswordRequirements());
        List<String> expectedGreen = List.of("One special character");

        assertTrue(actualGreen.containsAll(expectedGreen), "Green password requirements wrong");
        assertEquals(actualGreen.size(), expectedGreen.size(), "Quantity of green password requirement wrong");

        actualGrey = registerPage.getTextPasswordRequirements(registerPage.getGreyPasswordRequirements());
        expectedGrey = List.of("One number", "One lowercase letter", "One uppercase letter", "At least 8 characters");

        assertTrue(actualGrey.containsAll(expectedGrey), "Gray password requirements wrong");
        assertEquals(actualGrey.size(), expectedGrey.size(), "Quantity of grey password requirement wrong");

        registerPage.inputText(registerPage.getPasswordRegisterInput(), "6");

        actualGreen = registerPage.getTextPasswordRequirements(registerPage.getGreenPasswordRequirements());
        expectedGreen = List.of("One special character", "One number");

        assertTrue(actualGreen.containsAll(expectedGreen), "Green password requirements wrong");
        assertEquals(actualGreen.size(), expectedGreen.size(), "Quantity of green password requirement wrong");

        actualGrey = registerPage.getTextPasswordRequirements(registerPage.getGreyPasswordRequirements());
        expectedGrey = List.of("One lowercase letter", "One uppercase letter", "At least 8 characters");

        assertTrue(actualGrey.containsAll(expectedGrey), "Gray password requirements wrong");
        assertEquals(actualGrey.size(), expectedGrey.size(), "Quantity of grey password requirement wrong");

        registerPage.inputText(registerPage.getPasswordRegisterInput(), "k");

        actualGreen = registerPage.getTextPasswordRequirements(registerPage.getGreenPasswordRequirements());
        expectedGreen = List.of("One special character", "One number", "One lowercase letter");

        assertTrue(actualGreen.containsAll(expectedGreen), "Green password requirements wrong");
        assertEquals(actualGreen.size(), expectedGreen.size(), "Quantity of green password requirement wrong");

        actualGrey = registerPage.getTextPasswordRequirements(registerPage.getGreyPasswordRequirements());
        expectedGrey = List.of("One uppercase letter", "At least 8 characters");

        assertTrue(actualGrey.containsAll(expectedGrey), "Gray password requirements wrong");
        assertEquals(actualGrey.size(), expectedGrey.size(), "Quantity of grey password requirement wrong");

        registerPage.inputText(registerPage.getPasswordRegisterInput(), "K");

        actualGreen = registerPage.getTextPasswordRequirements(registerPage.getGreenPasswordRequirements());
        expectedGreen = List.of("One special character", "One number", "One lowercase letter", "One uppercase letter");

        assertTrue(actualGreen.containsAll(expectedGreen), "Green password requirements wrong");
        assertEquals(actualGreen.size(), expectedGreen.size(), "Quantity of green password requirement wrong");

        actualGrey = registerPage.getTextPasswordRequirements(registerPage.getGreyPasswordRequirements());
        expectedGrey = List.of("At least 8 characters");

        assertTrue(actualGrey.containsAll(expectedGrey), "Gray password requirements wrong");
        assertEquals(actualGrey.size(), expectedGrey.size(), "Quantity of grey password requirement wrong");

        registerPage.inputText(registerPage.getPasswordRegisterInput(), "okjh");

        actualGreen = registerPage.getTextPasswordRequirements(registerPage.getGreenPasswordRequirements());
        expectedGreen = List.of("One special character", "One number", "One lowercase letter", "One uppercase letter", "At least 8 characters");

        assertTrue(actualGreen.containsAll(expectedGreen), "Green password requirements wrong");
        assertEquals(actualGreen.size(), expectedGreen.size(), "Quantity of green password requirement wrong");
    }
}
