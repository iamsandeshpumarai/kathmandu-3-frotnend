import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import api from "../../utils/api";

// 1. Create the Context (Use createContext, not useContext)
export const AuthContext = createContext();

export const DataproviderWraper = ({ children }) => {
  // 2. Fix the queryFn (it must be a function that returns a promise)
  const { data, isLoading, error } = useQuery({
    queryKey: ['checkauth'],
    queryFn: async () => {
      const response = await api.get('/api/check');
      return response.data; // Return the actual data from the response
    },
    retry: false, // Often best for auth checks to avoid infinite loops on 401
  });

  // 3. Use the .Provider property (Capital P) and the 'value' prop
  return (
    <AuthContext.Provider value={{ user: data, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom hook for easy access in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a DataproviderWraper");
  }
  return context;
};