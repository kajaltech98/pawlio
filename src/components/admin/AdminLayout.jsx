import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./admin.css";

export default function AdminLayout({ title = "Admin Console", children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main dashboard content area */}
      <div className="admin-main">
        <AdminHeader
          title={title}
          onMobileToggle={() => setMobileSidebarOpen(true)}
        />
        <main className="admin-body">{children}</main>
      </div>
    </div>
  );
}
