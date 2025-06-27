import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";

import MainLayout from './components/MainLayout'
import { CoverImageModal } from "./components/modals/CoverImageModal";
import { Spinner } from "./components/Spinner";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";


function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-[#1f1f1f] flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <CoverImageModal />
      <MainLayout />
    </>
  );
}

export default App;
