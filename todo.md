# NeuroShop - Sembiyotik Zeka E-Ticaret Platform TODO

## 📊 Veritabanı Şeması
- [x] Core Memory tablosu (kullanıcı hedefleri, tercihler, kişilik profili)
- [x] Recall Memory tablosu (son etkileşimler, arama geçmişi)
- [x] Archival Memory tablosu (uzun dönem bellek, semantic search)
- [x] Conversation Context tablosu (sohbet bağlamı)
- [x] User Maturity Level tablosu (Level 1-3 progression)
- [x] Personality Profiles tablosu (Big Five traits)
- [x] Behavior Metrics tablosu (tıklama, scroll, hover metrikleri)
- [x] Price Watch List tablosu (takip edilen ürünler)
- [x] Price History tablosu (fiyat değişim geçmişi)
- [x] Price Alerts tablosu (bildirimler ve action guards)
- [x] Price Predictions tablosu (fiyat tahminleri)
- [x] Conditional Delegations tablosu (koşullu yetkilendirmeler)
- [x] Budget Tracking tablosu (aylık bütçe takibi)
- [x] Canvas Artifacts tablosu (spatial canvas öğeleri)
- [x] Recommendation Explanations tablosu (XAI reasoning traces)
- [x] Action Guards tablosu (onay mekanizmaları)

## 🔧 Backend Servisleri
- [ ] Agentic Memory Service (Core/Recall/Archival yönetimi)
- [ ] Memory Consolidation Service (bellek konsolidasyonu)
- [ ] Agentic Research Service (otonom web araştırması)
- [ ] URL Freshness Check Service (URL doğrulama)
- [ ] Price Tracking Service (7/24 fiyat izleme)
- [ ] Price Prediction Service (fiyat tahmin algoritması)
- [ ] XAI Service (reasoning traces üretimi)
- [ ] Action Guards Service (onay mekanizmaları)
- [ ] Ollama Integration Service (memory-aware chat)
- [ ] Personality Analysis Service (Big Five analizi)
- [ ] Behavior Tracking Service (davranış metrikleri)
- [ ] Budget Management Service (bütçe takibi)

## 🌐 API Endpoints (tRPC)
- [ ] Memory Router (getContext, addGoal, updatePreferences, consolidate)
- [ ] Research Router (conductResearch, getPastResearch, checkFreshness)
- [ ] Price Tracking Router (addToWatchList, getAlerts, respondToAlert)
- [ ] Canvas Router (saveCanvas, getArtifacts, updatePosition)
- [ ] Ollama Router (chat, analyzeQuery, recommendProducts, generateReasoning)
- [ ] Personality Router (getProfile, updateTraits, analyzeSearch)
- [ ] Budget Router (getTracking, updateBudget, getAlerts)

## 🎨 Frontend - Tasarım Sistemi
- [ ] Renk paleti seçimi (primary, secondary, accent colors)
- [ ] Tipografi sistemi (font ailesi, boyutlar, ağırlıklar)
- [ ] Spacing sistemi (padding, margin, gap değerleri)
- [ ] Shadow sistemi (elevation levels)
- [ ] Border radius sistemi
- [ ] Animation sistemi (transitions, keyframes)
- [ ] Responsive breakpoints
- [ ] Dark/Light tema desteği

## 🧩 Frontend - Temel Bileşenler
- [ ] Spatial Canvas Component (artifact-centric UI)
- [ ] Canvas Item Component (drag & drop, XAI tooltips)
- [ ] Action Guard Dialog Component (onay mekanizması)
- [ ] XAI Reasoning Card Component (gerekçe gösterimi)
- [ ] Price Alert Card Component (bildirim kartı)
- [ ] Memory Context Sidebar Component (bellek görüntüleme)
- [ ] Personality Indicator Component (Big Five göstergesi)
- [ ] Budget Tracker Component (bütçe takip widget)
- [ ] Ollama Chat Component (memory-aware sohbet)
- [ ] Adaptive Theme Component (kişiliğe göre tema)

## 📄 Frontend - Sayfalar
- [ ] Home Page (landing, adaptive UI, ürün önerileri)
- [ ] Research Page (agentic research, spatial canvas)
- [ ] Price Tracking Page (takip listesi, bildirimler)
- [ ] Chat Page (Ollama entegrasyonu)
- [ ] Profile Page (kişilik profili, tercihler, bellek)
- [ ] Budget Page (harcama analizi, bütçe yönetimi)
- [ ] History Page (geçmiş araştırmalar, satın almalar)

## 🔐 Güvenlik ve Etik
- [ ] GDPR uyumlu veri yönetimi
- [ ] Kullanıcı onay mekanizmaları
- [ ] Veri silme hakkı implementasyonu
- [ ] Etik koruma filtreleri (FOMO gizleme, manipülasyon engelleme)
- [ ] Human-on-the-Loop action guards
- [ ] Bilişsel sürtünme mekanizmaları

## 🧪 Test ve Dokümantasyon
- [ ] Unit testler (backend servisleri)
- [ ] Integration testler (API endpoints)
- [ ] E2E testler (kritik akışlar)
- [ ] API dokümantasyonu
- [ ] Kullanıcı rehberi
- [ ] Deployment rehberi

## 🚀 Deployment
- [ ] Production build optimizasyonu
- [ ] Environment variables yapılandırması
- [ ] Database migration stratejisi
- [ ] Monitoring ve logging kurulumu
- [ ] Checkpoint oluşturma
- [ ] Publish

---

**Not:** Bu liste, projenin tüm özelliklerini kapsayan kapsamlı bir yol haritasıdır. Her madde tamamlandıkça [x] ile işaretlenecektir.
