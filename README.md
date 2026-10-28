# Call a Hero
App für kurzfristige Mitarbeiter-Abrufe, Arbeitsaufträge und Push-Benachrichtigungen.

Das neue Zielbild ohne E-Mail-Anmeldung ist in den
[Anforderungen für Call a Hero](docs/call-a-hero-anforderungen.md) festgehalten.
Es ist noch nicht implementiert.

## Projektstand

Die aktive mobile App liegt in `app/mobile` und verwendet Expo/React Native
(Expo SDK 54) sowie Supabase. `app/flutter_mobile_backup` ist ein älterer Stand.

Im Quellcode enthalten:

- Anmeldung und Registrierung sowie Rollen für Admin, Counter und Mitarbeiter.
- Filial- und Mitarbeiterverwaltung.
- Aufträge für Schichtvertretung, Fahrzeugüberführung und sofortige Unterstützung.
- Zusagen für Haupt- und Shuttle-Fahrer, Auftragsübersichten und Stornierung.
- Expo-Push-Token-Registrierung und die Edge Function `send-push`.
- EAS-Buildprofile für Development, interne Preview und Production.

Diese Übersicht beschreibt den Quellcode; ein vollständiger Test auf Geräten
und gegen das aktive Supabase-Projekt steht noch aus.

## Umbenennung in Call a Hero

Der Anzeigename in der Expo-Konfiguration, der Titel der Startseite und der
Standardtitel der Push-Funktion heißen jetzt **Call a Hero**.
Die bestehenden technischen Projektkennungen bleiben für die Weiterführung
derselben App erhalten (Expo-Slug `mobile`, EAS-Projekt-ID, iOS-Bundle-ID,
URL-Scheme und Supabase-Konfiguration).

Zur Übernahme sind ein neuer EAS-Build und die Bereitstellung der geänderten
Edge Function erforderlich. Bereits installierte Builds ändern ihren Namen
erst durch Installation des neuen Builds.
