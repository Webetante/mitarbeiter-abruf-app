import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';

type Screen = 'home' | 'login' | 'register';

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'login') {
    return <LoginScreen onBack={() => setScreen('home')} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('home')} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mitarbeiter Abruf</Text>
      <Text style={styles.subtitle}>
        Kurzfristige Auftraege schnell an verfuegbare Mitarbeiter senden.
      </Text>

      <Pressable style={styles.primaryButton} onPress={() => setScreen('login')}>
        <Text style={styles.primaryButtonText}>Einloggen</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => setScreen('register')}>
        <Text style={styles.secondaryButtonText}>Registrieren</Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Status</Text>
        <Text style={styles.infoText}>
          App laeuft auf dem Handy. Login und Registrierung werden jetzt vorbereitet.
        </Text>
      </View>
    </View>
  );
}

function LoginScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Einloggen</Text>
      <Text style={styles.subtitle}>Melde dich mit deiner E-Mail-Adresse an.</Text>

      <TextInput style={styles.input} placeholder="E-Mail" autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Passwort" secureTextEntry />

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Einloggen</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkButtonText}>Zurueck</Text>
      </Pressable>
    </ScrollView>
  );
}

function RegisterScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrieren</Text>
      <Text style={styles.subtitle}>Erstelle ein Mitarbeiter-Konto.</Text>

      <TextInput style={styles.input} placeholder="Name" />
      <TextInput style={styles.input} placeholder="Telefon" keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="E-Mail" autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Passwort" secureTextEntry />

      <View style={styles.selectBox}>
        <Text style={styles.selectLabel}>Filiale</Text>
        <Text style={styles.selectText}>Hamburg / Luebeck / Kiel folgt mit Supabase</Text>
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Registrieren</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkButtonText}>Zurueck</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 14,
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
  linkButton: {
    paddingVertical: 12,
  },
  linkButtonText: {
    color: '#2563EB',
    fontSize: 17,
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
  selectBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
  },
  selectText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
