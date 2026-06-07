package com.crowntest.sdk.actions;

import com.crowntest.sdk.core.DriverManager;
import com.crowntest.sdk.exceptions.ElementNotClickableException;
import com.crowntest.sdk.exceptions.ElementNotFoundException;
import com.crowntest.sdk.locator.Locator;
import com.crowntest.sdk.wait.WaitStrategy;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;

public class ActionExecutor {

    private final DriverManager driverManager;
    private final WaitStrategy waitStrategy;

    public ActionExecutor(DriverManager driverManager, WaitStrategy waitStrategy) {
        this.driverManager = driverManager;
        this.waitStrategy = waitStrategy;
    }

    public void click(Locator locator) {
        WebElement element = findVisibleElement(locator);
        try {
            element.click();
        } catch (Exception cause) {
            throw new ElementNotClickableException("Unable to click element " + locator, cause);
        }
    }

    public void type(Locator locator, String value) {
        WebElement element = findVisibleElement(locator);
        element.clear();
        element.sendKeys(value);
    }

    public void clear(Locator locator) {
        WebElement element = findVisibleElement(locator);
        element.clear();
    }

    public void wait(int seconds) {
        try {
            Thread.sleep(Duration.ofSeconds(seconds).toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void scrollDown() {
        swipeVertical(0.75, 0.25);
    }

    public void scrollUp() {
        swipeVertical(0.25, 0.75);
    }

    public void scrollLeft() {
        swipeHorizontal(0.75, 0.25);
    }

    public void scrollRight() {
        swipeHorizontal(0.25, 0.75);
    }

    public void swipe(int startX, int startY, int endX, int endY, int durationMilliseconds) {
        AppiumDriver driver = driverManager.getDriver();
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);
        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(durationMilliseconds), PointerInput.Origin.viewport(), endX, endY));
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
        driver.perform(Collections.singletonList(swipe));
    }

    public void tap(Locator locator) {
        WebElement element = findClickableElement(locator);
        element.click();
    }

    public void takeScreenshot() {
        driverManager.getDriver().getScreenshotAs(OutputType.BYTES);
    }

    public void back() {
        driverManager.getDriver().navigate().back();
    }

    public void home() {
        AppiumDriver driver = driverManager.getDriver();
        driver.executeScript("mobile: pressButton", Map.of("name", "home"));
    }

    public void closeApp() {
        driverManager.getDriver().quit();
    }

    private WebElement findVisibleElement(Locator locator) {
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForVisible(driver, locator);
        return driver.findElement(toBy(locator));
    }

    private WebElement findClickableElement(Locator locator) {
        AppiumDriver driver = driverManager.getDriver();
        waitStrategy.waitForClickable(driver, locator);
        return driver.findElement(toBy(locator));
    }

    private By toBy(Locator locator) {
        return com.crowntest.sdk.utils.LocatorUtils.toBy(locator);
    }

    private void swipeVertical(double startRatio, double endRatio) {
        AppiumDriver driver = driverManager.getDriver();
        int width = driver.manage().window().getSize().getWidth();
        int height = driver.manage().window().getSize().getHeight();
        int startX = width / 2;
        int startY = (int) (height * startRatio);
        int endY = (int) (height * endRatio);
        swipe(startX, startY, startX, endY, 600);
    }

    private void swipeHorizontal(double startRatio, double endRatio) {
        AppiumDriver driver = driverManager.getDriver();
        int width = driver.manage().window().getSize().getWidth();
        int height = driver.manage().window().getSize().getHeight();
        int startY = height / 2;
        int startX = (int) (width * startRatio);
        int endX = (int) (width * endRatio);
        swipe(startX, startY, endX, startY, 600);
    }
}
