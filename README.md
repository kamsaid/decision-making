# Decision Making Assistant

A Next.js application that helps users make better decisions by analyzing their preferences, constraints, and goals using AI-powered recommendations.

## Features

- Interactive decision form with dynamic fields for preferences and constraints
- AI-powered recommendations using DeepSeek's reasoning model
- Detailed recommendations with pros and cons
- Modern, responsive UI built with Tailwind CSS

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- DeepSeek AI API
- React Query
- Zod for validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- DeepSeek API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kamsaid/decision-making.git
cd decision-making
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment file and update it with your DeepSeek API key:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your DeepSeek API key:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Enter your decision context (e.g., "Should I move to a new city?")
2. Add your preferences (e.g., "Good weather", "Cultural activities")
3. Add your constraints (e.g., "Budget under $2000/month")
4. Submit the form to get AI-powered recommendations
5. Review the recommendations and their pros/cons

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Next.js
- Powered by DeepSeek AI
- UI components inspired by Tailwind CSS
