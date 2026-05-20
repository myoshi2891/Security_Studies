---
name: test-dashboard-updater
description: >
  Synchronises docs/test-coverage-dashboard.html and docs/progress.md with the
  current test state of the Security Studies project. Use this skill when test
  files are added, modified, or deleted; when CI configuration changes (e.g.
  coverage tooling, Codecov, audit steps); or when the user asks to update the
  test dashboard, coverage dashboard, progress tracker, or progress.md.
  Trigger phrases include (Japanese and English):
  「ダッシュボードを更新して」「テスト追加したのでダッシュボードも直して」
  「progress.md を更新して」「カバレッジダッシュボードを最新にして」
  「テスト進捗を反映して」「CI を変更したのでダッシュボードも更新して」
  「テストカバレッジを更新して」「進捗ファイルを更新して」
  "update the dashboard", "sync the test dashboard", "update coverage dashboard",
  "reflect new tests in dashboard", "update progress.md", "update progress tracker",
  "dashboard needs updating after adding tests", "refresh coverage metrics".
---

# Test Dashboard Updater — Security Studies

## Purpose

Keeps two files in sync with the real test state every time tests or CI change:

- `docs/test-coverage-dashboard.html` — visual HTML dashboard
- `docs/progress.md` — text-based progress tracker

Both files are **always updated together** — updating one without the other leaves the project state inconsistent.

---

## Trigger Conditions

Run this skill whenever **any** of the following occurs:

| Event | Example |
|---|---|
| New test file added | `search-modal.test.tsx` created |
| Test cases added / removed in an existing file | smoke → 4 cases |
| Test file deleted | — |
| Previously untested source file gains tests | `DocsSubheading.test.tsx` added |
| CI workflow changed | `--coverage` flag added, Codecov step added |
| New source file added to a tracked domain | new component in `src/components/docs/` |

---

## Step 1 — Collect Current Metrics (always run first)

```bash
# 1-a. List all test files and count cases per file
find security-docs/src -name "*.test.*" | sort
grep -cE "^\s+(test|it)\(" <each test file>

# 1-b. Run tests — confirm all pass
cd security-docs && bun test 2>&1 | tail -5

# 1-c. Read current CI config
cat .github/workflows/ci.yml
```

### Metrics to Compute

| Variable | How to calculate |
|---|---|
| **Total test cases** | `bun test` output: `X pass` |
| **Test file count (Y)** | `Ran X tests across Y files` |
| **Source file count (denominator)** | Fixed at 22 (see Domain table below) |
| **File Unit Coverage %** | `round(Y / 22 * 100)` |
| **Strategy Coverage %** | See matrix calculation below |

### Strategy Coverage Calculation

Matrix = 8 categories × 5 domains = **40 cells**.  
N/A cells count toward the denominator (they are not skipped).

```
Strategy Coverage % = (cells with status "ok" or "partial") / 40 × 100
```

Current covered cells (as of 2026-05-20):

| Cell | Status |
|---|---|
| Unit / d1 (docs/Components) | partial |
| Unit / d2 (UI Components) | ok |
| Unit / d4 (Search & API) | partial |

= 3 cells → **7.5%**

---

## Step 2 — Update `docs/test-coverage-dashboard.html`

### 2-a. Header Meta (`<div class="header-meta">`)

| Element | Update rule |
|---|---|
| `Scanned YYYY-MM-DD` | Today's date |
| `Runner:` | Match CI command (`bun test` or `bun test --coverage`) |
| `CI:` | ✅ with service name, or ❌ 未設定 |
| `Coverage:` | Add `✅ Codecov (lcov)` when Codecov is wired up; remove if not |

### 2-b. Four Summary Cards

| Card | `summary-value` | `summary-sub` | progress bar `width` |
|---|---|---|---|
| Strategy Coverage | `X%` | `40 セル中 Y セル相当` | `X%` |
| File Unit Coverage | `X%` | `22 ファイル中 Y ファイル` | `X%` |
| Test Cases | `X` | `Y ファイル · <brief change note>` | rough % (目安) |
| CI Pipeline | `Active` / `None` | description | `100%` / `0%` |

Color class rules:

| Class | When |
|---|---|
| `c-green` | ≥ 80% or Active |
| `c-amber` | 30–79% or partial |
| `c-red` | < 30% or None |

### 2-c. Unit Row Cells (most frequently updated)

For each changed cell, update:

```html
<span class="cell-count">X tests · Y/Z files</span>
<div class="cell-bar-fill" style="width: W%"></div>
```

Cell class → icon mapping:

| Class | Icon | Meaning |
|---|---|---|
| `cell ok` | ✅ | All domain files tested; meaningful case count |
| `cell partial` | ⚠️ | Some files missing or mostly smoke-only |
| `cell none` | ❌ | No tests |
| `cell na` | — | Category × domain combination is out of scope |

Also update the tooltip (`<div class="tooltip" role="tooltip">`):
- Update the ✓ / ✗ file list to match reality
- Update `tt-title` status text

### 2-d. Footer

```html
<span>... Updated YYYY-MM-DD</span>
<span>Runner: bun test [--coverage] · DOM: happy-dom · Y files · X test cases · CI: ...</span>
```

---

## Step 3 — Update `docs/progress.md`

### 3-a. Top-of-file Metadata

```markdown
> **最終更新**: YYYY-MM-DD（brief change description）
```

### 3-b. 🧪 テスト Table

Update changed rows only:

| Row | What to update |
|---|---|
| テストケース総数 | New pass count |
| テストファイル数 | New Y / 22 and % |
| Strategy Coverage | Recalculated % |
| カバレッジレポート | ✅ / ❌ and detail |

Per-file test count table: update only the rows that changed.  
New rows: add `✅ YYYY-MM-DD 追加` in the 備考 column.

### 3-c. 🚀 CI/CD Table

Update only when CI config changed (coverage, audit, E2E added, etc.).

### 3-d. 📄 仕様書 / ドキュメント Table

Add rows for files updated in this session:

```markdown
| `docs/test-coverage-dashboard.html` | YYYY-MM-DD | brief description |
| `docs/progress.md` (本ファイル) | YYYY-MM-DD | brief description |
```

### 3-e. ✅ 完了済み Table

Append newly completed actions:

```markdown
| P-XX | task name | YYYY-MM-DD |
```

### 3-f. 次のアクション

1. Remove completed items from the numbered list
2. Re-number remaining items sequentially (1, 2, 3…)
3. Add any new action items at the appropriate priority level

---

## Step 4 — Verification

```bash
# Confirm tests still pass (if test files were modified)
cd security-docs && bun test 2>&1 | tail -5

# Lint + type check (if source files were touched)
bun run lint && bun run types:check
```

Visually inspect HTML: check all `<div class="tooltip">` tags are properly closed.

---

## Domain Reference Table

| ID | Domain | Source files |
|---|---|---|
| d1 | docs/Components | `src/components/docs/` — 16 files |
| d2 | UI Components | `disclaimer-modal.tsx`, `search-modal.tsx` |
| d3 | App / Pages | `src/app/page.tsx`, `layout.tsx`, `docs/layout.tsx`, 10 × `page.mdx` |
| d4 | Search & API | `src/lib/search.ts`, `src/app/api/search/route.ts` |
| d5 | Config & Nav | `src/config/docs.ts` |

**Denominator for File Unit Coverage = 22**  
(Only files that contain logic worth unit-testing. Page MDX files and pure layout files are excluded from the denominator by project convention.)

---

## Common Update Patterns

### Pattern A — Deepened an existing test file (smoke → multiple cases)

1. Update `cell-count` in Unit/d1
2. Cell class stays `partial` (all files already covered)
3. Update tooltip file list with new case counts
4. Update per-file row in progress.md テスト table

### Pattern B — First test ever added to a previously untested file

1. Recalculate File Unit Coverage % (denominator stays 22, numerator +1)
2. Update `File Unit Coverage` summary card
3. If cell transitions `none` → `partial` or `ok`: change class, icon, and tooltip
4. If Strategy Coverage cell count increases: recalculate and update `Strategy Coverage` card
5. Remove the related action from 次のアクション; add to ✅ 完了済み

### Pattern C — CI configuration changed only (no test count change)

1. Update header meta `Runner:` and `CI:` / `Coverage:`
2. Update CI Pipeline summary card `summary-sub`
3. Update footer CI text
4. Update 🚀 CI/CD table in progress.md
5. Append updated files to 📄 仕様書 table
