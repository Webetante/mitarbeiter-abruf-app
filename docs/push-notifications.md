# Push-Benachrichtigungen

## Ziel

Die App nutzt Push-Benachrichtigungen, um Mitarbeiter schnell über neue Arbeitsaufträge zu informieren.

Außerdem erhält der Counter eine Push-Benachrichtigung, sobald ein Auftrag angenommen wurde.

## Technische Lösung

Für Push-Benachrichtigungen verwenden wir Firebase Cloud Messaging.

Supabase speichert:

- Benutzer
- Rollen
- Filialen
- Arbeitsaufträge
- Geräte-Token

Firebase Cloud Messaging versendet die Push-Nachrichten an Android- und iOS-Geräte.

## Geräte-Token

Jedes Handy erhält von Firebase einen eigenen Geräte-Token.

Dieser Token wird in der Tabelle device_tokens gespeichert.

Gespeichert werden:

- Benutzer-ID
- Geräte-Token
- Plattform, zum Beispiel android oder ios
- Status aktiv oder inaktiv
- Zeitpunkt der letzten Aktualisierung

## Push bei neuem Auftrag

Wenn ein Counter einen neuen Auftrag erstellt:

1. Der Auftrag wird in Supabase gespeichert.
2. Eine Supabase Edge Function wird aufgerufen.
3. Die Function sucht passende Mitarbeiter.
4. Die Function liest deren Geräte-Token.
5. Firebase Cloud Messaging sendet die Push-Nachricht.

Beispiel:

Titel: Neuer Arbeitsauftrag verfügbar

Text: Fahrzeugtransfer heute um 15:00 Uhr ab Filiale Hamburg

## Push bei Annahme eines Auftrags

Wenn ein Mitarbeiter einen Auftrag annimmt:

1. Die App ruft die Datenbankfunktion accept_job auf.
2. Supabase prüft, ob der Auftrag noch offen ist.
3. Der Auftrag wird dem Mitarbeiter zugeordnet.
4. Eine Supabase Edge Function informiert den Counter.
5. Der Counter erhält eine Push-Nachricht.

Beispiel:

Titel: Auftrag angenommen

Text: Max Mustermann hat den Auftrag Fahrzeugtransfer Hamburg nach Lübeck angenommen.

## Zielgruppen

Neue Aufträge werden zunächst an Mitarbeiter der passenden Filiale gesendet.

Spätere Erweiterungen:

- Mitarbeiter benachbarter Filialen
- Mitarbeiter mit passender Qualifikation
- Mitarbeiter mit hinterlegter Verfügbarkeit
- Mitarbeiter im Umkreis eines Einsatzortes

## Sicherheit

Firebase-Schlüssel dürfen nicht in der App gespeichert werden.

Deshalb versendet nicht die App selbst die Push-Nachrichten, sondern eine Supabase Edge Function.

Die App darf nur:

- eigenen Geräte-Token speichern
- Aufträge anzeigen
- Aufträge annehmen

Die serverseitige Function entscheidet, wer Push-Nachrichten erhält.

## Spätere Erweiterungen

Mögliche spätere Funktionen:

- Push bei Stornierung eines Auftrags
- Push bei Änderung der Uhrzeit
- Push bei Erinnerung kurz vor Start
- Push an Admin bei kritischen offenen Aufträgen
- Push an alle Counter einer Filiale
