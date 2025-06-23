import type React from "react";
import { useEffect, useState } from "react";

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

// 상품 데이터 타입
interface Product {
  id: string;
  platform: string;
  category: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  quality: "standard" | "premium" | "vip";
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  totalOrders: number;
  totalRevenue: number;
  features: string[];
  warningNote?: string;
  createdAt: string;
  updatedAt: string;
}

// API 서비스
class ProductAPI {
  private static baseURL =
    import.meta.env.VITE_BACKEND_API_URL ||
    "https://instaup-production.up.railway.app";

  static async getProducts(filters?: {
    category?: string;
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.platform) params.append("platform", filters.platform);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(
      `${this.baseURL}/api/admin/products?${params}`,
    );
    return response.json();
  }

  static async createProduct(product: Partial<Product>) {
    const response = await fetch(`${this.baseURL}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return response.json();
  }

  static async updateProduct(id: string, product: Partial<Product>) {
    const response = await fetch(`${this.baseURL}/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return response.json();
  }

  static async deleteProduct(id: string) {
    const response = await fetch(`${this.baseURL}/api/admin/products/${id}`, {
      method: "DELETE",
    });
    return response.json();
  }
}

// 토스 스타일 버튼 컴포넌트
const TossButton: React.FC<{
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({
  variant = "primary",
  size = "medium",
  children,
  onClick,
  disabled = false,
  icon,
}) => {
  const getButtonStyles = () => {
    const baseStyles =
      "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

    const sizeStyles = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2.5 text-sm",
      large: "px-6 py-3 text-base",
    };

    const variantStyles = {
      primary: `bg-[${TossColors.primary}] hover:bg-[${TossColors.primaryHover}] text-white shadow-sm`,
      secondary: `bg-[${TossColors.secondary}] hover:bg-gray-200 text-[${TossColors.text.primary}]`,
      success: `bg-[${TossColors.success}] hover:bg-green-600 text-white`,
      warning: `bg-[${TossColors.warning}] hover:bg-yellow-600 text-white`,
      error: `bg-[${TossColors.error}] hover:bg-red-600 text-white`,
    };

    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles}`;
  };

  return (
    <button className={getButtonStyles()} onClick={onClick} disabled={disabled}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

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

// 플랫폼 아이콘 컴포넌트
const PlatformIcon: React.FC<{ platform: string; size?: number }> = ({
  platform,
  size = 24,
}) => {
  const icons: { [key: string]: { emoji: string; color: string } } = {
    instagram: { emoji: "📷", color: "#E4405F" },
    youtube: { emoji: "🎥", color: "#FF0000" },
    tiktok: { emoji: "🎵", color: "#000000" },
    facebook: { emoji: "📘", color: "#1877F2" },
    twitter: { emoji: "🐦", color: "#1DA1F2" },
  };

  const icon = icons[platform] || { emoji: "📱", color: TossColors.primary };

  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: `${icon.color}15`,
        fontSize: size * 0.6,
      }}
    >
      {icon.emoji}
    </div>
  );
};

// 상품 카드 컴포넌트
const ProductCard: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}> = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const qualityColors = {
    standard: TossColors.text.secondary,
    premium: TossColors.primary,
    vip: TossColors.warning,
  };

  const qualityBadges = {
    standard: { text: "STANDARD", bg: "bg-gray-100", color: "text-gray-600" },
    premium: { text: "PREMIUM", bg: "bg-blue-100", color: "text-blue-600" },
    vip: { text: "VIP", bg: "bg-yellow-100", color: "text-yellow-600" },
  };

  return (
    <TossCard hoverable className="p-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={product.platform} size={32} />
          <div>
            <h3 className="font-bold text-[#191F28] text-lg leading-tight">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${qualityBadges[product.quality].bg} ${qualityBadges[product.quality].color}`}
              >
                {qualityBadges[product.quality].text}
              </span>
              {product.isPopular && (
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-600">
                  인기
                </span>
              )}
              {product.isRecommended && (
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-600">
                  추천
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 상태 토글 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(product.id, !product.isActive)}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
              product.isActive ? "bg-[#3182F6]" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
                product.isActive ? "left-6" : "left-0.5"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${product.isActive ? "text-[#3182F6]" : "text-gray-500"}`}
          >
            {product.isActive ? "활성" : "비활성"}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-[#6B7684] text-sm mb-4 line-clamp-2 leading-relaxed">
        {product.description}
      </p>

      {/* 가격 정보 */}
      <div className="bg-[#F9FAFB] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#6B7684] text-sm">가격 (100개당)</span>
          <div className="flex items-center gap-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 text-sm line-through">
                ₩{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-[#191F28] font-bold text-lg">
              ₩{product.price.toLocaleString()}
            </span>
            {product.discount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#6B7684]">최소 주문</span>
            <div className="font-medium text-[#191F28]">
              {product.minOrder.toLocaleString()}개
            </div>
          </div>
          <div>
            <span className="text-[#6B7684]">최대 주문</span>
            <div className="font-medium text-[#191F28]">
              {product.maxOrder.toLocaleString()}개
            </div>
          </div>
          <div>
            <span className="text-[#6B7684]">처리 시간</span>
            <div className="font-medium text-[#191F28]">
              {product.deliveryTime}
            </div>
          </div>
          <div>
            <span className="text-[#6B7684]">총 주문</span>
            <div className="font-medium text-[#191F28]">
              {product.totalOrders.toLocaleString()}건
            </div>
          </div>
        </div>
      </div>

      {/* 매출 정보 */}
      <div className="bg-[#E8F3FF] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[#3182F6] font-medium text-sm">총 매출</span>
          <span className="text-[#3182F6] font-bold text-lg">
            ₩{product.totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 특징 태그 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {product.features.slice(0, 3).map((feature, index) => (
          <span
            key={index}
            className="bg-[#F2F4F6] text-[#6B7684] text-xs px-3 py-1 rounded-full"
          >
            {feature}
          </span>
        ))}
        {product.features.length > 3 && (
          <span className="bg-[#F2F4F6] text-[#6B7684] text-xs px-3 py-1 rounded-full">
            +{product.features.length - 3}개 더
          </span>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <TossButton
          variant="primary"
          size="small"
          onClick={() => onEdit(product)}
          icon="✏️"
        >
          수정
        </TossButton>

        <TossButton
          variant="secondary"
          size="small"
          onClick={() => navigator.clipboard.writeText(product.id)}
          icon="📋"
        >
          ID 복사
        </TossButton>

        <TossButton
          variant="error"
          size="small"
          onClick={() => onDelete(product.id)}
          icon="🗑️"
        >
          삭제
        </TossButton>
      </div>
    </TossCard>
  );
};

// 상품 편집 모달
const ProductEditModal: React.FC<{
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}> = ({ isOpen, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        platform: "instagram",
        category: "followers",
        name: "",
        description: "",
        price: 0,
        minOrder: 1,
        maxOrder: 1000,
        deliveryTime: "1~24시간",
        quality: "standard",
        isActive: true,
        isPopular: false,
        isRecommended: false,
        features: [],
      });
    }
  }, [product]);

  const handleSave = () => {
    if (formData.name && formData.description && formData.price) {
      onSave(formData as Product);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E8EB]">
          <h2 className="text-xl font-bold text-[#191F28]">
            {product ? "상품 수정" : "새 상품 추가"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                플랫폼
              </label>
              <select
                value={formData.platform || ""}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                카테고리
              </label>
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
              >
                <option value="followers">팔로워</option>
                <option value="likes">좋아요</option>
                <option value="views">조회수</option>
                <option value="comments">댓글</option>
                <option value="subscribers">구독자</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              상품명
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
              placeholder="상품명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              상품 설명
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent resize-none"
              placeholder="상품 설명을 입력하세요"
            />
          </div>

          {/* 가격 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                가격 (100개당)
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                처리 시간
              </label>
              <input
                type="text"
                value={formData.deliveryTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryTime: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                placeholder="1~24시간"
              />
            </div>
          </div>

          {/* 주문 수량 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                최소 주문
              </label>
              <input
                type="number"
                value={formData.minOrder || ""}
                onChange={(e) =>
                  setFormData({ ...formData, minOrder: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                최대 주문
              </label>
              <input
                type="number"
                value={formData.maxOrder || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maxOrder: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                placeholder="1000"
              />
            </div>
          </div>

          {/* 품질 및 옵션 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">
                품질
              </label>
              <select
                value={formData.quality || ""}
                onChange={(e) =>
                  setFormData({ ...formData, quality: e.target.value as any })
                }
                className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isPopular: e.target.checked })
                  }
                  className="w-5 h-5 text-[#3182F6] border-2 border-gray-300 rounded focus:ring-[#3182F6]"
                />
                <span className="text-sm font-medium text-[#191F28]">
                  인기 상품
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecommended || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isRecommended: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-[#3182F6] border-2 border-gray-300 rounded focus:ring-[#3182F6]"
                />
                <span className="text-sm font-medium text-[#191F28]">
                  추천 상품
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#E5E8EB]">
          <TossButton variant="secondary" onClick={onClose}>
            취소
          </TossButton>
          <TossButton variant="primary" onClick={handleSave}>
            저장
          </TossButton>
        </div>
      </div>
    </div>
  );
};

// 메인 상품 관리 컴포넌트
export default function TossProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    platform: "all",
    category: "all",
    status: "all",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductAPI.getProducts(filters);
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("상품 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 이 상품을 삭제하시겠습니까?")) {
      try {
        const response = await ProductAPI.deleteProduct(id);
        if (response.success) {
          loadProducts();
        }
      } catch (error) {
        console.error("상품 삭제 실패:", error);
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await ProductAPI.updateProduct(id, { isActive });
      if (response.success) {
        loadProducts();
      }
    } catch (error) {
      console.error("상품 상태 변경 실패:", error);
    }
  };

  const handleSave = async (product: Product) => {
    try {
      let response;
      if (editingProduct) {
        response = await ProductAPI.updateProduct(product.id, product);
      } else {
        response = await ProductAPI.createProduct(product);
      }

      if (response.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      }
    } catch (error) {
      console.error("상품 저장 실패:", error);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    popular: products.filter((p) => p.isPopular).length,
    totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0),
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#191F28] mb-2">
                📦 상품 관리
              </h1>
              <p className="text-[#6B7684] text-lg">
                서비스 상품을 효율적으로 관리하세요
              </p>
            </div>
            <TossButton
              variant="primary"
              size="large"
              onClick={handleAddNew}
              icon="+"
            >
              새 상품 추가
            </TossButton>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <TossCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#191F28] mb-1">
                  {stats.total}
                </div>
                <div className="text-[#6B7684] text-sm">전체 상품</div>
              </div>
            </TossCard>

            <TossCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#3182F6] mb-1">
                  {stats.active}
                </div>
                <div className="text-[#6B7684] text-sm">활성 상품</div>
              </div>
            </TossCard>

            <TossCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00C73C] mb-1">
                  {stats.popular}
                </div>
                <div className="text-[#6B7684] text-sm">인기 상품</div>
              </div>
            </TossCard>

            <TossCard className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFB800] mb-1">
                  ₩{(stats.totalRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-[#6B7684] text-sm">총 매출</div>
              </div>
            </TossCard>
          </div>

          {/* 필터 */}
          <TossCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="상품명으로 검색"
                  className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                />
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
                  카테고리
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl focus:ring-2 focus:ring-[#3182F6] focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="followers">팔로워</option>
                  <option value="likes">좋아요</option>
                  <option value="views">조회수</option>
                  <option value="comments">댓글</option>
                  <option value="subscribers">구독자</option>
                </select>
              </div>

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
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </div>
          </TossCard>
        </div>

        {/* 상품 그리드 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#3182F6] border-t-transparent rounded-full"></div>
            <span className="ml-3 text-[#6B7684]">로딩 중...</span>
          </div>
        ) : products.length === 0 ? (
          <TossCard className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-[#191F28] mb-2">
              상품이 없습니다
            </h3>
            <p className="text-[#6B7684] mb-6">첫 번째 상품을 추가해보세요</p>
            <TossButton variant="primary" onClick={handleAddNew}>
              상품 추가하기
            </TossButton>
          </TossCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* 편집 모달 */}
        <ProductEditModal
          isOpen={isModalOpen}
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
