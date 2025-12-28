import { AppShell } from './src/app/AppShell';

import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function App() {
  return <AppShell />;
}
