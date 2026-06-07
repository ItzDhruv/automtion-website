package com.crowntest;

public final class CT {

    private CT() {
        // static access only
    }

    public static void init(io.appium.java_client.AppiumDriver driver) {
        com.crowntest.sdk.core.CT.init(driver);
    }

    public static void click(Locator locator) {
        com.crowntest.sdk.core.CT.click(locator.unwrap());
    }

    public static void type(Locator locator, String value) {
        com.crowntest.sdk.core.CT.type(locator.unwrap(), value);
    }

    public static void clear(Locator locator) {
        com.crowntest.sdk.core.CT.clear(locator.unwrap());
    }

    public static void wait(int seconds) {
        com.crowntest.sdk.core.CT.wait(seconds);
    }

    public static void scrollDown() {
        com.crowntest.sdk.core.CT.scrollDown();
    }

    public static void scrollUp() {
        com.crowntest.sdk.core.CT.scrollUp();
    }

    public static void scrollLeft() {
        com.crowntest.sdk.core.CT.scrollLeft();
    }

    public static void scrollRight() {
        com.crowntest.sdk.core.CT.scrollRight();
    }

    public static void swipe(int startX, int startY, int endX, int endY, int durationMilliseconds) {
        com.crowntest.sdk.core.CT.swipe(startX, startY, endX, endY, durationMilliseconds);
    }

    public static void tap(Locator locator) {
        com.crowntest.sdk.core.CT.tap(locator.unwrap());
    }

    public static void verifyText(String expectedText) {
        com.crowntest.sdk.core.CT.verifyText(expectedText);
    }

    public static void closeApp() {
        com.crowntest.sdk.core.CT.closeApp();
    }

    public static void takeScreenshot() {
        com.crowntest.sdk.core.CT.takeScreenshot();
    }
}
