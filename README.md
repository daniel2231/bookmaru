# bookmaru 📚

A bilingual platform for discovering beautiful places to read books in Korea. Built with SvelteKit, Supabase, and OpenAI.

## About

bookmaru (a combination of "book" and "maru", which means "living room" in Korean) is inspired by [Places to read](https://placestoread.com/) by Mitul Shah. It features a moderated submission system with automatic translation between Korean and English.

### Key Features

- 🌍 **Bilingual Support**: Full Korean and English interface
- 📝 **Moderated Submissions**: Admin approval system for quality control
- 🤖 **Auto Translation**: OpenAI-powered translation between languages
- 📱 **Responsive Design**: Works on all devices
- 🏷️ **Categorization**: Filter by region, category, and quietness level
- 🔔 **Real-time Notifications**: ntfy.sh integration for new entry alerts

## Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Supabase (Database, Storage, Edge Functions)
- **AI**: OpenAI GPT-3.5 for translation
- **Hosting**: Netlify
- **Development**: Cursor AI

## Development Story

Learn more about how this project was built in 3 days using AI-assisted development:

### English

📖 [How I made bookmaru using SvelteKit in 3 days](https://www.danielkang.top/blog/posts/how-i-made-bookmaru)

### 한국어

📖 [SvelteKit으로 3일 만에 bookmaru 만들기](https://www.danielkang.top/blog/posts/how-i-made-bookmaru)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

````sh
# Clone the repository
git clone https://github.com/your-username/bookmaru.git
cd bookmaru

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and OpenAI API keys

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Configuration
PRIVATE_ADMIN_PASSWORD=your_admin_password_here

# NTFY Configuration
# Topic for ntfy.sh notifications when new entries are submitted
# Default: Bookmaru-entry
PRIVATE_VITE_NTFY_TOPIC=Bookmaru-entry
````

### Development

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Live Demo

🌐 [bookmaru.site](https://bookmaru.site)

## License

MIT License - see LICENSE file for details.
