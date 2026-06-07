package com.crowntest.sdk.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public final class FileUtils {

    private FileUtils() {
        // Utility class
    }

    public static void ensureDirectoryExists(Path directory) {
        try {
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }
        } catch (IOException exception) {
            throw new RuntimeException("Unable to create directory: " + directory, exception);
        }
    }
}
