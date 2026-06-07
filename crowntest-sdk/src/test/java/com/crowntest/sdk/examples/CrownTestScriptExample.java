package com.crowntest.sdk.examples;

import com.crowntest.sdk.core.CT;
import com.crowntest.sdk.locator.Locator;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;

public class CrownTestScriptExample {

    public static void main(String[] args) throws MalformedURLException {
        // The setup below is only for SDK initialization and is not part of the user script.
        AppiumDriver driver = createDriver();
        CT.init(driver);

        // User script starts here. No Appium or Selenium imports are required by users.
        CT.click(Locator.text("Login"));
        CT.type(Locator.accessibilityId("email"), "user@gmail.com");
        CT.type(Locator.accessibilityId("password"), "123456");
        CT.click(Locator.id("btn_login"));
        CT.wait(3);
        CT.scrollDown();
        String screenshotPath = CT.takeScreenshot();
        System.out.println("Screenshot saved at: " + screenshotPath);
        CT.verifyText("Welcome");
        CT.closeApp();
    }

    private static AppiumDriver createDriver() throws MalformedURLException {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability("platformName", "Android");
        capabilities.setCapability("deviceName", "Android Emulator");
        capabilities.setCapability("appPackage", "com.example.app");
        capabilities.setCapability("appActivity", ".MainActivity");
        return new AndroidDriver(new URL("http://127.0.0.1:4723/wd/hub"), capabilities);
    }
}
