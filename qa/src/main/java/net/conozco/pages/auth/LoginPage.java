package net.conozco.pages.auth;

import com.codeborne.selenide.SelenideElement;
import lombok.Getter;
import net.conozco.pages.CommonPage;

import static com.codeborne.selenide.Selenide.$;

@Getter
public class LoginPage extends CommonPage {
    private final SelenideElement emailLoginInput = $("[data-test-id='emailLoginInput']");
    private final SelenideElement passwordLoginInput = $("[data-test-id='passwordLoginInput']");
    private final SelenideElement submitLoginBtn = $("[data-test-id='submitLoginBtn']");

    private final SelenideElement signUpBtn = $("[data-test-id='signUpBtn']");

    private final SelenideElement errorLoginAlert = $(".opacity-90"); // TODO: не смогла найти где вешать локатор


    public void checkAuth(String expectedEmail) {
        checkText(getUserEmailHeader(), expectedEmail);
    }

}
