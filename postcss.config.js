export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**8. Move your component to `src/BoerenBridgeScore.jsx`** (the code you shared)

**9. Delete `vercel.json` if you created one** - Vercel auto-detects Vite

**File structure should be:**
```
/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── index.css
    └── BoerenBridgeScore.jsx
