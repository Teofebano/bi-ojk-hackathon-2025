# AI Financial Planner

A Next.js application that provides AI-powered financial planning through conversational chat. Users can discuss their financial situation and receive personalized financial plans.

## Features

- **AI Chat Assistant**: Natural language conversations about financial planning
- **Personalized Financial Plans**: Three tailored strategies (Conservative, Balanced, Aggressive)
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Admin Dashboard**: Secure area for administrators (under development)
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-3.5-turbo
- **Authentication**: Firebase (planned for admin)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # OpenAI chat API endpoint
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard (under construction)
│   ├── chat/
│   │   └── page.tsx              # Main chat interface
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
```

## Usage

### Chat Interface (`/chat`)

1. Navigate to the chat page
2. Start a conversation about your financial situation
3. The AI will ask questions about your income, expenses, goals, and risk tolerance
4. Once you've shared enough information, say "okay" or "go ahead" to generate plans
5. Receive three personalized financial plans

### Admin Dashboard (`/admin`)

Currently under construction. Will include:
- Google account authentication via Firebase
- User management
- Chat history analytics
- System configuration

## API Endpoints

### POST `/api/chat`

Handles chat conversations with OpenAI.

**Request Body:**
```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Response:**
```json
{
  "reply": "AI response message"
}
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- Firebase variables (for future admin authentication)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new pages in `src/app/`
2. Add API routes in `src/app/api/`
3. Use TypeScript for type safety
4. Follow the existing component patterns

## Deployment

This is a Next.js application that can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the BI OJK Hackathon 2025.

## Support

For questions or issues, please refer to the hackathon documentation or contact the development team.
