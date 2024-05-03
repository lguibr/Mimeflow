import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  console.log("MyApp");

  return (
    <>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />
      <meta name="application-name" content="MimeFlow 0.1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MimeFlow 0.1" />
      <meta name="description" content="Best MimeFlow 0.1 in the world" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#2B5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/apple-touch-icon.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="167x167"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="theme-color" content="#000626ff" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://mimeflow.luisguilher.me" />
      <meta name="twitter:title" content="MimeFlow 0.1" />
      <meta
        name="twitter:description"
        content="MimeFlow 0.1 - The Pose Matching Application"
      />
      <meta
        name="twitter:image"
        content="https://mimeflow.luisguilher.me/android-chrome-192x192.png"
      />
      <meta name="twitter:creator" content="@luisguilher_me" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="MimeFlow 0.1" />
      <meta
        property="og:description"
        content="MimeFlow 0.1 - The Pose Matching Application"
      />
      <meta property="og:site_name" content="MimeFlow 0.1" />
      <meta property="og:url" content="https://mimeflow.luisguilher.me" />
      <meta
        property="og:image"
        content="https://mimeflow.luisguilher.me/apple-touch-icon.png"
      />
      <Component {...pageProps} />;
    </>
  );
}
