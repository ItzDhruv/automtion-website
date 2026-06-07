package com.crowntest.sdk.core;

import com.crowntest.sdk.actions.ActionExecutor;
import com.crowntest.sdk.assertions.AssertionExecutor;
import com.crowntest.sdk.locator.Locator;
import com.crowntest.sdk.screenshots.ScreenshotManager;
import com.crowntest.sdk.wait.WaitStrategy;
import io.appium.java_client.AppiumDriver;

public final class CT {

    private static final DriverManager driverManager = new DriverManager();
    private static final WaitStrategy waitStrategy = new WaitStrategy();
    private static ActionExecutor actions;
    private static AssertionExecutor assertions;
    private static ScreenshotManager screenshots;

    private CT() {
        // static access only
    }

    public static synchronized void init(AppiumDriver driver) {
        driverManager.init(driver);
        actions = new ActionExecutor(driverManager, waitStrategy);
        assertions = new AssertionExecutor(driverManager, waitStrategy);
        screenshots = new ScreenshotManager(driverManager);
    }

    public static AppiumDriver getDriver() {
        return driverManager.getDriver();
    }

    public static void click(Locator locator) {
        ensureInitialized();
        actions.click(locator);
    }

    public static void type(Locator locator, String value) {
        ensureInitialized();
        actions.type(locator, value);
    }

    public static void clear(Locator locator) {
        ensureInitialized();
        actions.clear(locator);
    }

    public static void wait(int seconds) {
        ensureInitialized();
        actions.wait(seconds);
    }

    public static void scrollDown() {
        ensureInitialized();
        actions.scrollDown();
    }

    public static void scrollUp() {
        ensureInitialized();
        actions.scrollUp();
    }

    public static void scrollLeft() {
        ensureInitialized();
        actions.scrollLeft();
    }

    public static void scrollRight() {
        ensureInitialized();
        actions.scrollRight();
    }

    public static void swipe(int startX, int startY, int endX, int endY, int durationMilliseconds) {
        ensureInitialized();
        actions.swipe(startX, startY, endX, endY, durationMilliseconds);
    }

    public static void tap(Locator locator) {
        ensureInitialized();
        actions.tap(locator);
    }

    public static String takeScreenshot() {
        ensureInitialized();
        return screenshots.takeScreenshot();
    }

    public static void back() {
        ensureInitialized();
        actions.back();
    }

    public static void home() {
        ensureInitialized();
        actions.home();
    }

    public static void verifyText(String expectedText) {
        ensureInitialized();
        assertions.verifyText(expectedText);
    }

    public static void verifyElement(Locator locator) {
        ensureInitialized();
        assertions.verifyElement(locator);
    }

    public static void verifyNotPresent(Locator locator) {
        ensureInitialized();
        assertions.verifyNotPresent(locator);
    }

    public static void verifyContains(Locator locator, String expectedSubstring) {
        ensureInitialized();
        assertions.verifyContains(locator, expectedSubstring);
    }

    public static void closeApp() {
        ensureInitialized();
        actions.closeApp();
    }

    private static void ensureInitialized() {
        if (!driverManager.isInitialized()) {
            throw new IllegalStateException("CT is not initialized. Call CT.init(driver) before invoking actions.");
        }
    }
}
