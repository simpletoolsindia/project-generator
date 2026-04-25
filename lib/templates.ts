export interface Package {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  badge?: string;
  color: string;
}

export const categories = [
  { id: "all", name: "All" },
  { id: "web", name: "Web" },
  { id: "database", name: "Database" },
  { id: "auth", name: "Authentication" },
  { id: "api", name: "API & HTTP" },
  { id: "utils", name: "Utilities" },
  { id: "ai", name: "AI & ML" },
];

export const packages: Package[] = [
  // Web
  { id: "react-router", name: "React Router", description: "Client-side routing", category: "web", version: "^6.x", color: "#61DAFB" },
  { id: "tailwindcss", name: "Tailwind CSS", description: "Utility-first CSS", category: "web", version: "^3.x", color: "#38B2AC" },
  { id: "shadcn", name: "shadcn/ui", description: "Beautiful components", category: "web", version: "latest", color: "#000000" },
  { id: "framer-motion", name: "Framer Motion", description: "Animations", category: "web", version: "^11.x", color: "#FF0055" },

  // Database
  { id: "prisma", name: "Prisma", description: "ORM for Node.js", category: "database", version: "^5.x", color: "#5A67D8" },
  { id: "drizzle", name: "Drizzle ORM", description: "Lightweight ORM", category: "database", version: "^0.30.x", color: "#F5C300" },
  { id: "better-sqlite3", name: "better-sqlite3", description: "Fast SQLite3", category: "database", version: "^11.x", color: "#003D8F" },
  { id: "mongoose", name: "Mongoose", description: "MongoDB ODM", category: "database", version: "^8.x", color: "#880000" },

  // Auth
  { id: "next-auth", name: "NextAuth.js", description: "Authentication", category: "auth", version: "^4.x", color: "#003D8F" },
  { id: "clerk", name: "Clerk", description: "Auth & user mgmt", category: "auth", version: "^5.x", color: "#6C3FEC" },
  { id: "lucia", name: "Lucia Auth", description: "Lightweight auth", category: "auth", version: "^3.x", color: "#C5F74C" },
  { id: "jwt", name: "jsonwebtoken", description: "JWT tokens", category: "auth", version: "^9.x", color: "#000000" },

  // API & HTTP
  { id: "axios", name: "Axios", description: "HTTP client", category: "api", version: "^1.x", color: "#5A29E4" },
  { id: "zod", name: "Zod", description: "Schema validation", category: "api", version: "^3.x", color: "#3B82F6" },
  { id: "trpc", name: "tRPC", description: "End-to-end types", category: "api", version: "^11.x", color: "#39884C" },
  { id: "hono", name: "Hono", description: "Lightweight API", category: "api", version: "^4.x", color: "#E53F38" },

  // Utilities
  { id: "date-fns", name: "date-fns", description: "Date utilities", category: "utils", version: "^3.x", color: "#295C83" },
  { id: "lodash", name: "Lodash", description: "JS utilities", category: "utils", version: "^4.x", color: "#349B47" },
  { id: "zod", name: "Zod", description: "Schema validation", category: "utils", version: "^3.x", color: "#3B82F6" },
  { id: "nanoid", name: "nanoid", description: "ID generation", category: "utils", version: "^5.x", color: "#E53F38" },

  // AI & ML
  { id: "openai", name: "OpenAI SDK", description: "OpenAI API", category: "ai", version: "^4.x", color: "#10A37F" },
  { id: "anthropic", name: "Anthropic SDK", description: "Claude API", category: "ai", version: "^0.40.x", color: "#D6A855" },
  { id: "langchain", name: "LangChain.js", description: "AI framework", category: "ai", version: "^0.2.x", color: "#000000" },
  { id: "llm-client", name: "LLM Client", description: "Unified LLM API", category: "ai", version: "^1.0.x", color: "#FF6B6B" },
];

export interface ProjectConfig {
  name: string;
  group: string;
  package: string;
  description: string;
  language: "typescript" | "javascript";
  framework: string;
  packages: string[];
}

export function generateProject(config: ProjectConfig): Record<string, string> {
  const files: Record<string, string> = {};
  const { name, group, package: pkg, description, language, packages: selectedPackages } = config;

  const ext = language === "typescript" ? "ts" : "js";
  const extReact = language === "typescript" ? "tsx" : "jsx";

  // package.json
  const deps = selectedPackages.map(p => {
    const pkgData = packages.find(pkg => pkg.id === p);
    return pkgData ? `"${p}": "${pkgData.version}"` : `"${p}": "latest"`;
  }).join(",\n    ");

  files["package.json"] = JSON.stringify({
    name: name.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      next: "15.0.0",
      ...Object.fromEntries(selectedPackages.map(p => [p, "latest"]))
    },
    devDependencies: {
      typescript: "^5.x",
      "@types/node": "^20.x",
      "@types/react": "^18.x",
      "@types/react-dom": "^18.x",
    }
  }, null, 2);

  // tsconfig.json
  files["tsconfig.json"] = JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2);

  // next.config.js
  files["next.config.js"] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

  // app/layout.tsx
  files["app/layout.tsx"] = `import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${name}",
  description: "${description}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  // app/page.tsx
  files["app/page.tsx"] = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to ${name}</h1>
      <p>${description}</p>
    </main>
  );
}
`;

  // app/globals.css
  files["app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

  // tailwind.config.ts
  files["tailwind.config.ts"] = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
`;

  // postcss.config.js
  files["postcss.config.js"] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

  // .gitignore
  files[".gitignore"] = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

  // README.md
  files["README.md"] = `# ${name}

${description}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Project Structure

\`\`\`
├── app/                  # Next.js App Router
│   ├── page.tsx         # Home page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # React components
├── lib/                 # Utilities
├── public/              # Static assets
└── package.json
\`\`\`

## Packages Included

${selectedPackages.map(p => `- ${p}`).join("\n")}

## License

MIT
`;

  return files;
}
