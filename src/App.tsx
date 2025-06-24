import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from 'convex/react'
import MainLayout from './components/MainLayout'
import { SignInButton } from '@clerk/clerk-react'
import { CoverImageModal } from "./components/modals/CoverImageModal";
import { Spinner } from "./components/Spinner";

function App() {
  return (
    <>
      <AuthLoading>
        <div className="bg-[#1f1f1f] flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="h-screen flex flex-col items-center justify-center gap-8 bg-[#1f1f1f] text-white">
          <div className="flex items-center gap-4">
            <img src="/duck.png" alt="DocDuck Logo" className="w-16 h-16" />
            <h1 className="text-5xl font-bold tracking-tight">DocDuck</h1>
          </div>
          <p className="text-lg text-gray-400">
            Your all-in-one workspace for notes and ideas.
          </p>
          <div className="mt-4">
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <CoverImageModal />
        <div className="h-full flex flex-col">
          <MainLayout />
        </div>
      </Authenticated>
    </>
  )
}

export default App
