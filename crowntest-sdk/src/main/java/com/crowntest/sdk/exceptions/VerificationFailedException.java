package com.crowntest.sdk.exceptions;

public class VerificationFailedException extends AssertionError {

    public VerificationFailedException(String message) {
        super(message);
    }

    public VerificationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
