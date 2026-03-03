# FlowDesk 🟣

Gestionnaire de tâches personnel — React + Vite + Supabase + PWA

---

## Setup en 5 étapes

### 1. Cloner et installer

```bash
git clone https://github.com/TON_USERNAME/flowdesk.git
cd flowdesk
npm install
```

### 2. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → New project
2. Dans l'éditeur SQL (**SQL Editor** → New query), colle le contenu de `supabase-schema.sql` et clique **Run**
3. Va dans **Settings → API** et copie :
   - `Project URL`
   - `anon public` key

### 3. Configurer les variables d'environnement

Crée un fichier `.env` à la racine :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 4. Tester en local

```bash
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

### 5. Déployer sur Vercel

1. Push le projet sur GitHub
2. Va sur [vercel.com](https://vercel.com) → New Project → importe ton repo
3. Dans **Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique Deploy ✅

### 6. Installer la PWA sur le bureau

Une fois déployé sur Vercel, ouvre l'URL dans Chrome :
- **Mac/Windows** : menu ⋮ → "Installer FlowDesk"
- **Mac Safari** : Partager → "Sur l'écran d'accueil"

---

## Stack

- React 18 + Vite
- Supabase (PostgreSQL)
- CSS Modules
- vite-plugin-pwa

## Structure

```
src/
  components/
    TaskCard.jsx / .module.css
    Modal.jsx / .module.css
  hooks/
    useFlowDesk.js     ← toute la logique données
  lib/
    supabase.js        ← client Supabase
  App.jsx / .module.css
  main.jsx
  index.css
```
