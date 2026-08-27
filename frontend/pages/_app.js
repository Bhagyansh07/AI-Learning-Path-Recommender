import { useState, useEffect } from 'react';
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useRouter } from 'next/router';

function PageTransition({ children }) {
  const router = useRouter();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');
  const [currentPath, setCurrentPath] = useState(router.asPath);

  useEffect(() => {
    if (router.asPath !== currentPath) {
      setTransitionStage('exit');
      const timeout = setTimeout(() => {
        setCurrentPath(router.asPath);
        setDisplayChildren(children);
        setTransitionStage('enter');
      }, 150);
      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [children, router.asPath, currentPath]);

  return (
    <div style={{
      opacity: transitionStage === 'enter' ? 1 : 0,
      transform: transitionStage === 'enter' ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    }}>
      {displayChildren}
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <PageTransition>
          <Component {...pageProps} />
        </PageTransition>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
