package net.conozco.core;

@org.aeonbits.owner.Config.LoadPolicy(org.aeonbits.owner.Config.LoadType.MERGE)
@org.aeonbits.owner.Config.Sources({
        "classpath:config.properties",
        "system:properties",
        "system:env"})

public interface Config extends org.aeonbits.owner.Config {

    @Key("CONOZCO_USER")
    String conozcoUser();

    @Key("CONOZCO_PASSWORD")
    String conozcoPassword();
}
