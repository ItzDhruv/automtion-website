package com.crowntest.sdk.exceptions;

public class ScreenshotFailedException extends RuntimeException {

    public ScreenshotFailedException(String message) {
        super(message);
    }

    public ScreenshotFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
