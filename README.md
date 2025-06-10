# Decision Making Assistant

A Next.js application that helps you make better decisions through AI-powered analysis and recommendations.

## Features

- **Structured Decision Framework**: Input your context, preferences, and constraints
- AI-powered recommendations using OpenAI's advanced reasoning models
- **Interactive Chat Interface**: Discuss your decisions with an AI assistant
- **Multi-faceted Analysis**: Preference analysis, constraint validation, and creative solutions
- **Real-time Processing**: Get immediate insights and recommendations

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decision-making
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment file and update it with your OpenAI API key:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── recommendations/ # Recommendations API endpoint
│   ├── recommendations/    # Recommendations page
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions
```

## API Endpoints

- `POST /api/chat` - Interactive chat with the AI assistant
- `POST /api/recommendations` - Generate structured recommendations

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: OpenAI API
- **Validation**: Zod
- **Deployment**: Vercel

## Design Tokens

This application uses the **Duson Color Palette** for a cohesive and accessible design system:

### Color Palette
- **Base Light**: `#FAF5E6` - Dominant light-mode background (washed ivory)
- **Base Dark**: `#2D2C2E` - Dominant dark-mode background  
- **Accent Primary**: `#FD1F4A` - Primary actions, links, highlights (coral pink)
- **Accent Secondary**: `#FBBD0D` - Secondary accents, badges (golden yellow)

### Semantic Tokens
- `bg-base` - Light mode background
- `bg-base-dark` - Dark mode background  
- `accent-primary` - Primary action color
- `accent-secondary` - Secondary accent color

### Accessibility
All color combinations maintain WCAG AA contrast ratios (≥ 4.5:1) for optimal readability. The palette supports both light and dark modes with automatic theme switching.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application is powered by OpenAI API and requires a valid API key to function.
