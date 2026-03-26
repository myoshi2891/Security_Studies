---
name: fumadocs-adder
description: Converts HTML/MD files to MDX, adds Fumadocs frontmatter, places them in security-docs/content/docs, and updates meta.json. Use when adding HTML or MD files as Fumadocs pages.
---

# Fumadocs Page Generator (Antigravity)

This skill converts provided HTML or MD file content into Fumadocs MDX pages and adds them to the Next.js `security-docs` application.

## Instructions

When the user provides an HTML or MD file (or its content) and asks to add it as a Fumadocs page:

1. **Extract Content & Metadata**:
   - Read the contents of the target file.
   - Determine a suitable `title` and a short `description` (around 1 sentence) based on the content.
   - Convert any HTML content into MDX. Map standard HTML tags to Markdown/MDX components. **Sanitization Requirement:** Before conversion, remove or replace dangerous tags (e.g., `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`) with safe placeholders. Strip all event handler attributes (e.g., `on*`). Normalize or reject dangerous schemes in `href` and `src` attributes (e.g., `javascript:`, `vbscript:`, `data:text/html`). Follow a whitelist-based approach for allowed tags and attributes; any non-whitelisted items should be either removed or safely escaped.
   - **Asset Handling Decision Flow:** If the source contains local or relative references (`img` src, attachment links, local anchor hrefs, CSS url() refs, etc.):
     - **Classify Assets:**
       - **Essential:** Main content images, required attachments (e.g., PDFs, downloads mentioned in text).
       - **Optional:** Decorative icons, background images, thumbnails.
     - **Fallback Order:**
       1. Request the user to provide/import the missing asset.
       2. For **Optional** assets only, attempt safe substitution with an explicit placeholder (e.g., `[MISSING_ASSET:name]`).
       3. If an **Essential** asset is missing or cannot be safely substituted, **fail-closed**: abort conversion and surface an error to the user.

2. **Add YAML Frontmatter**:
   Add the following YAML frontmatter at the top of the converted MDX content:
   - Always YAML-escape extracted values before writing them.
   - Quote single-line strings and use a block scalar for multiline descriptions so `:`, `#`, quotes, and line breaks cannot break parsing.

   ```yaml
   ---
   title: "[Extracted Title]"
   description: "[Extracted Description]"
   ---
   ```

   **Multiline Description Example:**

   ```yaml
   ---
   title: "Secure SDLC Lifecycle"
   description: |
     Detailed guide on implementing security across the Software Development Life Cycle.
     Covers planning, implementation, testing, and deployment phases.
   ---
   ```

3. **Save as MDX File**:
   - **Slug Generation Algorithm:** Derive a slug from the title:
     1. Trim and lowercase.
     2. Normalize Unicode (NFKD) and transliterate to ASCII where possible. Use URL-encoding or hex codepoints for non-transliterable Unicode.
     3. Replace whitespace and punctuation with single hyphens (keep alphanumerics and hyphens).
     4. Collapse multiple hyphens and strip leading/trailing hyphens.
     5. Limit to a safe length (e.g., 60 characters).
     6. **Collision Handling:** If the slug already exists in `security-docs/content/docs`, append a numeric suffix (`-1`, `-2`, ...) before creating `NN-slug.mdx`.
   - **Duplicate-Slug Check:** Before creating the MDX file, parse `security-docs/content/docs/meta.json` and check the `pages` array for the target slug. Abort if an exact duplicate exists and can't be resolved with a suffix.
   - **Sequential Filename:** Scan `security-docs/content/docs` for the maximum leading number. Generate the next number as `NN-slug.mdx` (e.g., `09-new-topic.mdx`).
   - Write the finalized MDX string to the new file in `security-docs/content/docs/`.
   - Fail-closed when required assets cannot be represented within the allowed write scope (`.mdx` + `meta.json` only).

4. **Update `meta.json`**:
   - Parse `security-docs/content/docs/meta.json`.
   - Append the new page ID (the created filename without `.mdx`, i.e., `NN-slug`) to the end of the `pages` array if it's not already listed (confirming against the ID verified in Step 3). Always use the filename stem (the part before the extension).
   - Write the updated JSON back to `meta.json`.

5. **Completion**:
   - Run validation in `security-docs`: `bun run types:check`.
   - If validation fails, report the errors and do not claim completion.
   - If validation succeeds, inform the user that the file was successfully generated and registered as a Fumadocs page.

## Constraints & Safety Rules

- **No File Deletion**: Under no circumstances should you delete or remove existing files from the workspace.
- **Command Execution**: You are permitted to execute necessary read-only commands (e.g., listing directories or checking file contents) to gather context. However, you must NOT execute any destructive commands (like `rm` or `rmdir`) or modify files outside the explicit scope of adding a new Fumadocs page.
- **Create/Update Only**: You may only create new `.mdx` files in `security-docs/content/docs/` and update `security-docs/content/docs/meta.json`. Existing documentation pages must never be overwritten or deleted.
