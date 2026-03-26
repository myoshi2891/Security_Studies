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

2. **Add YAML Frontmatter**:
   Add the following YAML frontmatter at the top of the converted MDX content:

   ```yaml
   ---
   title: [Extracted Title]
   description: [Extracted Description]
   ---
   ```

3. **Save as MDX File**:
   - Determine an appropriate sequential filename: Scan the `security-docs/content/docs` directory for existing `.mdx` files to find the maximum leading number. Generate the next number in the format `NN-slug.mdx` (zero-padded, e.g., `09-new-topic.mdx`).
   - Write the finalized MDX string to a new file in `security-docs/content/docs/`.

4. **Update `meta.json`**:
   - Parse `security-docs/content/docs/meta.json`.
   - Before adding to the `pages` array, check if the same slug (filename without extension) already exists. If it doesn't exist, add it to the end of the `pages` array.
   - Write the updated JSON back to `meta.json`.

5. **Completion**:
   - Inform the user that the file was successfully generated and registered as a Fumadocs page.

## Constraints & Safety Rules
- **No File Deletion**: Under no circumstances should you delete or remove existing files from the workspace.
- **Command Execution**: You are permitted to execute necessary read-only commands (e.g., listing directories or checking file contents) to gather context. However, you must NOT execute any destructive commands (like `rm` or `rmdir`) or modify files outside the explicit scope of adding a new Fumadocs page.
- **Create/Update Only**: You may only create new `.mdx` files in `security-docs/content/docs/` and update `security-docs/content/docs/meta.json`. Existing documentation pages must never be overwritten or deleted.
