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
   - Convert any HTML content into MDX. Map standard HTML tags to Markdown/MDX components.

2. **Add YAML Frontmatter**:
   Add the following YAML frontmatter at the top of the converted MDX content:

   ```yaml
   ---
   title: [Extracted Title]
   description: [Extracted Description]
   ---
   ```

3. **Save as MDX File**:
   - Determine an appropriate sequential filename (e.g., if the last file is `08-references.mdx`, the next could be `09-new-topic.mdx` or just `new-topic.mdx`).
   - Write the finalized MDX string to a new file in `security-docs/content/docs/`.

4. **Update `meta.json`**:
   - Parse `security-docs/content/docs/meta.json`.
   - Add the filename (without the `.mdx` extension) to the end of the `pages` array.
   - Write the updated JSON back to `meta.json`.

5. **Completion**:
   - Inform the user that the file was successfully generated and registered as a Fumadocs page.
