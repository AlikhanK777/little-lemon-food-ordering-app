import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, categories } from './src/theme';
import { getDatabase, loadMenu, loadProfile, saveProfile, deleteProfile } from './src/database';

const Stack = createNativeStackNavigator();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Brand({ small = false }) {
  return (
    <View style={styles.brand}>
      <Text style={{ fontSize: small ? 21 : 30 }}>🍋</Text>
      <Text style={[styles.brandName, small && { fontSize: 19 }]}>LITTLE LEMON</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, disabled = false, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && { opacity: 0.83 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: colors.forest }]}>{title}</Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A09A"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function OnboardingScreen({ onFinish }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [working, setWorking] = useState(false);
  const valid = firstName.trim().length > 0 && EMAIL.test(email.trim());

  async function submit() {
    if (!valid || working) return;
    setWorking(true);
    try {
      await onFinish({ firstName, email, lastName: '', phone: '', notifications: true });
    } catch (error) {
      Alert.alert('Could not save details', String(error));
    } finally {
      setWorking(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.onboardingContent}>
          <Brand />
          <View style={[styles.hero, { marginTop: 30, borderRadius: 18 }]}>
            <Text style={styles.heroTitle}>Little Lemon</Text>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroDescription}>
              A family-owned Mediterranean restaurant with traditional recipes and a modern twist.
            </Text>
            <Text style={{ fontSize: 66, alignSelf: 'flex-end' }}>🥗</Text>
          </View>
          <Text style={styles.pageHeading}>Welcome! 👋</Text>
          <Text style={styles.muted}>Enter your details to explore our menu.</Text>
          <Field label="First name *" value={firstName} onChangeText={setFirstName} placeholder="Your first name" />
          <Field label="Email *" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton title={working ? 'Saving…' : 'Next'} disabled={!valid || working} onPress={submit} />
          <Text style={styles.hint}>The Next button becomes available when both required fields are valid.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MenuCard({ item }) {
  return (
    <View style={styles.menuCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.dishPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.foodIcon}><Text style={{ fontSize: 38 }}>{item.emoji || '🍽️'}</Text></View>
    </View>
  );
}

function HomeScreen({ navigation, profile, menu }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [delayedQuery, setDelayedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDelayedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => menu.filter((item) => {
    const matchesCategory = selected.length === 0 || selected.includes(String(item.category).toLowerCase());
    const matchesText = String(item.name).toLowerCase().includes(delayedQuery);
    return matchesCategory && matchesText;
  }), [menu, selected, delayedQuery]);

  function toggleCategory(category) {
    setSelected((previous) => previous.includes(category) ? previous.filter((x) => x !== category) : [...previous, category]);
  }

  const header = (
    <>
      <View style={styles.homeTop}>
        <Brand small />
        <Pressable onPress={() => navigation.navigate('Profile')} accessibilityLabel="Open profile" style={styles.avatar}>
          <Text style={{ color: colors.forest, fontWeight: '900' }}>{profile.firstName[0]?.toUpperCase() || '?'}</Text>
        </Pressable>
      </View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <Text style={styles.heroSubtitle}>Chicago</Text>
        <Text style={styles.heroDescription}>Mediterranean classics made with fresh ingredients and plenty of love.</Text>
        <Text style={styles.heroDish}>🍋 🥙</Text>
        <TextInput
          accessibilityLabel="Search menu"
          placeholder="⌕  Search dishes"
          placeholderTextColor="#75837C"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.menuHeader}>
        <Text style={styles.sectionHeading}>ORDER FOR DELIVERY!</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map((c) => (
            <Pressable key={c} onPress={() => toggleCategory(c)} style={[styles.chip, selected.includes(c) && styles.chipActive]}>
              <Text style={[styles.chipText, selected.includes(c) && styles.chipTextActive]}>{c[0].toUpperCase() + c.slice(1)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <FlatList
        ListHeaderComponent={header}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MenuCard item={item} />}
        ListEmptyComponent={<Text style={[styles.muted, { textAlign: 'center', margin: 26 }]}>No matching dishes. Try a different search or category.</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

function ProfileScreen({ navigation, profile, onSave, onLogout }) {
  const [form, setForm] = useState({ ...profile });
  const [working, setWorking] = useState(false);
  const valid = form.firstName.trim().length > 0 && EMAIL.test(form.email.trim());

  async function save() {
    if (!valid || working) return;
    setWorking(true);
    try {
      await onSave(form);
      Alert.alert('Saved', 'Your profile changes have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save failed', String(error));
    } finally {
      setWorking(false);
    }
  }

  async function logOut() {
    try {
      await onLogout();
    } catch (error) {
      Alert.alert('Log out failed', String(error));
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.profileContent} keyboardShouldPersistTaps="handled">
        <View style={styles.profileHeader}><Brand small /></View>
        <Text style={styles.pageHeading}>Personal information</Text>
        <View style={styles.profileAvatar}>
          <Text style={{ color: colors.white, fontSize: 26, fontWeight: '900' }}>
            {(form.firstName[0] || '').toUpperCase()}{(form.lastName[0] || '').toUpperCase()}
          </Text>
        </View>
        <Field label="First name *" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
        <Field label="Last name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
        <Field label="Email *" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone number" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
        <Text style={styles.sectionHeading}>EMAIL NOTIFICATIONS</Text>
        <Pressable
          onPress={() => setForm({ ...form, notifications: !form.notifications })}
          style={styles.checkboxRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.notifications }}
        >
          <View style={[styles.checkbox, form.notifications && styles.checkboxChecked]}>
            {form.notifications ? <Text style={{ color: 'white', fontWeight: '900' }}>✓</Text> : null}
          </View>
          <Text>Receive updates and special offers</Text>
        </Pressable>
        <PrimaryButton title="Save changes" disabled={!valid || working} onPress={save} />
        <PrimaryButton title="Discard changes" secondary onPress={() => navigation.goBack()} />
        <View style={{ marginTop: 20 }}><PrimaryButton title="Log out" onPress={logOut} /></View>
        <Text style={styles.hint}>Logging out clears saved profile data from this device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Loading() {
  return (
    <SafeAreaView style={[styles.screen, styles.center]}>
      <ActivityIndicator color={colors.forest} size="large" />
      <Text style={[styles.muted, { marginTop: 15 }]}>Preparing Little Lemon…</Text>
    </SafeAreaView>
  );
}

export default function App() {
  const [db, setDb] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menu, setMenu] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    async function initialize() {
      try {
        const database = await getDatabase();
        const existingProfile = await loadProfile(database);
        const existingMenu = await loadMenu(database);
        if (live) {
          setDb(database);
          setProfile(existingProfile);
          setMenu(existingMenu);
          setReady(true);
        }
      } catch (e) {
        if (live) setError(String(e));
      }
    }
    initialize();
    return () => { live = false; };
  }, []);

  async function save(form) {
    await saveProfile(db, form);
    setProfile({ ...form });
  }

  async function logout() {
    await deleteProfile(db);
    setProfile(null);
  }

  if (error) {
    return <SafeAreaProvider><SafeAreaView style={[styles.screen, styles.center]}><Text style={styles.pageHeading}>Unable to start</Text><Text>{error}</Text></SafeAreaView></SafeAreaProvider>;
  }
  if (!ready) return <SafeAreaProvider><Loading /></SafeAreaProvider>;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator key={profile ? 'signed-in' : 'signed-out'} initialRouteName={profile ? 'Home' : 'Onboarding'} screenOptions={{ headerShown: false }}>
          {profile ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} profile={profile} menu={menu} />}
              </Stack.Screen>
              <Stack.Screen name="Profile" options={{ headerShown: true, title: 'Your Profile', headerTintColor: colors.forest }}>
                {(props) => <ProfileScreen {...props} profile={profile} onSave={save} onLogout={logout} />}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Onboarding">
              {(props) => <OnboardingScreen {...props} onFinish={save} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  center: { alignItems: 'center', justifyContent: 'center', padding: 30 },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  brandName: { fontSize: 22, color: colors.forest, fontWeight: '900', letterSpacing: 2 },
  onboardingContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  homeTop: { height: 68, justifyContent: 'space-between', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: colors.soft, width: 39, height: 39, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: 20, backgroundColor: colors.forest, minHeight: 192 },
  heroTitle: { color: colors.lemon, fontSize: 35, fontWeight: '800', fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }) },
  heroSubtitle: { color: colors.white, fontSize: 22, fontWeight: '700' },
  heroDescription: { color: colors.white, fontSize: 14, lineHeight: 20, width: '72%', marginTop: 10 },
  heroDish: { position: 'absolute', right: 14, top: 55, fontSize: 44 },
  searchInput: { backgroundColor: colors.white, borderRadius: 11, marginTop: 18, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, color: colors.charcoal },
  pageHeading: { fontSize: 24, fontWeight: '800', color: colors.charcoal, marginTop: 24, marginBottom: 5 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  field: { marginTop: 17 },
  fieldLabel: { color: colors.charcoal, fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#C4CECA', borderRadius: 10, fontSize: 16, paddingHorizontal: 12, paddingVertical: 12, color: colors.charcoal, backgroundColor: colors.white },
  button: { backgroundColor: colors.lemon, minHeight: 48, paddingHorizontal: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  secondaryButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.forest },
  disabledButton: { backgroundColor: '#D6D6D0' },
  buttonText: { color: '#1A2821', fontSize: 16, fontWeight: '800' },
  hint: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 12, lineHeight: 18 },
  menuHeader: { marginHorizontal: 16, paddingTop: 19, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16 },
  sectionHeading: { fontWeight: '900', color: colors.charcoal, fontSize: 17, marginBottom: 14 },
  categoriesRow: { gap: 8 },
  chip: { paddingVertical: 11, paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.soft },
  chipActive: { backgroundColor: colors.forest },
  chipText: { color: colors.forest, fontWeight: '800', fontSize: 13 },
  chipTextActive: { color: colors.white },
  menuCard: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 18, borderBottomColor: colors.border, borderBottomWidth: 1, gap: 12 },
  foodIcon: { height: 80, width: 80, borderRadius: 12, backgroundColor: '#F1F3EA', alignItems: 'center', justifyContent: 'center' },
  dishName: { fontSize: 17, fontWeight: '800', color: colors.charcoal },
  dishDescription: { marginTop: 5, fontSize: 13, lineHeight: 18, color: colors.muted },
  dishPrice: { marginTop: 10, fontSize: 14, fontWeight: '800', color: colors.forest },
  profileContent: { padding: 20, paddingBottom: 55 },
  profileHeader: { paddingVertical: 4 },
  profileAvatar: { backgroundColor: colors.forest, width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  checkboxRow: { alignItems: 'center', flexDirection: 'row', marginTop: 5, marginBottom: 12, gap: 10 },
  checkbox: { borderWidth: 1, borderColor: colors.forest, height: 23, width: 23, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.forest },
});
