import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Tracking from "./pages/Tracking";
import Services from "./pages/Services";
import About from "./pages/About";
import BookDelivery from "./pages/BookDelivery";
import CalculatePrice from "./pages/CalculatePrice";
import Admin from "./pages/Admin";
import AdminLocations from "./pages/AdminLocations";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import RiderLogin from "./pages/RiderLogin";
import RiderWithdrawal from "./pages/RiderWithdrawal";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
// import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/book-delivery" element={<BookDelivery />} />
            <Route path="/calculate-price" element={<CalculatePrice />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/rider-login" element={<RiderLogin />} />
            <Route path="/rider-withdrawal" element={<RiderWithdrawal />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        {/* <Toaster /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
