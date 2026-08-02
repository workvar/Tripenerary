import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useItinerary from './src/hooks/useItinerary';
import TripScreen from './src/screens/TripScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InfoScreen from './src/screens/InfoScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { colors } from './src/theme';

export default function App() {
  const trip = useItinerary();
  const [screen, setScreen] = useState('trip');

  const needsSetup = !trip.loading && !trip.data && !trip.sourceUrl;

  let content;
  if (trip.loading) {
    content = (
      <View style={s.boot}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  } else if (screen === 'settings') {
    content = <SettingsScreen trip={trip} onClose={() => setScreen('trip')} />;
  } else if (screen === 'info') {
    content = <InfoScreen trip={trip} onClose={() => setScreen('trip')} />;
  } else if (needsSetup) {
    content = <OnboardingScreen trip={trip} />;
  } else {
    content = (
      <TripScreen
        trip={trip}
        onOpenSettings={() => setScreen('settings')}
        onOpenInfo={() => setScreen('info')}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.primary} />
      {content}
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
