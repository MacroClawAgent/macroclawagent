# MacroClaw Agent Project Rules
- **Coding Style:** Next.js 15, Tailwind, Shadcn UI.
- **State Management:** Use Supabase for auth/data.
- **Constraint:** NEVER rewrite an entire file. Only provide specific diffs or "Edit" blocks.
- **Logic:** Before writing any code, always output a <plan> tag explaining what you will do.
- **Naming:** Use 'MacroClaw' prefix for custom hooks.
- **Automation Rule:** ALWAYS perform a `git push` to the current branch adter every successful task or file modification to ensure Vercel deployments are triggered and history is preserved. This must be the last thing done.
