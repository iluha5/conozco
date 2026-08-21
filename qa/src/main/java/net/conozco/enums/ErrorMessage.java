package net.conozco.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorMessage {
    FILL_ALL_REQUIRED_FIELDS("Fill all required fields", "Заполните все обязательные поля", "Completa todos los campos obligatorios"),
    INVALID_EMAIL_OR_PASSWORD("Invalid email or password", "Неверный email или пароль", "Email o contraseña incorrectos"),
    PLEASE_VERIFY_YOUR_EMAIL("Please verify your email before resetting password", "Please verify your email before resetting password", "Please verify your email before resetting password");

    private final String en;
    private final String ru;
    private final String es;
}
