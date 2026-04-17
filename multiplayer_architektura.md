# Architektonický plán pro rozšíření aplikace Pudovka

Tento dokument detailně popisuje doporučené kroky, volbu technologií a dopady na současnou implementaci pro vytyčené cíle – online hru typu multiplayer přes internet a dynamické spravování databáze otázek.

## 1. Technologická volba pro Multiplayer (každý na vlastním zařízení)

Dosud hra funguje tak, že veškerá herní logika probíhá pouze v prohlížeči (frontendu) a všichni hrají s jedním displejem. Abychom to rozšířili, musíme hru rozdělit na vrstvu **Klienta** (hráčův telefon) a vrstvu vlastního **Serveru** (rozhodčí hry na pozadí).

### Návrh: Node.js (s Express.js) + WebSockets (zprostředkované enginem Socket.io)

**Proč tato kombinace?**
- **Sjednocený jazyk:** Vaše aplikace aktuálně běží v Reactu (tedy přes JavaScript/TypeScript). Nastavením serveru do **Node.js** zajistíte, že na obou stranách fronty budete používat stejný kód, stejné modely a logiku. 
- **Socket.io komunikace v reálném čase:** Ve hrách typu multiplayer "kdo nakliká rychleji" je zcela krizová odezva (latence). WebSockets udržují přímý tunel do serverového mozku a nevznikají prodlevy spojené s klasickým načítáním. Knihovna Socket.io má navýsost elegantně vyřešené takzvané koncepty "Rooms" (místnosti) – tudíž hráč, který založí hru obdrží kód (např. 1234), ostatní zadají kód a Socket.io pod pultem odjistí, že přesně tito lidé hrají mezi sebou a stavy se bleskurychle posílají na jejich přístroje.
- Není doporučeno využívat služby jako *Firebase* – model placených malých událostí se u her tohoto typu prodraží a WebSocket server je oproti tomu pod absolutní kontrolou.

## 2. Podpora obou režimů: Místní hra (Společný displej) vs. Síťová hra (Simultánní)

Vaše aplikace musí pojmout dva diametrálně odlišné způsoby hraní, což naštěstí s navrhovaným systémem lze velmi elegantně oddělit:

**REŽIM A: Společný displej (Lokální hra)**
Tento režim plynule naváže na to, co už máte nastavené. Hra se odstartuje a počítá vše lokálně v prohlížeči. Postupně v tazích (hráč A hraje, předá tah hráči B) – neprobíhá žádná složitá Socket komunikace! Pouze na začátku se při startu kola z Node.js backendu jednorázově stáhnou aktuální otázky (`GET /api/questions`), a samotná React aplikace už funguje plně tak jako doteď. Nelesne latence, může se odesílat na offline fungování v telefonu.

**REŽIM B: Síťová hra (Každý svůj telefon a najednou!)**
Zcela odlišný herní *pohyb*. Když uživatel zvolí v úvodním menu "Založit / Připojit do online hry", aktivuje se **WebSockets (Socket.io) modul**. React komponenty fungují jako "dálkové ovladače"! Jelikož všichni hrají *najednou*, backend zajistí synchronizaci:
- Všichni na svých telefonech zírají na stejnou otázku (backend nasadí časovač nebo synchronizaci).
- Lidé tipují současně. Můžeme to vymodelovat tak, že hrají svoji logiku (hledají 5 správných), nebo dokonce odpovídají jako závodníci nad stejnou deskou odpovědí, kdy prvním stisknutím např. "slíznou" bod za ostatní (záleží, jaké mechanismy přesně budete chtít využít).
- Rozhodčím, koho kliknutí přišlo rychleji, se stává server, který stav vrací na displeje.

Je tím pádem zaručené, že projekt **nebude zničen v předchozí práci**, ale pouze se pro větev Síťové hry vytvoří nový vizuální kabátek a ovladače komunikující s API.

### Realizace - Backend (Autoritativní Server pro Režim B)
1. Ponoříme se do vytvoření adresáře `server/` ve kterém postavíme Node.js aplikaci s nasloucháním na portu.
2. Vytvoříme Herní Manažer, který bude udržovat celkový stav v paměti RAM stroje (Seznam her na pozadí, pole hráčů v místnostech, jejich aktuální body, a běžící časovače pro střídání tahů).
3. Server vyčkává na připojení. Jakmile jeden hráč klikne "Založit místnost", backend ji paměťově alokuje a odesílá tzv. "Room Code"

### Změny ve Frontendu (React v prohlížeči)
1. **Lobby screen:** Aplikace se obohatí o uvítací okno `Vytvořit hru` a `Připojit do existující přes heslo`.
2. V instalátoru npm přidáme závislost `socket.io-client`. Přesouvání aktuální logiky vyhodnocení odpovědí zmizí z `GameScreen.jsx`.
3. Když hráč obdrží na své obrazovce otázku, React samotný vůbec neví, které odpovědi jsou správně. Bude na slepo čekat než se zaklikne okno. Ve chvíli zakliknutí na displeji odešle žádost po tenké lince do serveru: `socket.emit("ANSWER_SUBMIT", { odpověď: "Mount Everest", hrac: "Pavlina"})`. Backend okamžitě odpoví a teprve podle toho front-end zabarví obdélníky jako správně, či špatně. Konec podvodníkům!

---

## 3. Dynamické zásahy do `questions.json` a správa

Pudovka nyní staticky stahuje natvrdo umístěný `questions.json` přímo z klientské složky. Možnost síťového serveru nám to sice trochu zkomplikuje, ovšem také dává perfektní možnost se posunout dopředu. Na produkčním serveru zapisovat natvrdo data do JSON souboru, za běhu, se může chovat jako ruleta a působit pády ve čtení (navíc tam nedrží konzistentní IDčkování). 

### Návrh pro dynamickou databázi
Spolu s posíleným Node.js backendem obohatíme server o snadno zavedenou plnohodnotnou "embedovanou (vnořenou)" relační databázi z rodiny **SQLite**. Pro absolutně jasné čtení a zápis zapojíme moderní ORM překladač **Prisma**.
Veškeré otázky pak opustí přední klientskou část složky projektů a uloží se čistě pro oko serveru dovnitř této databáze.

### Plán Implementace přidávání
1. Backend nabídne bezpečný tzv. **REST API endpoint**, např. `POST -> /api/questions/add`. 
2. V React vrstvě vytvoříme úplně novou stránku / utajenou chráněnou složku pod jakýmsi např. `<AdminUI />` komponentem, do které se přistoupí buď vygenerovaným kódem, v nejlepším zabezpečením pomocí JSON Web Token (JWT hesla). Bude obsahovat robustní dotazovací formulář s řádkem na Otázku, 5 správných chytáků a hromadu nesprávných špatných.
3. Poté co bude formulář na Frontendu odeslán a prošel validací pole, zavolá API na serveru, kde si ho Prisma přečte a nasype rovnou na nejspodnější řádek Vaší nové databázové SQLite file tabulky (v reálném čase dostupný prvek bez restartování stroje po zásahu admina!).

---

## Shrnutí Vašeho projektu po provedení změn
Tato práce předpokládá výraznou strukturální mutaci čisté na frontend zaměřené webovky na takzvaný Full-Stack (Klient & Server obojí naráz) provoz. K rozběhnutí finální formy hry pro masové posílání kamarádům bude následně vyžadována platba za reálný 24/7 webhosting virtuálního systému (tzv. VPS serveru na platformách typu DigitalOcean, či na Cloud enginu u stránek typu Render.com viz $5/m).

Mohu s tím rovnou začít? 
1. Nejdříve založím `server/` složku rovnou ve Vašem stávajícím workspace s jednoduchým Express a WebSocketem pro testy a začneme napojovat klienty.
2. Pak se vrhneme na propojení s Administrátorským přidáváním a nasugerování otázek ze starého souboru do nového bezpečí serveru.
