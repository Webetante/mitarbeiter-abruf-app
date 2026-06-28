import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mitarbeiter Abruf</Text>
      <Text style={styles.subtitle}>
        Kurzfristige Auftraege schnell an verfuegbare Mitarbeiter senden.
      </Text>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Einloggen</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Registrieren</Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Status</Text>
        <Text style={styles.infoText}>
          Die App laeuft jetzt auf deinem Handy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    backgroundColor: '#F6F8FB',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111827',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 34,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 28,
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E0F2FE',
    padding: 18,
    borderRadius: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    color: '#075985',
  },
  infoText: {
    fontSize: 15,
    color: '#075985',
    lineHeight: 21,
  },
});
