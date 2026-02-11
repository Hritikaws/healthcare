# WittyDoctor (Healthcare Demo)

This repository contains a lightweight Node.js backend and static frontend for the WittyDoctor demo app.

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm

## Steps to run it

1. Go to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Open in GitHub Codespaces

1. Push this branch/repo to GitHub.
2. Open the repository page on GitHub.
3. Click **Code** → **Codespaces** tab → **Create codespace on <branch>**.
4. In the Codespace terminal, run:
   ```bash
   cd backend
   npm install
   npm start
   ```
5. When prompted, open the forwarded port `3000` in browser preview.

## Sync and deploy updates when localhost still shows old version

If `git log` still shows only `aa4d8de` on `main`, your environment does not yet have the latest commits.

### A) Verify you are in the correct folder

```bash
cd /workspaces/healthcare/backend
pwd
# should end with: /workspaces/healthcare/backend
```

Run the app from `backend` (not `backend/public`):

```bash
npm install
npm start
```

### B) Sync latest branch and merge into `main`

```bash
cd /workspaces/healthcare
git fetch --all --prune
git branch -a
```

If you can see a feature branch with the new work, merge it:

```bash
git checkout main
git pull origin main
git merge <feature-branch-name>
git push origin main
```

If you are using a PR workflow, merge the PR on GitHub first, then pull:

```bash
git checkout main
git pull origin main
```

### C) Restart runtime and force-refresh browser

```bash
cd /workspaces/healthcare/backend
npm install
npm start
```

Then hard refresh your browser:

- Windows/Linux: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`

### D) Confirm new deployment is live

```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/ | head -n 40
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/about.html
```

Expected:

- `/api/health` returns JSON with `"status":"ok"`
- homepage HTML loads successfully
- `/about.html` returns `200`

## Health check

Once the server is running, verify liveliness:

```bash
curl http://localhost:3000/api/health
```

Expected shape:

```json
{
  "status": "ok",
  "service": "wittydoctor-backend",
  "timestamp": "2026-..."
}
```

## Run tests

From the `backend` folder:

```bash
npm test
```

## API endpoints

- `GET /api/health` — service health/liveness
- `GET /api/specialties` — specialties list
- `GET /api/doctors?search=<term>&specialty=<specialty>` — doctors list/filter
- `POST /api/bookings` — create a booking
- `POST /api/chat` — chat with WittyDoctor
- `POST /api/ambulance` — request ambulance dispatch
