package com.crowntest.sdk.assertions;

import com.crowntest.sdk.core.DriverManager;
import com.crowntest.sdk.exceptions.ElementNotFoundException;
import com.crowntest.sdk.exceptions.VerificationFailedException;
import com.crowntest.sdk.locator.Locator;
import com.crowntest.sdk.wait.WaitStrategy;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class AssertionExecutor {

    private final DriverManager driverManager;
    private final WaitStrategy waitStrategy;

    public AssertionExecutor(DriverManager driverManager, WaitStrategy waitStrategy) {
        this.driverManager = driverManager;
        this.waitStrategy = waitStrategy;
    }

    public void verifyText(String expectedText) {
        Locator textLocator = Locator.text(expectedText);
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForVisible(driver, textLocator);
        WebElement element = driver.findElement(toBy(textLocator));
        if (!expectedText.equals(element.getText().trim())) {
            throw new VerificationFailedException(
                String.format("Expected text '%s' but found '%s'", expectedText, element.getText()));
        }
    }

    public void verifyElement(Locator locator) {
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForPresence(driver, locator);
        if (driver.findElements(toBy(locator)).isEmpty()) {
            throw new ElementNotFoundException("Element not found: " + locator);
        }
    }

    public void verifyNotPresent(Locator locator) {
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForNotPresent(driver, locator);
    }

    public void verifyContains(Locator locator, String expectedSubstring) {
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForVisible(driver, locator);
        WebElement element = driver.findElement(toBy(locator));
        if (!element.getText().contains(expectedSubstring)) {
            throw new VerificationFailedException(
                String.format("Expected element %s to contain '%s' but actual text was '%s'", locator, expectedSubstring, element.getText()));
        }
    }

    private By toBy(Locator locator) {
        return com.crowntest.sdk.utils.LocatorUtils.toBy(locator);
    }
}
