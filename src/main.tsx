import { createRoot } from 'react-dom/client';
import App from '@/App';
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary';
import './index.css';
import './styles/globals.css';

if (import.meta.env.DEV) {
  import('react-grab').then((m) =>
    m.init({
      activationMode: 'toggle',
      allowActivationInsideInput: true,
      maxContextLines: 3,
    })
  );
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
