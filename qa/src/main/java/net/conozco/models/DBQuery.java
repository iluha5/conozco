package net.conozco.models;

import lombok.Data;

@Data
public class DBQuery {
    private String key;
    private String query;
    private String description;
}
