import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useTripLibrary from '@/hooks/useTripLibrary';
import ScreenTransition from '@/components/ScreenTransition';
import SplashScreen from '@/screens/SplashScreen';
import LandingScreen from '@/screens/LandingScreen';
import TripScreen from '@/screens/TripScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import InfoScreen from '@/screens/InfoScreen';
import { colors } from '@/theme';

type Overlay = 'settings' | 'info' | null;

export default function App() {
  const library = useTripLibrary();
  const [splashDone, setSplashDone] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const { activeId, activeData, activeStatus, prefs, closeTrip, refreshTrip } = library;
  const closeOverlay = () => setOverlay(null);

  // Base layer: the trip library, or one open trip.
  const base = activeId ? (
    <TripScreen
      data={activeData}
      status={activeStatus}
      prefs={prefs}
      onRefresh={() => void refreshTrip(activeId)}
      onBack={closeTrip}
      onOpenSettings={() => setOverlay('settings')}
      onOpenInfo={() => setOverlay('info')}
    />
  ) : (
    <LandingScreen library={library} onOpenSettings={() => setOverlay('settings')} />
  );

  // Overlays sit on top so the screen underneath keeps its scroll and selection.
  const sheet =
    overlay === 'settings' ? (
      <SettingsScreen library={library} onClose={closeOverlay} />
    ) : overlay === 'info' ? (
      <InfoScreen data={activeData} showImages={prefs.showImages} onClose={closeOverlay} />
    ) : null;

  const onLanding = splashDone && !activeId && !overlay;

  return (
    <SafeAreaProvider>
      <StatusBar
        style={onLanding ? 'dark' : 'light'}
        backgroundColor={onLanding ? colors.bg : colors.primary}
      />
      <View style={s.root}>
        <ScreenTransition id={activeId ?? 'landing'} from="right">
          {base}
        </ScreenTransition>

        {sheet && overlay ? (
          <View style={s.overlay}>
            <ScreenTransition id={overlay} from="up">
              {sheet}
            </ScreenTransition>
          </View>
        ) : null}

        {!splashDone ? (
          <SplashScreen ready={!library.booting} onDone={() => setSplashDone(true)} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg },
});
