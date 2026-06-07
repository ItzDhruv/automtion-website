package com.crowntest.sdk.runner;

import com.crowntest.CT;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.URL;

public final class JavaTestLauncher {

    private JavaTestLauncher() {
        // no instances
    }

    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            throw new IllegalArgumentException("Expected arguments: <testClass> <appiumUrl> <deviceId> [appPackage] [appActivity]");
        }

        String testClass = args[0];
        String appiumUrl = args[1];
        String deviceId = args[2];
        String appPackage = args.length > 3 ? args[3] : null;
        String appActivity = args.length > 4 ? args[4] : null;

        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability("platformName", "Android");
        capabilities.setCapability("automationName", "UiAutomator2");
        capabilities.setCapability("udid", deviceId);
        capabilities.setCapability("noReset", true);
        capabilities.setCapability("ignoreHiddenApiPolicyError", true);

        if (appPackage != null && !appPackage.isEmpty()) {
            capabilities.setCapability("appPackage", appPackage);
        }
        if (appActivity != null && !appActivity.isEmpty()) {    
            capabilities.setCapability("appActivity", appActivity);
        }

        AndroidDriver driver = new AndroidDriver(new URL(appiumUrl), capabilities);
        try {
            CT.init(driver);
            Class<?> clazz = Class.forName(testClass);
            clazz.getMethod("main", String[].class).invoke(null, (Object) new String[0]);
        } finally {
            driver.quit();
        }
    }
}
