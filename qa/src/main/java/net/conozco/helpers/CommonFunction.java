package net.conozco.helpers;

import java.text.SimpleDateFormat;
import java.util.Date;

public class CommonFunction {

    public String toStringDate(Date date) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        return simpleDateFormat.format(date);
    }

    public String toStringDate(Date date, String pattern) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
        return simpleDateFormat.format(date);
    }

    public void sleep(int seconds){
        try {
            Thread.sleep(seconds*1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
