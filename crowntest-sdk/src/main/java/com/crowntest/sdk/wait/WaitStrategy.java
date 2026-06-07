package com.crowntest.sdk.wait;

import com.crowntest.sdk.locator.Locator;
import com.crowntest.sdk.utils.LocatorUtils;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;

import java.time.Duration;

public class WaitStrategy {

    private final Duration timeout;
    private final Duration pollingInterval;

    public WaitStrategy() {
        this.timeout = Duration.ofSeconds(20);
        this.pollingInterval = Duration.ofMillis(500);
    }

    public WaitStrategy(Duration timeout, Duration pollingInterval) {
        this.timeout = timeout;
        this.pollingInterval = pollingInterval;
    }

    public void waitForPresence(WebDriver driver, Locator locator) {
        wait(driver, locator).until(ExpectedConditions.presenceOfElementLocated(toBy(locator)));
    }

    public void waitForVisible(WebDriver driver, Locator locator) {
        wait(driver, locator).until(ExpectedConditions.visibilityOfElementLocated(toBy(locator)));
    }

    public void waitForClickable(WebDriver driver, Locator locator) {
        wait(driver, locator).until(ExpectedConditions.elementToBeClickable(toBy(locator)));
    }

    public void waitForNotPresent(WebDriver driver, Locator locator) {
        wait(driver, locator).until(ExpectedConditions.invisibilityOfElementLocated(toBy(locator)));
    }

    private FluentWait<WebDriver> wait(WebDriver driver, Locator locator) {
        return new FluentWait<>(driver)
            .withTimeout(timeout)
            .pollingEvery(pollingInterval)
            .ignoring(NoSuchElementException.class);
    }

    private By toBy(Locator locator) {
        return LocatorUtils.toBy(locator);
    }
}
