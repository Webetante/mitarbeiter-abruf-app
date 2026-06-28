# Mitarbeiter-Abruf-App

## Ziel

Die App soll kurzfristige Arbeitsaufträge an registrierte Mitarbeiter senden. Mitarbeiter erhalten eine Push-Benachrichtigung, können den Auftrag ansehen und direkt annehmen.

Typische Fälle:

- Mitarbeiter ist krank und Ersatz wird benötigt
- zusätzlicher kurzfristiger Arbeitsaufwand
- Fahrzeugtransfer von einer Filiale zu einer anderen Filiale
- Unterstützung an einer Station oder Filiale

## Nutzerrollen

### Admin

Der Admin sieht und verwaltet alles:

- alle Filialen
- alle Mitarbeiter
- alle Counter
- alle offenen Aufträge
- alle vergangenen Aufträge
- Rollen und Benutzerstatus

### Counter

Der Counter arbeitet für eine oder mehrere Filialen:

- Auftrag für eigene Filiale erstellen
- offene Aufträge der eigenen Filiale sehen
- vergangene Aufträge der eigenen Filiale sehen
- Benachrichtigung erhalten, wenn ein Auftrag angenommen wurde

### Mitarbeiter

Der Mitarbeiter kann:

- sich registrieren
- eine Filiale auswählen
- Push-Benachrichtigungen erhalten
- offene Aufträge sehen
- Arbeitsauftrag annehmen
- eigene angenommene Aufträge sehen

## Hauptprozess

1. Counter erstellt einen neuen Arbeitsauftrag.
2. App speichert den Auftrag in Supabase.
3. Passende Mitarbeiter erhalten eine Push-Nachricht.
4. Mitarbeiter öffnet die App und sieht den Auftrag.
5. Mitarbeiter nimmt den Auftrag an.
6. Auftrag wird für andere Mitarbeiter gesperrt.
7. Counter erhält eine Push-Nachricht mit dem Namen des Mitarbeiters.
8. Auftrag erscheint später in der Historie.

## MVP-Funktionen

Die erste Version enthält:

- Registrierung und Login
- Filialauswahl für Mitarbeiter
- Rollen: Admin, Counter, Mitarbeiter
- Auftrag erstellen
- offene Aufträge anzeigen
- Auftrag annehmen
- Auftragshistorie
- Push-Nachrichten für neue Aufträge
- Push-Nachrichten bei Annahme eines Auftrags

## Technische Basis

- Flutter für Android und iOS
- Supabase für Auth, Datenbank, Rollen und Aufträge
- Firebase Cloud Messaging für Push-Nachrichten
- Supabase Edge Functions für serverseitige Logik
- GitHub für Code-Verwaltung
