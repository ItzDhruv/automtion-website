package com.crowntest.sdk.utils;

import com.crowntest.sdk.locator.Locator;
import io.appium.java_client.MobileBy;
import org.openqa.selenium.By;

public final class LocatorUtils {

    private LocatorUtils() {
        // Utility class
    }

    public static By toBy(Locator locator) {
        switch (locator.getType()) {
            case ID:
                return By.id(locator.getValue());
            case ACCESSIBILITY_ID:
                return MobileBy.AccessibilityId(locator.getValue());
            case TEXT:
                return By.xpath(String.format("//*[normalize-space()='%s']", escapeXpath(locator.getValue())));
            case XPATH:
                return By.xpath(locator.getValue());
            case CLASS_NAME:
                return By.className(locator.getValue());
            default:
                throw new IllegalArgumentException("Unsupported locator type: " + locator.getType());
        }
    }

    private static String escapeXpath(String value) {
        if (!value.contains("'")) {
            return value;
        }
        String[] parts = value.split("'");
        StringBuilder builder = new StringBuilder("concat(");
        for (int i = 0; i < parts.length; i++) {
            builder.append("'").append(parts[i]).append("'");
            if (i < parts.length - 1) {
                builder.append(", '\'', ");
            }
        }
        builder.append(")");
        return builder.toString();
    }
}
