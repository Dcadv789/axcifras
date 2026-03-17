import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SongsProvider } from './context/SongsContext'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { LiveModePage } from './pages/LiveModePage'
import { SongEditorPage } from './pages/SongEditorPage'
import { SongsPage } from './pages/SongsPage'
import { SongViewPage } from './pages/SongViewPage'

function ProtectedContent({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <SongsProvider>{children}</SongsProvider>
}

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-mist">
          Inicializando sessão do AxPiano...
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedContent>
            <SongsPage />
          </ProtectedContent>
        }
      />
      <Route
        path="/songs/new"
        element={
          <ProtectedContent>
            <SongEditorPage />
          </ProtectedContent>
        }
      />
      <Route
        path="/songs/:songId/edit"
        element={
          <ProtectedContent>
            <SongEditorPage />
          </ProtectedContent>
        }
      />
      <Route
        path="/songs/:songId/view"
        element={
          <ProtectedContent>
            <SongViewPage />
          </ProtectedContent>
        }
      />
      <Route
        path="/songs/:songId/live"
        element={
          <ProtectedContent>
            <LiveModePage />
          </ProtectedContent>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
