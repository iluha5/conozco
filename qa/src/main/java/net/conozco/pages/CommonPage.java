package net.conozco.pages;

import com.codeborne.selenide.SelenideElement;
import lombok.Getter;

import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;

@Getter
public class CommonPage extends DefaultPage {
    private final SelenideElement registerHeaderBtn = $("[data-test-id='registerHeaderBtn']");
    private final SelenideElement loginHeaderBtn = $("[data-test-id='loginHeaderBtn']");
    private final SelenideElement userEmailHeader = $("[data-test-id='userEmailHeader']");

    private final SelenideElement cookieAlert = $("[data-test-id='cookieAlert']");
    private final SelenideElement acceptAllCookieBtn = $("[data-test-id='acceptAllCookieBtn']");

    public void acceptAllCookie() {
        if (elementShouldBe(cookieAlert, visible)) {
            clickOn(acceptAllCookieBtn);
        }
    }
}
