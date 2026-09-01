#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = createJiti(import.meta.url)
const { DEMO_NAV_GROUPS, listDemoNavItems } = await jiti.import(
  '../examples/example/shared/app-config.ts'
)
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const items = listDemoNavItems()
const check = process.argv.includes('--check')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const sections = DEMO_NAV_GROUPS.map((group) => {
  const tags = group.items
    .map(
      (item) =>
        `        <a class="component-tag" href="./vue/#${item.path}" data-react="./react/#${item.path}">${escapeHtml(item.label['en-US'])}</a>`
    )
    .join('\n')
  return `    <div class="section" id="${group.key}">
      <h2>${escapeHtml(group.label['zh-CN'])} (${escapeHtml(group.label['en-US'])})</h2>
      <div class="component-grid" data-category="${group.key}">
${tags}
      </div>
    </div>`
}).join('\n\n')

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tigercat UI — Component Library for Vue 3 & React</title>
    <style>
      :root {
        color-scheme: light;
        --tc-primary: #2563eb;
        --tc-bg: #f8fafc;
        --tc-surface: #ffffff;
        --tc-text: #0f172a;
        --tc-text-muted: #475569;
        --tc-border: #e2e8f0;
        --tc-shadow: rgba(15, 23, 42, 0.08);
      }
      html.dark {
        color-scheme: dark;
        --tc-bg: #0f172a;
        --tc-surface: #1e293b;
        --tc-text: #f1f5f9;
        --tc-text-muted: #94a3b8;
        --tc-border: #334155;
        --tc-shadow: rgba(0, 0, 0, 0.3);
      }
      * {
        box-sizing: border-box;
        margin: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--tc-bg);
        color: var(--tc-text);
        line-height: 1.6;
      }
      .header {
        padding: 48px 16px 32px;
        text-align: center;
      }
      .header h1 {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
      }
      .header p {
        font-size: 16px;
        color: var(--tc-text-muted);
        max-width: 600px;
        margin: 0 auto;
      }
      .version-badge {
        display: inline-block;
        background: var(--tc-primary);
        color: #fff;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        margin-left: 8px;
        vertical-align: middle;
      }
      .toolbar {
        max-width: 960px;
        margin: 0 auto 24px;
        padding: 0 16px;
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      .search-input {
        flex: 1;
        min-width: 200px;
        padding: 10px 16px;
        border: 1px solid var(--tc-border);
        border-radius: 8px;
        font-size: 14px;
        background: var(--tc-surface);
        color: var(--tc-text);
        outline: none;
      }
      .theme-toggle {
        padding: 8px 16px;
        border: 1px solid var(--tc-border);
        border-radius: 8px;
        background: var(--tc-surface);
        color: var(--tc-text);
        cursor: pointer;
        font-size: 14px;
      }
      .fw-section,
      .section,
      .stats {
        max-width: 960px;
        margin: 0 auto 40px;
        padding: 0 16px;
      }
      .fw-cards {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .fw-card {
        background: var(--tc-surface);
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 12px 30px var(--tc-shadow);
        text-decoration: none;
        color: inherit;
      }
      .fw-card h2 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .fw-card p {
        font-size: 14px;
        color: var(--tc-text-muted);
        margin-bottom: 16px;
      }
      .fw-card .link {
        font-weight: 600;
        color: var(--tc-primary);
      }
      .section h2 {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 16px;
        border-bottom: 2px solid var(--tc-border);
        padding-bottom: 8px;
      }
      .component-grid {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
      a.component-tag {
        padding: 6px 12px;
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        color: inherit;
      }
      a.component-tag.hidden {
        display: none;
      }
      .stats {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
      .stat {
        background: var(--tc-surface);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 12px var(--tc-shadow);
      }
      .stat-value {
        font-size: 28px;
        font-weight: 800;
        color: var(--tc-primary);
      }
      .stat-label {
        font-size: 13px;
        color: var(--tc-text-muted);
        margin-top: 4px;
      }
      .footer {
        text-align: center;
        padding: 32px 16px;
        color: var(--tc-text-muted);
        font-size: 13px;
        border-top: 1px solid var(--tc-border);
      }
      .footer a {
        color: var(--tc-primary);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Tigercat <span class="version-badge">v${version}</span></h1>
      <p>
        Tailwind CSS 驱动的跨框架 UI 组件库。入口清单来自示例站导航，共 ${items.length} 个可打开的示例页。
      </p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${items.length}</div>
        <div class="stat-label">示例页</div>
      </div>
    </div>

    <div class="toolbar">
      <input class="search-input" type="text" placeholder="搜索组件…" id="searchInput" />
      <button class="theme-toggle" id="themeToggle" type="button">🌙 暗色模式</button>
    </div>

    <div class="fw-section">
      <div class="fw-cards">
        <a class="fw-card" href="./vue/">
          <h2>Vue 3 示例</h2>
          <p>浏览 Tigercat Vue 组件示例、主题效果与交互体验。</p>
          <span class="link">进入站点 →</span>
        </a>
        <a class="fw-card" href="./react/">
          <h2>React 示例</h2>
          <p>查看 Tigercat React 组件示例、主题效果与交互体验。</p>
          <span class="link">进入站点 →</span>
        </a>
        <a class="fw-card" href="./mcp/">
          <h2>MCP 技能源</h2>
          <p>@expcat/tigercat-mcp 默认远程读取的 skills 文档与 context7 清单。</p>
          <span class="link">进入站点 →</span>
        </a>
      </div>
    </div>

${sections}

    <div class="footer">
      <p>
        Tigercat v${version} · MIT License ·
        <a href="https://github.com/expcat/Tigercat">GitHub</a>
      </p>
    </div>

    <script>
      const toggle = document.getElementById('themeToggle')
      const html = document.documentElement
      const darkKey = 'tigercat-example-dark'
      const savedDark = localStorage.getItem(darkKey)
      const preferDark =
        savedDark === '1' ||
        (savedDark !== '0' && matchMedia('(prefers-color-scheme: dark)').matches)
      if (preferDark) html.classList.add('dark')
      toggle.textContent = html.classList.contains('dark') ? '☀️ 浅色模式' : '🌙 暗色模式'
      toggle.addEventListener('click', () => {
        const next = !html.classList.contains('dark')
        html.classList.toggle('dark', next)
        localStorage.setItem(darkKey, next ? '1' : '0')
        toggle.textContent = next ? '☀️ 浅色模式' : '🌙 暗色模式'
      })

      const searchInput = document.getElementById('searchInput')
      const allTags = document.querySelectorAll('.component-tag')
      const allSections = document.querySelectorAll('.section')
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim()
        allTags.forEach((tag) => {
          const match = !query || tag.textContent.toLowerCase().includes(query)
          tag.classList.toggle('hidden', !match)
        })
        allSections.forEach((section) => {
          const visibleTags = section.querySelectorAll('.component-tag:not(.hidden)')
          section.style.display = visibleTags.length === 0 && query ? 'none' : ''
        })
      })
    </script>
  </body>
</html>
`

const target = join(root, 'examples/index.html')
if (check) {
  const current = readFileSync(target, 'utf8')
  if (current !== html) {
    console.error('examples/index.html is stale; run node ./scripts/generate-example-index.mjs')
    process.exit(1)
  }
  console.log(`examples/index.html matches DEMO_NAV_GROUPS (${items.length} pages).`)
} else {
  writeFileSync(target, html)
  console.log(`Wrote examples/index.html (${items.length} pages, v${version}).`)
}
