# 🧠 NeuroShop - Symbiotic Intelligence E-Commerce Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-398ccb)](https://trpc.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **From Amnesic Tools to Symbiotic Partners** - An AI-powered shopping assistant that remembers your preferences, learns with you, and proactively finds opportunities.

## 🌟 Vision

NeuroShop transforms e-commerce from passive search tools into **proactive digital partners** using **Symbiotic Intelligence**. Unlike traditional "amnesic" AI that forgets everything after each session, NeuroShop builds a **persistent memory** of your goals, preferences, and shopping patterns.

### Maturity Levels

- **Level 1 (Tool):** Basic search and listing
- **Level 2 (Copilot):** Chat-based recommendations with session memory
- **Level 3 (Partner):** Proactive goal-setting, persistent memory, and autonomous research

## ✨ Core Features

### 1. 🧠 Agentic Memory System

A three-tier memory architecture that never forgets:

- **Core Memory:** User goals, preferences, personality profile (Big Five traits)
- **Recall Memory:** Recent interactions, search history, browsing patterns
- **Archival Memory:** Long-term memory with semantic search capabilities

**Key Benefits:**
- Remembers your budget constraints and past rejections
- Learns from every interaction
- Builds a "shared mental model" between you and the AI

### 2. 💰 Proactive Price Tracking

24/7 autonomous monitoring that goes beyond simple alerts:

- **Memory-Aware Notifications:** Only alerts you based on your budget sensitivity
- **Predictive Analysis:** Forecasts whether prices will drop further
- **Action Guards:** Prevents impulsive purchases with cognitive friction mechanisms
- **Conditional Delegation:** Automatically reserve items when price targets are met (with human approval)

### 3. 🔍 Agentic Research

Autonomous web research that understands context:

- **Multi-Source Search:** Simultaneously searches Amazon, eBay, tech blogs, etc.
- **Personality-Based Scoring:** Ranks products based on your Big Five personality traits
- **Trust Calibration:** Confidence scores for every recommendation
- **XAI Reasoning:** Transparent explanations for why each product was suggested

### 4. 🎨 Spatial Canvas UI

Move beyond linear lists:

- **Artifact-Centric Interface:** Products appear as cards you can organize
- **AI Collaboration:** Work alongside AI to curate your shopping space
- **Drag & Drop:** Organize products spatially, not chronologically

### 5. 🛡️ Ethical AI & Action Guards

Built-in protections against manipulation:

- **Cognitive Friction:** Slows down impulsive decisions on high-stakes purchases
- **FOMO Filtering:** Automatically hides manipulative "limited time" tactics for high-neuroticism users
- **Budget Conflict Warnings:** Alerts when purchases exceed monthly limits
- **Human-on-the-Loop:** Critical actions always require human approval

### 6. 📊 XAI (Explainable AI)

Every recommendation comes with:

- **Reasoning Traces:** "Why this product?" with evidence
- **Factor Breakdown:** Personality match (92%), budget fit (85%), past preferences (78%)
- **Confidence Scores:** AI tells you how certain it is
- **Source Attribution:** Links to original data sources

## 🏗️ Technical Architecture

### Stack

- **Frontend:** React 19 + Tailwind CSS 4 + Wouter
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** MySQL/TiDB (17 tables)
- **AI:** Ollama (local LLM) + Memory-aware prompting
- **Auth:** Manus OAuth

### Database Schema

```
users                    → User accounts & roles
core_memory             → Goals, preferences, personality
recall_memory           → Recent interactions
archival_memory         → Long-term semantic memory
conversation_context    → Chat history
user_maturity_level     → Level 1-3 progression
personality_profiles    → Big Five traits
behavior_metrics        → Click, scroll, hover data
price_watch_list        → Tracked products
price_history           → Historical price data
price_alerts            → Notifications & triggers
price_predictions       → ML-based forecasts
conditional_delegations → Automated actions
budget_tracking         → Monthly spending
canvas_artifacts        → Spatial UI elements
recommendation_explanations → XAI traces
action_guards           → Approval mechanisms
```

### API Endpoints (tRPC)

**Memory Router:**
- `getCoreMemory()` - Fetch user's core memory
- `updateCoreMemory()` - Update goals/preferences
- `getRecallMemory()` - Recent interactions
- `addToArchival()` - Store long-term memory
- `getMaturityLevel()` - Current user level
- `consolidateMemory()` - Nightly memory consolidation

**Price Tracking Router:**
- `addToWatchList()` - Track a product
- `getWatchList()` - Fetch tracked products
- `getPriceHistory()` - Historical data
- `getActiveAlerts()` - Current notifications
- `createConditionalDelegation()` - Automated actions
- `getBudgetStatus()` - Monthly spending

**Ollama Router:**
- `chat()` - Memory-aware conversation
- `analyzeQuery()` - Search intent analysis
- `recommendProducts()` - Personalized suggestions
- `explainRecommendation()` - XAI reasoning

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL 8+ (or use Manus built-in database)
- Ollama (optional, for local AI)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd neuroshop-production

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication (Manus OAuth)
JWT_SECRET=your-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Ollama (optional)
OLLAMA_API_KEY=your-key
OLLAMA_BASE_URL=http://localhost:11434
```

### Running Ollama (Optional)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama server
ollama serve

# Pull a model
ollama pull llama3.2:3b
```

## 📖 Usage

### For End Users

1. **Sign In:** Use Manus OAuth to authenticate
2. **Set Goals:** Tell the AI what you're looking for
3. **Browse & Track:** Add products to your watch list
4. **Get Alerts:** Receive memory-aware notifications
5. **Chat:** Ask the AI for recommendations

### For Developers

```typescript
// Example: Add product to watch list
const { mutate: addToWatch } = trpc.priceTracking.addToWatchList.useMutation();

addToWatch({
  productUrl: "https://example.com/product",
  targetPrice: 299.99,
  notifyOnDrop: true,
});

// Example: Get memory-aware recommendations
const { data: recommendations } = trpc.ollama.recommendProducts.useQuery({
  query: "laptop for programming",
  budget: 1500,
});
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/services/ollama.test.ts

# Watch mode
pnpm test --watch
```

## 📊 Project Structure

```
neuroshop-production/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client
│   │   └── index.css      # Symbiotic theme
├── server/                # Backend Express + tRPC
│   ├── services/          # Business logic
│   │   ├── memory.ts      # Agentic Memory
│   │   ├── priceTracking.ts
│   │   └── ollama.ts
│   ├── routers.ts         # tRPC API routes
│   └── db.ts              # Database queries
├── drizzle/               # Database schema
│   └── schema.ts
└── shared/                # Shared types & constants
```

## 🎨 Design System

### Color Palette (Symbiotic Theme)

- **Primary (Purple):** AI emphasis, neural glow effects
- **Secondary (Blue):** Trust indicators, reliability
- **Accent (Bright Purple):** Action buttons, highlights
- **Trust Green:** Confidence scores, verified data
- **Warning Amber:** Action guards, budget alerts

### Custom CSS Classes

```css
.neural-glow         /* Pulsing AI effect */
.memory-card         /* Glassmorphism memory cards */
.trust-indicator     /* Green trust badges */
.xai-card            /* Explanation cards */
.spatial-canvas      /* Grid background */
.canvas-artifact     /* Draggable product cards */
.maturity-level      /* Level 1-3 badges */
.trait-bar           /* Personality trait bars */
```

## 🔒 Security & Privacy

- **GDPR Compliant:** Users own their data
- **Transparent AI:** XAI explanations for all decisions
- **Ethical Design:** No dark patterns or manipulation
- **Data Minimization:** Only collect what's necessary
- **Right to Forget:** Users can delete all memory

## 🗺️ Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Agentic Memory System
- [x] Price Tracking Service
- [x] Ollama Integration
- [x] Basic UI & Theme

### Phase 2: Intelligence (🚧 In Progress)
- [ ] Real product data integration (RapidAPI/Firecrawl)
- [ ] Big Five personality profiling
- [ ] Spatial Canvas drag & drop
- [ ] Advanced XAI visualizations

### Phase 3: Autonomy (📅 Planned)
- [ ] Autonomous research agents
- [ ] Predictive price modeling
- [ ] Multi-user collaboration
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Manus Platform** - Infrastructure and OAuth
- **Ollama** - Local LLM runtime
- **Drizzle ORM** - Type-safe database queries
- **tRPC** - End-to-end typesafe APIs
- **Tailwind CSS** - Utility-first styling

## 📞 Support

- **Documentation:** [docs.neuroshop.ai](https://docs.neuroshop.ai) (coming soon)
- **Issues:** [GitHub Issues](https://github.com/your-org/neuroshop/issues)
- **Discord:** [Join our community](https://discord.gg/neuroshop) (coming soon)
- **Email:** support@neuroshop.ai

## 🌐 Links

- **Live Demo:** [neuroshop.manus.space](https://neuroshop.manus.space)
- **Documentation:** [docs.neuroshop.ai](https://docs.neuroshop.ai)
- **Blog:** [blog.neuroshop.ai](https://blog.neuroshop.ai)

---

**Built with ❤️ using Symbiotic Intelligence principles**

*"From amnesia to partnership, one memory at a time."*
