package com.crowntest;

public final class Locator {

    private final com.crowntest.sdk.locator.Locator delegate;

    private Locator(com.crowntest.sdk.locator.Locator delegate) {
        this.delegate = delegate;
    }

    public com.crowntest.sdk.locator.Locator unwrap() {
        return delegate;
    }

    public static Locator id(String id) {
        return new Locator(com.crowntest.sdk.locator.Locator.id(id));
    }

    public static Locator accessibilityId(String accessibilityId) {
        return new Locator(com.crowntest.sdk.locator.Locator.accessibilityId(accessibilityId));
    }

    public static Locator text(String text) {
        return new Locator(com.crowntest.sdk.locator.Locator.text(text));
    }

    public static Locator xpath(String xpathExpression) {
        return new Locator(com.crowntest.sdk.locator.Locator.xpath(xpathExpression));
    }

    public static Locator className(String className) {
        return new Locator(com.crowntest.sdk.locator.Locator.className(className));
    }
}
