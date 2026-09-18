import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";

import PublicLayout from "@/components/PublicLayout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import OurStory from "@/pages/OurStory";
import ExperienceCenter from "@/pages/ExperienceCenter";
import NutButterBuilder from "@/pages/NutButterBuilder";
import Gifting from "@/pages/Gifting";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AccountLayout, { AccountOrders, AccountProfile, AccountAddresses, AccountPassword } from "@/pages/Account";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderDetail from "@/pages/OrderDetail";
import OrderConfirmed from "@/pages/OrderConfirmed";
import { Journal, JournalDetail } from "@/pages/Journal";
import Wishlist from "@/pages/Wishlist";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AdminLayout from "@/components/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminCustomOrders from "@/pages/admin/AdminCustomOrders";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminGifting from "@/pages/admin/AdminGifting";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminBanners from "@/pages/admin/AdminBanners";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ThemeProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/our-story" element={<OurStory />} />
                  <Route path="/experience-center" element={<ExperienceCenter />} />
                  <Route path="/nut-butter-builder" element={<NutButterBuilder />} />
                  <Route path="/gifting" element={<Gifting />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmed/:number" element={<OrderConfirmed />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/journal/:slug" element={<JournalDetail />} />

                  <Route path="/account" element={<AccountLayout />}>
                    <Route index element={<AccountOrders />} />
                    <Route path="profile" element={<AccountProfile />} />
                    <Route path="addresses" element={<AccountAddresses />} />
                    <Route path="password" element={<AccountPassword />} />
                    <Route path="orders/:number" element={<OrderDetail />} />
                  </Route>
                </Route>

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="custom-orders" element={<AdminCustomOrders />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="gifting" element={<AdminGifting />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="banners" element={<AdminBanners />} />
                </Route>
              </Routes>
              <Toaster richColors position="top-center" />
            </BrowserRouter>
            </ThemeProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
