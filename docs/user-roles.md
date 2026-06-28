# Nutzerrollen und Rechte

Die App hat drei Hauptrollen:

- Admin
- Counter
- Mitarbeiter

## Admin

Der Admin hat vollständigen Zugriff auf das System.

### Darf sehen

- alle Filialen
- alle Benutzer
- alle Counter
- alle Mitarbeiter
- alle offenen Aufträge
- alle angenommenen Aufträge
- alle erledigten Aufträge
- alle stornierten Aufträge
- komplette Auftragshistorie

### Darf verwalten

- Filialen anlegen und bearbeiten
- Benutzer aktivieren und deaktivieren
- Rollen vergeben
- Counter einer Filiale zuordnen
- Mitarbeiter einer Filiale zuordnen
- Aufträge prüfen
- Auswertungen einsehen

## Counter

Der Counter arbeitet für eine bestimmte Filiale oder Station.

### Darf sehen

- eigene Filiale
- Mitarbeiter der eigenen Filiale
- offene Aufträge der eigenen Filiale
- angenommene Aufträge der eigenen Filiale
- vergangene Aufträge der eigenen Filiale

### Darf erstellen

- neue Arbeitsaufträge für die eigene Filiale

### Darf erhalten

- Push-Benachrichtigung, wenn ein Auftrag angenommen wurde

### Darf nicht

- Aufträge anderer Filialen sehen
- Mitarbeiter anderer Filialen verwalten
- Admin-Rechte vergeben

## Mitarbeiter

Der Mitarbeiter kann kurzfristige Arbeitsaufträge annehmen.

### Darf

- sich registrieren
- eigenes Profil bearbeiten
- eigene Filiale auswählen
- Push-Benachrichtigungen erhalten
- offene Aufträge der eigenen Filiale sehen
- Auftrag annehmen
- eigene angenommene Aufträge sehen

### Darf nicht

- Aufträge erstellen
- Aufträge anderer Filialen sehen
- andere Mitarbeiter verwalten
- Rollen ändern
- fremde Profile sehen

## Rollenlogik

Neue Benutzer erhalten standardmäßig die Rolle employee.

Die Rollen counter und admin dürfen nur durch einen Admin vergeben werden.

## Sicherheit

Die App nutzt Supabase Row Level Security.

Das bedeutet:

- Die App kann nicht einfach beliebige Daten abrufen.
- Die Datenbank prüft bei jeder Anfrage die Rolle des Benutzers.
- Mitarbeiter sehen nur Daten, die für sie erlaubt sind.
- Counter sehen nur Daten ihrer Filiale.
- Admins sehen alles.

## Rollen in der Datenbank

Die Rollen werden in der Tabelle profiles gespeichert:

- admin
- counter
- employee
