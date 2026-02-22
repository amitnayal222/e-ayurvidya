import './globals.css';

export const metadata = {
  title: 'e-AyurVidya',
  description: 'Your digital Ayurveda notes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>e-AyurVidya Notes</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/ayurvidya-logo.png" />
      </head>
      <body>
        {children}
        <script>
          {`if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker registered');
              });
            }`}
        </script>
      </body>
    </html>
  );
}

