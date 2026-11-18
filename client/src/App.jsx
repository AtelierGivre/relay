import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppStore';
import { ToastProvider } from './components/Toast';
import { BootScreen, ErrorScreen } from './components/States';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './layouts/AppShell';
import { Landing } from './pages/Landing';
import { Connect } from './pages/Connect';
import { Overview } from './pages/Overview';
import { Inbox } from './pages/Inbox';
import { Board } from './pages/Board';
import { ReviewQueue } from './pages/ReviewQueue';
import { Accounts } from './pages/Accounts';
import { Lab } from './pages/Lab';
import { Evaluation } from './pages/Evaluation';
import { ClientHome } from './pages/ClientHome';
import { ClientThread } from './pages/ClientThread';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const TITLES = {
  '/': 'Relay: reply routing for personal assistants',
  '/connect': 'Connect your mailboxes · Relay',
  '/app': 'Overview · Relay',
  '/app/board': 'Who owes the reply · Relay',
  '/app/review': 'Needs review · Relay',
  '/app/accounts': 'Mailboxes · Relay',
  '/app/lab': 'Routing lab · Relay',
  '/app/eval': 'Evaluation · Relay',
  '/client': 'Client view · Relay',
};

function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    let title = TITLES[pathname];
    if (!title) {
      if (pathname.startsWith('/app/inbox')) title = 'Inbox · Relay';
      else if (pathname.startsWith('/client/thread')) title = 'Your replies · Relay';
      else title = 'Relay: reply routing for personal assistants';
    }
    document.title = title;
  }, [pathname]);
  return null;
}

function DataGate({ children }) {
  const { status, error, reload } = useApp();
  if (status === 'loading') return <BootScreen />;
  if (status === 'error') return <ErrorScreen message={error} onRetry={() => reload()} />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <DocumentTitle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/connect"
          element={
            <DataGate>
              <Connect />
            </DataGate>
          }
        />
        <Route
          path="/app"
          element={
            <DataGate>
              <AppShell />
            </DataGate>
          }
        >
          <Route index element={<Overview />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="inbox/:threadId" element={<Inbox />} />
          <Route path="board" element={<Board />} />
          <Route path="lab" element={<Lab />} />
          <Route path="eval" element={<Evaluation />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
        <Route
          path="/client"
          element={
            <DataGate>
              <ClientHome />
            </DataGate>
          }
        />
        <Route
          path="/client/thread/:threadId"
          element={
            <DataGate>
              <ClientThread />
            </DataGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
