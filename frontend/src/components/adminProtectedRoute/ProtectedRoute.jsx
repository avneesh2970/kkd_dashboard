import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return (
      <div className="text-center mt-20 text-lg">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
