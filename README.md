# Project Generator

> Instantly create Next.js projects with custom packages and configurations.

A web-based tool and CLI for scaffolding Next.js projects with your choice of packages and settings.

## Features

- **Web UI**: Select packages, configure settings, and download as ZIP
- **CLI Tool**: Generate projects from terminal
- **20+ Packages**: React Router, Prisma, NextAuth, Axios, OpenAI, and more
- **Multiple Languages**: TypeScript and JavaScript support
- **Tailwind CSS**: Built-in Tailwind configuration

## Quick Start

### Web UI

1. Open [simpletoolsindia.github.io/project-generator](https://simpletoolsindia.github.io/project-generator)
2. Select packages you need
3. Configure project settings
4. Download as ZIP

### CLI

```bash
# Create a project with defaults
npx @simpletoolsindia/project-generator my-app

# Create with TypeScript and Tailwind
npx @simpletoolsindia/project-generator my-app --typescript --tailwind

# Create with specific packages
npx @simpletoolsindia/project-generator my-app --packages prisma,next-auth,tailwindcss

# Interactive mode
npx @simpletoolsindia/project-generator
```

## Available Packages

### Web
- React Router, Tailwind CSS, shadcn/ui, Framer Motion

### Database
- Prisma, Drizzle ORM, Mongoose, better-sqlite3

### Authentication
- NextAuth.js, Clerk, Lucia Auth, jsonwebtoken

### API & HTTP
- Axios, Zod, tRPC, Hono

### Utilities
- date-fns, Lodash, nanoid

### AI & ML
- OpenAI SDK, Anthropic SDK, LangChain.js

## Deployment

This project is deployed to GitHub Pages.

## Tech Stack

- Next.js 15, React 19, Tailwind CSS 4, TypeScript

## License

MIT