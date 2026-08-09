package net.conozco.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DBType {
    CONOZCO("jdbc:postgresql://localhost:5433/flashcards"),
    MYSQL("jdbc:mysql://");

    private final String value;
}
