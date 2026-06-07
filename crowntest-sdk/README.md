# CrownTest SDK

A wrapper SDK that hides Appium, Selenium, Maven/Gradle, driver configuration, and locator complexity from users.

## Architecture

- `core/`
  - `CT.java`: central facade that exposes user-friendly automation commands.
  - `DriverManager.java`: stores the Appium driver instance and enforces initialization.

- `locator/`
  - `Locator.java`: fluent locator builders for `id`, `accessibilityId`, `text`, `xpath`, and `className`.

- `wait/`
  - `WaitStrategy.java`: automatic waiting for presence, visibility, clickability, and absence before every interaction.

- `actions/`
  - `ActionExecutor.java`: translates CT commands into Appium/Selenium operations and provides scrolling, swiping, and navigation.

- `assertions/`
  - `AssertionExecutor.java`: verification methods for text, element existence, presence, and substring assertions.

- `screenshots/`
  - `ScreenshotManager.java`: screenshot capture with timestamped storage and returned file path.

- `exceptions/`
  - custom runtime exceptions for element lookup, clickability, verification, and screenshot failures.

- `utils/`
  - reusable helpers for locator conversion, timestamp generation, and file directory management.

## Folder Structure

```
crowntest-sdk/
 ├── pom.xml
 ├── README.md
 ├── src/main/java/com/crowntest/sdk/
 │   ├── actions/
 │   ├── assertions/
 │   ├── core/
 │   ├── exceptions/
 │   ├── locator/
 │   ├── screenshots/
 │   ├── utils/
 │   └── wait/
 └── src/test/java/com/crowntest/sdk/examples/
```

## User-facing API Example

```java
CT.click(Locator.id("btn_login"));
CT.type(Locator.accessibilityId("email"), "user@gmail.com");
CT.type(Locator.accessibilityId("password"), "123456");
CT.click(Locator.text("Sign In"));
CT.wait(3);
CT.scrollDown();
CT.takeScreenshot();
CT.verifyText("Welcome");
```

## Key Benefits

- Users never import Appium, Selenium, DesiredCapabilities, or wait/locator helpers.
- Automatic waits reduce flaky tests.
- Locator builder abstraction supports multiple strategies.
- Screenshot naming and storage are handled automatically.
- Custom exceptions provide clear failure reasons.

## Extensibility

The SDK is designed so additional execution targets can be added in the future without major refactoring:

- add platform-specific action executors for Android, iOS, Web, API
- add AI-generated test adapters
- add parallel execution orchestration on top of `CT`

