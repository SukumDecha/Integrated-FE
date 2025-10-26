# 🎯 Vue 3 E-Commerce Frontend Architecture

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [Security & Best Practices](#security--best-practices)
6. [Demo Flow](#demo-flow)

---

## 🎨 Overview

E-Commerce Platform ที่ผู้ใช้สามารถ:

- 🛒 **Buyer**: ซื้อสินค้า, จัดการตะกร้า, ดูประวัติการสั่งซื้อ
- 🏪 **Seller**: เพิ่ม/แก้ไข/จัดการสินค้า, ดูคำสั่งซื้อ
- 👤 **User Management**: ระบบสมัครสมาชิก, Login, จัดการโปรไฟล์

### ทำไมต้องใช้ Architecture นี้?

- ✅ **Scalable**: เพิ่มฟีเจอร์ใหม่ได้ง่าย
- ✅ **Secure**: จัดการ Authentication/Authorization อย่างปลอดภัย
- ✅ **Maintainable**: Code แยกหน้าที่ชัดเจน ง่ายต่อการดูแล
- ✅ **User-Friendly**: Error handling ครบครัน, UX ดี

---

## 🛠️ Tech Stack

### Frontend Core

```
Vue 3 (Composition API)
├── Pinia (State Management)
├── Vue Router (Routing + Guards)
├── Vite (Build Tool)
└── Ant Design Vue (UI Components)
```

### Key Libraries

- **jwt-decode**: Decode JWT tokens
- **Fetch API**: HTTP requests
- **LocalStorage**: Client-side persistence

### Development Tools

- ESLint + Prettier
- Docker + Nginx
- Cypress (E2E Testing)

---

## 🏗️ System Architecture

### 1️⃣ Layer Architecture

```
┌─────────────────────────────────────────┐
│           UI Components                 │
│  (LoginForm, CartView, ProductCard)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Pinia Stores (State)            │
│  ┌────────────┬────────────┬─────────┐  │
│  │ Auth Store │ Cart Store │  Toast  │  │
│  └────────────┴────────────┴─────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Services Layer                 │
│  ┌──────────────────────────────────┐   │
│  │  AuthService, SaleItemService    │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│  ┌──────────────▼───────────────────┐   │
│  │   Centralized API Handler        │   │
│  │   (Auto-refresh, Error handling) │   │
│  └──────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Backend API (Spring Boot)       │
└─────────────────────────────────────────┘
```

### 2️⃣ Request Flow

```
User Action → Component → Store → Service → API Handler → Backend
                  ↓           ↓         ↓          ↓
              Update UI   Validate  Transform  Auto-Refresh
                          State     Data       Handle Errors
```

---

## 🔐 Core Features

### Feature 1: Authentication & Authorization

#### 🔑 Authentication Flow

```
1. User Login
   ├── POST /api/v2/auth/login
   ├── Receive: Access Token (JWT) + Refresh Token (HttpOnly Cookie)
   └── Store: Token in localStorage

2. Auto Token Refresh
   ├── Check token expiration before each request
   ├── If expired → Call /api/v2/auth/refresh
   ├── Get new access token
   └── Retry original request

3. Logout
   ├── Call /api/v2/auth/logout
   ├── Clear localStorage
   └── Redirect to /signin
```

#### 🛡️ Authorization (Role-based)

```javascript
// Router Guard Example
routes: [
  {
    path: '/sale-items/list',
    meta: {
      requiresAuth: true,           // ต้อง login
      roles: ['SELLER']             // เฉพาะ SELLER
    }
  },
  {
    path: '/cart',
    meta: {
      requiresAuth: true           // ทุก role (login ก็พอ)
    }
  }
]

// Automatic Redirect
Buyer → ไป /sale-items/list → Redirect to /sale-items-gallery
Guest → ไป /cart → Redirect to /signin
```

**Key Points:**

- ✅ JWT Token มี expiration (ป้องกัน token ใช้ตลอดกาล)
- ✅ Refresh Token อยู่ใน HttpOnly Cookie (ป้องกัน XSS)
- ✅ Auto-refresh ก่อน API call (UX ดี, ไม่ logout กลาง session)
- ✅ Single refresh lock (ป้องกัน race condition)

---

### Feature 2: State Management (Pinia)

#### 📦 Store Structure

```
stores/
├── auth.store.js       → ข้อมูล user, token, login/logout
├── cart.store.js       → ตะกร้าสินค้า, business logic
├── toast.store.js      → แสดง notification
└── loader.store.js     → Loading states
```

#### 🛒 Cart Store Highlights

**Per-User Cart Storage**

```javascript
// Problem: ทุกคนใช้ cart เดียวกัน → logout/login ข้อมูลปนกัน
// Solution: Namespace by userId

storageKey = "cart:user123"  // User 123
storageKey = "cart:user456"  // User 456
storageKey = "cart:guest"    // ไม่ได้ login
```

**Business Validation**

```javascript
addItem(item) {
  // ✅ ต้อง login ก่อน
  if (!userId) return error

  // ✅ ห้ามซื้อสินค้าของตัวเอง
  if (item.sellerId === userId) return error

  // ✅ เช็ค stock
  if (item.stock === 0) return error

  // ✅ จำกัด quantity ไม่เกิน stock
  if (quantity > stock) {
    quantity = stock
    return warning
  }
}
```

**Auto-Sync with localStorage**

```javascript
// Watch items change → Auto save
watch(items, (newItems) => {
  saveToLocalStorage(storageKey, newItems)
}, { deep: true })

// Watch user change → Load their cart
watch(() => authStore.user?.id, () => {
  items.value = loadFromLocalStorage(storageKey, [])
})
```

---

### Feature 3: Centralized Error Handling

#### 🎯 4-Layer Error Handling

```
Layer 1: Network (api.js)
├── HTTP errors (404, 500)
├── 401 → Auto logout
├── Token refresh failures
└── Network failures

Layer 2: Service
├── API response errors
└── Data transformation errors

Layer 3: Store
├── Business logic validation
└── State consistency errors

Layer 4: UI
├── Toast notifications
└── Form validation messages
```

#### 🔄 Automatic Token Refresh

**Problem:** Token หมดอายุกลาง session → User ถูก logout ทันทีทำให้ UX แย่

**New Solution (Improved):**

```javascript
// ไม่ต้องเช็ค expiration ก่อน request → ทำให้โค้ดง่ายกว่า
// ใช้วิธี "Try → Fail → Refresh → Retry" แทน

const request = async (url, method, payload, options) => {
  // 1. ส่ง request ตามปกติ
  const res = await fetch(`${API_BASE_URL}${url}`, httpOptions)

  // 2. ถ้าได้ 401 → Access token หมดอายุ
  if (res.status === 401) {
    console.warn('[401] Access token expired → refreshing...')
    
    // 3. เรียก refresh endpoint
    const refreshResult = await authStore.refreshAccessToken()

    if (refreshResult?.success) {
      console.info('[401] Refresh successful → retrying...')
      
      // 4. Retry request เดิมอีกครั้งด้วย token ใหม่
      return await request(url, method, payload, options)
    }

    // 5. ถ้า refresh ล้มเหลว → Refresh token หมดอายุ → logout
    console.warn('[401] Refresh failed → logout')
    await authStore.logout()
    return new ResponseBuilder().error('Session expired').build()
  }

  // Success response
  return handleSuccessResponse(res)
}
```

**Key Improvements:**

✅ **Simpler Logic**: ไม่ต้องเช็ค `exp` field ของ JWT ก่อนทุก request  
✅ **More Reliable**: Backend เป็นคนตัดสินว่า token หมดอายุหรือยัง (Single Source of Truth)  
✅ **Better Performance**: ไม่ต้อง decode JWT และเช็ค timestamp ทุกครั้ง  
✅ **Automatic Retry**: User ไม่รู้สึกเลยว่ามีการ refresh เกิดขึ้น  
✅ **Clean Separation**: `auth.store.js` ทำแค่ refresh logic, `api.js` ทำ retry logic

**วิธีการทำงาน:**

```
User Click "Add to Cart"
    ↓
1. POST /api/cart/items (with expired token)
    ↓
2. Backend Response: 401 Unauthorized
    ↓
3. Frontend Auto Refresh
   ├── POST /api/auth/refresh (with httpOnly cookie)
   ├── Get new access token
   └── Update localStorage
    ↓
4. Retry POST /api/cart/items (with new token)
    ↓
5. Success: 200 OK
    ↓
User sees "Added to cart" (ไม่รู้ว่ามี refresh เกิดขึ้น!)
```

#### 📊 Standardized Response Format

**Builder Pattern**

```javascript
// All API responses have consistent structure
{
  data: {...},           // Success data
  error: "...",          // Error message
  message: "...",        // Success message
  status: 200            // HTTP status
}

// Usage in components
const response = await SaleItemService.getItems()
if (response.error) {
  toastStore.add({ type: 'error', message: response.error })
} else {
  items.value = response.data
}
```

---

### Feature 4: Toast Notification System

#### 💬 User Feedback

```javascript
// Auto-dismiss notifications
toastStore.add({
  message: 'Added to cart successfully',
  type: 'success',      // success, error, warn, info
  timeout: 3000         // Auto remove after 3s
})

// Use cases
✅ Login successful
❌ Invalid credentials
⚠️ Stock limit reached
ℹ️ Processing your order...
```

---

## 🔒 Security & Best Practices

### Security Measures

| Feature | Implementation | Why? |
|---------|---------------|------|
| **HttpOnly Cookies** | Refresh token stored in cookie | ป้องกัน XSS attack |
| **CSRF Protection** | `credentials: 'include'` | ส่ง cookie อย่างปลอดภัย |
| **Token Expiration** | JWT มี `exp` field | จำกัดเวลาใช้งาน token |
| **Auto Logout** | 401 → Immediate logout | ป้องกันการเข้าถึงโดยไม่มีสิทธิ์ |
| **Role-Based Access** | Router guards + Backend validation | ควบคุมการเข้าถึง feature |
| **Input Validation** | Frontend + Backend | ป้องกัน invalid data |

### Code Quality Practices

```javascript
✅ Single Responsibility Principle
   → auth.store.js จัดการเฉพาะ authentication
   → cart.store.js จัดการเฉพาะ cart logic

✅ DRY (Don't Repeat Yourself)
   → Centralized API handler (ไม่ต้องเขียน fetch ซ้ำ)
   → Reusable utilities (StorageUtils, ErrorUtils)

✅ Separation of Concerns
   → Components: UI only
   → Stores: State + Business Logic
   → Services: API calls
   → Utils: Helper functions

✅ Error Handling First
   → ทุก async function มี try-catch
   → ทุก response มีการเช็ค error
   → User เห็น error message เสมอ
```

---

## 🎬 Demo Flow

### Scenario 1: User Journey (Buyer)

```
1. 📱 เข้าหน้าแรก (Guest)
   └── แสดงสินค้าทั้งหมด

2. 🔐 กด Login
   ├── กรอก email/password
   ├── Backend ตรวจสอบ
   ├── รับ access token
   └── Redirect to Home (Logged in)

3. 🛍️ เลือกสินค้า
   ├── กด "Add to Cart"
   ├── เช็ค: ไม่ใช่สินค้าของตัวเอง ✅
   ├── เช็ค: มี stock ✅
   └── แสดง Toast "Added successfully"

4. 🛒 ไป Cart
   ├── เห็นสินค้าทั้งหมด (group by seller)
   ├── เลือกสินค้าที่จะซื้อ
   ├── กรอกที่อยู่จัดส่ง
   └── Place Order

5. 📦 ดูประวัติ Orders
   └── แสดงรายการที่สั่งซื้อ + สถานะ
```

### Scenario 2: Seller Journey

```
1. 🔐 Login as Seller
   └── Router guard check role → Allow access

2. ➕ Add Product
   ├── กรอกข้อมูล: ชื่อ, ราคา, stock, รูปภาพ
   ├── Upload to backend (FormData)
   └── Success → Redirect to product list

3. 📊 View Sale Orders
   ├── เห็นรายการที่ลูกค้าสั่งซื้อ
   └── Update สถานะ (Completed)
```

### Scenario 3: Token Refresh (Background)

```
Timeline: User login และใช้งานระบบ

1. 🔐 User login (T = 0 min)
   ├── Receive: Access Token (expires in 15 min)
   └── Receive: Refresh Token (HttpOnly cookie, expires in 7 days)

2. 🛍️ User browse products (T = 10 min)
   ├── GET /api/sale-items
   ├── Token still valid ✅
   └── Response: 200 OK

3. 🛒 User click "Add to Cart" (T = 16 min) - Token หมดอายุแล้ว!
   ├── POST /api/cart/items (with expired token)
   ├── Backend checks: Token expired ⚠️
   ├── Response: 401 Unauthorized
   │
   ├── 🔄 Frontend Auto Refresh (User ไม่รู้ตัว)
   │   ├── Detect 401 response
   │   ├── POST /api/auth/refresh (with httpOnly cookie)
   │   ├── Backend validates refresh token ✅
   │   ├── Response: New access token
   │   └── Update localStorage
   │
   ├── 🔁 Retry Original Request
   │   └── POST /api/cart/items (with NEW token)
   │
   └── Success: 200 OK
       └── User sees: "Added to cart successfully" ✅

User Experience: ไม่รู้สึกว่ามี refresh เกิดขึ้น! Seamless! 🎉

4. ❌ If Refresh Fails (Refresh token หมดอายุ)
   ├── POST /api/auth/refresh → 401 Unauthorized
   ├── Frontend: Auto logout
   ├── Clear localStorage
   ├── Show toast: "Session expired, please login again"
   └── Redirect to /signin
```

**Key Points:**

✅ **Lazy Refresh**: Refresh เกิดขึ้นเมื่อ 401 เท่านั้น (ไม่ waste resources)  
✅ **Automatic Retry**: Request เดิมถูก retry ทันที หลัง refresh สำเร็จ  
✅ **Transparent to User**: User ไม่เห็นว่ามี error เกิดขึ้นเลย  
✅ **Graceful Degradation**: ถ้า refresh token หมด → Logout อย่างสง่างาม

---

## 📊 Architecture Advantages

### For Developers

| Advantage | Benefit |
|-----------|---------|
| **Modular Structure** | เพิ่มฟีเจอร์ใหม่ไม่กระทบ code เก่า |
| **Centralized Logic** | แก้ bug ที่เดียว ใช้ได้ทุกที่ |
| **Type Safety Ready** | เตรียมพร้อมสำหรับ TypeScript |
| **Easy Testing** | แต่ละ layer test แยกได้ |

### For Users

| Advantage | Benefit |
|-----------|---------|
| **Seamless Auth** | ไม่โดน logout กลาง session |
| **Instant Feedback** | Toast แจ้งผลทุก action |
| **Fast Performance** | Local state + Optimized API calls |
| **Secure** | ข้อมูลปลอดภัย, ไม่ปนกันระหว่าง user |

### For Business

| Advantage | Benefit |
|-----------|---------|
| **Scalable** | รองรับ user เพิ่มได้ไม่จำกัด |
| **Cost Effective** | ลด server load ด้วย local state |
| **Audit Trail** | ทุก action มี error log |

---

## 🎯 Key Takeaways

### 3 Core Principles

1. **Security First** 🔐
   - Token management ปลอดภัย
   - Auto-refresh ไม่ให้ user รู้สึก
   - Role-based access control

2. **Developer Experience** 👨‍💻
   - Code ที่อ่านง่าย maintain ง่าย
   - Centralized error handling
   - Consistent patterns

3. **User Experience** 😊
   - ไม่มี unexpected logout
   - Error messages ชัดเจน
   - Fast and responsive

---

## 📈 Future Improvements

### Short-term

- [ ] Add TypeScript for type safety
- [ ] Implement i18n (multi-language)
- [ ] Add unit tests (Vitest)
- [ ] Optimize bundle size

### Long-term

- [ ] PWA support (offline mode)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced caching strategy (Service Worker)
- [ ] Analytics integration

---

### Common Questions

**Q: ทำไมไม่ใช้ Vuex แทน Pinia?**
A: Pinia เป็น official successor ของ Vuex, มี TypeScript support ดีกว่า, API ง่ายกว่า

**Q: ทำไม access token อยู่ใน localStorage แทน cookie?**
A: เพราะต้องส่งไปกับ header (Authorization: Bearer), ง่ายกว่าการจัดการ cookie

**Q: ทำไมไม่เช็ค token expiration ก่อนส่ง request?**
A: เพราะ Backend เป็นคน validate ว่า token หมดอายุหรือยัง (Single Source of Truth) ทำให้แน่ใจว่าไม่มี timing issue และ logic ไม่ซับซ้อน

**Q: ถ้า 2 requests พร้อมกันได้ 401 จะ refresh 2 ครั้งไหม?**
A: อาจเกิดขึ้นได้ แต่ไม่เป็นปัญหา เพราะ refresh endpoint ใช้ refresh token เดียวกัน (httpOnly cookie) Backend จะ handle concurrent refresh ให้

**Q: Cart เก็บใน localStorage ถ้า clear browser จะหายไหม?**
A: หาย แต่ production ควรเก็บใน backend ด้วย (sync กับ server)

**Q: รองรับ mobile ไหม?**
A: ใช่ Vue 3 + responsive design รองรับทุก device

---

# Thank You! 🙏

