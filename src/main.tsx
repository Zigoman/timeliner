import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadLocalCatalog } from './songs';
import './style.css';

loadLocalCatalog().then(() => {
    createRoot(document.getElementById('root')!).render(<App />);
}).catch(() => {
    const root = document.getElementById('root')!;
    root.textContent = 'קטלוג לא תקין. בדקו את catalog.local.json לפי README. Invalid local catalog.';
});
