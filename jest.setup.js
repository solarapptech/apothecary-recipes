require('react-native-reanimated').setUpTests();

jest.mock('react-native-svg', () => {
  const React = require('react');

  const Mock = (props) => React.createElement('Svg', props, props.children);

  return {
    __esModule: true,
    default: Mock,
    Svg: Mock,
    Path: Mock,
    Circle: Mock,
    Rect: Mock,
    G: Mock,
  };
});

jest.mock('expo-splash-screen', () => ({
  __esModule: true,
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}));
