import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Auth0Provider } from '@auth0/auth0-react';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./components/Login.jsx";
import FindUser from "./components/FindUser.jsx";
import Finding from "./components/Finding.jsx";
import From from "./components/From.jsx"
import RidingRoute from "./components/RidingRoutes.jsx";
import Signup from "./components/SignUp.jsx"
import SignUpRide from "./components/SignUpRide.jsx";
import FindR from "./components/FindR.jsx";
import Success from "./components/Success.jsx";
import SuccessR from "./components/SucessR.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
    {
    path: "/Riding",
    element: <RidingRoute/>,
  },
    {
    path: "/from",
    element: <From />,
  },
      {
    path: "/signup",
    element: <Signup/>,
  },


  {
    path:"/finduser",
    element:<FindUser/>,
  },
  {
    path:"/SucessU",
    element:<Success/>,
  },
    {
    path:"/SucessR",
    element:<SuccessR/>,
  },
  {
    path: "/Finding",
    element: <Finding />,
  },
  {
    path:"/signupR",
    element:<SignUpRide/>
  },
  {
    path:"/findR",
    element:<FindR/>
  }
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
  <RouterProvider router={router} />
  </StrictMode>
);
