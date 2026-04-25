"use client";

import { useState, useMemo } from "react";
import { packages, categories, type Package } from "@/lib/templates";
import JSZip from "jszip";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("my-project");
  const [projectGroup, setProjectGroup] = useState("com.example");
  const [projectDesc, setProjectDesc] = useState("A Next.js application");
  const [language, setLanguage] = useState<"typescript" | "javascript">("typescript");
  const [showPreview, setShowPreview] = useState(false);

  const filteredPackages = useMemo(() => {
    if (selectedCategory === "all") return packages;
    return packages.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const togglePackage = (id: string) => {
    setSelectedPackages(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const downloadProject = async () => {
    const zip = new JSZip();

    // Add selected packages info
    const selected = selectedPackages.map(id => packages.find(p => p.id === id)).filter(Boolean) as Package[];

    const files: Record<string, string> = {};

    // package.json
    const deps: Record<string, string> = {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      next: "^15.0.0",
      ...Object.fromEntries(selected.map(p => [p.id, p.version]))
    };

    const devDeps: Record<string, string> = {};
    if (language === "typescript") {
      devDeps.typescript = "^5.x";
      devDeps["@types/node"] = "^20.x";
      devDeps["@types/react"] = "^18.x";
      devDeps["@types/react-dom"] = "^18.x";
    }

    zip.file("package.json", JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: deps,
      devDependencies: devDeps
    }, null, 2));

    // tsconfig.json
    if (language === "typescript") {
      zip.file("tsconfig.json", JSON.stringify({
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
      }, null, 2));
    }

    // next.config.js
    zip.file("next.config.js", `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;
`);

    // tailwind.config.ts
    if (language === "typescript") {
      zip.file("tailwind.config.ts", `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`);
    } else {
      zip.file("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
`);
    }

    // postcss.config.js
    zip.file("postcss.config.js", `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

    // app directory
    zip.file("app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;
`);

    if (language === "typescript") {
      zip.file("app/layout.tsx", `import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${projectName}",
  description: "${projectDesc}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`);

      zip.file("app/page.tsx", `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to ${projectName}</h1>
      <p className="mt-4 text-lg">${projectDesc}</p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">Packages included: ${selected.join(", ") || "none"}</p>
      </div>
    </main>
  );
}
`);
    } else {
      zip.file("app/layout.js", `import "./globals.css";

export const metadata = {
  title: "${projectName}",
  description: "${projectDesc}",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`);

      zip.file("app/page.js", `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to ${projectName}</h1>
      <p className="mt-4 text-lg">${projectDesc}</p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">Packages included: ${selected.join(", ") || "none"}</p>
      </div>
    </main>
  );
}
`);
    }

    // .gitignore
    zip.file(".gitignore", `# dependencies
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
`);

    // README.md
    zip.file("README.md", `# ${projectName}

${projectDesc}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Packages

${selected.map(p => `- **${p.name}**: ${p.description}`).join("\n")}

## License

MIT
`);

    // Generate and download
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCLICommand = () => {
    const cmd = `npx create-next-app@latest ${projectName} --typescript --tailwind --app --import-alias "@/*" && cd ${projectName} && npm install ${selectedPackages.join(" ")}`;
    navigator.clipboard.writeText(cmd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">PG</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Project Generator</h1>
                <p className="text-xs text-gray-400">Create Next.js projects instantly</p>
              </div>
            </div>
            <a
              href="https://github.com/simpletoolsindia/llm-client-framework"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Powered by LLM Client Framework
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Project Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Metadata */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Project Metadata</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="my-project"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Group ID</label>
                  <input
                    type="text"
                    value={projectGroup}
                    onChange={e => setProjectGroup(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="com.example"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="A brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as "typescript" | "javascript")}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Package Selector */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Dependencies</h2>

              {/* Category Filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Package Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map(pkg => {
                  const isSelected = selectedPackages.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => togglePackage(pkg.id)}
                      className={`group relative rounded-lg border p-4 text-left transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white">{pkg.name}</h3>
                          <p className="mt-1 text-xs text-gray-400">{pkg.description}</p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                        {pkg.version}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Count */}
              {selectedPackages.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-purple-500/10 px-4 py-2">
                  <span className="text-sm text-purple-300">
                    {selectedPackages.length} package{selectedPackages.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={() => setSelectedPackages([])}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* CLI Generator */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">CLI Command</h2>
              <div className="flex gap-3">
                <code className="flex-1 rounded-lg bg-black/50 border border-white/10 px-4 py-3 font-mono text-sm text-green-400 overflow-x-auto">
                  npx create-next-app@latest {projectName.toLowerCase().replace(/\s+/g, "-")} --typescript --tailwind --app --import-alias "@/*"
                  {selectedPackages.length > 0 && (
                    <>{"\n"}# Then install packages:{"\n"}cd {projectName.toLowerCase().replace(/\s+/g, "-")} && npm install {selectedPackages.join(" ")}</>
                  )}
                </code>
                <button
                  onClick={copyCLICommand}
                  className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Download */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Download</h2>
              <div className="space-y-3">
                <button
                  onClick={downloadProject}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
              </div>
            </div>

            {/* Selected Packages */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Selected Packages</h2>
              {selectedPackages.length === 0 ? (
                <p className="text-sm text-gray-400">No packages selected yet</p>
              ) : (
                <ul className="space-y-2">
                  {selectedPackages.map(id => {
                    const pkg = packages.find(p => p.id === id);
                    return (
                      <li key={id} className="flex items-center gap-3 text-sm">
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        <span className="text-white">{pkg?.name}</span>
                        <span className="text-gray-500">{pkg?.version}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Project Preview */}
            {showPreview && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-lg font-semibold text-white">Project Structure</h2>
                <div className="font-mono text-sm">
                  <div className="text-gray-400">
                    <span className="text-yellow-400">{projectName.toLowerCase().replace(/\s+/g, "-")}/</span>
                    <div className="ml-4 mt-2 space-y-1">
                      <div className="text-white">📄 package.json</div>
                      <div className="text-white">📄 {language === "typescript" ? "tsconfig.json" : "jsconfig.json"}</div>
                      <div className="text-white">📄 next.config.js</div>
                      <div className="text-white">📄 tailwind.config.{language === "typescript" ? "ts" : "js"}</div>
                      <div className="text-white">📄 postcss.config.js</div>
                      <div className="text-white">📄 .gitignore</div>
                      <div className="text-white">📄 README.md</div>
                      <div className="text-yellow-400 mt-2">📁 app/</div>
                      <div className="ml-4 text-white">📄 layout.tsx</div>
                      <div className="ml-4 text-white">📄 page.tsx</div>
                      <div className="ml-4 text-white">📄 globals.css</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          Built with Next.js & Tailwind CSS · Deploy to GitHub Pages
        </div>
      </footer>
    </div>
  );
}