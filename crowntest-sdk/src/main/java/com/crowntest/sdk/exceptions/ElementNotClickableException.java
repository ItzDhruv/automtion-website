package com.crowntest.sdk.exceptions;

public class ElementNotClickableException extends RuntimeException {

    public ElementNotClickableException(String message) {
        super(message);
    }

    public ElementNotClickableException(String message, Throwable cause) {
        super(message, cause);
    }
}
