package org.example;

import com.crowntest.CT;
import com.crowntest.Locator;

public class AlarmClockCtTest {

    public static void main(String[] args) {
        // This file uses the CrownTest wrapper API only.
        // No Appium, Selenium, DesiredCapabilities, or WebDriver imports are required.

        CT.click(Locator.id("com.coloros.alarmclock:id/coui_floating_button_main_fab"));
        CT.click(Locator.id("com.coloros.alarmclock:id/save"));
        CT.click(Locator.id("com.coloros.alarmclock:id/navigation_bar_item_icon_view"));
        CT.click(Locator.id("com.coloros.alarmclock:id/coui_floating_button_main_fab"));

        CT.wait(2);

        CT.click(Locator.id("com.coloros.alarmclock:id/first_component"));
        CT.click(Locator.id("com.coloros.alarmclock:id/fl_root"));
        CT.click(Locator.id("com.coloros.alarmclock:id/click_view"));
        CT.click(Locator.className("android.widget.FrameLayout"));

        CT.verifyText("World Clock");
        CT.takeScreenshot();
    }
}
