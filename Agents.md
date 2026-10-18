# Agents.md

Bu dosya, repository üzerinde çalışan AI agent'ları ve geliştiriciler için genel kuralları içerir.
Alt projelere özgü kurallar için:

- Backend: [backend/Agents.backend.md](backend/Agents.backend.md)
- Web uygulaması: [webapp/Agents.webapp.md](webapp/Agents.webapp.md)

## Proje Yapısı

| Klasör     | Açıklama                                           |
|------------|----------------------------------------------------|
| `backend/` | ASP.NET Core (.NET 10) Minimal API                 |
| `webapp/`  | React + TypeScript web uygulaması (webpack ile)    |

Bir işe başlamadan önce ilgili alt projenin Agents dosyasını oku.

## Genel Kurallar

- İstenen işin kapsamında kal; istenmeyen refactor, yeniden adlandırma veya format değişikliği yapma.
- Mevcut kod stilini, isimlendirmeyi ve klasör yapısını takip et.
- Yeni bağımlılık eklemeden önce mevcut olanlarla çözülüp çözülemeyeceğini değerlendir.
- Secret, parola, token veya connection string'leri koda ya da commit'e koyma.
- Değişiklik yaptıktan sonra ilgili projeyi derle / typecheck et (komutlar alt proje dosyalarında).
- Kod içindeki yorumlar ve commit mesajları İngilizce olsun; kullanıcıya yanıtlar kullanıcının diliyle verilsin.

## Git Kuralları

- Ana branch: `main`. Doğrudan `main` üzerinde çalışma; her iş için ayrı branch aç.
- Branch isimleri: `feature/<kisa-aciklama>`, `fix/<kisa-aciklama>`, `chore/<kisa-aciklama>`.
- Commit mesajları kısa, emir kipinde ve İngilizce olsun (örn. `Add todo creation endpoint`). İlk satır ~72 karakteri geçmesin.
- Her commit tek bir mantıksal değişiklik içersin; ilgisiz değişiklikleri aynı commit'e koyma.
- Kullanıcı açıkça istemedikçe commit atma, push etme veya PR açma.
- `git push --force`, `git reset --hard`, `git clean -fd` gibi geri alınamaz komutları onay almadan çalıştırma.
- Hook'ları atlama (`--no-verify`) ve geçmişi yeniden yazma (`rebase`, `amend`) yalnızca açık talimatla yapılır.
- `git add .` yerine dosyaları tek tek ekle; `node_modules/`, `bin/`, `obj/`, `dist/` ve `.env` dosyaları commit'lenmemeli.
- Commit öncesi `git status` ve `git diff` ile neyin commit'lendiğini kontrol et.

## Pull Request

- PR başlığı commit mesajı kuralına uysun.
- Açıklamada ne değişti, neden değişti ve nasıl test edildi yazılsın.
- PR'lar küçük ve tek amaçlı tutulsun.

## API Sözleşmesi

- Backend ve webapp arasındaki sözleşme JSON üzerindendir; alan isimleri camelCase'dir (`id`, `text`, `done`).
- Backend modelinde bir alan değişirse `webapp/src/models` altındaki TypeScript tipi aynı değişiklikte güncellenmelidir.
- Endpoint değişikliklerinde `backend/webapi.http` dosyası da güncellenmelidir.
