import { Ollama } from "ollama";

const ollamaClient = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
});

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  messages: OllamaMessage[];
  temperature?: number;
  num_ctx?: number;
  top_p?: number;
  stream?: boolean;
}

/**
 * Ollama Service - Memory-aware LLM integration
 */
export class OllamaService {
  private defaultModel = "llama3.2:3b";

  /**
   * Check if Ollama is available
   */
  async checkAvailability(): Promise<{ available: boolean; models: string[] }> {
    try {
      const models = await ollamaClient.list();
      return {
        available: true,
        models: models.models.map((m: any) => m.name),
      };
    } catch (error) {
      console.error("[Ollama] Availability check failed:", error);
      return {
        available: false,
        models: [],
      };
    }
  }

  /**
   * Generate response with memory context
   */
  async generate(options: OllamaGenerateOptions): Promise<string> {
    const { model = this.defaultModel, messages, temperature = 0.4, num_ctx = 8192, top_p = 0.9 } = options;

    try {
      const response = await ollamaClient.chat({
        model,
        messages,
        options: {
          temperature,
          num_ctx,
          top_p,
        },
        stream: false,
      });

      return response.message.content;
    } catch (error) {
      console.error("[Ollama] Generation failed:", error);
      throw new Error("Failed to generate response from Ollama");
    }
  }

  /**
   * Build memory-aware system prompt
   */
  buildMemoryPrompt(userMemory: {
    relationshipState?: string;
    trustScore?: number;
    activeGoals?: string[];
    priceRange?: { min: number; max: number } | null;
    favoriteCategories?: string[];
    idiosyncrasies?: string[];
    recentInteractions?: Array<{ type: string; data: any }>;
  }): string {
    const {
      relationshipState = "stranger",
      trustScore = 0,
      activeGoals = [],
      priceRange,
      favoriteCategories = [],
      idiosyncrasies = [],
      recentInteractions = [],
    } = userMemory;

    let prompt = `Sen NeuroShop'un sembiyotik AI asistanısın. Kullanıcıyla birlikte öğrenir ve evrimleşirsin.

KULLANICI BELLEĞİ:
- İlişki Durumu: ${relationshipState}
- Güven Skoru: ${trustScore}/100
- Aktif Hedefler: ${activeGoals.length > 0 ? activeGoals.join(", ") : "Henüz yok"}`;

    if (priceRange) {
      prompt += `\n- Fiyat Aralığı: ₺${priceRange.min.toLocaleString()} - ₺${priceRange.max.toLocaleString()}`;
    }

    if (favoriteCategories.length > 0) {
      prompt += `\n- Favori Kategoriler: ${favoriteCategories.join(", ")}`;
    }

    if (idiosyncrasies.length > 0) {
      prompt += `\n- Kişisel Tuhaflıklar: ${idiosyncrasies.join(", ")}`;
    }

    if (recentInteractions.length > 0) {
      prompt += `\n\nGEÇMİŞ ETKİLEŞİMLER:`;
      recentInteractions.slice(0, 5).forEach((interaction) => {
        prompt += `\n- ${interaction.type}: ${JSON.stringify(interaction.data).substring(0, 100)}`;
      });
    }

    prompt += `\n\nKullanıcının belleğini ve geçmişini dikkate alarak yanıt ver. Kişiselleştirilmiş, bağlam-aware ve yardımcı ol.`;

    return prompt;
  }

  /**
   * Analyze search query for personality insights
   */
  async analyzeSearchQuery(
    query: string,
    userMemory: any
  ): Promise<{
    insights: string;
    personalityIndicators: Record<string, number>;
    suggestedPreferences: string[];
  }> {
    const systemPrompt = this.buildMemoryPrompt(userMemory);
    const userPrompt = `Kullanıcının arama sorgusu: "${query}"

Bu sorgudan:
1. Kullanıcının kişiliği hakkında çıkarımlar yap (Big Five: openness, conscientiousness, extraversion, agreeableness, neuroticism)
2. Tercih kalıpları belirle
3. JSON formatında yanıt ver:

{
  "insights": "Kullanıcı hakkında genel değerlendirme",
  "personalityIndicators": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100
  },
  "suggestedPreferences": ["tercih1", "tercih2", ...]
}`;

    const response = await this.generate({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        insights: response,
        personalityIndicators: {},
        suggestedPreferences: [],
      };
    }
  }

  /**
   * Generate product recommendations with XAI
   */
  async recommendProducts(
    products: Array<{ id: string | number; name: string; description?: string; price: number }>,
    userMemory: any
  ): Promise<
    Array<{
      productId: string | number;
      score: number;
      reasoning: string;
      factors: Record<string, number>;
    }>
  > {
    const systemPrompt = this.buildMemoryPrompt(userMemory);
    const userPrompt = `Aşağıdaki ürünleri kullanıcının belleğine göre skorla ve öner:

${products.map((p) => `- ${p.name} (₺${p.price.toLocaleString()}): ${p.description || ""}`).join("\n")}

Her ürün için JSON formatında:
{
  "recommendations": [
    {
      "productId": "ürün_id",
      "score": 0-100,
      "reasoning": "Neden bu ürün önerildi? Bellek ve kişilikle uyumu",
      "factors": {
        "personalityMatch": 0-100,
        "budgetFit": 0-100,
        "memoryAlignment": 0-100
      }
    }
  ]
}`;

    const response = await this.generate({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(response);
      return parsed.recommendations || [];
    } catch {
      return [];
    }
  }

  /**
   * Generate XAI reasoning for a recommendation
   */
  async generateReasoning(
    productName: string,
    score: number,
    userMemory: any
  ): Promise<
    Array<{
      step: number;
      factor: string;
      evidence: string;
      weight: number;
    }>
  > {
    const systemPrompt = this.buildMemoryPrompt(userMemory);
    const userPrompt = `Ürün: "${productName}" (Skor: ${score}/100)

Bu ürünün neden önerildiğini adım adım açıkla. JSON formatında:

{
  "reasoning": [
    {
      "step": 1,
      "factor": "Faktör adı",
      "evidence": "Kullanıcının belleğinden kanıt",
      "weight": 0-100
    }
  ]
}`;

    const response = await this.generate({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    try {
      const parsed = JSON.parse(response);
      return parsed.reasoning || [];
    } catch {
      return [];
    }
  }

  /**
   * Chat with memory awareness
   */
  async chat(message: string, userMemory: any, conversationHistory: OllamaMessage[] = []): Promise<string> {
    const systemPrompt = this.buildMemoryPrompt(userMemory);

    const messages: OllamaMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    return this.generate({
      messages,
      temperature: 0.6,
    });
  }
}

export const ollamaService = new OllamaService();
