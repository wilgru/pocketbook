<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/96103b70-0a97-4337-8cbb-2b265f054a99">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/299fdeff-1ec5-4439-8106-1458c2f388c0">
    <img alt="Pocketbook logo" src="https://github.com/user-attachments/assets/299fdeff-1ec5-4439-8106-1458c2f388c0" width="300">
  </picture>
</p>

<p align="center">
  A free and open source notetaking app with modern features while still having a familiar experience
</p>

## Getting Started

1. Install recommended extensions (VS Code). The recommended extensions can be found under `.vscode/extensions.json` but VS Code should prompt you to install them as well.

2. Make sure you're using the workspace settings instead of your personal settings (which should be overridden by workspace settings by default).

3. Run the following command at the root of the repo's directory to create an `.env` file

   ```
   cp .env.example .env
   ```

4. Install Packages

   ```
   npm install
   ```

5. Start the Electron App

   ```
   npm run dev
   ```

## One-off note content migration (Quill Delta -> Lexical JSON)

For production note content migration, run:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db
```

Use `--apply` to persist changes:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db --apply
```

Optional: migrate a single note only:

```bash
npx tsx scripts/migrateNotesQuillToLexical.ts --db-path=/var/lib/pocketbook/pocketbook.db --note-id=<NOTE_ID> --apply
```
