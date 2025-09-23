import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useState } from "react";
import Loader from "./components/loadingAnimation/Loader";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Loader setLoading={setLoading} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
