# 🍔 FoodApp — system zamawiania jedzenia online

Pełnostackowa aplikacja webowa do zamawiania jedzenia z restauracji — z panelami dla
klienta, właściciela restauracji oraz administratora. Backend w **Spring Boot**,
frontend w **React**, autoryzacja oparta o **JWT**.

> 🎓 **Projekt zespołowy, studencki**, zrealizowany w ramach przedmiotu
> *Laboratorium specjalistyczne*. Aplikacja powstała jako praca grupowa —
> backend i frontend rozwijane były równolegle i zintegrowane w jedno repozytorium.

---

## 📑 Spis treści

- [Funkcjonalności](#-funkcjonalności)
- [Role użytkowników](#-role-użytkowników)
- [Stack technologiczny](#-stack-technologiczny)
- [Struktura projektu](#-struktura-projektu)
- [Wymagania](#-wymagania)
- [Uruchomienie](#-uruchomienie)
- [Konfiguracja](#-konfiguracja)
- [API — najważniejsze endpointy](#-api--najważniejsze-endpointy)
- [Funkcje warte uwagi](#-funkcje-warte-uwagi)
- [Zespół](#-zespół)

---

## ✨ Funkcjonalności

- **Rejestracja i logowanie** użytkowników z tokenem JWT
- **Przeglądanie restauracji** i ich menu (kategorie, opisy, ceny, zdjęcia)
- **Koszyk** z modyfikacją ilości i składaniem zamówienia
- **Wybór adresu dostawy** — ręcznie lub przez **interaktywną mapę**
- **Kalkulacja trasy dostawy** (odległość w km i szacowany czas) na podstawie
  realnych dróg
- **Historia zamówień** klienta ze statusami
- **Panel właściciela** — zarządzanie restauracją, menu, zamówieniami i
  **raportem sprzedaży** (przychód, najlepiej sprzedające się dania)
- **Panel administratora** — zatwierdzanie restauracji, podgląd szczegółów
  właściciela i menu, historia wszystkich zamówień, ręczne dodawanie restauracji
- **Upload zdjęć** restauracji i dań
- **Alergeny i poziom ostrości** dań

---

## 👥 Role użytkowników

| Rola | Uprawnienia |
|------|-------------|
| **USER** (klient) | przeglądanie restauracji, koszyk, składanie i śledzenie zamówień |
| **OWNER** (właściciel) | zarządzanie własną restauracją, menu, obsługa zamówień, raport sprzedaży |
| **ADMIN** | zatwierdzanie/odrzucanie restauracji, podgląd wszystkich zamówień, ręczne dodawanie restauracji |

---

## 🛠 Stack technologiczny

**Backend**
- Java 21, Spring Boot 3.5
- Spring Web, Spring Data JPA, Spring Security
- JWT (jjwt 0.12)
- MySQL / MariaDB
- Lombok
- Maven (z wrapperem `mvnw`)

**Frontend**
- React 18 (Create React App)
- React Router 6
- Axios
- CSS Modules
- Leaflet + OpenStreetMap (wybór adresu na mapie)

**Usługi zewnętrzne (open-source, bez kluczy API)**
- **Nominatim** (OpenStreetMap) — geokodowanie adresów (adres → współrzędne)
- **OSRM** — wyznaczanie trasy dojazdu (odległość i czas dostawy)

---

## 📂 Struktura projektu

Repozytorium łączy backend i frontend w jednym drzewie:

```
.
├── pom.xml                      # konfiguracja Maven (backend)
├── package.json                 # zależności npm (frontend)
├── .env                         # zmienne środowiskowe frontendu
├── src/
│   ├── main/
│   │   ├── java/com/foodorder/foodorderapp/
│   │   │   ├── controller/      # kontrolery REST
│   │   │   ├── service/         # logika biznesowa
│   │   │   ├── repository/      # repozytoria JPA
│   │   │   ├── entity/          # encje (User, Restaurant, Order, ...)
│   │   │   ├── dto/             # obiekty transferowe
│   │   │   ├── auth/            # logowanie / rejestracja / JWT
│   │   │   └── config/          # konfiguracja (security, zasoby statyczne)
│   │   └── resources/
│   │       └── application.properties
│   │
│   ├── api/                     # klienci HTTP (axios) — komunikacja z backendem
│   ├── components/              # komponenty wielokrotnego użytku (Navbar, Button, MapPicker, ...)
│   ├── context/                 # konteksty React (Auth, Cart)
│   ├── pages/                   # widoki: client / owner / admin / shared / public
│   ├── routes/                  # routing i ochrona tras wg ról
│   └── utils/                   # funkcje pomocnicze (formatowanie, walidacja)
│
├── public/                      # statyczne pliki CRA
└── uploads/                     # przesłane zdjęcia (tworzone automatycznie, poza repo)
```

---

## ✅ Wymagania

- **JDK 21**
- **Node.js 18+** oraz npm
- **MySQL** lub **MariaDB** (np. z pakietu XAMPP) z bazą `fr_base`

---

## 🚀 Uruchomienie

### 1. Baza danych

Utwórz bazę `fr_base` w MySQL/MariaDB. Aplikacja ma ustawione
`spring.jpa.hibernate.ddl-auto=none`, więc **nie tworzy tabel automatycznie** —
schemat bazy musi istnieć przed startem (struktura zgodna z encjami z
`src/main/java/.../entity`).

Domyślne połączenie (do zmiany w `application.properties`):
- host: `127.0.0.1:3306`, baza: `fr_base`, użytkownik: `root`, hasło: *(puste)*

### 2. Backend (port 8080)

```bash
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```

### 3. Frontend (port 3000)

```bash
npm install
npm start
```

Frontend działa na `http://localhost:3000` i komunikuje się z backendem
na porcie 8080 (skonfigurowane przez `proxy` w `package.json` oraz
`REACT_APP_API_URL` w `.env`).

---

## ⚙️ Konfiguracja

**Backend** — `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/fr_base
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=none
server.port=8080
jwt.secret=...
jwt.expiration=86400000
```

**Frontend** — `.env`:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_USE_MOCK_AUTH=false
REACT_APP_USE_MOCK_DATA=false
```

> 🔒 Sekret JWT w repozytorium jest wartością deweloperską — w środowisku
> produkcyjnym należy go zastąpić własnym, bezpiecznym kluczem.

---

## 🔌 API — najważniejsze endpointy

**Autoryzacja**
- `POST /register` — rejestracja
- `POST /login` — logowanie (zwraca token JWT)

**Restauracje i menu**
- `GET /api/restaurants` — lista restauracji
- `GET /api/restaurants/{id}` — szczegóły restauracji
- `GET /api/restaurants/{restaurantId}/menu` — menu restauracji
- `GET /api/restaurants/my` — restauracja zalogowanego właściciela
- `GET /api/restaurant-categories`, `GET /api/menu-product-categories`

**Zamówienia**
- `POST /api/orders` — złożenie zamówienia
- `GET /api/orders/my` — zamówienia klienta
- `GET /api/orders/restaurant` — zamówienia restauracji (właściciel)
- `PATCH /api/orders/{id}/status` — zmiana statusu zamówienia
- `GET /api/orders/report` — raport sprzedaży właściciela

**Panel administratora**
- `GET /api/admin/restaurants`, `GET /api/admin/restaurants/{id}`
- `POST /api/admin/restaurants` — ręczne dodanie restauracji
- `PATCH /api/admin/restaurants/{id}/approve` — zatwierdzenie
- `PATCH /api/admin/restaurants/{id}/reject` — odrzucenie
- `GET /api/admin/orders` — historia wszystkich zamówień

**Profil**
- `GET /api/clients/me`, `PUT /api/clients/me`

---

## 🌟 Funkcje warte uwagi

- **Mapa wyboru adresu** (`MapPicker`) — interaktywna mapa Leaflet z kafelkami
  OpenStreetMap; klient stawia pinezkę, a aplikacja odczytuje adres (reverse
  geocoding przez Nominatim).
- **Obliczanie dostawy** — adresy restauracji i klienta zamieniane są na
  współrzędne (Nominatim), a trasa dojazdu (km i czas) wyliczana jest przez
  OSRM. Cała kalkulacja dzieje się po stronie frontendu; jest informacją
  pomocniczą i nie blokuje złożenia zamówienia.
- **Przechowywanie zdjęć** — pliki trafiają do katalogu `uploads/` i serwowane
  są przez backend pod `/uploads/**` oraz `/api/images/**`.
- **Ochrona tras po stronie frontendu** — komponent `ProtectedRoute` ogranicza
  dostęp do widoków zależnie od roli użytkownika.

---

## 👨‍💻 Zespół

Projekt został wykonany **zespołowo** przez grupę studentów w ramach przedmiotu
*Laboratorium specjalistyczne*. Praca obejmowała m.in. projekt bazy danych,
backend (REST API + bezpieczeństwo), frontend (UI/UX) oraz integrację obu warstw.

Lista współautorów dostępna jest w zakładce
[*Contributors*](https://github.com/kolosinski99/Integration_backend_frontend_FoodApp/graphs/contributors)
repozytorium.

---

> Projekt edukacyjny — przygotowany w celach dydaktycznych.
