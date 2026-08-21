package net.conozco.pages;

import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebElementCondition;

public abstract class DefaultPage {
    public void clickOn(SelenideElement element) {
        element.click();
    }

    public void inputText(SelenideElement element, String text) {
        element.sendKeys(text);
    }

    public boolean checkText(SelenideElement element, String text) {
        return element.text().equalsIgnoreCase(text);
    }

    public boolean elementShouldBe(SelenideElement element, WebElementCondition condition) {
        try {
            element.shouldBe(condition);
            return true;
        } catch (Error e) {
            return false;
        }
    }
}
