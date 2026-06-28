import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

type Screen = 'home' | 'login' | 'register' | 'dashboard';

type Branch = {
  id: string;
  name: string;
  city: string | null;
  active: boolean;
};

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'counter' | 'employee';
  branch_id: string | null;
  active: boolean;
};

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  function handleLoggedIn(nextProfile: UserProfile) {
    setProfile(nextProfile);
    setScreen('dashboard');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    setScreen('home');
  }

  if (screen === 'login') {
    return <LoginScreen onBack={() => setScreen('home')} onLoggedIn={handleLoggedIn} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('home')} onRegistered={handleLoggedIn} />;
  }

  if (screen === 'dashboard' && profile) {
    return <DashboardScreen profile={profile} onLogout={handleLogout} />;
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
        <Text style={styles.infoText}>Admin, Counter und Mitarbeiter-Bereiche sind vorbereitet.</Text>
      </View>
    </View>
  );
}

async function loadProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, branch_id, active')
    .eq('id', userId)
    .single();

  if (error) {
    Alert.alert('Profil konnte nicht geladen werden', error.message);
    return null;
  }

  return data as UserProfile;
}

function LoginScreen({
  onBack,
  onLoggedIn,
}: {
  onBack: () => void;
  onLoggedIn: (profile: UserProfile) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Login fehlgeschlagen', error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      Alert.alert('Login fehlgeschlagen', 'Kein Benutzer gefunden.');
      return;
    }

    const profile = await loadProfile(userId);

    if (!profile) {
      return;
    }

    if (!profile.active) {
      Alert.alert('Konto deaktiviert', 'Dieses Konto ist nicht aktiv.');
      return;
    }

    onLoggedIn(profile);
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

function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (profile: UserProfile) => void;
}) {
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
        .select('id, name, city, active')
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
      Alert.alert('Registrierung fehlgeschlagen', 'Kein Benutzer gefunden.');
      return;
    }

    const newProfile = {
      id: userId,
      full_name: fullName,
      phone,
      role: 'employee' as const,
      branch_id: selectedBranchId,
      active: true,
    };

    const { error: profileError } = await supabase.from('profiles').insert(newProfile);

    if (profileError) {
      Alert.alert('Profil konnte nicht erstellt werden', profileError.message);
      return;
    }

    Alert.alert('Registriert', 'Dein Mitarbeiter-Konto wurde erstellt.');
    onRegistered(newProfile);
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

function DashboardScreen({
  profile,
  onLogout,
}: {
  profile: UserProfile;
  onLogout: () => void;
}) {
  if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} onLogout={onLogout} />;
  }

  if (profile.role === 'counter') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Counter-Bereich</Text>
        <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Counter'}.</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Naechster Schritt</Text>
          <Text style={styles.infoText}>
            Counter erstellen kurzfristige Auftraege fuer ihre Filiale.
          </Text>
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Neuen Auftrag erstellen</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onLogout}>
          <Text style={styles.secondaryButtonText}>Ausloggen</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mitarbeiter-Bereich</Text>
      <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Mitarbeiter'}.</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Naechster Schritt</Text>
        <Text style={styles.infoText}>
          Hier erscheinen offene Auftraege deiner Filiale.
        </Text>
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Offene Auftraege anzeigen</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onLogout}>
        <Text style={styles.secondaryButtonText}>Ausloggen</Text>
      </Pressable>
    </ScrollView>
  );
}

function AdminDashboard({
  profile,
  onLogout,
}: {
  profile: UserProfile;
  onLogout: () => void;
}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadBranches() {
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, city, active')
      .order('name');

    if (error) {
      Alert.alert('Filialen konnten nicht geladen werden', error.message);
      return;
    }

    setBranches(data ?? []);
  }

  useEffect(() => {
    loadBranches();
  }, []);

  async function createBranch() {
    if (!newBranchName.trim()) {
      Alert.alert('Name fehlt', 'Bitte einen Filialnamen eingeben.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('branches')
      .insert({
        name: newBranchName.trim(),
        city: newBranchCity.trim() || null,
        active: true,
      });

    setLoading(false);

    if (error) {
      Alert.alert('Filiale konnte nicht erstellt werden', error.message);
      return;
    }

    setNewBranchName('');
    setNewBranchCity('');
    await loadBranches();
    Alert.alert('Gespeichert', 'Filiale wurde angelegt.');
  }

  async function toggleBranch(branch: Branch) {
    const { error } = await supabase
      .from('branches')
      .update({ active: !branch.active })
      .eq('id', branch.id);

    if (error) {
      Alert.alert('Filiale konnte nicht aktualisiert werden', error.message);
      return;
    }

    await loadBranches();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin-Bereich</Text>
      <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Admin'}.</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Filialen verwalten</Text>
        <Text style={styles.infoText}>
          Admins koennen Filialen anlegen und aktiv oder inaktiv schalten.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Neue Filiale</Text>

        <TextInput
          style={styles.input}
          placeholder="Filialname"
          value={newBranchName}
          onChangeText={setNewBranchName}
        />

        <TextInput
          style={styles.input}
          placeholder="Stadt"
          value={newBranchCity}
          onChangeText={setNewBranchCity}
        />

        <Pressable style={styles.primaryButton} onPress={createBranch} disabled={loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? 'Speichert...' : 'Filiale anlegen'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bestehende Filialen</Text>

        {branches.length === 0 ? (
          <Text style={styles.selectText}>Noch keine Filialen vorhanden.</Text>
        ) : (
          branches.map((branch) => (
            <View key={branch.id} style={styles.branchCard}>
              <View style={styles.branchCardText}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchMeta}>
                  {branch.city || 'Keine Stadt'} · {branch.active ? 'Aktiv' : 'Inaktiv'}
                </Text>
              </View>

              <Pressable
                style={branch.active ? styles.dangerButton : styles.smallPrimaryButton}
                onPress={() => toggleBranch(branch)}
              >
                <Text style={styles.smallButtonText}>
                  {branch.active ? 'Deaktivieren' : 'Aktivieren'}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.secondaryButton} onPress={onLogout}>
        <Text style={styles.secondaryButtonText}>Ausloggen</Text>
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
    marginBottom: 20,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    color: '#111827',
  },
  branchCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  branchCardText: {
    marginBottom: 12,
  },
  branchName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  branchMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 3,
  },
  smallPrimaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
