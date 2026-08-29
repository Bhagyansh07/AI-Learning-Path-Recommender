import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="LearnPath AI — Personalized learning path recommender using client-side ML algorithms. Get AI-powered course recommendations, skill gap analysis, and adaptive learning paths." />
        <meta name="theme-color" content="#e8590c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LearnPath AI" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="LearnPath AI — Personalized AI Learning Paths" />
        <meta property="og:description" content="AI-powered personalized learning path recommender. 54 skills, 8 career paths, 5-factor hybrid scoring. Works 100% client-side." />
        <meta property="og:site_name" content="LearnPath AI" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LearnPath AI — Personalized AI Learning Paths" />
        <meta name="twitter:description" content="AI-powered personalized learning path recommender. 54 skills, 8 career paths, 5-factor hybrid scoring." />

        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23e8590c'/><text x='50' y='50' font-size='50' font-weight='bold' text-anchor='middle' dy='.35em' fill='white'>LP</text></svg>" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
