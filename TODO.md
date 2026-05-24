# ✅ YAPILAN / TAMAMLANAN

## 🔐 Kimlik Doğrulama (Auth)
- [x] Landing Page (giriş çağrısı, ürün tanıtımı)
- [x] Login (giriş) sayfası
- [x] Register (kayıt) sayfası
- [x] Forgot Password (şifremi unuttum) sayfası
- [x] Reset Password (şifre sıfırlama) sayfası
- [x] E-posta doğrulama maili kaldırıldı → kayıt olunca direkt sisteme giriş yapılıyor
- [x] "Şifremi Unuttum" ekranında email enumeration güvenlik standardı uygulandı (nötr mesaj)
- [x] PrivateRoute koruması → giriş yapmadan sayfalara erişim engellendi
- [x] Supabase Auth entegrasyonu (oturum yönetimi)

## 🎨 Arayüz (UI / Frontend)
- [x] Dashboard (Ana Kontrol Paneli) sayfası
- [x] Authoring Mode (Yazım Modu) sayfası
- [x] Review Mode (İnceleme Modu) sayfası
- [x] Profile (Profil) sayfası
- [x] Sidebar (yan menü) bileşeni
- [x] ThemeToggle (karanlık/aydınlık mod) bileşeni
- [x] DownloadMenu (dışa aktarma menüsü) bileşeni
- [x] Son dökümanlar kısmında bir dökümana tıklandığında authoring sayfasına yönlendirme
- [x] Şablon değiştirilince AI Chat geçmişi ve analiz sonuçları otomatik temizleniyor
- [x] Authoring'de ilerleme çubuğu (Progress Bar) içerik doluluğuna göre dolup boşalıyor
- [x] Authoring'de İçindekiler (TOC) sayfası ve Revizyon Geçmişi tablosu
- [x] Review Mode'da sürükle-bırak (Drag & Drop) dosya yükleme
- [x] Review Mode'da SMART analiz sonuçlarını filtreleme (S/M/A/R/T dropdown)
- [x] Review Mode'da "Apply Suggestion" → AI otomatik gereksinimi yeniden yazıyor
- [x] Review Mode'da analiz kartından AI Chat'e sürükle-bırak aktarımı
- [x] Kullanıcı profil fotoğrafı ve baş harfleri (avatar) navbar'da gösteriliyor
- [x] AI Chat boş durumundayken rastgele ve samimi karşılama mesajları gösterilmesi
- [x] Authoring Mode'da tüm şablon başlıkları için dinamik "Placeholder/Rehber Metinler" eklendi

## 🏛️ Kurumsal Temizlik
- [x] HAVELSAN standardı tüm referanslardan kaldırıldı (UI, CSS, prompt, template, JSON)
- [x] Proje tamamen IEEE/ISO uluslararası standartlarına taşındı
- [x] `havelsanBlue` renk değişkeni → `idasBlue` olarak yeniden adlandırıldı

## 📋 Standartlar ve Şablonlar
- [x] `templates.json` (backend) ve `templates.js` (frontend) oluşturuldu
- [x] IEEE 830 → 10 ana başlıkla düzleştirildi
- [x] ISO/IEC/IEEE 29148 → 7 başlık eklendi
- [x] IEEE 730 (Software Quality Assurance) → 10 başlık eklendi
- [x] IEEE/ISO/IEC 12207 → 9 başlık eklendi
- [x] `ui_config.json` → arayüz metinleri merkezi yapılandırma dosyasında yönetiliyor

## 🧠 AI Ajan Mimarisi (Backend)
- [x] `BaseAgent` → tüm ajanların türediği temel sınıf
- [x] `ClassifierAgent` → FR/NFR sınıflandırması
- [x] `ReviewAgent` → gereksinim kalite analizi (SMART kriterleri)
- [x] `RewriteAgent` → hatalı gereksinimleri otomatik yeniden yazma
- [x] `DraftingAgent` → IEEE 29148 stilinde taslak üretimi
- [x] `ChatAgent` → kullanıcıyla konuşan genel amaçlı AI asistan
- [x] `GlossaryAgent` → terminoloji kontrolü
- [x] `QualityAgent` → gereksinim kalite puanlama
- [x] `TemplateAgent` → şablon seçimi ve rehberlik
- [x] `ResolutionAgent` → çakışan gereksinimleri çözme
- [x] `RequirementAnalyst` → derinlemesine gereksinim analizi
- [x] `Orchestrator` (core) → tüm ajanları yöneten merkezi koordinatör
- [x] `LLMManager` (core) → Gemini API bağlantısı ve model yönetimi

## 📊 AI Doğruluk İyileştirmeleri
- [x] FR/NFR sınıflandırması için net tanımlar prompt'a eklendi
- [x] Few-Shot Prompting → AI artık `rules.json`'daki örneklerle öğreniyor (ReviewAgent + ClassifierAgent)
- [x] JSON onarım mekanizması → AI'ın bozuk JSON çıktılarını otomatik düzeltiyor (`_repair_json`)
- [x] Çok dilli destek → Türkçe dökümanları otomatik İngilizce'ye çeviriyor (ReviewAgent)

## 📁 Bilgi Seti (Knowledge Base / Data)
- [x] `rules.json` → kalite kuralları, yasaklı kelimeler listesi (4 kategori: Ambiguity, Subjectivity, Non-Verifiable, Continuity)
- [x] `rules.json`'a FR/NFR sınıflandırma örnekleri (5 FR + 5 NFR) eklendi
- [x] `glossary.json` → temel terminoloji sözlüğü oluşturuldu
- [x] `session.json` → oturum bilgisi yönetimi

## 🔗 Backend API (FastAPI + Uvicorn ASGI)
- [x] RESTful API mimarisi kuruldu (FastAPI + Uvicorn)
- [x] `POST /classify` → gereksinim sınıflandırma endpoint'i
- [x] `POST /analyze` → gereksinim kalite analizi endpoint'i
- [x] `POST /rewrite` → otomatik yeniden yazma endpoint'i
- [x] `POST /upload-review` → dosya yükleme ve inceleme endpoint'i
- [x] `POST /chat` → AI sohbet endpoint'i
- [x] `GET /templates` → şablon listesi endpoint'i
- [x] `GET /ui-config` → arayüz yapılandırma endpoint'i
- [x] `GET /session` → oturum verisi endpoint'i
- [x] CORS yapılandırması (frontend-backend iletişimi)
- [x] Supabase veritabanı entegrasyonu (döküman kaydetme/yükleme)
- [x] Döküman taslak kaydetme (upsert) → aynı dökümanı günceller, yenisini yaratmaz

## 🧪 Test Altyapısı
- [x] `test_api_functional.py` → API endpoint fonksiyonel testleri (pytest + FastAPI TestClient)
- [x] `test_validation.py` → LLM doğruluk testleri (ground truth dataset ile FR/NFR ve kalite analizi)
- [x] `test_agents.py` → Orchestrator ajan başlatma testi
- [x] `test_engine.py` → Backend motor testleri
- [x] `test_suite.py` → Genel test paketi
- [x] `App.test.jsx` → Frontend bileşen testi (Vitest + React Testing Library)
- [x] `setupTests.js` → Frontend test ortamı yapılandırması

---


# ❌ YAPILMAYAN / DEVAM EDEN

## Arayüz (UI)
- [ ] Authoring'de her bölüm için "Tamamlandı" butonu → döküman yapısında işaretlensin
- [ ] Authoring'de Reference kısmında otomatik öneriler bulunsun
- [ ] Authoring/Review kısımlarında kullanıcının ek belge yüklemesine izin vermek (glossary vb.)
- [ ] Kullanıcı glossary yüklemezse bizim şablonumuzu sunmak + düzenleyebilmesini sağlamak
- [ ] Dil seçimi
- [ ] Profil sayfasında düzenlemeler (avatar yükleme, bilgi güncelleme)

## Bilgi Seti (Knowledge Base)
- [ ] Mock belgeler (test dokümanları — hatalı ve doğru SRS örnekleri)
- [x] Her şablon bölümü için "beklenen içerik" rehber metinlerinin hazırlanması

## AI Backend
- [ ] python-docx ile .docx dosyalarındaki paragrafları okuyan fonksiyon
- [ ] Başlıkları ve normal metni ayıran parsing algoritması
- [ ] "shall", "must", "meli/malı" gibi ifadeleri yakalayan kural seti veya NLP modeli
- [ ] Gereksinimlerin test edilebilirliğini puanlayan AI prompt'ları (QualityAgent aktif kullanım)
- [ ] AI'nın "Database yerine VTBS kullan" uyarısı yapabilmesi için glossary.json entegrasyonu

## Dashboard Dinamizasyonu
- [x] "Son Dökümanlar" kısmının veritabanından gerçek zamanlı gelmesi

## Authoring Mode Geliştirme
- [ ] Editöre yazılan metnin anlık olarak şablon başlıklarıyla eşleşmesi

## Entegrasyon ve Test

- [ ] Kullanıcı testleri: Kurumsal şablona göre yazılan dökümanın doğru puanlanıp puanlanmadığının testi
