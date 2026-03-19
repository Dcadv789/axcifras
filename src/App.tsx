import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SongsProvider } from './context/SongsContext'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { ChordsPage } from './pages/ChordsPage'
import { LiveModePage } from './pages/LiveModePage'
import { SongEditorPage } from './pages/SongEditorPage'
import { SongsPage } from './pages/SongsPage'
import { SongViewPage } from './pages/SongViewPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { email } = useAuth()

  if (!email) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <SongsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SongsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chords"
              element={
                <ProtectedRoute>
                  <ChordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/songs/new"
              element={
                <ProtectedRoute>
                  <SongEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/songs/:songId/edit"
              element={
                <ProtectedRoute>
                  <SongEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/songs/:songId/view"
              element={
                <ProtectedRoute>
                  <SongViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/songs/:songId/live"
              element={
                <ProtectedRoute>
                  <LiveModePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SongsProvider>
    </AuthProvider>
  )
}
