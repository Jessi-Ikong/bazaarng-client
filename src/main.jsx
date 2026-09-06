import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// GA4 traffic tracking — only loaded for real production visitors, and
// only when a Measurement ID is actually configured, so local dev never
// reports traffic and a missing env var is a silent no-op either way.
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (import.meta.env.PROD && gaMeasurementId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', gaMeasurementId);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
