import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserRole } from "./utils/enums";

import WelcomePage from "./pages/login/WelcomPage";
import RegisterPage from "./pages/login/RegisterPage";
import LoginPage from "./pages/login/LoginPage";

import UserLayout from "./pages/user/UserLayout";
import UserHomePage from "./pages/user/UserHomePage";
import UserReservationPage from "./pages/user/UserReservationPage";
import UserConfirmPage from "./pages/user/UserConfirmPage";
import UserHelpPage from "./pages/user/UserHelpPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRoomManagePage from "./pages/admin/AdminRoomManagePage";
import AdminReservationPage from "./pages/admin/AdminReservationPage";
import AdminSchedulePage from "./pages/admin/AdminSchedulePage";
import AdminHelpPage from "./pages/admin/AdminHelpPage";

import ProfilePage from "./pages/common/ProfilePage";
import SecurityPage from "./pages/common/SecurityPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ======================= 用户端路由 (需要 USER 权限) ======================= */}
        <Route
          path="/user"
          element={<ProtectedRoute requiredRole={UserRole.USER} />}
        >
          <Route element={<UserLayout />}>
            <Route path="home" element={<UserHomePage />} />
            <Route path="reservations" element={<UserReservationPage />} />
            <Route path="confirm" element={<UserConfirmPage />} />
            <Route path="help" element={<UserHelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="secure" element={<SecurityPage />} />
          </Route>
        </Route>

        {/* ==================== 管理员端路由 (需要 ADMIN 权限) ==================== */}
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRole={UserRole.ADMIN} />}
        >
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="room-manage" element={<AdminRoomManagePage />} />
            <Route path="reservations" element={<AdminReservationPage />} />
            <Route path="schedule" element={<AdminSchedulePage />} />
            <Route path="help" element={<AdminHelpPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="secure" element={<SecurityPage />} />

            {/* 复用用户端功能 */}
            <Route path="book/home" element={<UserHomePage />} />
            <Route path="book/mine" element={<UserReservationPage />} />
            <Route path="book/confirm" element={<UserConfirmPage />} />
          </Route>
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
