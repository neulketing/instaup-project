import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import AdminNotificationSystem from "../components/AdminNotificationSystem";
import AdvancedAnalyticsDashboard from "../components/AdvancedAnalyticsDashboard";
import AutomationManagement from "../components/AutomationManagement";
import ConnectionManagement from "../components/ConnectionManagement";
import DataExportPanel from "../components/DataExportPanel";
import ProductManagement from "../components/ProductManagement";
import RoleManagement from "../components/RoleManagement";
import ServiceManagementModal from "../components/ServiceManagementModal";
import { PermissionGuard, usePermissions } from "../hooks/usePermissions";
import {
  type DashboardMetrics,
  type OrderData,
  type ProductData,
  type ServiceData,
  type UserData,
  adminApi,
} from "../services/adminApi";

interface AdminSession {
  id: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
  loginTime: string;
  permissions: string[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "orders"
    | "users"
    | "services"
    | "products"
    | "connections"
    | "analytics"
    | "automation"
    | "roles"
  >("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] =
    useState<DashboardMetrics | null>(null);

  // 주문 관리 상태
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [orderFilters, setOrderFilters] = useState({
    status: "all",
    platform: "all",
    search: "",
    page: 1,
    limit: 20,
  });

  // 사용자 관리 상태
  const [users, setUsers] = useState<UserData[]>([]);
  const [userFilters, setUserFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 20,
  });

  // 서비스 관리 상태
  const [services, setServices] = useState<ServiceData[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(
    null,
  );
  const [serviceModalMode, setServiceModalMode] = useState<
    "create" | "edit" | "view"
  >("create");

  // UI 상태
  const [showExportPanel, setShowExportPanel] = useState(false);

  // 관리자 세션 확인
  useEffect(() => {
    const checkAdminSession = () => {
      const savedSession = localStorage.getItem("adminSession");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setAdminSession(session);
          setLoading(false);
          return;
        } catch (error) {
          console.error("관리자 세션 파싱 오류:", error);
          localStorage.removeItem("adminSession");
        }
      }
      setLoading(false);
    };

    checkAdminSession();
  }, []);

  // 대시보드 데이터 로드
  useEffect(() => {
    if (adminSession && activeTab === "dashboard") {
      loadDashboardMetrics();
    }
  }, [adminSession, activeTab]);

  // 주문 데이터 로드
  useEffect(() => {
    if (adminSession && activeTab === "orders") {
      loadOrders();
    }
  }, [adminSession, activeTab, orderFilters]);

  // 사용자 데이터 로드
  useEffect(() => {
    if (adminSession && activeTab === "users") {
      loadUsers();
    }
  }, [adminSession, activeTab, userFilters]);

  // 서비스 데이터 로드
  useEffect(() => {
    if (adminSession && activeTab === "services") {
      loadServices();
    }
  }, [adminSession, activeTab]);

  const loadDashboardMetrics = async () => {
    try {
      const response = await adminApi.getDashboardMetrics();
      if (response.success && response.data) {
        setDashboardMetrics(response.data);
      }
    } catch (error) {
      console.error("대시보드 메트릭 로드 실패:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await adminApi.getOrders({
        ...orderFilters,
        status: orderFilters.status === "all" ? undefined : orderFilters.status,
        platform:
          orderFilters.platform === "all" ? undefined : orderFilters.platform,
      });
      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("주문 목록 로드 실패:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers({
        ...userFilters,
        status: userFilters.status === "all" ? undefined : userFilters.status,
      });
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("사용자 목록 로드 실패:", error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await adminApi.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("서비스 목록 로드 실패:", error);
    }
  };

  const handleLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
  };

  const handleLogout = () => {
    if (confirm("정말로 로그아웃하시겠습니까?")) {
      localStorage.removeItem("adminSession");
      setAdminSession(null);
      navigate("/");
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: string,
  ) => {
    try {
      const response = await adminApi.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as OrderData["status"] }
              : order,
          ),
        );
        alert("주문 상태가 업데이트되었습니다.");
      }
    } catch (error) {
      console.error("주문 상태 업데이트 실패:", error);
      alert("주문 상태 업데이트에 실패했습니다.");
    }
  };

  const handleUserStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const response = await adminApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, status: newStatus as UserData["status"] }
              : user,
          ),
        );
        alert("사용자 상태가 업데이트되었습니다.");
      }
    } catch (error) {
      console.error("사용자 상태 업데이트 실패:", error);
      alert("사용자 상태 업데이트에 실패했습니다.");
    }
  };

  const handleNotificationClick = (notification: any) => {
    console.log("알림 클릭:", notification);
    // 알림 타입에 따른 처리
    if (notification.type === "order" && notification.data?.orderId) {
      setActiveTab("orders");
      // 특정 주문으로 스크롤 또는 필터링
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setServiceModalMode("create");
    setShowServiceModal(true);
  };

  const handleEditService = (service: ServiceData) => {
    setSelectedService(service);
    setServiceModalMode("edit");
    setShowServiceModal(true);
  };

  const handleViewService = (service: ServiceData) => {
    setSelectedService(service);
    setServiceModalMode("view");
    setShowServiceModal(true);
  };

  const handleSaveService = async (serviceData: Partial<ServiceData>) => {
    try {
      if (serviceModalMode === "create") {
        const response = await adminApi.createService(
          serviceData as Omit<ServiceData, "id" | "createdAt" | "updatedAt">,
        );
        if (response.success && response.data) {
          setServices((prev) => [...prev, response.data]);
        }
      } else if (serviceModalMode === "edit" && selectedService) {
        const response = await adminApi.updateService(
          selectedService.id,
          serviceData,
        );
        if (response.success && response.data) {
          setServices((prev) =>
            prev.map((s) => (s.id === selectedService.id ? response.data! : s)),
          );
        }
      }
      setShowServiceModal(false);
      alert("서비스가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("서비스 저장 실패:", error);
      alert("서비스 저장에 실패했습니다.");
    }
  };

  const handleCopyService = async (service: ServiceData) => {
    try {
      const copiedService = {
        ...service,
        name: `${service.name} (복사본)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        totalOrders: 0,
        totalRevenue: 0,
      };

      const response = await adminApi.createService(
        copiedService as Omit<ServiceData, "id" | "createdAt" | "updatedAt">,
      );
      if (response.success && response.data) {
        setServices((prev) => [...prev, response.data]);
        alert("서비스가 성공적으로 복사되었습니다.");
      }
    } catch (error) {
      console.error("서비스 복사 실패:", error);
      alert("서비스 복사에 실패했습니다.");
    }
  };

  const handleToggleServiceVisibility = async (
    serviceId: string,
    isHidden: boolean,
  ) => {
    try {
      const response = await adminApi.updateService(serviceId, { isHidden });
      if (response.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === serviceId ? { ...s, isHidden } : s)),
        );
        alert(`서비스가 ${isHidden ? "숨김" : "표시"} 처리되었습니다.`);
      }
    } catch (error) {
      console.error("서비스 표시 상태 변경 실패:", error);
      alert("서비스 표시 상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await adminApi.deleteService(serviceId);
      if (response.success) {
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
        alert("서비스가 성공적으로 삭제되었습니다.");
      }
    } catch (error) {
      console.error("서비스 삭제 실패:", error);
      alert("서비스 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 시스템 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!adminSession) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl">←</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                🛠️ InstaUp 관리자 대시보드
              </h1>
            </div>

            {/* 헤더 우측 */}
            <div className="flex items-center gap-4">
              {/* 실시간 알림 시스템 */}
              <AdminNotificationSystem
                adminId={adminSession.id}
                onNotificationClick={handleNotificationClick}
              />

              {/* 데이터 내보내기 버튼 */}
              <button
                onClick={() => setShowExportPanel(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                title="데이터 내보내기"
              >
                📊 내보내기
              </button>

              {/* 관리자 정보 */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-right">
                  <div className="font-medium text-gray-900">
                    {adminSession.name}
                  </div>
                  <div className="text-gray-600">{adminSession.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: "dashboard", label: "📊 대시보드", icon: "📊" },
                { id: "orders", label: "📦 주문 관리", icon: "📦" },
                { id: "users", label: "👥 사용자 관리", icon: "👥" },
                { id: "services", label: "🛍️ 서비스 관리", icon: "🛍️" },
                { id: "products", label: "📦 상품 관리", icon: "📦" },
                { id: "connections", label: "🔗 연결 관리", icon: "🔗" },
                { id: "analytics", label: "📈 고급 분석", icon: "📈" },
                { id: "automation", label: "🤖 자동화", icon: "🤖" },
                { id: "roles", label: "🔐 권한 관리", icon: "🔐" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 대시보드 */}
        {activeTab === "dashboard" && dashboardMetrics && (
          <div className="space-y-8">
            {/* 개요 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">👥</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics.overview.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">총 사용자</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📦</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {dashboardMetrics.overview.totalOrders.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">총 주문</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">💰</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₩{dashboardMetrics.overview.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">총 매출</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">⏳</div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardMetrics.overview.pendingOrders}
                    </div>
                    <div className="text-sm text-gray-600">대기 중 주문</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🎯</div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardMetrics.overview.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-600">전환율</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📈</div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      +{dashboardMetrics.revenue.growth.daily}%
                    </div>
                    <div className="text-sm text-gray-600">일일 성장률</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 플랫폼별 통계 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  플랫폼별 현황
                </h3>
                <div className="space-y-4">
                  {Object.entries(dashboardMetrics.platforms).map(
                    ([platform, data]) => (
                      <div
                        key={platform}
                        className="flex items-center justify-between p-3 bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">
                            {platform === "instagram"
                              ? "📷"
                              : platform === "youtube"
                                ? "🎥"
                                : platform === "tiktok"
                                  ? "🎵"
                                  : platform === "facebook"
                                    ? "📘"
                                    : "🐦"}
                          </span>
                          <span className="font-medium capitalize">
                            {platform}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {data.orders.toLocaleString()}건
                          </div>
                          <div className="text-sm text-gray-600">
                            ₩{data.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  인기 서비스
                </h3>
                <div className="space-y-4">
                  {dashboardMetrics.topServices.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{service.orders}건</div>
                        <div className="text-sm text-gray-600">
                          ₩{service.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                최근 활동
              </h3>
              <div className="space-y-3">
                {dashboardMetrics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">
                        {activity.type === "order"
                          ? "🛒"
                          : activity.type === "payment"
                            ? "💳"
                            : activity.type === "user"
                              ? "👤"
                              : "📢"}
                      </span>
                      <span>{activity.description}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleString("ko-KR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 주문 관리 */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* 필터 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="pending">대기 중</option>
                    <option value="processing">처리 중</option>
                    <option value="completed">완료</option>
                    <option value="failed">실패</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    플랫폼
                  </label>
                  <select
                    value={orderFilters.platform}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        platform: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색
                  </label>
                  <input
                    type="text"
                    value={orderFilters.search}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        search: e.target.value,
                      })
                    }
                    placeholder="주문 ID, 사용자 ID 검색"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={loadOrders}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* 주문 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  주문 목록
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        서비스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        플랫폼
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수량
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.serviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{order.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusUpdate(order.id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">대기 중</option>
                            <option value="processing">처리 중</option>
                            <option value="completed">완료</option>
                            <option value="failed">실패</option>
                            <option value="cancelled">취소</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 사용자 관리 */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* 필터 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={userFilters.status}
                    onChange={(e) =>
                      setUserFilters({ ...userFilters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="active">활성</option>
                    <option value="suspended">정지</option>
                    <option value="banned">차단</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색
                  </label>
                  <input
                    type="text"
                    value={userFilters.search}
                    onChange={(e) =>
                      setUserFilters({ ...userFilters, search: e.target.value })
                    }
                    placeholder="사용자명, 이메일 검색"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={loadUsers}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* 사용자 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  사용자 목록
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        잔액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        주문수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        총 지출
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{user.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalOrders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{user.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "suspended"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.joinDate).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.status}
                            onChange={(e) =>
                              handleUserStatusUpdate(user.id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="active">활성</option>
                            <option value="suspended">정지</option>
                            <option value="banned">차단</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 서비스 관리 */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  서비스 목록
                </h3>
                <button
                  onClick={handleCreateService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + 새 서비스 추가
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => handleViewService(service)}
                      >
                        {service.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.isActive ? "활성" : "비활성"}
                        </span>
                        {service.isHidden && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            숨김
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>플랫폼: {service.platform}</div>
                      <div>카테고리: {service.category}</div>
                      <div>가격: ₩{service.price}/100개</div>
                      <div>
                        주문 범위: {service.minOrder}-{service.maxOrder}
                      </div>
                      <div>총 주문: {service.totalOrders}건</div>
                      <div>
                        총 매출: ₩{service.totalRevenue.toLocaleString()}
                      </div>
                      <div>배송 시간: {service.deliveryTime}</div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="서비스 수정"
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => handleCopyService(service)}
                        className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="서비스 복사"
                      >
                        📋 복사
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="서비스 삭제"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          handleToggleServiceVisibility(
                            service.id,
                            !service.isHidden,
                          )
                        }
                        className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                          service.isHidden
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                        }`}
                        title={
                          service.isHidden ? "서비스 표시하기" : "서비스 숨기기"
                        }
                      >
                        {service.isHidden ? "👁️ 표시" : "🙈 숨기기"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {services.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                  <p className="text-gray-600 mb-4">등록된 서비스가 없습니다</p>
                  <button
                    onClick={handleCreateService}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    첫 번째 서비스 추가하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 상품 관리 */}
        {activeTab === "products" && <ProductManagement services={services} />}

        {/* 연결 관리 */}
        {activeTab === "connections" && <ConnectionManagement />}

        {/* 고급 분석 */}
        {activeTab === "analytics" && (
          <PermissionGuard
            permissionId="analytics.view"
            fallback={
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  접근 권한이 없습니다
                </h3>
                <p className="text-gray-600">
                  고급 분석 기능을 사용하려면 관리자 권한이 필요합니다.
                </p>
              </div>
            }
          >
            <AdvancedAnalyticsDashboard />
          </PermissionGuard>
        )}

        {/* 자동화 관리 */}
        {activeTab === "automation" && (
          <PermissionGuard
            permissionId="automation.view"
            fallback={
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  접근 권한이 없습니다
                </h3>
                <p className="text-gray-600">
                  자동화 관리 기능을 사용하려면 관리자 권한이 필요합니다.
                </p>
              </div>
            }
          >
            <AutomationManagement />
          </PermissionGuard>
        )}

        {/* 권한 관리 */}
        {activeTab === "roles" && (
          <PermissionGuard
            permissionId="system.manage"
            fallback={
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  접근 권한이 없습니다
                </h3>
                <p className="text-gray-600">
                  권한 관리 기능을 사용하려면 최고 관리자 권한이 필요합니다.
                </p>
              </div>
            }
          >
            <RoleManagement />
          </PermissionGuard>
        )}
      </div>

      {/* 데이터 내보내기 패널 */}
      {showExportPanel && (
        <DataExportPanel
          data={{
            orders,
            users,
            services,
            analytics: [],
          }}
          onClose={() => setShowExportPanel(false)}
        />
      )}

      {/* 서비스 관리 모달 */}
      {showServiceModal && (
        <ServiceManagementModal
          isOpen={showServiceModal}
          service={selectedService}
          mode={serviceModalMode}
          onSave={handleSaveService}
          onCopy={handleCopyService}
          onToggleVisibility={handleToggleServiceVisibility}
          onDelete={handleDeleteService}
          onClose={() => setShowServiceModal(false)}
        />
      )}
    </div>
  );
}
