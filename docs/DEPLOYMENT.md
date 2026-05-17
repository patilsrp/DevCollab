# DevCollab Live Demo Deployment

A walk-through for deploying DevCollab to a **fully free** production stack:

| Layer | Service | Free tier |
| --- | --- | --- |
| Frontend | **Vercel** | Unlimited static deploys, global CDN |
| Backend | **Render** Web Service | Free; sleeps after 15min idle (~30s cold start) |
| Redis | **Upstash** | 10,000 commands/day, 256 MB |

The order matters: deploy Redis → Backend → Frontend, because each step
needs the URL of the previous one.

---

## 1. Provision free Redis on Upstash

1. Go to **https://upstash.com/** and sign in with GitHub.
2. Click **Create Database**:
   - **Name:** `devcollab-redis`
   - **Region:** pick one close to your Render region (e.g. `us-west-2`)
   - **Type:** Regional, **Eviction:** enabled (LRU)
3. Once created, scroll to **Connect to your database → Node.js** and copy the
   **`redis://`** URL. It looks like:
   ```
   redis://default:<password>@<region>.upstash.io:<port>
   ```
4. Save this — you'll paste it into Render in the next step.

---

## 2. Deploy the backend to Render

1. Go to **https://render.com** and sign in with GitHub.
2. Click **New → Web Service** and pick your DevCollab repo.
3. Fill in:
   | Field | Value |
   | --- | --- |
   | **Name** | `devcollab-server` |
   | **Region** | Pick the same region as your Upstash DB |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/index.js` |
   | **Instance Type** | **Free** |

4. Click **Advanced** and add environment variables:
   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `REDIS_URL` | _(paste the Upstash URL from step 1)_ |
   | `CLIENT_URL` | `http://localhost:5173` _(temporary — we'll update this after Vercel)_ |
   | `PORT` | `10000` _(Render's default)_ |

5. Click **Create Web Service**. First build takes ~3–5 minutes.

6. Once deployed, your backend URL looks like:
   `https://devcollab-server.onrender.com`
   Test it: open `https://devcollab-server.onrender.com/health` — should return `{"status":"ok",...}`.

---

## 3. Deploy the frontend to Vercel

1. Go to **https://vercel.com** and sign in with GitHub.
2. Click **Add New → Project** and import your DevCollab repo.
3. Configure:
   | Field | Value |
   | --- | --- |
   | **Root Directory** | `client` |
   | **Framework Preset** | Vite _(auto-detected)_ |
   | **Build Command** | `npm run build` _(default)_ |
   | **Output Directory** | `dist` _(default)_ |

4. Expand **Environment Variables** and add:
   | Key | Value |
   | --- | --- |
   | `VITE_SERVER_URL` | `https://devcollab-server.onrender.com` _(your Render URL)_ |

5. Click **Deploy**. First build takes ~1–2 minutes.

6. Vercel gives you a URL like `https://devcollab-<random>.vercel.app`.

---

## 4. Connect the two: update CORS on the backend

The backend currently has `CLIENT_URL=http://localhost:5173`, so it will reject
requests from your Vercel domain. Fix that:

1. In **Render → devcollab-server → Environment**, edit `CLIENT_URL` to:
   ```
   https://devcollab-<random>.vercel.app,http://localhost:5173
   ```
   _(Comma-separated. Localhost stays so you can still dev locally.)_

2. Render redeploys automatically (~1 minute).

3. Open your Vercel URL, create a room, and verify two browser tabs sync code
   in real time. 🎉

---

## 5. (Optional) Custom domain on Vercel

1. **Vercel → Project → Settings → Domains** → add your domain.
2. Add the CNAME/A record at your registrar (Vercel shows the values).
3. After it goes live, append the custom domain to `CLIENT_URL` on Render:
   ```
   https://devcollab.example.com,https://devcollab-<random>.vercel.app,http://localhost:5173
   ```

---

## Free-tier gotchas you should know

### Render sleeps after 15 minutes idle
First request after sleep takes ~30 seconds. The frontend's reconnection
logic handles this — users will see "Reconnecting…" for ~30s on cold start.

**Workaround for demos:** ping `/health` every 10 minutes from a free uptime
monitor like [UptimeRobot](https://uptimerobot.com) to keep the server warm.

### Upstash 10K commands/day
Each `code-change` event triggers one Redis SET. Per-day budget:
~10K events ÷ ~1 update/second = enough for ~3 hours of active typing.
Plenty for a demo, watch usage in Upstash dashboard.

If you hit the limit, the server falls back to in-memory storage automatically
(state is lost on restart, but the app keeps working).

### Vercel preview deploys
Every PR creates a preview URL. The CORS config above allows
`*.vercel.app` so previews work without manual config changes.

---

## Local development still works

Nothing changes for local dev:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Default values in `.env.example` still point to localhost.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Frontend loads but won't connect to server | CORS rejecting Vercel origin | Verify Vercel URL is in `CLIENT_URL` on Render (no trailing slash) |
| `/health` returns 502 | Server crashed | Check Render → Logs |
| Code doesn't sync between tabs | Socket.IO blocked | Open browser devtools → Network → WS tab; check WebSocket connected |
| First request takes 30s | Render free tier cold start | Expected. Use UptimeRobot to keep warm. |
| Redis errors in logs | Wrong `REDIS_URL` | Re-copy from Upstash; make sure it starts with `redis://` (not `rediss://` unless you enabled TLS) |