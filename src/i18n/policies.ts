import { Lang } from './dictionaries'

type PolicyDoc = {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

type PolicySet = { privacy: PolicyDoc; terms: PolicyDoc }

export const policies: Record<Lang, PolicySet> = {
  hu: {
    privacy: {
      title: 'Adatkezelési tájékoztató',
      updated: 'Utolsó frissítés: 2026. június',
      intro: 'Ez a tájékoztató bemutatja, hogyan kezeli a CONTAIT KFT ("Contai", "mi") a személyes adataidat, amikor a Contai platformot használod. Kérdés esetén írj a hello@contai.market címre.',
      sections: [
        { heading: 'Ki kezeli az adataidat', body: ['Az adatkezelő a CONTAIT KFT. Az adatkezeléssel kapcsolatos kérdéseiddel a hello@contai.market címen fordulhatsz hozzánk.'] },
        { heading: 'Milyen adatokat gyűjtünk', body: ['Regisztrációs adatok: név, e-mail cím, és ha művészként regisztrálsz, profiladatok (bemutatkozás, város, technikák, képek).', 'Használati adatok: lefoglalt és megtekintett alkotások, kedvencek, üzenetek.', 'Fizetési adatok: a fizetést a Stripe dolgozza fel — a kártyaadataidat nem tároljuk, azokat közvetlenül a Stripe kezeli.'] },
        { heading: 'Miért kezeljük az adataidat', body: ['A szolgáltatás nyújtásához: fiók létrehozása, foglalások kezelése, művészek és vevők összekötése.', 'Kommunikációhoz: tranzakciókkal kapcsolatos értesítések.', 'Jogi kötelezettségek teljesítéséhez.'] },
        { heading: 'Kivel osztjuk meg', body: ['Szolgáltatókkal, akik segítenek a működésben: Supabase (adattárolás), Stripe (fizetés), Vercel (hosting). Ezek adatfeldolgozók, akik a mi utasításaink szerint járnak el.', 'A platformon belül: amikor lefoglalsz egy alkotást, a művész látja a foglaláshoz szükséges adataidat.'] },
        { heading: 'Üzenetek és kommunikáció', body: ['Alkalmazáson belüli üzenetküldést kínálunk, hogy a vásárlók és a művészek megszervezhessék az adásvételt. Felhasználóink védelme érdekében, valamint a foglalás és a hozzá tartozó Garancia megkerülésére tett kísérletek megelőzésére alkalmazásunk gépelés közben automatikusan ellenőrzi az üzenet szövegét olyan elemekre, amelyek telefonszámnak, e-mail-címnek vagy egyéb elérhetőségnek tűnnek, és emlékeztetőt jeleníthet meg, amely arra ösztönöz, hogy ezeket az adatokat az alkalmazáson belül tartsd. Ez az ellenőrzés gépelés közben a saját eszközödön történik; nem használjuk profilalkotásra, és e célból nem osztjuk meg az üzenetek tartalmát harmadik felekkel. Az üzeneteket tároljuk, hogy a beszélgetések működjenek és elérhetők maradjanak a résztvevők számára.'] },
        { heading: 'Meddig tároljuk', body: ['Az adataidat addig tároljuk, amíg a fiókod aktív, vagy ameddig jogszabály előírja. A fiókod törlését bármikor kérheted.'] },
        { heading: 'A te jogaid', body: ['Jogod van hozzáférni az adataidhoz, kérni azok helyesbítését vagy törlését, és tiltakozni a kezelésük ellen. Ehhez írj a hello@contai.market címre. Panaszt a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH) tehetsz.'] },
        { heading: 'Sütik', body: ['A bejelentkezés működéséhez szükséges sütiket használunk. Ezek nélkül a platform nem tudna működni.'] },
      ],
    },
    terms: {
      title: 'Felhasználási feltételek',
      updated: 'Utolsó frissítés: 2026. június',
      intro: 'Ezek a feltételek a Contai platform használatára vonatkoznak. A platform használatával elfogadod ezeket. A Contai üzemeltetője a CONTAIT KFT.',
      sections: [
        { heading: 'A Contai szerepe', body: ['A Contai egy közvetítő platform, amely összeköti a művészeket és a vevőket. A Contai nem az alkotások eladója — az adásvétel közvetlenül a művész és a vevő között jön létre. A Contai a foglalási szolgáltatásért díjat számít fel.'] },
        { heading: 'A foglalási díj', body: ['Amikor lefoglalsz egy alkotást, az ár 8%-át fizeted foglalási díjként. A fennmaradó összeget közvetlenül a művésznek fizeted a személyes találkozó során. A foglalási díjra a Contai Garancia vonatkozik.'] },
        { heading: 'A művészek felelőssége', body: ['A művészek felelősek a saját adózásukért és a feltöltött alkotások valódiságáért. A művész szavatolja, hogy jogosult az alkotás értékesítésére.'] },
        { heading: 'A vevők felelőssége', body: ['A vevő a személyes találkozó során megvizsgálja az alkotást a vásárlás véglegesítése előtt. Az átvétel után a vásárlás véglegesnek minősül.'] },
        { heading: 'Platformon kívüli tranzakciók', body: ['A foglalásokat és a vásárlásokat a Contain keresztül kell intézni. Az elérhetőségek megosztása annak érdekében, hogy az adásvétel a platformon kívülre kerüljön — a foglalási díj elkerülése vagy bármely más célból — nem támogatott, és a Contain kívül szervezett adásvételre nem vonatkozik a Contai Garancia. Felhasználóink védelme érdekében az alkalmazás észlelheti és megjelölheti az üzenetekben szereplő elérhetőségeket, és emlékeztethet arra, hogy a tranzakciót a Contain belül tartsd. Lépéseket tehetünk azon fiókokkal szemben, amelyek ismételten megpróbálják megkerülni a foglalási folyamatot.'] },
        { heading: 'Tiltott magatartás', body: ['Tilos hamis adatok megadása, mások adatainak visszaélésszerű használata, vagy a platform jogellenes célú használata.'] },
        { heading: 'Felelősségkorlátozás', body: ['A Contai a közvetítő szerepére korlátozott felelősséget vállal. A Contai Garancia feltételei szerint védjük a foglalási díjat, de a személyes találkozó és az átadás a felek között zajlik.'] },
        { heading: 'Módosítások', body: ['Ezeket a feltételeket időről időre frissíthetjük. A lényeges változásokról értesítünk.'] },
        { heading: 'Kapcsolat', body: ['Kérdés esetén írj a hello@contai.market címre.'] },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: June 2026',
      intro: 'This policy explains how CONTAIT KFT ("Contai", "we") handles your personal data when you use the Contai platform. For questions, contact hello@contai.market.',
      sections: [
        { heading: 'Who controls your data', body: ['The data controller is CONTAIT KFT. For any data-related questions, contact us at hello@contai.market.'] },
        { heading: 'What data we collect', body: ['Registration data: name, email address, and if you register as an artist, profile details (bio, city, mediums, images).', 'Usage data: artworks you reserve and view, favorites, messages.', 'Payment data: payments are processed by Stripe — we do not store your card details, they are handled directly by Stripe.'] },
        { heading: 'Why we process your data', body: ['To provide the service: creating your account, managing reservations, connecting artists and buyers.', 'To communicate: transaction-related notifications.', 'To meet legal obligations.'] },
        { heading: 'Who we share it with', body: ['Service providers who help us operate: Supabase (data storage), Stripe (payments), Vercel (hosting). These are data processors acting on our instructions.', 'Within the platform: when you reserve a piece, the artist sees the data needed for the reservation.'] },
        { heading: 'Messages and communications', body: ['We offer in-app messaging so buyers and artists can arrange a sale. To protect our users and prevent attempts to bypass the reservation and its Guarantee, our app automatically checks message text as it is typed for things that look like phone numbers, email addresses, or other contact details, and may show a reminder encouraging you to keep those details in the app. This check happens on your device as you type; we do not use it to build a profile of you, and we do not share message content with third parties for this purpose. Messages are stored so that conversations work and remain available to the people in them.'] },
        { heading: 'How long we keep it', body: ['We keep your data while your account is active or as required by law. You can request deletion of your account at any time.'] },
        { heading: 'Your rights', body: ['You have the right to access your data, request correction or deletion, and object to its processing. To do so, write to hello@contai.market. You may also lodge a complaint with the Hungarian data protection authority (NAIH).'] },
        { heading: 'Cookies', body: ['We use cookies necessary for login to function. Without these, the platform could not operate.'] },
      ],
    },
    terms: {
      title: 'Terms of Service',
      updated: 'Last updated: June 2026',
      intro: 'These terms govern your use of the Contai platform. By using the platform, you accept them. Contai is operated by CONTAIT KFT.',
      sections: [
        { heading: 'Contai\'s role', body: ['Contai is an intermediary platform connecting artists and buyers. Contai is not the seller of the artworks — the sale takes place directly between the artist and the buyer. Contai charges a fee for the reservation service.'] },
        { heading: 'The reservation fee', body: ['When you reserve a piece, you pay 8% of the price as a reservation fee. You pay the remaining amount directly to the artist at your in-person meeting. The reservation fee is covered by the Contai Guarantee.'] },
        { heading: 'Artists\' responsibilities', body: ['Artists are responsible for their own taxes and for the authenticity of the artworks they upload. The artist warrants that they have the right to sell the piece.'] },
        { heading: 'Buyers\' responsibilities', body: ['The buyer inspects the artwork at the in-person meeting before completing the purchase. Once collected, the purchase is final.'] },
        { heading: 'Off-platform transactions', body: ['Reservations and purchases must be arranged through Contai. Sharing contact details to move a sale off the platform — to avoid the reservation fee or otherwise — is discouraged, and any sale arranged outside Contai is not covered by the Contai Guarantee. To protect our users, the app may detect and flag contact information in messages and remind you to keep the transaction within Contai. We may take action on accounts that repeatedly attempt to bypass the reservation process.'] },
        { heading: 'Prohibited conduct', body: ['Providing false information, misusing others\' data, or using the platform for unlawful purposes is prohibited.'] },
        { heading: 'Limitation of liability', body: ['Contai\'s liability is limited to its role as intermediary. We protect the reservation fee under the Contai Guarantee, but the in-person meeting and handover take place between the parties.'] },
        { heading: 'Changes', body: ['We may update these terms from time to time. We will notify you of material changes.'] },
        { heading: 'Contact', body: ['For questions, write to hello@contai.market.'] },
      ],
    },
  },
  ro: {
    privacy: {
      title: 'Politica de confidențialitate',
      updated: 'Ultima actualizare: iunie 2026',
      intro: 'Această politică explică modul în care CONTAIT KFT ("Contai", "noi") gestionează datele tale personale când folosești platforma Contai. Pentru întrebări, contactează hello@contai.market.',
      sections: [
        { heading: 'Cine îți controlează datele', body: ['Operatorul de date este CONTAIT KFT. Pentru orice întrebare legată de date, contactează-ne la hello@contai.market.'] },
        { heading: 'Ce date colectăm', body: ['Date de înregistrare: nume, adresă de e-mail și, dacă te înregistrezi ca artist, detalii de profil (descriere, oraș, tehnici, imagini).', 'Date de utilizare: lucrările pe care le rezervi și le vizualizezi, favorite, mesaje.', 'Date de plată: plățile sunt procesate de Stripe — nu stocăm datele cardului tău, acestea sunt gestionate direct de Stripe.'] },
        { heading: 'De ce procesăm datele tale', body: ['Pentru a furniza serviciul: crearea contului, gestionarea rezervărilor, conectarea artiștilor și cumpărătorilor.', 'Pentru comunicare: notificări legate de tranzacții.', 'Pentru a respecta obligațiile legale.'] },
        { heading: 'Cu cine le partajăm', body: ['Furnizori de servicii care ne ajută să funcționăm: Supabase (stocare date), Stripe (plăți), Vercel (hosting). Aceștia sunt procesatori de date care acționează conform instrucțiunilor noastre.', 'În cadrul platformei: când rezervi o lucrare, artistul vede datele necesare pentru rezervare.'] },
        { heading: 'Mesaje și comunicări', body: ['Oferim mesagerie în aplicație pentru ca cumpărătorii și artiștii să poată organiza o vânzare. Pentru a ne proteja utilizatorii și a preveni încercările de a ocoli rezervarea și Garanția aferentă, aplicația noastră verifică automat textul mesajului pe măsură ce este scris, pentru elemente care par a fi numere de telefon, adrese de e-mail sau alte date de contact, și poate afișa un memento care încurajează păstrarea acestor detalii în aplicație. Această verificare are loc pe dispozitivul tău în timp ce scrii; nu o folosim pentru a crea un profil despre tine și nu partajăm conținutul mesajelor cu terți în acest scop. Mesajele sunt stocate pentru ca conversațiile să funcționeze și să rămână disponibile persoanelor implicate.'] },
        { heading: 'Cât timp le păstrăm', body: ['Păstrăm datele tale cât timp contul este activ sau conform cerințelor legale. Poți solicita ștergerea contului oricând.'] },
        { heading: 'Drepturile tale', body: ['Ai dreptul de a accesa datele tale, de a solicita corectarea sau ștergerea lor și de a te opune procesării. Pentru aceasta, scrie la hello@contai.market. Poți depune și o plângere la autoritatea maghiară de protecție a datelor (NAIH).'] },
        { heading: 'Cookie-uri', body: ['Folosim cookie-uri necesare pentru funcționarea autentificării. Fără acestea, platforma nu ar putea funcționa.'] },
      ],
    },
    terms: {
      title: 'Termeni și condiții',
      updated: 'Ultima actualizare: iunie 2026',
      intro: 'Acești termeni reglementează utilizarea platformei Contai. Prin utilizarea platformei, îi accepți. Contai este operat de CONTAIT KFT.',
      sections: [
        { heading: 'Rolul Contai', body: ['Contai este o platformă intermediară care conectează artiști și cumpărători. Contai nu este vânzătorul lucrărilor — vânzarea are loc direct între artist și cumpărător. Contai percepe o taxă pentru serviciul de rezervare.'] },
        { heading: 'Taxa de rezervare', body: ['Când rezervi o lucrare, plătești 8% din preț ca taxă de rezervare. Plătești suma rămasă direct artistului la întâlnirea personală. Taxa de rezervare este acoperită de Garanția Contai.'] },
        { heading: 'Responsabilitățile artiștilor', body: ['Artiștii sunt responsabili pentru propriile taxe și pentru autenticitatea lucrărilor încărcate. Artistul garantează că are dreptul de a vinde lucrarea.'] },
        { heading: 'Responsabilitățile cumpărătorilor', body: ['Cumpărătorul inspectează lucrarea la întâlnirea personală înainte de a finaliza achiziția. După ridicare, achiziția este finală.'] },
        { heading: 'Tranzacții în afara platformei', body: ['Rezervările și achizițiile trebuie organizate prin Contai. Partajarea datelor de contact pentru a muta o vânzare în afara platformei — pentru a evita taxa de rezervare sau din orice alt motiv — nu este încurajată, iar orice vânzare organizată în afara Contai nu este acoperită de Garanția Contai. Pentru a ne proteja utilizatorii, aplicația poate detecta și semnala informațiile de contact din mesaje și îți poate reaminti să păstrezi tranzacția în Contai. Putem lua măsuri împotriva conturilor care încearcă în mod repetat să ocolească procesul de rezervare.'] },
        { heading: 'Conduită interzisă', body: ['Furnizarea de informații false, utilizarea abuzivă a datelor altora sau folosirea platformei în scopuri ilegale este interzisă.'] },
        { heading: 'Limitarea răspunderii', body: ['Răspunderea Contai este limitată la rolul său de intermediar. Protejăm taxa de rezervare conform Garanției Contai, dar întâlnirea personală și predarea au loc între părți.'] },
        { heading: 'Modificări', body: ['Putem actualiza acești termeni din când în când. Te vom notifica despre modificările importante.'] },
        { heading: 'Contact', body: ['Pentru întrebări, scrie la hello@contai.market.'] },
      ],
    },
  },
}

export function getPolicy(lang: Lang, which: 'privacy' | 'terms'): PolicyDoc {
  return policies[lang]?.[which] || policies.hu[which]
}