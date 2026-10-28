# Call a Hero – Anforderungen

Stand: 28.10.2026. Diese Datei beschreibt das neue Zielbild. Die bestehende
App verwendet noch E-Mail-Anmeldung; die folgenden Abläufe sind noch nicht implementiert.

## Festgelegter Umfang

- Kostenlos für Nutzer, keine Werbung, kein Werbetracking und keine Verhaltensanalyse.
- Keine E-Mail-Adresse, keine Telefonnummer und keine Einladungen per E-Mail.
- Ein Mitarbeiter lädt die App über einen QR-Code mit Store-Link herunter.
- Beitritt mit Stationscode, gemeinsamem Stationskennwort und frei gewähltem
  Anzeigenamen. Ein Alias ist ausreichend; ein Klarname bleibt freiwillig.
- Jeder neue Stationsbeitritt erhält serverseitig die Rolle Mitarbeiter.
- Nur Admins der jeweiligen Station dürfen Rollen auf Counter oder Admin ändern.
- Admins erstellen und verwalten ihre eigene Station und können Mitglieder entfernen.
- Admins und Counter erstellen Aufgaben. Mitarbeiter sehen und übernehmen Aufgaben
  ihrer Station. Bestehende Auftragsarten einschließlich Shuttle bleiben erhalten.
- Jede Station bildet eine getrennte Berechtigungsgrenze, auch für Admins.

## Einfacher Mitarbeiterablauf

1. QR-Code mit der normalen Handykamera scannen und den passenden Store öffnen.
2. App installieren und „Station beitreten“ wählen.
3. Stationscode, Stationskennwort und Anzeigename eingeben. Keine Rollenwahl.
4. Nach erfolgreichem Beitritt kurz erläutern, wofür Benachrichtigungen gebraucht
   werden; erst anschließend die Betriebssystemfreigabe anfragen.
5. Direkt die offenen Aufgaben sehen. Hauptnavigation: „Offene Aufgaben“,
   „Meine Zusagen“ und „Einstellungen“.

Ein QR-Code enthält niemals das gemeinsame Kennwort oder einen Admin-Zugang.
Der Stationscode kann sichtbar auf demselben Aushang stehen und manuell eingegeben
werden. Automatische Übernahme nach einer Erstinstallation ist kein vorausgesetztes
Store-Verhalten; der manuelle Weg muss immer funktionieren.

Die Anmeldung bleibt auf dem Gerät erhalten. Erneutes Öffnen der App erzeugt
keinen neuen Mitarbeiter und setzt bestehende Admin-/Counterrollen nicht zurück.
Wird Push abgelehnt, bleibt die Aufgabenansicht mit manueller Aktualisierung nutzbar.

## Station einrichten und verwalten

„Neue Station einrichten“ ist ein eigener Ablauf. Der Server erzeugt die Station
und ordnet ausschließlich ihren Ersteller als ersten Admin zu. Dies ist der
Bootstrap der Station, keine Möglichkeit, beim Beitritt zu einer bestehenden
Station eine Adminrolle zu wählen.

Der Admin erhält Stationscode, änderbares Stationskennwort, Download-QR-Code
und einen einmal angezeigten Wiederherstellungscode. Der Wiederherstellungscode
ist getrennt vom Mitarbeiterkennwort aufzubewahren; es gibt keine Wiederherstellung
per E-Mail. Ohne Adminzugang oder Wiederherstellungscode darf kein Zugang über
die bloße Kenntnis des Stationskennworts übernommen werden.

Die Mitgliederliste zeigt Alias und Rolle mit verständlichen Aktionen:
„Rolle ändern“ und „Zugang entfernen“. Der letzte aktive Admin kann weder entfernt
noch herabgestuft werden. Kritische Aktionen benötigen eine klare Bestätigung.
Ein Counter darf weder Mitglieder verwalten noch Rollen oder Stationszugänge ändern.

Ein entferntes Mitglied verliert sofort den Zugriff; seine Sitzungen und Push-Ziele
werden widerrufen. Aufgaben bleiben ohne unnötige personenbezogene Zuordnungen
erhalten, soweit für den Betriebsablauf erforderlich. Die genauen Löschfristen
sind vor Produktivbetrieb festzulegen und technisch umzusetzen.

**Grenze des gemeinsamen Kennworts:** Wer weiterhin das Stationskennwort kennt,
kann sich nach einer Entfernung erneut als neuer Mitarbeiter anmelden. Eine
dauerhafte Sperre derselben natürlichen Person ist ohne zusätzliche Identifizierung
nicht verlässlich möglich. Der Admin kann das Stationskennwort wechseln. Neu
beitretende Geräte erhalten auch dann keine alten privilegierten Rollen.

## Identität und minimale Daten

Der Alias ist ein Anzeigename, kein Anmeldebeweis. Auch ein Push-Token ist kein
Anmeldetoken: Er kann sich ändern und darf keine Zugriffsrechte verleihen.
Eine gerätegebundene Sitzung identifiziert das Mitglied; Sitzungsschlüssel werden
im geschützten Gerätespeicher abgelegt. Auf einem neuen Gerät darf die Eingabe
eines bereits vorhandenen Alias niemals das alte Konto oder seine Rechte öffnen.

Für den Betrieb sind neben dem optionalen Anzeigenamen mindestens eine zufällige
Mitgliedskennung, Stationszuordnung, Rolle, Zugangsstatus und bei freigegebenem Push
ein Zustelltoken nötig. Hinzu kommen die notwendigen Auftragsdaten und Zusagen.
Kennwörter und Wiederherstellungscodes werden nur als sichere Hashwerte gespeichert.

Keine Kontakte, Werbe-IDs, Standortverfolgung, Geburtsdaten, Telefonnummern oder
E-Mail-Adressen erfassen. Keine Tokens, Kennwörter oder vollständigen Auftragstexte
in Protokolle schreiben. Technische Infrastrukturprotokolle und ihre Aufbewahrung
ebenfalls prüfen; keine pauschale Zusage „keine Daten“ oder „keine IP-Verarbeitung“.

Die zutreffende Beschreibung ist **datensparsam und pseudonym**, nicht vollständig
anonym. Alias, Gerätekennungen und zugeordnete Zusagen können personenbezogen sein.
Datenschutzhinweise, Dienstleisterverträge und Store-Datenangaben müssen die
tatsächliche Verarbeitung einschließlich Push-Diensten abbilden. „Kein Tracking“
bedeutet nicht automatisch „keine Datenerhebung“.

Vorgeschlagener datensparsamer Push-Standard: „Call a Hero – Neue Aufgabe verfügbar“;
Details erst nach Öffnen der authentifizierten App. Hinweise bei Auftragsbeschreibungen
sollen unnötige Namen und Gesundheitsangaben vermeiden; „Schichtvertretung“ statt
„Mitarbeiter X krank“. Diese Texte sind Teil des anstehenden Umbaus.

## Serverseitig zu prüfende Sicherheit

- Stationscode und Kennwort vor jeder erstmaligen Mitgliedschaft prüfen.
- Fehlversuche begrenzen; Stationscodes und Kennwörter dürfen nicht über öffentliche
  Tabellenabfragen ausgelesen werden. Keine offene Liste sämtlicher Stationen.
- Rolle und Station aus vertrauenswürdigen Daten ableiten; niemals Rollen aus
  Formularen oder vom Nutzer editierbaren Metadaten übernehmen.
- Alle Datenbankregeln, Verwaltungsfunktionen und Push-Endpunkte an die aktive
  Mitgliedschaft und deren Station binden, auch für Admins.
- Rollenänderungen und Sperren müssen bei der nächsten Serveroperation wirksam sein,
  selbst wenn ein altes Zugriffstoken noch nicht abgelaufen ist.
- Aufgabenübernahme atomar durchführen, damit zwei gleichzeitige Zusagen keine
  unzulässige Doppelbelegung verursachen.
- App-eigene Löschfunktion und sichere Behandlung des letzten Admins vorsehen.
- Missbrauchsschutz auch für das Erstellen neuer Stationen vorsehen.

## Store-Verteilung

**Apple:** Ziel ist Unlisted App Distribution. Nach App Review und Genehmigung
ist die App über einen Direktlink verfügbar, ohne Suchtreffer oder Store-Listen.
Auch private, nicht verwaltete Geräte werden unterstützt. Jeder mit dem Link
kann die App herunterladen; die Stationsanmeldung schützt die eigentlichen Inhalte.

**Google:** Private Apps in Managed Google Play sind für festgelegte Organisationen
und verwaltete Unternehmensumgebungen vorgesehen. Eine gleichwertige, dauerhafte
Unlisted-Verteilung für beliebige private Geräte ist durch die geprüfte Dokumentation
nicht belegt. Öffentliches Play-Listing würde die Vorgabe „nicht auffindbar“ nicht
erfüllen und wird nicht stillschweigend als Ersatz beschlossen.

Interne/geschlossene Tests sind keine dauerhafte Produktionsverteilung; sie arbeiten
unter anderem mit Testerlisten bzw. Google Groups. Interne App-Freigabe hat unter
anderem begrenzte Downloadlinks und ist ebenfalls kein gleichwertiger Dauerweg.
Die Android-Verteilungsentscheidung hängt daher davon ab, ob verwaltete Geräte
verwendet werden. Store-Konten der Nutzer sind von einem App-Konto getrennt:
Call a Hero erhält dadurch keine E-Mail-Adresse des Store-Kontos.

Kostenloser Download bedeutet keine Zusage eines kostenlosen Betriebs oder
kostenloser Entwicklerkonten. Eine Store-Veröffentlichung ist noch nicht erfolgt.

## Abnahme vor einer Veröffentlichung

1. Neuanmeldung ohne E-Mail/Telefon; keine Rollenwahl und kein Klarnamenzwang.
2. Erneuter App-Start behält Identität und Rolle; gleiche Alias-Eingabe auf einem
   anderen Gerät übernimmt keine fremde Identität.
3. Admin kann eigene Station verwalten und Counter/Admin ernennen; Mitarbeiter
   und Counter können diese Funktionen auch per direktem API-Aufruf nicht nutzen.
4. Mitglieder und Admins von Station A können keine Daten von Station B lesen,
   ändern, Aufgaben übernehmen oder Push an deren Mitglieder auslösen.
5. Entfernte Mitglieder haben mit alten Sitzungen keinen Zugriff und erhalten
   keine neuen Push-Nachrichten. Letzter Admin bleibt wiederherstellbar.
6. Wechsel des Stationskennworts verhindert neue Beitritte mit dem alten Kennwort.
7. Verweigerte Benachrichtigungen, Netzfehler und bereits vergebene Aufträge haben
   verständliche Zustände; Doppeltippen erzeugt keine doppelten Aktionen.
8. Keine Tracking-SDKs oder Werbung; tatsächliche Datenflüsse, Löschung und
   Store-Datenschutzangaben sind geprüft. Geräte- und Push-Test auf iOS/Android.

## Grenzen des vorhandenen Quellstands

Die Version vom 29.06.2026 enthält E-Mail-Anmeldung und Name-/Telefonfelder.
Die eingecheckten SQL-Dateien decken außerdem nicht alle vom aktuellen Frontend
aufgerufenen Funktionen und Tabellen ab. Vor dem Umbau muss das aktive Datenbankschema
mit dem Repository abgeglichen werden. Die bisherige Adminberechtigung ist global
formuliert und muss durch Stationsgrenzen ersetzt werden. Eine Änderung allein
an den Formularen erfüllt diese Anforderungen nicht.

## Geprüfte Quellen

- Apple Unlisted Distribution: https://developer.apple.com/support/unlisted-app-distribution/
- Google Private Apps: https://support.google.com/googleplay/android-developer/answer/9874937
- Google Tests: https://support.google.com/googleplay/android-developer/answer/9845334
- Google Internal App Sharing: https://support.google.com/googleplay/android-developer/answer/9844679
- Apple Datenschutzangaben: https://developer.apple.com/app-store/app-privacy-details/
- DSGVO, insbesondere Art. 4 sowie Erwägungsgründe 26 und 30:
  https://eur-lex.europa.eu/eli/reg/2016/679/oj
