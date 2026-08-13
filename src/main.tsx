import { createRoot } from 'react-dom/client';
import App from '@/App';
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary';
import './index.css';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
