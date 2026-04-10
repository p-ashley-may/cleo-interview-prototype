# Financial interview prototype (standalone)

Runs the same React prototype as `/internal/prototypes/financial-interview` **without Rails, Shakapacker, or AWS**.

## Local demo

From this directory:

```bash
yarn install
yarn dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Shareable static deploy

```bash
yarn install
yarn build
```

Upload the `dist/` folder to **[Netlify Drop](https://app.netlify.com/drop)**, or use the Vercel steps below.

**Important:** This app imports shared source from `app/javascript/modules/...` (two levels above this folder). Deploy **from the full `meetcleo` repository** and set Vercel’s **Root Directory** to this folder so the clone includes those files. A standalone copy of only `prototypes/financial-interview-demo` will not build.

### Deploy on Vercel ([your team](https://vercel.com/p-ashley-mays-projects))

1. Sign in at [vercel.com](https://vercel.com) and open **p-ashley-mays-projects** (or your personal dashboard).
2. **Add New… → Project** and **Import** the **meetcleo** Git repository (GitHub/GitLab/Bitbucket).
3. Before deploying, open **Configure Project** and set:
   - **Root Directory:** `prototypes/financial-interview-demo` (use “Edit” if the UI hides it).
   - Leave **Framework Preset** as **Vite** if detected.
   - **Build Command** `yarn build` and **Output Directory** `dist` should match [vercel.json](./vercel.json); override only if you use `npm` (then set Install Command to `npm install` and Build to `npm run build`).
4. **Deploy**. When it finishes, Vercel assigns a URL like `financial-interview-demo-xxx.vercel.app`; you can rename the project or add a custom domain under **Project → Settings → Domains**.

If the build fails with missing `Modules/...` imports, double-check that Root Directory is exactly `prototypes/financial-interview-demo` (full monorepo must still be cloned—Vercel does this by default).

### Cloudflare Pages (alternative)

- **Root directory:** `prototypes/financial-interview-demo`
- **Build command:** `yarn install && yarn build`
- **Build output directory:** `dist`

No server-side code is required; it is a static SPA bundle.
