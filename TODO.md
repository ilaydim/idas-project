**GEREKLİ BİLGİ SETLERİ**
[ ] templates.json (şablonlar)
[ ] glossary.json (terminoloji sözlüğü)
[ ] rules.json (kalite kontrol, yasaklı kelimeler listesi)
[ ] mock documents (test dökümenları - hatalı ve doğru SRS örnekleri)

**ARAYÜZ**
[ ] Giriş ekranı (login,sign up)
[ ] Dashboard (Authoring, Review, Son dökümanlar, Profil)
[ ] Review Mode
[ ] Authoring Mode 
    [ ] Her sayfada bitti gibi bir buton olmalı ve bu döküman yapısında gözükmeli ki kullanıcı buraya gerekmediği sürece geri dönmek zorunda kalmasın
    [ ]Referebce kısmında bazı öneriler bulunsun ()
    [ ]
    [ ]
    [ ]
[ ] Son dökümanlar kısmında bir dökümana tıklandığında onun authoring sayfasına yönlendirilmesi 
[ ] Profile kısmında düzenlemeler 
[ ] Authoring/Review kısımlarında kullanıcının ek belgeler yüklemesine izin vermek (glossar gibi)  
[ ] Kullanıcı bir glossary belgesi yüklemezse, bizim elimizde olan template'i ona sunmak ve değiştirebilmesini sağlamak (authoring kısmında en sol en alta konulabilir, kullanıcı kelimeleri silebilir, ekleyebilir ya da değiştirebilir ve AI agentımız buna göre karar verir)
[ ]


📋 IDAS Proje Geliştirme Yol Haritası (GEMINI'IN YAZDIĞI)
📚 Standartlar ve Bilgi Seti (Kritik Araştırma) - utils/templates.js dosyası'na konulacak
HAVELSAN Standart SRS Şablonunun Bulunması/Oluşturulması: 

[ ] Şablonun tam hiyerarşisinin (1. Giriş, 2. Genel Tanımlama, 2.1... vb.) çıkarılması.

[ ] Her bölüm için "beklenen içerik" rehber metinlerinin hazırlanması. (havelsan şablonunda gördüğümüz gibi)

IEEE 830 (veya ISO/IEC/IEEE 29148) Şablonunun Sisteme Tanımlanması:

[ ] IEEE standart başlıklarının templates.js dosyasına tam liste olarak girilmesi.

Terminoloji Sözlüğü (Glossary) Oluşturma:

[ ] HAVELSAN projelerinde kullanılan teknik terimlerin (örn: VTBS, İDS, YDS) ve bunların İngilizce/Türkçe karşılıklarının listelenmesi.

[ ] AI'nın "Database yerine VTBS kullan" uyarısı yapabilmesi için bir glossary.json veritabanı hazırlanması.

🧠 Faz 3: Backend & AI "Beyin" Geliştirme
Döküman İşleme Motoru:

[ ] python-docx kütüphanesi ile .docx dosyalarındaki paragrafları okuyan fonksiyon.

[ ] Başlıkları ve normal metni birbirinden ayıran algoritma (Parsing).

Gereksinim Ayıklama (Extraction):

[ ] Metin içindeki "shall", "must", "meli/malı" gibi ifadeleri yakalayan kural seti veya NLP modeli.

AI Sınıflandırma Servisi:

[ ] Gereksinimlerin Fonksiyonel (FR) ve Fonksiyonel Olmayan (NFR) olarak ayrılması için bir model (HuggingFace veya OpenAI API entegrasyonu).

Kalite ve Belirsizlik Analizi:

[ ] "Hızlı, kullanıcı dostu, bazen" gibi belirsiz kelimeleri yakalayan sözlük bazlı kontrol.

[ ] Gereksinimlerin test edilebilirliğini puanlayan AI prompt'larının hazırlanması.

🎨 Faz 4: Frontend Güzelleştirme & Dinamik Yapı
Dashboard Dinamizasyonu:

[ ] "Son Dokümanlar" kısmının backend'den (veritabanından) gerçek zamanlı gelmesi.

Authoring Mode (Yazım) Geliştirme:

[ ] Editöre yazılan metnin anlık olarak şablon başlıklarıyla eşleşmesi.

[ ] Sol menüdeki "İlerleme Çubuğu"nun (Progress Bar) içeriğin doluluğuna göre gerçekten dolması. (SİLİNEBİLİR)

Review Mode (İnceleme) Geliştirme:

[ ] Sürükle-bırak (Drag & Drop) ile yüklenen dosyanın backend'e gönderilmesi.

[ ] Backend'den dönen "Kusur Listesi"nin (Issues List) arayüzde kartlar halinde gösterilmesi.

🔗 Faz 5: Entegrasyon ve Test
[ ] Axios Entegrasyonu: React tarafında backend ile konuşacak api.js servisinin yazılması.

[ ] Export Servisi: Backend'de hazırlanan içeriğin profesyonel bir .docx dökümanı olarak paketlenip indirilmesi.

[ ] Kullanıcı Testleri: HAVELSAN şablonuna göre yazılan bir dökümanın sistem tarafından doğru puanlanıp puanlanmadığının testi.

