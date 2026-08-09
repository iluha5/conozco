package net.conozco.pages.auth.register;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import lombok.Getter;
import net.conozco.pages.CommonPage;

import java.util.List;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

@Getter
public class RegisterPage extends CommonPage {
    private final SelenideElement emailRegisterInput = $("[data-test-id='emailRegisterInput']");
    private final SelenideElement nameRegisterInput = $("[data-test-id='nameRegisterInput']");
    private final SelenideElement passwordRegisterInput = $("[data-test-id='passwordRegisterInput']");
    private final SelenideElement createAccountBtn = $("[data-test-id='createAccountBtn']");
    private final ElementsCollection greenPasswordRequirements = $$("[data-test-id='passwordRequirementText'] [class='text-green-600']");
    private final ElementsCollection greyPasswordRequirements = $$("[data-test-id='passwordRequirementText'] [class='text-gray-500']");
    private final SelenideElement errorRegisterAlert = $(".opacity-90"); // TODO: не смогла найти где вешать локатор
    private final SelenideElement signInBtn = $("[data-test-id='signInBtn']");

    public List<String> getTextPasswordRequirements(ElementsCollection collection) {
        return collection.texts();
    }

}
