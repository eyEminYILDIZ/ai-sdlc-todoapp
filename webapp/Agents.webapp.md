# Agents.webapp.md

Web uygulamasına özgü kurallar. Genel kurallar için [../Agents.md](../Agents.md) dosyasına bak.

## Teknoloji

- React 19 (function component + hooks), TypeScript 5 (`strict: true`)
- Axios ile HTTP istekleri
- Webpack 5 (`ts-loader`, `css-loader`, `style-loader`, `html-webpack-plugin`)

## Klasör Yapısı

```
webapp/src/
├── index.tsx        # Giriş noktası
├── App.tsx          # Kök bileşen
├── api_client.ts    # Axios istemcisi (tek örnek)
├── models/          # API'den gelen veri tipleri (index.ts barrel dosyası)
├── global.d.ts      # Global tip bildirimleri
└── styles.css
```

Büyüdükçe: `components/` (yeniden kullanılabilir UI), `hooks/` (custom hook'lar), `services/` (API çağrı fonksiyonları).

## React + TypeScript Kuralları

- Yalnızca function component kullan; class component yazma.
- Bileşen dosyaları PascalCase (`TodoItem.tsx`), bir dosyada bir ana bileşen.
- Bileşenler `export default` ile, diğer modüller named export ile dışa aktarılır (mevcut yapıya uy).
- Props için `interface` tanımla (`interface TodoItemProps`); `any` kullanma, gerekiyorsa `unknown` + daralt.
- `React.FC` yerine props'u parametrede tiple: `function TodoItem({ todo }: TodoItemProps)`.
- State tiplerini açıkça ver: `useState<Todo[]>([])`.
- Liste render'larında `key` olarak array `index` değil, kayıt `id`'si kullan (`key={todo.id}`).
- `useEffect` bağımlılık dizisini eksiksiz yaz; async işlemlerde temizlik (iptal / unmount kontrolü) ekle.
- Tekrar eden veri çekme / state mantığını custom hook'a (`useTodos`) taşı.
- Türetilebilen veriyi state'e koyma; render sırasında hesapla.
- Component içinde doğrudan Axios çağırmak yerine API fonksiyonlarını ayrı modüle (örn. `services/todo_service.ts`) çıkar.
- Loading ve hata durumlarını kullanıcıya göster; sadece `console.error` ile yetinme.
- Stil için `styles.css` kullanılır; satır içi stil sadece dinamik değerler için.

## Modeller

- API'den dönen her veri şekli için `src/models/` altında tip tanımla ve `models/index.ts` üzerinden dışa aktar.
- Tip alanları backend JSON'u ile birebir eşleşmeli (camelCase): `id`, `text`, `done`.
- Import'u barrel üzerinden yap: `import { Todo } from "./models";`.
- Tipler için `interface` kullan; backend modeli değişirse bu tipleri aynı değişiklikte güncelle.

## Axios İstemcisi

- Tüm HTTP istekleri [src/api_client.ts](src/api_client.ts) içindeki tek `ApiClient` örneği üzerinden yapılır; bileşenlerde `axios`'u doğrudan import etme.
- Ortak ayarlar (`baseURL`, `headers`, timeout, interceptor) yalnızca bu dosyada tutulur.
- `baseURL` kodda sabit yazılmak yerine build-time ortam değişkeninden (webpack `DefinePlugin`) okunmalıdır; varsayılan `http://localhost:5000`.
- İstekleri tiple: `ApiClient.get<Todo[]>("/todos")`; böylece `response.data` tipli gelir.
- Hata yönetimi: `axios.isAxiosError(error)` ile kontrol et, kullanıcıya anlaşılır mesaj göster.
- İptal gerektiğinde `AbortController` signal'ini isteğe ver (`{ signal }`), unmount'ta iptal et.
- Interceptor gerekiyorsa (auth token, global hata) `api_client.ts` içinde ekle.
- Endpoint yolları backend route'larıyla birebir aynı olmalı (`/todos`, `/todos/{id}`).

## Kod Stili

- İsimlendirme: bileşen ve tipler PascalCase, değişken/fonksiyonlar camelCase; mevcut dosya adları (`api_client.ts`) snake_case olduğundan yeni util/servis dosyalarında bu kalıbı koru.
- 2 boşluk girinti, çift tırnaklı string (mevcut `App.tsx` stili).
- `var` kullanma; `const` öncelikli, gerekirse `let`.
- Kullanılmayan import ve değişkenleri bırakma.

## Çalıştırma ve Doğrulama

```bash
cd webapp
npm install
npm start            # webpack dev server
npm run typecheck    # tsc --noEmit — değişiklikten sonra mutlaka çalıştır
npm run build        # production build
```

- Geliştirme sırasında backend'in (`http://localhost:5000`) çalışıyor olması gerekir.
- `typecheck` hatasız geçmeden işi tamamlanmış sayma.
