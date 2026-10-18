# Agents.backend.md

Backend'e özgü kurallar. Genel kurallar için [../Agents.md](../Agents.md) dosyasına bak.

## Teknoloji

- .NET 10, ASP.NET Core **Minimal API** (controller kullanılmaz)
- OpenAPI: `Microsoft.AspNetCore.OpenApi` (`AddOpenApi` / `MapOpenApi`, yalnızca Development'ta)
- Proje dosyası: `webapi.csproj` (`Nullable` kapalı, `ImplicitUsings` açık)
- Veri şu an bellekte (in-memory) tutulur; veritabanı yoktur.

## Klasör Yapısı

```
backend/
├── Program.cs          # DI kayıtları, middleware, endpoint tanımları
├── Models/             # Veri modelleri / DTO'lar (namespace TodoApp.Models)
├── Services/           # İş mantığı (namespace TodoApp.Services)
├── appsettings.json
└── webapi.http         # Manuel endpoint testleri
```

Yeni bir endpoint grubu büyürse `Endpoints/` klasörü açıp extension method ile
(`app.MapTodoEndpoints()`) `Program.cs`'den ayır.

## Minimal API Kuralları

- Endpoint'ler `Program.cs` (veya extension method) içinde `app.MapGet/MapPost/MapPut/MapDelete` ile tanımlanır.
- Her endpoint'e `.WithName("...")` ver; isim `<Fiil><Kaynak>` biçiminde olsun (`GetTodos`, `CreateTodo`).
- Route'lar çoğul ve küçük harf: `/todos`, `/todos/{id}`.
- Servisler endpoint parametresi olarak DI ile alınır; `new` ile oluşturma.
- Doğru HTTP durum kodlarını `Results` / `TypedResults` ile döndür:
  `200 Ok`, `201 Created`, `204 NoContent`, `400 BadRequest`, `404 NotFound`.
- Endpoint içinde iş mantığı yazma; sadece request'i al, servisi çağır, sonucu döndür.
- Girdi doğrulaması endpoint seviyesinde yapılır (örn. boş `Text` için `400`).
- Gerektiğinde `.WithTags("Todos")`, `.Produces<T>()` ile OpenAPI dokümantasyonunu zenginleştir.

## Models

- Namespace: `TodoApp.Models`; dosya adı sınıf adıyla aynı (`Todo.cs`).
- Özellikler PascalCase; JSON'a camelCase serileşir (ASP.NET Core varsayılanı).
- Request/response için entity'den farklı bir şekil gerekiyorsa ayrı DTO (`CreateTodoRequest` gibi) oluştur; `Id` gibi alanları istemciden alma.
- Basit veri taşıyıcılar için `record` tercih edilebilir; mevcut `Todo` sınıfı ile tutarlılığı bozma.

## Services

- Namespace: `TodoApp.Services`; sınıf adı `<Kaynak>Service`.
- `Program.cs` içinde DI'a kaydedilir (`AddSingleton` / `AddScoped`). Durum tutan in-memory servis Singleton'dır.
- Tüm iş mantığı ve veri erişimi servislerde olur.
- Bellekteki liste birden fazla istekten erişildiği için thread-safety'e dikkat et (`lock` veya `ConcurrentDictionary`).
- Id üretimi için `_todos.Count + 1` kullanma (silme sonrası çakışır); artan bir sayaç kullan.
- Bulunamayan kayıt için sessizce geçmek yerine `bool` / `null` döndür ki endpoint `404` verebilsin.
- Servis kodu `HttpContext`'e bağımlı olmamalı.
- Veritabanına geçilirse servis arayüzü (`ITodoService`) çıkarılıp repository katmanı eklenir.

## CORS

- Şu an `AllowAnyOrigin` (geliştirme kolaylığı). Production'a çıkmadan önce yalnızca webapp origin'ine (örn. `http://localhost:3000`) kısıtla.
- Middleware sırası: `UseHttpsRedirection` → `UseCors` → endpoint'ler.

## Kod Stili

- C# standart isimlendirme: tipler/metotlar PascalCase, private alanlar `_camelCase`, parametreler camelCase.
- Dosya başına bir tip; `namespace` dosya kapsamlı (`namespace X;`) yazılır.
- Async I/O eklenirse metot adları `Async` ile biter ve `CancellationToken` kabul eder.
- Kullanılmayan `using`'leri temizle.

## Çalıştırma ve Doğrulama

```bash
cd backend
dotnet build          # derleme
dotnet run            # API'yi başlat
```

- Endpoint'leri `webapi.http` ile test et; yeni endpoint eklediğinde buraya örnek istek ekle.
- Development'ta OpenAPI dokümanı `/openapi/v1.json` adresinde yayınlanır.
- Webapp `http://localhost:5000` adresini bekler; port değişirse `webapp/src/api_client.ts` de güncellenmelidir.
