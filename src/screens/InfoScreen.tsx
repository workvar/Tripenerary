import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import SmartImage from '@/components/SmartImage';
import Message from '@/components/Message';
import { Card, SectionTitle } from '@/components/ui';
import { colors, hairlineWidth, radius, spacing, type } from '@/theme';
import { formatDate } from '@/lib/dates';
import type { Contact, Itinerary } from '@/types';

function contactHref(contact: Contact): string | null {
  if (contact.type === 'phone') return `tel:${contact.value.replace(/\s/g, '')}`;
  if (contact.type === 'url') return contact.value;
  return null;
}

const shortDate = (key: string): string => formatDate(key, { day: 'numeric', month: 'short' });

interface InfoScreenProps {
  readonly data: Itinerary | null;
  readonly showImages: boolean;
  readonly onClose: () => void;
}

export default function InfoScreen({ data, showImages, onClose }: InfoScreenProps) {
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
                {`${formatDate(data.trip.startDate, { day: 'numeric', month: 'long' })} to ${formatDate(
                  data.trip.endDate,
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}`}
              </Text>
              {data.trip.travellers.length > 0 ? (
                <Text style={s.meta}>{data.trip.travellers.join(' and ')}</Text>
              ) : null}
            </Card>

            {data.contacts.length > 0 ? (
              <>
                <SectionTitle>Useful numbers</SectionTitle>
                <Card>
                  {data.contacts.map((contact, i) => {
                    const href = contactHref(contact);
                    return (
                      <View key={contact.label} style={[s.contact, i > 0 && s.contactBorder]}>
                        <Text style={s.contactLabel}>{contact.label}</Text>
                        <Text
                          style={[s.contactValue, href ? s.link : null]}
                          onPress={href ? () => void Linking.openURL(href) : undefined}
                        >
                          {contact.value}
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              </>
            ) : null}

            {data.stays.length > 0 ? (
              <>
                <SectionTitle>Stays</SectionTitle>
                {data.stays.map((stay) => (
                  <Card key={stay.id} style={s.spaced}>
                    {showImages && stay.image ? (
                      <SmartImage uri={stay.image} style={s.thumb} radiusValue={radius.sm} />
                    ) : null}
                    <Text style={s.infoTitle}>{stay.name}</Text>
                    <Text style={s.infoBody}>
                      {[stay.city, stay.address].filter(Boolean).join(' · ')}
                    </Text>
                    <Text style={s.meta}>{`${shortDate(stay.checkIn)} to ${shortDate(stay.checkOut)}`}</Text>
                  </Card>
                ))}
              </>
            ) : null}

            {data.info.length > 0 ? (
              <>
                <SectionTitle>Practical information</SectionTitle>
                {data.info.map((section) => (
                  <Card key={section.title} style={s.spaced}>
                    {showImages && section.image ? (
                      <SmartImage uri={section.image} style={s.thumb} radiusValue={radius.sm} />
                    ) : null}
                    <Text style={s.infoTitle}>{section.title}</Text>
                    <Text style={s.infoBody}>{section.body}</Text>
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
