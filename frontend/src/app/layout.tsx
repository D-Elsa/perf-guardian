import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/navbar/Navbar";
import "../styles/main.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
    title: "PerfGuardian"
};

const RootLayout = ({children}: {
  children: React.ReactNode
}) => {
    return (
        <html lang="en">
            <body>
                <AuthContextProvider>
                    <ThemeContextProvider>
                        <Navbar/>
                        <div className="container">
                            {children}
                        </div>
                        <ToastContainer />
                    </ThemeContextProvider>
                </AuthContextProvider>
            </body>
        </html>
    );
};

export default RootLayout;