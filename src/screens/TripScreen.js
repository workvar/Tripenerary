import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateStrip from '../components/DateStrip';
import DayHeader from '../components/DayHeader';
import ScheduleItem from '../components/ScheduleItem';
import StayCard from '../components/StayCard';
import NoteList from '../components/NoteList';
import Message from '../components/Message';
import Press from '../components/Press';
import { IconButton, SectionTitle } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { todayKey } from '../lib/dates';

function pickInitialDate(days, today) {
  if (days.some((d) => d.date === today)) return today;
  if (today < days[0].date) return days[0].date;
  return days[days.length - 1].date;
}

export default function TripScreen({ data, status, prefs, onRefresh, onBack, onOpenSettings, onOpenInfo }) {
  const { refreshing, error } = status;
  const today = todayKey(data && data.trip.timezone);
  const days = data ? data.days : [];

  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (days.length && !selected) setSelected(pickInitialDate(days, today));
  }, [days.length, selected, today]);

  const day = useMemo(() => days.find((d) => d.date === selected) || days[0], [days, selected]);
  const stay = day && data.staysById ? data.staysById[day.stayId] : null;
  const showPreview = prefs.showMapPreview;
  const showImages = prefs.showImages;
  const hasToday = days.some((d) => d.date === today);
  const isOnToday = day && day.date === today;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <IconButton glyph={'\u{2039}'} tone="dark" onPress={onBack} size={34} />
          <View style={s.headerText}>
            <Text style={s.title} numberOfLines={1}>{data ? data.trip.title : 'Trip'}</Text>
            {data && data.trip.subtitle ? (
              <Text style={s.subtitle} numberOfLines={1}>{data.trip.subtitle}</Text>
            ) : null}
          </View>
          <IconButton glyph={'\u{21BB}'} tone="dark" onPress={onRefresh} spinning={refreshing} size={34} />
          <View style={s.gap} />
          <IconButton glyph={'\u{2139}'} tone="dark" onPress={onOpenInfo} size={34} />
          <View style={s.gap} />
          <IconButton glyph={'\u{2699}'} tone="dark" onPress={onOpenSettings} size={34} />
        </View>

        {days.length ? (
          <DateStrip days={days} selectedDate={day ? day.date : null} todayDate={today} onSelect={setSelected} />
        ) : null}
      </View>

      {!isOnToday && hasToday ? (
        <Press style={s.todayBar} onPress={() => setSelected(today)} scaleTo={0.99}>
          <Text style={s.todayBarText}>{'Jump to today  \u{2193}'}</Text>
        </Press>
      ) : null}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {error && !data ? (
          <Message
            tone="error"
            title="Could not load the itinerary"
            body={error}
            actionTitle="Open settings"
            onAction={onOpenSettings}
          />
        ) : null}

        {!data && !error ? (
          <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
        ) : null}

        {day ? (
          <>
            <DayHeader day={day} totalDays={days.length} todayDate={today} showImages={showImages} />

            {error ? (
              <View style={s.warn}>
                <Text style={s.warnText}>{'Showing the saved copy. ' + error}</Text>
              </View>
            ) : null}

            <View style={s.schedule}>
              {day.items.length === 0 ? (
                <View style={s.emptyDay}>
                  <Text style={s.emptyGlyph}>{'\u{1F334}'}</Text>
                  <Text style={s.empty}>Nothing scheduled. Enjoy the day.</Text>
                </View>
              ) : (
                <>
                  <SectionTitle>Schedule</SectionTitle>
                  {day.items.map((item) => (
                    <ScheduleItem
                      key={item.key}
                      item={item}
                      showPreview={showPreview}
                      showImages={showImages}
                    />
                  ))}
                </>
              )}
            </View>

            {stay ? (
              <View style={s.block}>
                <SectionTitle>Stay</SectionTitle>
                <StayCard stay={stay} showPreview={showPreview} showImages={showImages} />
              </View>
            ) : null}

            {day.notes.length ? (
              <View style={s.block}><NoteList notes={day.notes} /></View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerText: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, color: '#fff' },
  subtitle: { fontSize: 12, color: colors.onDarkMuted, marginTop: 1 },
  gap: { width: 6 },

  todayBar: { backgroundColor: colors.accent, paddingVertical: 9, alignItems: 'center' },
  todayBarText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.2 },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },
  center: { paddingVertical: spacing.xxl * 2 },
  schedule: { marginTop: spacing.sm },
  block: { marginTop: spacing.md, marginBottom: spacing.lg },

  emptyDay: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyGlyph: { fontSize: 30 },
  empty: { ...type.body, color: colors.textMuted },

  warn: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
  },
  warnText: { ...type.small, color: '#8B2F26' },
});
