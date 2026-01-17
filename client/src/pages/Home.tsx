import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Brain, TrendingDown, Sparkles, Target, Shield, Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  const { data: maturityLevel } = trpc.memory.getMaturityLevel.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: coreMemory } = trpc.memory.getCoreMemory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center">
          <div className="container py-20">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Sembiyotik Zeka Destekli</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="gradient-text">NeuroShop</span>
                <br />
                <span className="text-foreground">Sizi Hatırlayan Alışveriş</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Unutkan araçlardan kurtulun. Tercihlerinizi öğrenen, sizinle evrimleşen ve proaktif fırsatlar sunan yapay zeka asistanınız.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>
                    <Brain className="w-5 h-5 mr-2" />
                    Başlayın
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sembiyotik Zeka Özellikleri
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sadece bir araç değil, sizinle birlikte öğrenen ve büyüyen bir dijital ortak
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass">
                <CardHeader>
                  <Brain className="w-10 h-10 text-primary mb-4" />
                  <CardTitle>Agentic Memory</CardTitle>
                  <CardDescription>
                    Tercihlerinizi, hedeflerinizi ve geçmişinizi kalıcı olarak hatırlayan bellek sistemi
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <TrendingDown className="w-10 h-10 text-secondary mb-4" />
                  <CardTitle>Proaktif Fiyat Takibi</CardTitle>
                  <CardDescription>
                    7/24 fiyatları izleyen, fırsatları yakalayan ve sizi bilgilendiren otonom ajan
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <Target className="w-10 h-10 text-accent mb-4" />
                  <CardTitle>XAI Açıklamaları</CardTitle>
                  <CardDescription>
                    Her önerinin arkasındaki mantığı anlatan, şeffaf ve güvenilir yapay zeka
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Gizliliğiniz Önceliğimiz
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Verileriniz size aittir. GDPR uyumlu, şeffaf ve etik yapay zeka.
            </p>
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>
                Hemen Başlayın
              </a>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold gradient-text">NeuroShop</h1>
              {maturityLevel && (
                <span className={`maturity-level ${maturityLevel}`}>
                  {maturityLevel === "tool" && "Level 1: Tool"}
                  {maturityLevel === "copilot" && "Level 2: Copilot"}
                  {maturityLevel === "partner" && "Level 3: Partner"}
                </span>
              )}
            </div>

            <Button variant="ghost" onClick={() => logout()}>
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Hoş geldiniz, {user?.name || "Kullanıcı"}!
            </h2>
            {coreMemory && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="trust-indicator">
                  <Shield className="w-4 h-4" />
                  Güven Skoru: {coreMemory.trustScore}/100
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30">
                  İlişki: {coreMemory.relationshipState === "stranger" ? "Yeni Tanışma" : 
                           coreMemory.relationshipState === "acquaintance" ? "Tanıdık" : "Ortak"}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass hover:border-primary transition-colors">
              <CardHeader>
                <TrendingDown className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Fiyat Takibi</CardTitle>
                <CardDescription>
                  Ürünleri takip edin, fırsatları kaçırmayın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary">
                  Takip Listesi
                </Button>
              </CardContent>
            </Card>

            <Card className="glass hover:border-primary transition-colors">
              <CardHeader>
                <Brain className="w-8 h-8 text-primary mb-2" />
                <CardTitle>AI Asistan</CardTitle>
                <CardDescription>
                  Bellek-aware sohbet ve öneriler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Sohbet Başlat
                </Button>
              </CardContent>
            </Card>

            <Card className="glass hover:border-primary transition-colors">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Profilim</CardTitle>
                <CardDescription>
                  Tercihleriniz ve kişilik analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Profili Görüntüle
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals */}
          {coreMemory?.activeGoals && coreMemory.activeGoals.length > 0 && (
            <Card className="memory-card">
              <CardHeader>
                <CardTitle>Aktif Hedefleriniz</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {coreMemory.activeGoals.map((goal, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle>Sistem Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Backend API</span>
                  <span className="text-green-500">✓ Çalışıyor</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Agentic Memory</span>
                  <span className="text-green-500">✓ Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price Tracking</span>
                  <span className="text-green-500">✓ Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ollama AI</span>
                  <span className="text-yellow-500">⚠ Yerel kurulum gerekli</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
