package com.crowntest.sdk.core;

import io.appium.java_client.AppiumDriver;

public class DriverManager {

    private AppiumDriver driver;

    public synchronized void init(AppiumDriver driver) {
        if (driver == null) {
            throw new IllegalArgumentException("Driver must not be null");
        }
        this.driver = driver;
    }

    public synchronized AppiumDriver getDriver() {
        if (driver == null) {
            throw new IllegalStateException("CT driver has not been initialized. Call CT.init(driver) first.");
        }
        return driver;
    }

    public synchronized boolean isInitialized() {
        return driver != null;
    }
}
