import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import SmartImage from '../components/SmartImage';
import Message from '../components/Message';
import { Card, SectionTitle } from '../components/ui';
import { colors, radius, spacing, type, hairlineWidth } from '../theme';
import { formatDate } from '../lib/dates';

function contactHref(c) {
  if (c.type === 'phone') return 'tel:' + c.value.replace(/\s/g, '');
  if (c.type === 'url') return c.value;
  return null;
}

export default function InfoScreen({ data, showImages, onClose }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Trip info" onClose={onClose} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!data ? (
          <Message title="No itinerary loaded" body="Add a trip from the home screen first." />
        ) : (
          <>
            <Card style={s.hero}>
              {showImages && data.trip.coverImage ? (
                <SmartImage uri={data.trip.coverImage} style={s.cover} radiusValue={radius.md} />
              ) : null}
              <Text style={s.title}>{data.trip.title}</Text>
              {data.trip.subtitle ? <Text style={s.subtitle}>{data.trip.subtitle}</Text> : null}
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
                <SectionTitle>Useful numbers</SectionTitle>
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
                <SectionTitle>Stays</SectionTitle>
                {data.stays.map((st) => (
                  <Card key={st.id} style={s.spaced}>
                    {showImages && st.image ? (
                      <SmartImage uri={st.image} style={s.thumb} radiusValue={radius.sm} />
                    ) : null}
                    <Text style={s.infoTitle}>{st.name}</Text>
                    <Text style={s.infoBody}>{[st.city, st.address].filter(Boolean).join(' · ')}</Text>
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
                <SectionTitle>Practical information</SectionTitle>
                {data.info.map((i, idx) => (
                  <Card key={idx} style={s.spaced}>
                    {showImages && i.image ? (
                      <SmartImage uri={i.image} style={s.thumb} radiusValue={radius.sm} />
                    ) : null}
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  hero: { padding: spacing.lg },
  cover: { height: 160, marginBottom: spacing.lg },
  thumb: { height: 120, marginBottom: spacing.md },
  title: { ...type.h1 },
  subtitle: { ...type.small, marginTop: 3 },
  dates: { ...type.small, marginTop: spacing.sm, fontWeight: '600', color: colors.text },
  meta: { ...type.small, marginTop: spacing.xs },
  spaced: { marginBottom: spacing.md },
  infoTitle: { ...type.h3, marginBottom: spacing.xs },
  infoBody: { ...type.body, color: colors.textMuted },
  contact: { paddingVertical: spacing.md },
  contactBorder: { borderTopWidth: hairlineWidth, borderTopColor: colors.borderSoft },
  contactLabel: { ...type.caption },
  contactValue: { ...type.h3, marginTop: 3 },
  link: { color: colors.primary },
});
