import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AuthLoginPage from './pages/auth/login.auth.page';
import AdminDashboardPage from './pages/admin/dashboard.admin';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLoginPage />,
  },
  {
    path: "/a/dashboard",
    element: <AdminDashboardPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
