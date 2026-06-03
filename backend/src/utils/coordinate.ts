import { Resolution, ScreenCoordinatePayload } from '../types/device';

export const mapBrowserToDeviceCoordinates = (
  coordinates: Omit<ScreenCoordinatePayload, 'deviceId'> & { deviceResolution: Resolution },
) => {
  const { x, y, screenWidth, screenHeight, deviceResolution, orientation } = coordinates;
  const { width: deviceWidth, height: deviceHeight } = deviceResolution;

  const normalizedX = x / screenWidth;
  const normalizedY = y / screenHeight;

  const isDeviceLandscape = deviceWidth >= deviceHeight;
  const isScreenLandscape = screenWidth >= screenHeight;

  if (!orientation && isDeviceLandscape !== isScreenLandscape) {
    return {
      x: Math.round(normalizedY * deviceWidth),
      y: Math.round((1 - normalizedX) * deviceHeight),
    };
  }

  if (orientation && orientation === 'landscape') {
    return {
      x: Math.round(normalizedX * deviceWidth),
      y: Math.round(normalizedY * deviceHeight),
    };
  }

  return {
    x: Math.round(normalizedX * deviceWidth),
    y: Math.round(normalizedY * deviceHeight),
  };
};
