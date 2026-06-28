import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Screen = 'home' | 'login' | 'register' | 'dashboard';
type AdminSection = 'menu' | 'branches' | 'profiles';
type UserRole = 'admin' | 'counter' | 'employee';

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
  role: UserRole;
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

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        placeholderTextColor="#475569"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Passwort"
        placeholderTextColor="#475569"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

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

      <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#475569" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon" placeholderTextColor="#475569" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="E-Mail" placeholderTextColor="#475569" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Passwort" placeholderTextColor="#475569" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filiale</Text>

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
  const [adminSection, setAdminSection] = useState<AdminSection>('menu');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editingBranchName, setEditingBranchName] = useState('');
  const [editingBranchCity, setEditingBranchCity] = useState('');

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

  async function loadProfiles() {
    const { data, error } = await supabase.rpc('admin_list_profiles');

    if (error) {
      Alert.alert('Mitarbeiter konnten nicht geladen werden', error.message);
      return;
    }

    setProfiles((data ?? []) as UserProfile[]);
  }

  useEffect(() => {
    loadBranches();
    loadProfiles();
  }, []);

  async function createBranch() {
    if (!newBranchName.trim()) {
      Alert.alert('Name fehlt', 'Bitte einen Filialnamen eingeben.');
      return;
    }

    const { error } = await supabase.from('branches').insert({
      name: newBranchName.trim(),
      city: newBranchCity.trim() || null,
      active: true,
    });

    if (error) {
      Alert.alert('Filiale konnte nicht erstellt werden', error.message);
      return;
    }

    setNewBranchName('');
    setNewBranchCity('');
    await loadBranches();
    Alert.alert('Gespeichert', 'Filiale wurde angelegt.');
  }

  function startEditing(branch: Branch) {
    setEditingBranchId(branch.id);
    setEditingBranchName(branch.name);
    setEditingBranchCity(branch.city ?? '');
  }

  function cancelEditing() {
    setEditingBranchId(null);
    setEditingBranchName('');
    setEditingBranchCity('');
  }

  async function saveEditing(branchId: string) {
    if (!editingBranchName.trim()) {
      Alert.alert('Name fehlt', 'Bitte einen Filialnamen eingeben.');
      return;
    }

    const { error } = await supabase
      .from('branches')
      .update({
        name: editingBranchName.trim(),
        city: editingBranchCity.trim() || null,
      })
      .eq('id', branchId);

    if (error) {
      Alert.alert('Filiale konnte nicht gespeichert werden', error.message);
      return;
    }

    cancelEditing();
    await loadBranches();
    Alert.alert('Gespeichert', 'Filiale wurde aktualisiert.');
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

  async function deleteBranch(branch: Branch) {
    Alert.alert(
      'Filiale loeschen?',
      `Soll "${branch.name}" wirklich geloescht werden?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Loeschen',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('branches').delete().eq('id', branch.id);

            if (error) {
              Alert.alert('Filiale konnte nicht geloescht werden', error.message);
              return;
            }

            await loadBranches();
          },
        },
      ]
    );
  }

  async function updateProfile(user: UserProfile, changes: Partial<UserProfile>) {
    const nextProfile = {
      ...user,
      ...changes,
    };

    if (user.id === profile.id && user.active && nextProfile.active === false) {
      Alert.alert('Nicht moeglich', 'Du kannst dich nicht selbst deaktivieren.');
      return;
    }

    const { error } = await supabase.rpc('admin_update_profile', {
      p_user_id: nextProfile.id,
      p_role: nextProfile.role,
      p_branch_id: nextProfile.branch_id,
      p_active: nextProfile.active,
    });

    if (error) {
      Alert.alert('Mitarbeiter konnte nicht aktualisiert werden', error.message);
      return;
    }

    await loadProfiles();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin-Bereich</Text>
      <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Admin'}.</Text>

      {adminSection === 'menu' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verwaltung</Text>

          <Pressable style={styles.primaryButton} onPress={() => setAdminSection('branches')}>
            <Text style={styles.primaryButtonText}>Filialverwaltung</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={() => setAdminSection('profiles')}>
            <Text style={styles.primaryButtonText}>Mitarbeiterverwaltung</Text>
          </Pressable>
        </View>
      )}

      {adminSection === 'branches' && (
        <View>
          <Pressable style={styles.neutralButton} onPress={() => setAdminSection('menu')}>
            <Text style={styles.neutralButtonText}>Zurueck zum Admin-Menue</Text>
          </Pressable>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Neue Filiale</Text>

            <TextInput
              style={styles.input}
              placeholder="Filialname"
              placeholderTextColor="#475569"
              value={newBranchName}
              onChangeText={setNewBranchName}
            />

            <TextInput
              style={styles.input}
              placeholder="Stadt"
              placeholderTextColor="#475569"
              value={newBranchCity}
              onChangeText={setNewBranchCity}
            />

            <Pressable style={styles.primaryButton} onPress={createBranch}>
              <Text style={styles.primaryButtonText}>Filiale anlegen</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bestehende Filialen</Text>

            {branches.map((branch) => {
              const isEditing = editingBranchId === branch.id;

              return (
                <View key={branch.id} style={styles.branchCard}>
                  {isEditing ? (
                    <View>
                      <TextInput
                        style={styles.input}
                        placeholder="Filialname"
                        placeholderTextColor="#475569"
                        value={editingBranchName}
                        onChangeText={setEditingBranchName}
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="Stadt"
                        placeholderTextColor="#475569"
                        value={editingBranchCity}
                        onChangeText={setEditingBranchCity}
                      />

                      <Pressable style={styles.smallPrimaryButton} onPress={() => saveEditing(branch.id)}>
                        <Text style={styles.smallButtonText}>Speichern</Text>
                      </Pressable>

                      <Pressable style={styles.neutralButton} onPress={cancelEditing}>
                        <Text style={styles.neutralButtonText}>Abbrechen</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.branchName}>{branch.name}</Text>
                      <Text style={styles.branchMeta}>
                        {branch.city || 'Keine Stadt'} · {branch.active ? 'Aktiv' : 'Inaktiv'}
                      </Text>

                      <Pressable style={styles.smallPrimaryButton} onPress={() => startEditing(branch)}>
                        <Text style={styles.smallButtonText}>Bearbeiten</Text>
                      </Pressable>

                      <Pressable
                        style={branch.active ? styles.warningButton : styles.smallPrimaryButton}
                        onPress={() => toggleBranch(branch)}
                      >
                        <Text style={styles.smallButtonText}>
                          {branch.active ? 'Deaktivieren' : 'Aktivieren'}
                        </Text>
                      </Pressable>

                      <Pressable style={styles.dangerButton} onPress={() => deleteBranch(branch)}>
                        <Text style={styles.smallButtonText}>Loeschen</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {adminSection === 'profiles' && (
        <View>
          <Pressable style={styles.neutralButton} onPress={() => setAdminSection('menu')}>
            <Text style={styles.neutralButtonText}>Zurueck zum Admin-Menue</Text>
          </Pressable>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mitarbeiter verwalten</Text>

            {profiles.map((user) => (
              <View key={user.id} style={styles.branchCard}>
                <Text style={styles.branchName}>{user.full_name || 'Ohne Namen'}</Text>
                <Text style={styles.branchMeta}>
                  {user.phone || 'Keine Telefonnummer'} · {user.active ? 'Aktiv' : 'Inaktiv'}
                </Text>
                <Text style={styles.branchMeta}>Rolle: {user.role}</Text>

                <Text style={styles.selectLabel}>Rolle</Text>

                <Pressable
                  style={user.role === 'employee' ? styles.roleButtonActive : styles.roleButton}
                  onPress={() => updateProfile(user, { role: 'employee' })}
                >
                  <Text style={user.role === 'employee' ? styles.roleButtonTextActive : styles.roleButtonText}>Mitarbeiter</Text>
                </Pressable>

                <Pressable
                  style={user.role === 'counter' ? styles.roleButtonActive : styles.roleButton}
                  onPress={() => updateProfile(user, { role: 'counter' })}
                >
                  <Text style={user.role === 'counter' ? styles.roleButtonTextActive : styles.roleButtonText}>Counter</Text>
                </Pressable>

                <Pressable
                  style={user.role === 'admin' ? styles.roleButtonActive : styles.roleButton}
                  onPress={() => updateProfile(user, { role: 'admin' })}
                >
                  <Text style={user.role === 'admin' ? styles.roleButtonTextActive : styles.roleButtonText}>Admin</Text>
                </Pressable>

                <Text style={styles.selectLabel}>Filiale</Text>

                {branches.map((branch) => (
                  <Pressable
                    key={branch.id}
                    style={[
                      styles.branchOption,
                      user.branch_id === branch.id && styles.branchOptionSelected,
                    ]}
                    onPress={() => updateProfile(user, { branch_id: branch.id })}
                  >
                    <Text style={styles.branchOptionText}>
                      {branch.name}{branch.city ? `, ${branch.city}` : ''}
                    </Text>
                  </Pressable>
                ))}

                <Pressable
                  style={user.active ? styles.warningButton : styles.smallPrimaryButton}
                  onPress={() => updateProfile(user, { active: !user.active })}
                >
                  <Text style={styles.smallButtonText}>
                    {user.active ? 'Nutzer deaktivieren' : 'Nutzer aktivieren'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#64748B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 14,
    color: '#111827',
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
  selectLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
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
  branchCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  branchName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  branchMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  smallPrimaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  warningButton: {
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  neutralButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  neutralButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  roleButtonActive: {
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  roleButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
