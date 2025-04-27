import '../styles/globals.css';
import '../styles/animations.css';
import { AppProvider } from '../context/AppContext';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp; 