package com.crowntest.sdk.screenshots;

import com.crowntest.sdk.core.DriverManager;
import com.crowntest.sdk.exceptions.ScreenshotFailedException;
import com.crowntest.sdk.utils.DateTimeUtils;
import com.crowntest.sdk.utils.FileUtils;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ScreenshotManager {

    private static final String DEFAULT_SCREENSHOT_DIRECTORY = "crowntest-screenshots";
    private final DriverManager driverManager;

    public ScreenshotManager(DriverManager driverManager) {
        this.driverManager = driverManager;
    }

    public String takeScreenshot() {
        AppiumDriver driver = driverManager.getDriver();
        if (!(driver instanceof TakesScreenshot)) {
            throw new ScreenshotFailedException("Driver does not support taking screenshots.");
        }

        Path screenshotFolder = Paths.get(System.getProperty("user.dir"), DEFAULT_SCREENSHOT_DIRECTORY);
        FileUtils.ensureDirectoryExists(screenshotFolder);

        String fileName = String.format("CT-%s.png", DateTimeUtils.createTimestamp());
        Path screenshotPath = screenshotFolder.resolve(fileName);

        try {
            File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            java.nio.file.Files.copy(screenshotFile.toPath(), screenshotPath);
            return screenshotPath.toAbsolutePath().toString();
        } catch (IOException exception) {
            throw new ScreenshotFailedException("Unable to save screenshot to " + screenshotPath, exception);
        }
    }
}
