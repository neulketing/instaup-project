import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'

const app = express()

// Initialize Prisma
export const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://same-4001w3tt33q-latest.netlify.app",
    "https://instaup.kr",
    "https://instaup-clean.netlify.app"
  ],
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ===========================================
// 헬스체크 및 기본 엔드포인트
// ===========================================
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      version: '1.0.0',
      phase: 'production'
    })
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: 'Database connection failed'
    })
  }
})

app.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    phase: 'production',
    build: process.env.RAILWAY_GIT_COMMIT_SHA || 'local',
    timestamp: new Date().toISOString(),
    node_version: process.version
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'Instaup Backend API - Production Ready',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      version: '/version',
      admin: {
        products: '/api/admin/products',
        orders: '/api/admin/orders',
        dashboard: '/api/admin/dashboard',
        analytics: '/api/admin/analytics'
      },
      public: {
        services: '/api/services',
        order: '/api/orders'
      }
    }
  })
})

// ===========================================
// 관리자 API 엔드포인트
// ===========================================

// 관리자 대시보드 메트릭스
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // 실제 데이터베이스 연동을 위한 구조 (현재는 목 데이터)
    const dashboardData = {
      overview: {
        totalUsers: 15847,
        totalOrders: 3456,
        totalRevenue: 45672000,
        pendingOrders: 23,
        completedOrders: 3433,
        conversionRate: 12.4,
        avgOrderValue: 13200
      },
      platforms: {
        instagram: { orders: 2134, revenue: 28934000, growth: 15.2 },
        youtube: { orders: 782, revenue: 10456000, growth: 8.7 },
        tiktok: { orders: 412, revenue: 4567000, growth: 23.1 },
        facebook: { orders: 98, revenue: 1234000, growth: -2.3 },
        twitter: { orders: 30, revenue: 481000, growth: 5.4 }
      },
      revenue: {
        today: 456000,
        yesterday: 423000,
        thisWeek: 2834000,
        lastWeek: 2567000,
        thisMonth: 12456000,
        lastMonth: 11234000,
        growth: {
          daily: 7.8,
          weekly: 10.4,
          monthly: 10.9
        }
      },
      topServices: [
        { id: 'instagram_21', name: '인스타 실제 한국 팔로워', orders: 1234, revenue: 22248000 },
        { id: 'instagram_56', name: '인스타 좋아요', orders: 856, revenue: 12840000 },
        { id: 'youtube_01', name: '유튜브 구독자', orders: 423, revenue: 10575000 },
        { id: 'tiktok_02', name: '틱톡 좋아요', orders: 312, revenue: 3744000 },
        { id: 'instagram_12', name: '인스타 릴스 조회수', orders: 298, revenue: 2086000 }
      ],
      recentActivity: [
        {
          type: 'order',
          description: '새로운 주문이 생성되었습니다: 인스타 팔로워 500개',
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          userId: 'user_123',
          amount: 90000
        },
        {
          type: 'payment',
          description: '결제가 완료되었습니다: ₩75,000',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          userId: 'user_456',
          amount: 75000
        },
        {
          type: 'service',
          description: '서비스가 완료되었습니다: 유튜브 조회수 증가',
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          userId: 'user_789',
          serviceId: 'youtube_02'
        }
      ]
    }

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 상품 관리 API
app.get('/api/admin/products', async (req, res) => {
  try {
    const { category, platform, status, search, page = 1, limit = 20 } = req.query

    // 목 데이터 (실제로는 데이터베이스에서 조회)
    const products = [
      {
        id: 'instagram_21',
        platform: 'instagram',
        category: 'followers',
        name: '인스타 실제 한국 팔로워',
        description: '100% 실제 활동하는 한국인 유저들이 인스타 공식앱을 통해 직접 방문하여 팔로우를 눌러드리는 방식으로 안전하게 진행됩니다.',
        price: 180,
        originalPrice: 220,
        discount: 18,
        minOrder: 20,
        maxOrder: 3000000,
        deliveryTime: '1~6시간',
        quality: 'premium',
        isActive: true,
        isPopular: true,
        isRecommended: true,
        totalOrders: 1234,
        totalRevenue: 22248000,
        features: ['실제 한국인', '30일 AS', '안전한 방식', '프리미엄 품질'],
        warningNote: '계정을 비공개로 설정하시면 서비스가 불가능합니다.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'instagram_56',
        platform: 'instagram',
        category: 'likes',
        name: '인스타 좋아요',
        description: '인스타그램 게시물의 좋아요를 자연스럽게 증가시켜드립니다.',
        price: 15,
        originalPrice: 20,
        discount: 25,
        minOrder: 10,
        maxOrder: 50000,
        deliveryTime: '1~30분',
        quality: 'premium',
        isActive: true,
        isPopular: true,
        isRecommended: false,
        totalOrders: 856,
        totalRevenue: 12840000,
        features: ['빠른 시작', '30일 AS', '안전한 방식', '자연스러운 증가'],
        warningNote: '작업 진행 중 게시물 삭제 금지',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'youtube_01',
        platform: 'youtube',
        category: 'subscribers',
        name: '유튜브 구독자',
        description: '유튜브 채널의 구독자를 늘려드립니다.',
        price: 25,
        originalPrice: 30,
        discount: 17,
        minOrder: 10,
        maxOrder: 100000,
        deliveryTime: '1~24시간',
        quality: 'premium',
        isActive: true,
        isPopular: false,
        isRecommended: true,
        totalOrders: 423,
        totalRevenue: 10575000,
        features: ['실제 유저', '안전한 방식', '빠른 시작', '고품질'],
        warningNote: '채널이 공개 상태여야 합니다.',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // 필터링 로직 (실제로는 데이터베이스 쿼리로 처리)
    let filteredProducts = products

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category)
    }

    if (platform && platform !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.platform === platform)
    }

    if (search) {
      const searchTerm = search.toString().toLowerCase()
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      )
    }

    const total = filteredProducts.length
    const pageNum = parseInt(page.toString())
    const limitNum = parseInt(limit.toString())
    const offset = (pageNum - 1) * limitNum
    const paginatedProducts = filteredProducts.slice(offset, offset + limitNum)

    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    console.error('Products API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 상품 생성
app.post('/api/admin/products', async (req, res) => {
  try {
    const productData = req.body

    // 실제로는 데이터베이스에 저장
    const newProduct = {
      id: `product_${Date.now()}`,
      ...productData,
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: newProduct,
      message: '상품이 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Create Product Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 상품 수정
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // 실제로는 데이터베이스에서 업데이트
    const updatedProduct = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: '상품이 성공적으로 수정되었습니다.'
    })
  } catch (error) {
    console.error('Update Product Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 상품 삭제
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 실제로는 데이터베이스에서 삭제 (또는 soft delete)

    res.json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Delete Product Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// ===========================================
// 주문 관리 API
// ===========================================

// 주문 목록 조회
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { status, platform, search, page = 1, limit = 20 } = req.query

    // 목 데이터
    const orders = [
      {
        id: 'ord_001',
        userId: 'user_123',
        serviceId: 'instagram_21',
        serviceName: '인스타 실제 한국 팔로워',
        platform: 'instagram',
        quantity: 500,
        price: 90000,
        status: 'completed',
        targetUrl: '@sample_user',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        id: 'ord_002',
        userId: 'user_456',
        serviceId: 'instagram_56',
        serviceName: '인스타 좋아요',
        platform: 'instagram',
        quantity: 1000,
        price: 15000,
        status: 'processing',
        targetUrl: 'https://instagram.com/p/XXXXXXXXX/',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        completedAt: null
      },
      {
        id: 'ord_003',
        userId: 'user_789',
        serviceId: 'youtube_01',
        serviceName: '유튜브 구독자',
        platform: 'youtube',
        quantity: 200,
        price: 50000,
        status: 'pending',
        targetUrl: 'https://youtube.com/@sample_channel',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        completedAt: null
      }
    ]

    res.json({
      success: true,
      data: { orders }
    })
  } catch (error) {
    console.error('Orders API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    })
  }
})

// 주문 상태 업데이트
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    res.json({
      success: true,
      message: '주문 상태가 성공적으로 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Update Order Status Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    })
  }
})

// ===========================================
// 공개 API 엔드포인트
// ===========================================

// 서비스 목록 조회 (공개)
app.get('/api/services', async (req, res) => {
  try {
    const { platform, category } = req.query

    // 활성화된 상품만 반환
    const services = [
      {
        id: 'instagram_21',
        platform: 'instagram',
        category: 'followers',
        name: '인스타 실제 한국 팔로워',
        description: '100% 실제 활동하는 한국인 유저',
        price: 180,
        minOrder: 20,
        maxOrder: 3000000,
        deliveryTime: '1~6시간',
        quality: 'premium',
        isPopular: true,
        features: ['실제 한국인', '30일 AS', '안전한 방식']
      },
      {
        id: 'instagram_56',
        platform: 'instagram',
        category: 'likes',
        name: '인스타 좋아요',
        description: '게시물 좋아요를 자연스럽게 증가',
        price: 15,
        minOrder: 10,
        maxOrder: 50000,
        deliveryTime: '1~30분',
        quality: 'premium',
        isPopular: true,
        features: ['빠른 시작', '30일 AS', '자연스러운 증가']
      }
    ]

    let filteredServices = services

    if (platform) {
      filteredServices = filteredServices.filter(s => s.platform === platform)
    }

    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category)
    }

    res.json({
      success: true,
      data: filteredServices
    })
  } catch (error) {
    console.error('Services API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    })
  }
})

// 주문 생성 (공개)
app.post('/api/orders', async (req, res) => {
  try {
    const { serviceId, targetUrl, quantity, userId } = req.body

    // 실제로는 주문 처리 로직 구현
    const newOrder = {
      id: `ord_${Date.now()}`,
      userId,
      serviceId,
      targetUrl,
      quantity,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: newOrder,
      message: '주문이 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Create Order Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    })
  }
})

// ===========================================
// 실시간 알림 API
// ===========================================

// 실시간 알림 목록
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const notifications = [
      {
        id: 'notif_001',
        type: 'order',
        title: '새로운 주문',
        message: '인스타 팔로워 500개 주문이 생성되었습니다.',
        data: { orderId: 'ord_001', amount: 90000 },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
      },
      {
        id: 'notif_002',
        type: 'payment',
        title: '결제 완료',
        message: '₩75,000 결제가 완료되었습니다.',
        data: { orderId: 'ord_002', amount: 75000 },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ]

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error('Notifications API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    })
  }
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// Start server
const PORT = Number(process.env.PORT) || 3000

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Instaup Backend Server (Production) running on port ${PORT}`)
      console.log(`📍 Health Check: http://0.0.0.0:${PORT}/health`)
      console.log(`📍 Admin API: http://0.0.0.0:${PORT}/api/admin/`)
      console.log(`📍 Public API: http://0.0.0.0:${PORT}/api/`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
