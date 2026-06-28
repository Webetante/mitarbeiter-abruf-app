import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

type Screen = 'home' | 'login' | 'register';

type Branch = {
  id: string;
  name: string;
  city: string | null;
};

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
        <Text style={styles.infoText}>Supabase ist verbunden. Filialen werden live geladen.</Text>
      </View>
    </View>
  );
}

function LoginScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Login fehlgeschlagen', error.message);
      return;
    }

    Alert.alert('Eingeloggt', 'Login war erfolgreich.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Einloggen</Text>
      <Text style={styles.subtitle}>Melde dich mit deiner E-Mail-Adresse an.</Text>

      <TextInput style={styles.input} placeholder="E-Mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Passwort" secureTextEntry value={password} onChangeText={setPassword} />

      <Pressable style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Einloggen</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkButtonText}>Zurueck</Text>
      </Pressable>
    </ScrollView>
  );
}

function RegisterScreen({ onBack }: { onBack: () => void }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function loadBranches() {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city')
        .eq('active', true)
        .order('name');

      if (error) {
        Alert.alert('Filialen konnten nicht geladen werden', error.message);
        return;
      }

      setBranches(data ?? []);

      if (data && data.length > 0) {
        setSelectedBranchId(data[0].id);
      }
    }

    loadBranches();
  }, []);

  async function handleRegister() {
    if (!fullName || !email || !password || !selectedBranchId) {
      Alert.alert('Angaben fehlen', 'Bitte Name, E-Mail, Passwort und Filiale ausfuellen.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert('Registrierung fehlgeschlagen', error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      Alert.alert('Fast fertig', 'Bitte bestaetige deine E-Mail-Adresse.');
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      phone,
      role: 'employee',
      branch_id: selectedBranchId,
      active: true,
    });

    if (profileError) {
      Alert.alert('Profil konnte nicht erstellt werden', profileError.message);
      return;
    }

    Alert.alert('Registriert', 'Dein Mitarbeiter-Konto wurde erstellt.');
    onBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrieren</Text>
      <Text style={styles.subtitle}>Erstelle ein Mitarbeiter-Konto.</Text>

      <TextInput style={styles.input} placeholder="Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="E-Mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Passwort" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={styles.selectBox}>
        <Text style={styles.selectLabel}>Filiale</Text>

        {branches.length === 0 ? (
          <Text style={styles.selectText}>Keine Filialen geladen.</Text>
        ) : (
          branches.map((branch) => (
            <Pressable
              key={branch.id}
              style={[
                styles.branchOption,
                selectedBranchId === branch.id && styles.branchOptionSelected,
              ]}
              onPress={() => setSelectedBranchId(branch.id)}
            >
              <Text style={styles.branchOptionText}>
                {branch.name}{branch.city ? `, ${branch.city}` : ''}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      <Pressable style={styles.primaryButton} onPress={handleRegister}>
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
    marginBottom: 10,
  },
  selectText: {
    fontSize: 16,
    color: '#6B7280',
  },
  branchOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  branchOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  branchOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
});
