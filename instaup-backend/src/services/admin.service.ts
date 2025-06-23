import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardMetrics = async () => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();

    const revenueData = await prisma.order.aggregate({
      _sum: {
        charge: true,
      },
      where: {
        OR: [
          { status: OrderStatus.COMPLETED },
          { status: OrderStatus.PARTIAL },
        ],
      },
    });
    const totalRevenue = revenueData._sum.charge || 0;

    // Fetch admin logs count as an example of another metric
    const totalAdminLogs = await prisma.adminLog.count();

    // 추가 대시보드 메트릭스
    const pendingOrders = await prisma.order.count({
      where: { status: OrderStatus.PENDING }
    });

    const completedOrders = await prisma.order.count({
      where: { status: OrderStatus.COMPLETED }
    });

    // 오늘과 어제 매출 비교
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayRevenue = await prisma.order.aggregate({
      _sum: { charge: true },
      where: {
        createdAt: { gte: today },
        OR: [
          { status: OrderStatus.COMPLETED },
          { status: OrderStatus.PARTIAL },
        ],
      },
    });

    const yesterdayRevenue = await prisma.order.aggregate({
      _sum: { charge: true },
      where: {
        createdAt: {
          gte: yesterday,
          lt: today
        },
        OR: [
          { status: OrderStatus.COMPLETED },
          { status: OrderStatus.PARTIAL },
        ],
      },
    });

    const todayAmount = todayRevenue._sum.charge || 0;
    const yesterdayAmount = yesterdayRevenue._sum.charge || 0;
    const dailyGrowth = yesterdayAmount > 0 ? ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100 : 0;

    // 최근 활동
    const recentActivity = [
      {
        type: 'system',
        description: '대시보드 메트릭스가 업데이트되었습니다',
        timestamp: new Date().toISOString(),
      },
      {
        type: 'order',
        description: `오늘 ${await prisma.order.count({ where: { createdAt: { gte: today } } })}개의 새 주문이 생성되었습니다`,
        timestamp: new Date().toISOString(),
        amount: todayAmount,
      }
    ];

    // 인기 서비스 (임시 데이터)
    const topServices = [
      {
        id: 'instagram_followers',
        name: '인스타그램 팔로워',
        orders: 150,
        revenue: 2500000,
      },
      {
        id: 'instagram_likes',
        name: '인스타그램 좋아요',
        orders: 89,
        revenue: 890000,
      },
      {
        id: 'youtube_views',
        name: '유튜브 조회수',
        orders: 45,
        revenue: 450000,
      }
    ];

    // 플랫폼별 성과 (임시 데이터)
    const platforms = {
      instagram: { orders: 250, revenue: 4200000, growth: 12.5 },
      youtube: { orders: 89, revenue: 1800000, growth: 8.3 },
      tiktok: { orders: 67, revenue: 950000, growth: 15.2 },
      facebook: { orders: 34, revenue: 680000, growth: -2.1 },
      twitter: { orders: 12, revenue: 240000, growth: 5.7 },
    };

    return {
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
          conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
          avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        platforms,
        revenue: {
          today: todayAmount,
          yesterday: yesterdayAmount,
          thisWeek: 0, // TODO: 주간 계산
          lastWeek: 0,
          thisMonth: 0, // TODO: 월간 계산
          lastMonth: 0,
          growth: {
            daily: dailyGrowth,
            weekly: 0,
            monthly: 0,
          },
        },
        topServices,
        recentActivity,
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw new Error('Failed to retrieve dashboard metrics.');
  }
};

// Product 관리 서비스 함수들
export const getProducts = async (filters: any) => {
  try {
    const { category, platform, search, page, limit, isActive } = filters;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (platform && platform !== 'all') {
      where.platform = platform;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to get products');
  }
};

export const createProduct = async (productData: any) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        features: JSON.stringify(productData.features || []),
      },
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
};

export const updateProduct = async (id: string, productData: any) => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        features: productData.features ? JSON.stringify(productData.features) : undefined,
        updatedAt: new Date(),
      },
    });
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// 플랫폼 관리 서비스 함수들 (임시 구현)
export const getPlatforms = async () => {
  try {
    // 임시 플랫폼 데이터 (실제로는 데이터베이스에서 가져와야 함)
    const platforms = [
      {
        id: 'instagram',
        name: '인스타그램',
        icon: '📷',
        color: '#E4405F',
        isActive: true,
        isVisible: true,
        sortOrder: 1,
        description: '인스타그램 마케팅 서비스',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'youtube',
        name: '유튜브',
        icon: '🎥',
        color: '#FF0000',
        isActive: true,
        isVisible: true,
        sortOrder: 2,
        description: '유튜브 마케팅 서비스',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tiktok',
        name: '틱톡',
        icon: '🎵',
        color: '#000000',
        isActive: true,
        isVisible: true,
        sortOrder: 3,
        description: '틱톡 마케팅 서비스',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'facebook',
        name: '페이스북',
        icon: '📘',
        color: '#1877F2',
        isActive: true,
        isVisible: true,
        sortOrder: 4,
        description: '페이스북 마케팅 서비스',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'twitter',
        name: '트위터',
        icon: '🐦',
        color: '#1DA1F2',
        isActive: true,
        isVisible: true,
        sortOrder: 5,
        description: '트위터 마케팅 서비스',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    return platforms;
  } catch (error) {
    console.error('Error getting platforms:', error);
    throw new Error('Failed to get platforms');
  }
};

export const createPlatform = async (platformData: any) => {
  try {
    // 임시 구현 - 실제로는 플랫폼 테이블에 저장
    const platform = {
      ...platformData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return platform;
  } catch (error) {
    console.error('Error creating platform:', error);
    throw new Error('Failed to create platform');
  }
};

export const updatePlatform = async (id: string, platformData: any) => {
  try {
    // 임시 구현 - 실제로는 플랫폼 테이블 업데이트
    const platform = {
      id,
      ...platformData,
      updatedAt: new Date().toISOString(),
    };
    return platform;
  } catch (error) {
    console.error('Error updating platform:', error);
    throw new Error('Failed to update platform');
  }
};

export const deletePlatform = async (id: string) => {
  try {
    // 임시 구현 - 실제로는 플랫폼 테이블에서 삭제
    console.log(`Platform ${id} deleted`);
  } catch (error) {
    console.error('Error deleting platform:', error);
    throw new Error('Failed to delete platform');
  }
};

// 주문 관리 서비스 함수들
export const getOrders = async (filters: any) => {
  try {
    const { status, platform, search, page, limit } = filters;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { link: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // 주문 데이터에 플랫폼 정보 추가 (임시)
    const ordersWithPlatform = orders.map(order => ({
      ...order,
      platform: platform || 'instagram', // 임시로 설정
      serviceName: order.link || '서비스명', // 임시로 설정
    }));

    return {
      orders: ordersWithPlatform,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error('Failed to get orders');
  }
};

export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status.toUpperCase() as OrderStatus,
        updatedAt: new Date(),
      },
    });
    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

// 알림 관리 서비스 함수들
export const getNotifications = async () => {
  try {
    // 임시 알림 데이터
    const notifications = [
      {
        id: '1',
        type: 'info',
        title: '시스템 업데이트',
        message: '새로운 기능이 추가되었습니다',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: 'warning',
        title: '서버 점검 안내',
        message: '오늘 밤 12시부터 1시간 점검 예정',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
    ];

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('Failed to get notifications');
  }
};
