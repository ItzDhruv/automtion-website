package com.crowntest.sdk.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateTimeUtils {

    private static final DateTimeFormatter FILENAME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");

    private DateTimeUtils() {
        // Utility class
    }

    public static String createTimestamp() {
        return LocalDateTime.now().format(FILENAME_FORMATTER);
    }
}
