package net.conozco.pages.auth.register;

import com.codeborne.selenide.SelenideElement;
import lombok.Getter;
import net.conozco.pages.CommonPage;

import static com.codeborne.selenide.Selenide.$;

@Getter
public class RegisterSuccessPage extends CommonPage {
    private final SelenideElement registerSuccessHeader = $("[data-test-id='registerSuccessHeader']");
    private final SelenideElement backToLoginBtn = $("[data-test-id='backToLoginBtn']");
    private final SelenideElement registerSuccessText = $("[data-test-id='registerSuccessText']");
}
