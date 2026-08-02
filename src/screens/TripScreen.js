import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateStrip from '../components/DateStrip';
import DayHeader from '../components/DayHeader';
import ScheduleItem from '../components/ScheduleItem';
import StayCard from '../components/StayCard';
import NoteList from '../components/NoteList';
import Message from '../components/Message';
import { colors, spacing, type } from '../theme';
import { todayKey } from '../lib/dates';

function pickInitialDate(days, today) {
  if (days.some((d) => d.date === today)) return today;
  if (today < days[0].date) return days[0].date;
  return days[days.length - 1].date;
}

export default function TripScreen({ trip, onOpenSettings, onOpenInfo }) {
  const { data, refreshing, error, refresh, prefs } = trip;
  const today = todayKey(data && data.trip.timezone);
  const days = data ? data.days : [];

  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (days.length && !selected) setSelected(pickInitialDate(days, today));
  }, [days.length, selected, today]);

  const day = useMemo(
    () => days.find((d) => d.date === selected) || days[0],
    [days, selected]
  );
  const stay = day && data.staysById ? data.staysById[day.stayId] : null;
  const showPreview = prefs.showMapPreview;
  const isOnToday = day && day.date === today;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.headerText}>
            <Text style={s.title} numberOfLines={1}>
              {data ? data.trip.title : 'Trip Companion'}
            </Text>
            {data && data.trip.subtitle ? (
              <Text style={s.subtitle} numberOfLines={1}>{data.trip.subtitle}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={onOpenInfo} style={s.iconBtn} hitSlop={8}>
            <Text style={s.iconText}>{'ℹ'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenSettings} style={s.iconBtn} hitSlop={8}>
            <Text style={s.iconText}>{'⚙'}</Text>
          </TouchableOpacity>
        </View>

        {days.length ? (
          <DateStrip
            days={days}
            selectedDate={day ? day.date : null}
            todayDate={today}
            onSelect={setSelected}
          />
        ) : null}
      </View>

      {!isOnToday && days.some((d) => d.date === today) ? (
        <TouchableOpacity style={s.todayBar} onPress={() => setSelected(today)}>
          <Text style={s.todayBarText}>Jump to today</Text>
        </TouchableOpacity>
      ) : null}

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {error && !data ? (
          <Message tone="error" title="Could not load the itinerary" body={error}
            actionTitle="Open settings" onAction={onOpenSettings} />
        ) : null}

        {!data && !error ? (
          <View style={s.center}><ActivityIndicator color={colors.primary} /></View>
        ) : null}

        {day ? (
          <>
            <DayHeader day={day} totalDays={days.length} todayDate={today} />

            {error ? (
              <View style={s.warn}><Text style={s.warnText}>{'Showing the saved copy. ' + error}</Text></View>
            ) : null}

            <View style={s.schedule}>
              {day.items.length === 0 ? (
                <Text style={s.empty}>Nothing scheduled. Enjoy the day.</Text>
              ) : (
                day.items.map((item, i) => (
                  <ScheduleItem
                    key={item.key}
                    item={item}
                    isLast={i === day.items.length - 1}
                    showPreview={showPreview}
                  />
                ))
              )}
            </View>

            {stay ? <View style={s.block}><StayCard stay={stay} showPreview={showPreview} /></View> : null}
            {day.notes.length ? <View style={s.block}><NoteList notes={day.notes} /></View> : null}
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  headerText: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  iconBtn: { paddingHorizontal: spacing.sm },
  iconText: { fontSize: 19, color: '#fff' },
  todayBar: { backgroundColor: colors.accent, paddingVertical: 7, alignItems: 'center' },
  todayBarText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },
  center: { paddingVertical: spacing.xxl * 2 },
  schedule: { marginTop: spacing.xl },
  block: { marginTop: spacing.sm, marginBottom: spacing.lg },
  empty: { ...type.body, color: colors.textMuted, fontStyle: 'italic' },
  warn: {
    marginTop: spacing.md, padding: spacing.md,
    backgroundColor: '#FDECEA', borderRadius: 8,
  },
  warnText: { ...type.small, color: '#8B2F26' },
});
