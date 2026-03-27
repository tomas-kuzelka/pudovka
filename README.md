# Pudovka 🧠🎮

**Pudovka** je moderní paměťová a vědomostní multiplayerová webová hra naprogramovaná v Reactu (s využitím Vite). Hra prozkouší nejen vaše vědomosti z nejrůznějších oblastí, ale i vaši schopnost riskovat pod tlakem!

## O čem hra je?
Cílem každého kola je najít na hrací kartě až 5 správných odpovědí z deseti možných a nahrát tak potřebné body dříve než soupeři. Unikátnost spočívá v tom, že **všichni hráči na tahu dostanou stejnou otázku a stejnou sadu zamíchaných možností** (samozřejmě pro každého zamíchanou do jiného pořadí). 

Čím více správných odpovědí hráč za sebou trefí, tím rychleji mu u bodů roste sčítací progrese (1, 2, 3, 4, 5  – maximálně tedy 15 bodů za turn).
Ale pozor! Pokud hráč kdykoliv narazí i jen na jedinou špatnou odpověď, ztrácí **všechny dosud nasbírané body z aktuálního tahu** a na řadu se dostává další! Kdykoliv se ale může rozhodnout svůj vabank zastavit a tlačítkem nastřádané těsně body "Nahrát (Uložit)".

## Hlavní funkce a technologie

* **React (Hooks, Functional Components):** Čistá architektura bez zbytečností, svižný a nemutovatelný state management.
* **Premium Design:** Použito moderní Vanilla CSS s glassmorphismem, dark mode rozhraním a pulzující spoustou drobných mikroanimací.
* **Progresivní bodování & Risk Mechanics:** Vynucuje taktizování. Odpovědět na pátou otázku vyžaduje notný kus odvahy.
* **Nativní syntetizátor zvuku:** Místo stahování ohromných .mp3 souborů má hra integrovaný inteligentní generátor oscilací Web Audio API, který dynamicky pípá v různých variacích a pro absolutní vítězství zahraje slavnostní Arpeggio triádu!
* **PWA podpora:** Hru lze přes příkaz `npm run build` sestavit jako plnohodnotnou **Mobile-Ready Aplikaci** nainstalovatelnou rovnou na domovskou obrazovku libovolného iOs / Android telefonu!
* **LocalStorage Saving:** Hra si pamatuje vypnutí/zapnutí zvuku, target score pro vítězství a jména kamarádů přidaných jako hráčů i po zavření prohlížeče. Konec neustálého zdlouhavého vyplňování.
* **Databáze:** Robustní JSON dataset s desítkami pečlivě vybraných otázek zahrnujících geografii, historii, IT a další témata.

## Jak hru spustit lokálně

1. Ujistěte se, že máte nainstalované **Node.js**:
2. Naklonujte repozitář a v příkazové řádce přejděte do složky projektu.
3. Instalace závislostí:  
   `npm install`  
   *(Poznámka: repozitář obsahuje `.npmrc` soubor, který automaticky řeší případné závislosti přes `legacy-peer-deps`, instalace by tak měla proběhnout hladce.)*
4. Spuštění vývojového serveru:  
   `npm run dev`
5. Spuštění mimo localhost pro hraní třeba na mobilu, který je na stejné síti:  
   `npm run dev -- --host`
6. Pro vytvoření produkčního / PWA mobilního buildu slouží příkaz:  
   `npm run build`

*Enjoy & May the smartest player win!*
