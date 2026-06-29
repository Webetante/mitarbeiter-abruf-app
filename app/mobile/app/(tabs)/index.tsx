import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

type Job = {
  id: string;
  title: string;
  description: string | null;
  job_type: string;
  status: string;
  branch_id: string;
  start_location: string | null;
  destination_location: string | null;
  starts_at: string | null;
  shift_date: string | null;
  shift_start_time: string | null;
  shift_end_time: string | null;
  earliest_start_at: string | null;
  latest_delivery_at: string | null;
  support_needed_immediately: boolean | null;
  duration_unknown: boolean | null;
  shuttle_required: boolean | null;
  required_acceptances: number | null;
  accepted_by: string | null;
  accepted_at: string | null;
  accepted_by_name: string | null;
  main_driver_name: string | null;
  shuttle_driver_name: string | null;
  created_at: string;
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

  function jobTypeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return 'Schicht - MA krank';
    }

    if (job.job_type === 'vehicle_transfer') {
      return 'Ueberfuehrung';
    }

    if (job.support_needed_immediately) {
      return 'Unterstuetzung sofort';
    }

    return 'Auftrag';
  }

  function statusLabel(status: string) {
    if (status === 'open') {
      return 'Offen';
    }

    if (status === 'accepted') {
      return 'Angenommen';
    }

    if (status === 'completed') {
      return 'Erledigt';
    }

    if (status === 'cancelled') {
      return 'Abgebrochen';
    }

    return status;
  }

  function jobTimeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return `${job.shift_date ?? 'Datum offen'} · ${job.shift_start_time ?? '?'} bis ${job.shift_end_time ?? '?'}`;
    }

    if (job.job_type === 'vehicle_transfer') {
      return `Fruehester Start: ${job.earliest_start_at ?? job.starts_at ?? 'offen'} · Spaeteste Auslieferung: ${job.latest_delivery_at ?? 'offen'}`;
    }

    if (job.support_needed_immediately) {
      return 'Sofort · Dauer unbekannt';
    }

    return job.starts_at ?? 'Zeit offen';
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
    return <CounterDashboard profile={profile} onLogout={onLogout} />;
  }

  if (profile.role === 'employee') {
    return <EmployeeDashboard profile={profile} onLogout={onLogout} />;
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


async function registerPushToken(profile: UserProfile) {
  if (profile.role !== 'employee') {
    return;
  }

  try {
    if (!Device.isDevice) {
      console.log('Push: kein echtes Geraet.');
      return;
    }

    const existingPermission = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermission.status;

    if (finalStatus !== 'granted') {
      const requestedPermission = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermission.status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push: nicht erlaubt.');
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('Push: projectId fehlt. Spaeter mit Development Build aktivieren.');
      return;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenResult.data;

    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: profile.id,
          token: expoPushToken,
          expo_push_token: expoPushToken,
          platform: Platform.OS,
          active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,token',
        }
      );

    if (error) {
      console.log('Push Token konnte nicht gespeichert werden:', error.message);
      return;
    }

    console.log('Push Token gespeichert.');
  } catch (error) {
    console.log('Push aktuell nicht aktiv:', error);
  }
}


function EmployeeDashboard({
  profile,
  onLogout,
}: {
  profile: UserProfile;
  onLogout: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);

  async function loadOpenJobs() {
    if (!profile.branch_id) {
      return;
    }

    const { data, error } = await supabase
      .rpc('employee_list_open_jobs');

    if (error) {
      Alert.alert('Auftraege konnten nicht geladen werden', error.message);
      return;
    }

    setJobs((data ?? []) as Job[]);
  }

  async function loadMyJobs() {
    const { data, error } = await supabase
      .rpc('employee_list_my_jobs');

    if (error) {
      Alert.alert('Meine Auftraege konnten nicht geladen werden', error.message);
      return;
    }

    setMyJobs((data ?? []) as Job[]);
  }

  useEffect(() => {
    registerPushToken(profile);
    loadOpenJobs();
    loadMyJobs();
  }, []);

  function jobTypeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return 'Schicht - MA krank';
    }

    if (job.job_type === 'vehicle_transfer') {
      return 'Ueberfuehrung';
    }

    if (job.support_needed_immediately) {
      return 'Unterstuetzung sofort';
    }

    return 'Auftrag';
  }

  function statusLabel(status: string) {
    if (status === 'open') {
      return 'Offen';
    }

    if (status === 'accepted') {
      return 'Angenommen';
    }

    if (status === 'completed') {
      return 'Erledigt';
    }

    if (status === 'cancelled') {
      return 'Storniert';
    }

    return status;
  }

  function jobTimeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return `${job.shift_date ?? 'Datum offen'} · ${job.shift_start_time ?? '?'} bis ${job.shift_end_time ?? '?'}`;
    }

    if (job.job_type === 'vehicle_transfer') {
      return `Fruehester Start: ${job.earliest_start_at ?? job.starts_at ?? 'offen'} · Spaeteste Auslieferung: ${job.latest_delivery_at ?? 'offen'}`;
    }

    if (job.support_needed_immediately) {
      return 'Sofort · Dauer unbekannt';
    }

    return job.starts_at ?? 'Zeit offen';
  }

  async function acceptNormalJob(job: Job) {
    const { error: acceptanceError } = await supabase
      .from('job_acceptances')
      .insert({
        job_id: job.id,
        user_id: profile.id,
        acceptance_role: 'main',
        returns_alone: true,
      });

    if (acceptanceError) {
      Alert.alert('Zusage nicht moeglich', acceptanceError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
        accepted_by: profile.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    if (updateError) {
      Alert.alert('Auftrag konnte nicht aktualisiert werden', updateError.message);
      return;
    }

    Alert.alert('Zugesagt', 'Du hast den Auftrag angenommen.');
    await loadOpenJobs();
    await loadMyJobs();
  }

  async function acceptTransferAlone(job: Job) {
    const { error: acceptanceError } = await supabase
      .from('job_acceptances')
      .insert({
        job_id: job.id,
        user_id: profile.id,
        acceptance_role: 'main',
        returns_alone: true,
      });

    if (acceptanceError) {
      Alert.alert('Zusage nicht moeglich', acceptanceError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
        accepted_by: profile.id,
        accepted_at: new Date().toISOString(),
        shuttle_required: false,
        required_acceptances: 1,
      })
      .eq('id', job.id);

    if (updateError) {
      Alert.alert('Auftrag konnte nicht aktualisiert werden', updateError.message);
      return;
    }

    Alert.alert('Zugesagt', 'Du hast die Ueberfuehrung angenommen und kommst alleine zurueck.');
    await loadOpenJobs();
    await loadMyJobs();
  }

  async function acceptTransferNeedsShuttle(job: Job) {
    const { error: acceptanceError } = await supabase
      .from('job_acceptances')
      .insert({
        job_id: job.id,
        user_id: profile.id,
        acceptance_role: 'main',
        returns_alone: false,
      });

    if (acceptanceError) {
      Alert.alert('Zusage nicht moeglich', acceptanceError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        accepted_by: profile.id,
        accepted_at: new Date().toISOString(),
        shuttle_required: true,
        required_acceptances: 2,
        status: 'open',
      })
      .eq('id', job.id);

    if (updateError) {
      Alert.alert('Auftrag konnte nicht aktualisiert werden', updateError.message);
      return;
    }

    Alert.alert('Zugesagt', 'Du hast die Ueberfuehrung angenommen. Ein Shuttle-Fahrer wird noch gesucht.');
    await loadOpenJobs();
    await loadMyJobs();
  }

  async function acceptAsShuttle(job: Job) {
    const { error: acceptanceError } = await supabase
      .from('job_acceptances')
      .insert({
        job_id: job.id,
        user_id: profile.id,
        acceptance_role: 'shuttle',
        returns_alone: false,
      });

    if (acceptanceError) {
      Alert.alert('Zusage nicht moeglich', acceptanceError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
      })
      .eq('id', job.id);

    if (updateError) {
      Alert.alert('Auftrag konnte nicht aktualisiert werden', updateError.message);
      return;
    }

    Alert.alert('Zugesagt', 'Du bist als Shuttle-Fahrer eingetragen.');
    await loadOpenJobs();
    await loadMyJobs();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mitarbeiter-Bereich</Text>
      <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Mitarbeiter'}.</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Offene Auftraege</Text>
        <Text style={styles.infoText}>
          Hier siehst du offene Auftraege deiner Filiale und kannst direkt zusagen.
        </Text>
      </View>

      <Pressable
        style={styles.neutralButton}
        onPress={() => {
          loadOpenJobs();
          loadMyJobs();
        }}
      >
        <Text style={styles.neutralButtonText}>Liste aktualisieren</Text>
      </Pressable>

      {jobs.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.selectText}>Aktuell sind keine offenen Auftraege vorhanden.</Text>
        </View>
      ) : (
        jobs.map((job) => (
          <View key={job.id} style={styles.card}>
            <Text style={styles.cardTitle}>{job.title}</Text>
            <Text style={styles.branchMeta}>{jobTypeLabel(job)}</Text>
            <Text style={styles.branchMeta}>{jobTimeLabel(job)}</Text>

            {job.job_type === 'vehicle_transfer' && (
              <Text style={styles.branchMeta}>
                {job.start_location || 'Start offen'} → {job.destination_location || 'Ziel offen'}
              </Text>
            )}

            {job.description ? (
              <Text style={styles.branchMeta}>{job.description}</Text>
            ) : null}

            {job.job_type === 'vehicle_transfer' && job.shuttle_required && job.accepted_by && job.accepted_by !== profile.id ? (
              <Pressable style={styles.primaryButton} onPress={() => acceptAsShuttle(job)}>
                <Text style={styles.primaryButtonText}>Als Shuttle-Fahrer zusagen</Text>
              </Pressable>
            ) : job.job_type === 'vehicle_transfer' ? (
              <View>
                <Pressable style={styles.primaryButton} onPress={() => acceptTransferAlone(job)}>
                  <Text style={styles.primaryButtonText}>Ich komme alleine zurueck</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={() => acceptTransferNeedsShuttle(job)}>
                  <Text style={styles.secondaryButtonText}>Ich brauche Shuttle-Fahrer</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.primaryButton} onPress={() => acceptNormalJob(job)}>
                <Text style={styles.primaryButtonText}>Auftrag zusagen</Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Meine zugesagten Auftraege</Text>

        {myJobs.length === 0 ? (
          <Text style={styles.selectText}>Du hast noch keinen Auftrag zugesagt.</Text>
        ) : (
          myJobs.map((job) => (
            <View key={job.id} style={styles.branchCard}>
              <Text style={styles.branchName}>{job.title}</Text>
              <Text style={styles.branchMeta}>{jobTypeLabel(job)} · {statusLabel(job.status)}</Text>
              <Text style={styles.branchMeta}>{jobTimeLabel(job)}</Text>

              {job.job_type === 'vehicle_transfer' && (
                <Text style={styles.branchMeta}>
                  {job.start_location || 'Start offen'} → {job.destination_location || 'Ziel offen'}
                </Text>
              )}

              {job.status === 'cancelled' && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Storniert</Text>
                  <Text style={styles.infoText}>
                    Dieser Auftrag wurde vom Counter storniert.
                  </Text>
                </View>
              )}

              {job.description ? (
                <Text style={styles.branchMeta}>{job.description}</Text>
              ) : null}
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


function CounterDashboard({
  profile,
  onLogout,
}: {
  profile: UserProfile;
  onLogout: () => void;
}) {
  const [jobType, setJobType] = useState<'shift' | 'transfer' | 'support'>('shift');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [shiftDate, setShiftDate] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');

  const [earliestStartDate, setEarliestStartDate] = useState('');
  const [earliestStartTime, setEarliestStartTime] = useState('');
  const [latestDeliveryDate, setLatestDeliveryDate] = useState('');
  const [latestDeliveryTime, setLatestDeliveryTime] = useState('');
  const [startCity, setStartCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

  function buildDateTime(dateValue: string, timeValue: string) {
    return `${dateValue.trim()}T${timeValue.trim()}:00`;
  }

  async function loadBranchJobs() {
    if (!profile.branch_id) {
      return;
    }

    const { data, error } = await supabase
      .rpc('counter_list_branch_jobs');

    if (error) {
      Alert.alert('Auftraege konnten nicht geladen werden', error.message);
      return;
    }

    setJobs((data ?? []) as Job[]);
  }

  useEffect(() => {
    loadBranchJobs();
  }, []);

  async function createJob() {
    if (!profile.branch_id) {
      Alert.alert('Filiale fehlt', 'Deinem Counter-Profil ist noch keine Filiale zugeordnet.');
      return;
    }

    let payload: Record<string, unknown> = {
      branch_id: profile.branch_id,
      created_by: profile.id,
      status: 'open',
      required_acceptances: 1,
      description: description.trim() || null,
    };

    if (jobType === 'shift') {
      if (!shiftDate.trim() || !shiftStartTime.trim() || !shiftEndTime.trim()) {
        Alert.alert('Angaben fehlen', 'Bitte Datum, Startzeit und Endzeit eingeben.');
        return;
      }

      payload = {
        ...payload,
        title: title.trim() || 'Schicht - MA krank',
        job_type: 'staff_replacement',
        shift_date: shiftDate.trim(),
        shift_start_time: shiftStartTime.trim(),
        shift_end_time: shiftEndTime.trim(),
        starts_at: buildDateTime(shiftDate, shiftStartTime),
      };
    }

    if (jobType === 'transfer') {
      if (
        !startCity.trim() ||
        !destinationCity.trim() ||
        !earliestStartDate.trim() ||
        !earliestStartTime.trim() ||
        !latestDeliveryDate.trim() ||
        !latestDeliveryTime.trim()
      ) {
        Alert.alert('Angaben fehlen', 'Bitte Startstadt, Zielstadt, fruehesten Start und spaeteste Auslieferung eingeben.');
        return;
      }

      payload = {
        ...payload,
        title: title.trim() || 'Ueberfuehrung',
        job_type: 'vehicle_transfer',
        start_location: startCity.trim(),
        destination_location: destinationCity.trim(),
        earliest_start_at: buildDateTime(earliestStartDate, earliestStartTime),
        latest_delivery_at: buildDateTime(latestDeliveryDate, latestDeliveryTime),
        starts_at: buildDateTime(earliestStartDate, earliestStartTime),
        shuttle_required: false,
        required_acceptances: 1,
      };
    }

    if (jobType === 'support') {
      payload = {
        ...payload,
        title: title.trim() || 'Benoetige Unterstuetzung sofort',
        job_type: 'other',
        support_needed_immediately: true,
        duration_unknown: true,
        starts_at: new Date().toISOString(),
      };
    }

    const { error } = await supabase.from('jobs').insert(payload);

    if (error) {
      Alert.alert('Auftrag konnte nicht erstellt werden', error.message);
      return;
    }

    Alert.alert('Auftrag erstellt', 'Der Auftrag ist jetzt offen fuer Mitarbeiter.');
    await loadBranchJobs();

    setTitle('');
    setDescription('');
    setShiftDate('');
    setShiftStartTime('');
    setShiftEndTime('');
    setEarliestStartDate('');
    setEarliestStartTime('');
    setLatestDeliveryDate('');
    setLatestDeliveryTime('');
    setStartCity('');
    setDestinationCity('');
  }

  function jobTypeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return 'Schicht - MA krank';
    }

    if (job.job_type === 'vehicle_transfer') {
      return 'Ueberfuehrung';
    }

    if (job.support_needed_immediately) {
      return 'Unterstuetzung sofort';
    }

    return 'Auftrag';
  }

  function statusLabel(status: string) {
    if (status === 'open') {
      return 'Offen';
    }

    if (status === 'accepted') {
      return 'Angenommen';
    }

    if (status === 'completed') {
      return 'Erledigt';
    }

    if (status === 'cancelled') {
      return 'Storniert';
    }

    return status;
  }

  async function cancelJob(job: Job) {
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', job.id);

    if (error) {
      Alert.alert('Storno nicht moeglich', error.message);
      return;
    }

    Alert.alert('Auftrag storniert', 'Der Auftrag wurde storniert.');
    await loadBranchJobs();
  }

  function jobTimeLabel(job: Job) {
    if (job.job_type === 'staff_replacement') {
      return `${job.shift_date ?? 'Datum offen'} · ${job.shift_start_time ?? '?'} bis ${job.shift_end_time ?? '?'}`;
    }

    if (job.job_type === 'vehicle_transfer') {
      return `Fruehester Start: ${job.earliest_start_at ?? job.starts_at ?? 'offen'} · Spaeteste Auslieferung: ${job.latest_delivery_at ?? 'offen'}`;
    }

    if (job.support_needed_immediately) {
      return 'Sofort · Dauer unbekannt';
    }

    return job.starts_at ?? 'Zeit offen';
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Counter-Bereich</Text>
      <Text style={styles.subtitle}>Hallo {profile.full_name ?? 'Counter'}.</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Neuen Auftrag erstellen</Text>
        <Text style={styles.infoText}>
          Waehle den Auftragstyp und erfasse die wichtigsten Angaben.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Auftragstyp</Text>

        <Pressable
          style={jobType === 'shift' ? styles.roleButtonActive : styles.roleButton}
          onPress={() => setJobType('shift')}
        >
          <Text style={jobType === 'shift' ? styles.roleButtonTextActive : styles.roleButtonText}>
            Schicht - MA krank
          </Text>
        </Pressable>

        <Pressable
          style={jobType === 'transfer' ? styles.roleButtonActive : styles.roleButton}
          onPress={() => setJobType('transfer')}
        >
          <Text style={jobType === 'transfer' ? styles.roleButtonTextActive : styles.roleButtonText}>
            Ueberfuehrung
          </Text>
        </Pressable>

        <Pressable
          style={jobType === 'support' ? styles.roleButtonActive : styles.roleButton}
          onPress={() => setJobType('support')}
        >
          <Text style={jobType === 'support' ? styles.roleButtonTextActive : styles.roleButtonText}>
            Benoetige Unterstuetzung sofort
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Titel optional"
          placeholderTextColor="#475569"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Beschreibung / Hinweis optional"
          placeholderTextColor="#475569"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {jobType === 'shift' && (
          <View>
            <Text style={styles.selectLabel}>Datum</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD, z.B. 2026-06-28"
              placeholderTextColor="#475569"
              value={shiftDate}
              onChangeText={setShiftDate}
            />

            <Text style={styles.selectLabel}>Von</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM, z.B. 09:00"
              placeholderTextColor="#475569"
              value={shiftStartTime}
              onChangeText={setShiftStartTime}
            />

            <Text style={styles.selectLabel}>Bis</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM, z.B. 17:00"
              placeholderTextColor="#475569"
              value={shiftEndTime}
              onChangeText={setShiftEndTime}
            />
          </View>
        )}

        {jobType === 'transfer' && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Startstadt"
              placeholderTextColor="#475569"
              value={startCity}
              onChangeText={setStartCity}
            />

            <TextInput
              style={styles.input}
              placeholder="Zielstadt"
              placeholderTextColor="#475569"
              value={destinationCity}
              onChangeText={setDestinationCity}
            />

            <Text style={styles.selectLabel}>Fruehester Start</Text>
            <TextInput
              style={styles.input}
              placeholder="Datum YYYY-MM-DD"
              placeholderTextColor="#475569"
              value={earliestStartDate}
              onChangeText={setEarliestStartDate}
            />

            <TextInput
              style={styles.input}
              placeholder="Uhrzeit HH:MM"
              placeholderTextColor="#475569"
              value={earliestStartTime}
              onChangeText={setEarliestStartTime}
            />

            <Text style={styles.selectLabel}>Spaeteste Auslieferung</Text>
            <TextInput
              style={styles.input}
              placeholder="Datum YYYY-MM-DD"
              placeholderTextColor="#475569"
              value={latestDeliveryDate}
              onChangeText={setLatestDeliveryDate}
            />

            <TextInput
              style={styles.input}
              placeholder="Uhrzeit HH:MM"
              placeholderTextColor="#475569"
              value={latestDeliveryTime}
              onChangeText={setLatestDeliveryTime}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Rueckfahrt</Text>
              <Text style={styles.infoText}>
                Der Mitarbeiter entscheidet spaeter beim Zusagen, ob er alleine zurueckkommt oder einen Shuttle-Fahrer braucht.
              </Text>
            </View>
          </View>
        )}

        {jobType === 'support' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Sofortige Unterstuetzung</Text>
            <Text style={styles.infoText}>
              Dieser Auftrag startet sofort. Die Dauer ist unbekannt.
            </Text>
          </View>
        )}

        <Pressable style={styles.primaryButton} onPress={createJob}>
          <Text style={styles.primaryButtonText}>Auftrag erstellen</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Auftraege meiner Filiale</Text>

        <Pressable style={styles.neutralButton} onPress={loadBranchJobs}>
          <Text style={styles.neutralButtonText}>Liste aktualisieren</Text>
        </Pressable>

        {jobs.length === 0 ? (
          <Text style={styles.selectText}>Noch keine Auftraege vorhanden.</Text>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.branchCard}>
              <Text style={styles.branchName}>{job.title}</Text>
              <Text style={styles.branchMeta}>{jobTypeLabel(job)} · {statusLabel(job.status)}</Text>
              <Text style={styles.branchMeta}>{jobTimeLabel(job)}</Text>

              {job.job_type === 'vehicle_transfer' && (
                <Text style={styles.branchMeta}>
                  {job.start_location || 'Start offen'} → {job.destination_location || 'Ziel offen'}
                </Text>
              )}

              {job.description ? (
                <Text style={styles.branchMeta}>{job.description}</Text>
              ) : null}

              {job.status === 'accepted' && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Zusage</Text>
                  {job.job_type === 'vehicle_transfer' ? (
                    <Text style={styles.infoText}>
                      Hauptfahrer: {job.main_driver_name || job.accepted_by_name || 'noch unbekannt'}
                      {'\n'}Shuttle-Fahrer: {job.shuttle_driver_name || (job.shuttle_required ? 'noch offen' : 'nicht benoetigt')}
                    </Text>
                  ) : (
                    <Text style={styles.infoText}>
                      Angenommen von: {job.accepted_by_name || job.main_driver_name || 'noch unbekannt'}
                    </Text>
                  )}
                </View>
              )}

              {job.status === 'open' && job.job_type === 'vehicle_transfer' && job.shuttle_required && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Shuttle offen</Text>
                  <Text style={styles.infoText}>
                    Hauptfahrer: {job.main_driver_name || job.accepted_by_name || 'noch unbekannt'}
                    {'\n'}Shuttle-Fahrer wird noch gesucht.
                  </Text>
                </View>
              )}

              {job.status !== 'cancelled' && job.status !== 'completed' && (
                <Pressable style={styles.dangerButton} onPress={() => cancelJob(job)}>
                  <Text style={styles.dangerButtonText}>Auftrag stornieren</Text>
                </Pressable>
              )}
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
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#64748B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
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
