package com.crowntest.sdk.locator;

import java.util.Objects;

public final class Locator {

    public enum Type {
        ID,
        ACCESSIBILITY_ID,
        TEXT,
        XPATH,
        CLASS_NAME
    }

    private final Type type;
    private final String value;

    private Locator(Type type, String value) {
        this.type = Objects.requireNonNull(type, "Locator type must not be null");
        this.value = Objects.requireNonNull(value, "Locator value must not be null").trim();
    }

    public static Locator id(String id) {
        return new Locator(Type.ID, id);
    }

    public static Locator accessibilityId(String accessibilityId) {
        return new Locator(Type.ACCESSIBILITY_ID, accessibilityId);
    }

    public static Locator text(String text) {
        return new Locator(Type.TEXT, text);
    }

    public static Locator xpath(String xpathExpression) {
        return new Locator(Type.XPATH, xpathExpression);
    }

    public static Locator className(String className) {
        return new Locator(Type.CLASS_NAME, className);
    }

    public Type getType() {
        return type;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return String.format("Locator[%s=%s]", type, value);
    }
}
