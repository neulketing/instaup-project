import type React from "react";
import { useEffect, useState } from "react";
import TossProductManagement from "./TossProductManagement";

// 토스 디자인 시스템 색상
const TossColors = {
  primary: "#3182F6",
  primaryHover: "#1B64DA",
  primaryLight: "#E8F3FF",
  secondary: "#F2F4F6",
  success: "#00C73C",
  warning: "#FFB800",
  error: "#F04452",
  text: {
    primary: "#191F28",
    secondary: "#6B7684",
    tertiary: "#8B95A1",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
  },
  border: "#E5E8EB",
};

// 대시보드 데이터 타입
interface DashboardMetrics {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  platforms: {
    [key: string]: {
      orders: number;
      revenue: number;
      growth: number;
    };
  };
  revenue: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    growth: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  topServices: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    amount?: number;
    serviceId?: string;
  }>;
}

// API 서비스
class DashboardAPI {
  private static baseURL =
    import.meta.env.VITE_BACKEND_API_URL ||
    "https://instaup-production.up.railway.app";

  static async getDashboardMetrics(): Promise<{
    success: boolean;
    data: DashboardMetrics;
  }> {
    const response = await fetch(`${this.baseURL}/api/admin/dashboard`);
    return response.json();
  }

  static async getOrders(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/api/admin/orders?${params}`);
    return response.json();
  }

  static async updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(
      `${this.baseURL}/api/admin/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    return response.json();
  }
}

// 토스 스타일 카드 컴포넌트
const TossCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}> = ({ children, className = "", hoverable = false }) => {
  const hoverEffect = hoverable ? "hover:shadow-lg hover:-translate-y-1" : "";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-[${TossColors.border}] transition-all duration-200 ${hoverEffect} ${className}`}
    >
      {children}
    </div>
  );
};

// 통계 카드 컴포넌트
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
  prefix?: string;
  suffix?: string;
}> = ({ title, value, change, icon, color, prefix = "", suffix = "" }) => {
  const changeColor =
    change && change > 0
      ? "text-green-600"
      : change && change < 0
        ? "text-red-600"
        : "text-gray-500";
  const changeIcon =
    change && change > 0 ? "↗" : change && change < 0 ? "↘" : "";

  return (
    <TossCard hoverable className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#6B7684] text-sm font-medium">{title}</div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-[#191F28]">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </span>
      </div>

      {change !== undefined && (
        <div
          className={`text-sm font-medium ${changeColor} flex items-center gap-1`}
        >
          <span>{changeIcon}</span>
          <span>{Math.abs(change)}%</span>
          <span className="text-[#6B7684]">vs 어제</span>
        </div>
      )}
    </TossCard>
  );
};

// 플랫폼 통계 컴포넌트
const PlatformStats: React.FC<{ platforms: DashboardMetrics["platforms"] }> = ({
  platforms,
}) => {
  const platformInfo: {
    [key: string]: { name: string; icon: string; color: string };
  } = {
    instagram: { name: "인스타그램", icon: "📷", color: "#E4405F" },
    youtube: { name: "유튜브", icon: "🎥", color: "#FF0000" },
    tiktok: { name: "틱톡", icon: "🎵", color: "#000000" },
    facebook: { name: "페이스북", icon: "📘", color: "#1877F2" },
    twitter: { name: "트위터", icon: "🐦", color: "#1DA1F2" },
  };

  return (
    <TossCard className="p-6">
      <h3 className="text-lg font-bold text-[#191F28] mb-6">플랫폼별 성과</h3>

      <div className="space-y-4">
        {Object.entries(platforms).map(([platform, data]) => {
          const info = platformInfo[platform] || {
            name: platform,
            icon: "📱",
            color: TossColors.primary,
          };

          return (
            <div
              key={platform}
              className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  {info.icon}
                </div>
                <div>
                  <div className="font-semibold text-[#191F28]">
                    {info.name}
                  </div>
                  <div className="text-sm text-[#6B7684]">
                    {data.orders.toLocaleString()}건 주문
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-[#191F28] text-lg">
                  ₩{(data.revenue / 1000000).toFixed(1)}M
                </div>
                <div
                  className={`text-sm font-medium ${data.growth > 0 ? "text-green-600" : data.growth < 0 ? "text-red-600" : "text-gray-500"}`}
                >
                  {data.growth > 0 ? "+" : ""}
                  {data.growth}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TossCard>
  );
};

// 최근 활동 컴포넌트
const RecentActivity: React.FC<{
  activities: DashboardMetrics["recentActivity"];
}> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return "🛒";
      case "payment":
        return "💳";
      case "service":
        return "⚙️";
      case "user":
        return "👤";
      default:
        return "📢";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return TossColors.primary;
      case "payment":
        return TossColors.success;
      case "service":
        return TossColors.warning;
      case "user":
        return TossColors.secondary;
      default:
        return TossColors.text.secondary;
    }
  };

  return (
    <TossCard className="p-6">
      <h3 className="text-lg font-bold text-[#191F28] mb-6">최근 활동</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{
                backgroundColor: `${getActivityColor(activity.type)}15`,
              }}
            >
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#191F28] leading-relaxed">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#6B7684]">
                  {new Date(activity.timestamp).toLocaleString("ko-KR")}
                </span>
                {activity.amount && (
                  <span className="text-xs bg-[#E8F3FF] text-[#3182F6] px-2 py-1 rounded-md font-medium">
                    ₩{activity.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </TossCard>
  );
};

// 인기 서비스 컴포넌트
const TopServices: React.FC<{ services: DashboardMetrics["topServices"] }> = ({
  services,
}) => {
  return (
    <TossCard className="p-6">
      <h3 className="text-lg font-bold text-[#191F28] mb-6">인기 서비스</h3>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                      ? "bg-gray-400"
                      : index === 2
                        ? "bg-orange-500"
                        : "bg-[#3182F6]"
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-[#191F28] text-sm">
                  {service.name}
                </div>
                <div className="text-xs text-[#6B7684]">
                  {service.orders.toLocaleString()}건 주문
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-[#191F28]">
                ₩{(service.revenue / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        ))}
      </div>
    </TossCard>
  );
};

// 주문 관리 컴포넌트
const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    platform: "all",
    search: "",
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await DashboardAPI.getOrders(filters);
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("주문 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await DashboardAPI.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        loadOrders();
      }
    } catch (error) {
      console.error("주문 상태 업데이트 실패:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "대기 중",
      processing: "처리 중",
      completed: "완료",
      failed: "실패",
      cancelled: "취소",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <TossCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              상태
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
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
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              플랫폼
            </label>
            <select
              value={filters.platform}
              onChange={(e) =>
                setFilters({ ...filters, platform: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              검색
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="주문 ID, 사용자 ID 검색"
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
            />
          </div>
        </div>
      </TossCard>

      {/* 주문 목록 */}
      <TossCard>
        <div className="p-6 border-b border-[#E5E8EB]">
          <h3 className="text-lg font-bold text-[#191F28]">주문 목록</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-[#3182F6] border-t-transparent rounded-full"></div>
            <span className="ml-3 text-[#6B7684]">로딩 중...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-bold text-[#191F28] mb-2">
              주문이 없습니다
            </h3>
            <p className="text-[#6B7684]">현재 조건에 맞는 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    주문 ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    서비스
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    플랫폼
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    수량
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    금액
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    생성일
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#191F28]">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8EB]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#191F28]">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#191F28]">
                      {order.serviceName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#191F28]">
                      {order.platform}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#191F28]">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#191F28]">
                      ₩{order.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7684]">
                      {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        className="text-xs border border-[#E5E8EB] rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
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
        )}
      </TossCard>
    </div>
  );
};

// 메인 대시보드 컴포넌트
export default function TossAdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "orders"
  >("dashboard");
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadDashboardData();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardAPI.getDashboardMetrics();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "dashboard", name: "대시보드", icon: "📊" },
    { id: "products", name: "상품 관리", icon: "📦" },
    { id: "orders", name: "주문 관리", icon: "🛒" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E5E8EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3182F6] to-[#1B64DA] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#191F28]">
                  InstaUp 관리자
                </h1>
                <p className="text-sm text-[#6B7684]">
                  토스 스타일 관리 대시보드
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm text-[#6B7684]">실시간 연동 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-[#E5E8EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#3182F6] text-[#3182F6]"
                    : "border-transparent text-[#6B7684] hover:text-[#191F28]"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-[#3182F6] border-t-transparent rounded-full"></div>
                <span className="ml-3 text-[#6B7684]">대시보드 로딩 중...</span>
              </div>
            ) : dashboardData ? (
              <div className="space-y-8">
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="총 사용자"
                    value={dashboardData.overview.totalUsers}
                    icon="👥"
                    color="#3182F6"
                    change={5.2}
                  />
                  <StatCard
                    title="총 주문"
                    value={dashboardData.overview.totalOrders}
                    icon="📦"
                    color="#00C73C"
                    change={12.8}
                  />
                  <StatCard
                    title="총 매출"
                    value={`${(dashboardData.overview.totalRevenue / 1000000).toFixed(1)}M`}
                    icon="💰"
                    color="#FFB800"
                    prefix="₩"
                    change={7.3}
                  />
                  <StatCard
                    title="전환율"
                    value={dashboardData.overview.conversionRate}
                    icon="🎯"
                    color="#F04452"
                    suffix="%"
                    change={-1.2}
                  />
                </div>

                {/* 그래프 및 세부 정보 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PlatformStats platforms={dashboardData.platforms} />
                  <TopServices services={dashboardData.topServices} />
                </div>

                {/* 최근 활동 */}
                <RecentActivity activities={dashboardData.recentActivity} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-[#191F28] mb-2">
                  데이터를 불러올 수 없습니다
                </h3>
                <p className="text-[#6B7684] mb-6">
                  백엔드 연결을 확인해주세요.
                </p>
                <button
                  onClick={loadDashboardData}
                  className="px-6 py-3 bg-[#3182F6] text-white rounded-xl font-medium hover:bg-[#1B64DA] transition-colors"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && <TossProductManagement />}
        {activeTab === "orders" && <OrderManagement />}
      </div>
    </div>
  );
}
