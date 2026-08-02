import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui';
import Message from '../components/Message';
import { colors, spacing, type } from '../theme';
import { formatDate } from '../lib/dates';

function contactHref(c) {
  if (c.type === 'phone') return 'tel:' + c.value.replace(/\s/g, '');
  if (c.type === 'url') return c.value;
  return null;
}

export default function InfoScreen({ trip, onClose }) {
  const data = trip.data;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Trip info</Text>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Text style={s.close}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {!data ? (
          <Message title="No itinerary loaded" body="Add a link in settings first." />
        ) : (
          <>
            <Card>
              <Text style={s.title}>{data.trip.title}</Text>
              <Text style={s.dates}>
                {formatDate(data.trip.startDate, { day: 'numeric', month: 'long' }) + ' to ' +
                 formatDate(data.trip.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              {data.trip.travellers.length ? (
                <Text style={s.meta}>{data.trip.travellers.join(' and ')}</Text>
              ) : null}
            </Card>

            {data.contacts.length ? (
              <>
                <Text style={s.section}>USEFUL NUMBERS</Text>
                <Card>
                  {data.contacts.map((c, i) => {
                    const href = contactHref(c);
                    return (
                      <View key={i} style={[s.contact, i > 0 && s.contactBorder]}>
                        <Text style={s.contactLabel}>{c.label}</Text>
                        <Text
                          style={[s.contactValue, href && s.link]}
                          onPress={href ? () => Linking.openURL(href) : undefined}
                        >
                          {c.value}
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              </>
            ) : null}

            {data.stays.length ? (
              <>
                <Text style={s.section}>STAYS</Text>
                {data.stays.map((st) => (
                  <Card key={st.id} style={s.spaced}>
                    <Text style={s.infoTitle}>{st.name}</Text>
                    <Text style={s.infoBody}>
                      {[st.city, st.address].filter(Boolean).join(' · ')}
                    </Text>
                    <Text style={s.meta}>
                      {formatDate(st.checkIn, { day: 'numeric', month: 'short' }) + ' to ' +
                       formatDate(st.checkOut, { day: 'numeric', month: 'short' })}
                    </Text>
                  </Card>
                ))}
              </>
            ) : null}

            {data.info.length ? (
              <>
                <Text style={s.section}>PRACTICAL INFORMATION</Text>
                {data.info.map((i, idx) => (
                  <Card key={idx} style={s.spaced}>
                    <Text style={s.infoTitle}>{i.title}</Text>
                    <Text style={s.infoBody}>{i.body}</Text>
                  </Card>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.primary,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  close: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  title: { ...type.h2 },
  dates: { ...type.small, marginTop: spacing.xs },
  meta: { ...type.small, marginTop: spacing.xs },
  section: { ...type.label, marginTop: spacing.xl, marginBottom: spacing.sm },
  spaced: { marginBottom: spacing.md },
  infoTitle: { ...type.h3, marginBottom: spacing.xs },
  infoBody: { ...type.body },
  contact: { paddingVertical: spacing.md },
  contactBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  contactLabel: { ...type.small },
  contactValue: { ...type.h3, marginTop: 2 },
  link: { color: colors.primary, textDecorationLine: 'underline' },
});
