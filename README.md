# 微服务电商平台（全屋定制）

## 📖 项目简介

本项目是一个基于微服务架构的电商平台，专注于家居装修和全屋定制服务。系统采用前后端分离架构，包含用户端、管理端和后台服务，提供完整的电商购物、全屋定制、社区互动等功能。

### 核心特性

- 🛒 **完整的电商购物流程**：商品浏览、搜索、购物车、订单管理、支付、评价晒单
- 🏠 **全屋定制服务**：定制案例展示、设计师管理、在线预约、方案选择
- 💬 **社区互动**：用户发布灵感帖、点赞评论、分享装修经验
- 📢 **公告通知系统**：系统公告、消息推送、已读未读管理
- 🔐 **安全认证**：JWT无状态认证、Spring Security权限控制
- ⚡ **性能优化**：Redis缓存、数据库索引优化、查询性能提升

---

## 🎯 功能模块

### 1. 用户认证模块
- 用户注册/登录
- 忘记密码（邮箱验证码重置）
- JWT Token认证
- 个人信息管理（头像上传、资料修改）

### 2. 商品管理模块
- 商品分类树形结构（主分类、子分类）
- 商品搜索与筛选（价格、品牌、分类、关键词）
- 商品详情展示（多图、规格、属性、评价）
- 商品推荐（热门推荐、新品上市、限时特惠、爆款热销）
- 热门搜索关键词（Redis ZSet排序）

### 3. 购物车模块
- 商品加入购物车
- 购物车商品管理（数量修改、删除）
- 购物车结算

### 4. 订单管理模块
- 订单创建与确认
- 订单状态管理（待付款、待发货、待收货、待评价、已完成、退款/售后）
- 订单列表查询（全部、待付款、待发货、待收货、待评价）
- 订单详情查看
- 评价晒单（多图上传、评分、评论）
- 再次购买

### 5. 全屋定制模块
- 定制案例展示（风格筛选、面积筛选、预算筛选）
- 案例详情（图片、描述、设计亮点、设计师信息）
- 设计师列表（职称、经验、擅长风格、评分）
- 设计师详情（案例作品、预约信息）
- 在线预约（选择设计师、填写需求、选择方案）
- 定制方案选择（基础版、进阶版、豪华版）

### 6. 社区/灵感模块
- 帖子发布（富文本编辑、多图上传）
- 帖子列表（分页、排序）
- 帖子详情（点赞、评论、分享）
- 评论互动（回复、点赞）

### 7. 公告通知模块
- 公告列表（分页、优先级排序）
- 公告详情（富文本内容）
- 已读未读状态管理
- 未读消息提醒

### 8. 门店管理模块
- 门店列表
- 门店详情（地址、联系方式、营业时间）

### 9. 管理端模块
- 商品管理（增删改查、图片上传）
- 分类管理（主分类、子分类管理）
- 订单管理（订单查询、状态更新）
- 用户管理
- 公告管理（富文本编辑）
- 数据统计

---

## 🛠️ 技术栈

### 后端技术
- **Java 17** - 编程语言
- **Spring Boot 3.2.5** - 微服务框架
- **Spring Security** - 安全框架
- **JWT (jjwt 0.12.5)** - 无状态认证
- **MyBatis-Plus 3.5.5** - ORM框架（动态SQL）
- **MySQL** - 关系型数据库（事务隔离级别优化）
- **Redis** - 缓存数据库（ZSet排序、缓存穿透防护）
- **Spring Mail** - 邮件服务
- **Swagger/SpringDoc** - API文档
- **Lombok** - 代码简化

### 前端技术
- **React 19.1.1** - UI框架
- **React Router 7.8.1** - 路由管理
- **Axios 1.11.0** - HTTP请求
- **DOMPurify 3.3.0** - XSS防护

### 管理端技术
- **UmiJS Max 4.4.12** - 前端框架
- **Ant Design 5.27.3** - UI组件库
- **Ant Design Pro Components 2.4.4** - 高级组件
- **React Quill 2.0.0** - 富文本编辑器
- **TypeScript 5.0.3** - 类型系统

### 开发工具
- **Maven** - 项目构建
- **Node.js** - 前端运行环境
- **Git** - 版本控制

---

## 🚀 启动项目

### 环境要求

- **JDK**: 17+
- **Maven**: 3.6+
- **Node.js**: 16+
- **MySQL**: 8.0+
- **Redis**: 6.0+

### 1. 数据库准备

#### 1.1 创建数据库

```sql
CREATE DATABASE ecommerce_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 1.2 执行初始化脚本

执行以下SQL脚本（位于 `sql/` 目录）：

```bash
# 初始化数据库表结构（包含所有表）
mysql -u root -p ecommerce_user < sql/init_all_tables.sql
```

**注意**：执行 SQL 脚本时，请确保使用 UTF-8 编码，避免中文注释乱码。推荐使用以下方式：

**方式1：使用 Get-Content 指定 UTF-8 编码（PowerShell）**

```powershell
# 设置 PowerShell 输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 使用 Get-Content 读取文件并指定 UTF-8 编码
Get-Content sql/init_all_tables.sql -Encoding UTF8 | mysql -h localhost -P 3307 -u root -p123456 ecommerce_user --default-character-set=utf8mb4
```

**方式2：在 MySQL 客户端内使用 source 命令**

```bash
# 先连接到 MySQL
mysql -h localhost -P 3307 -u root -p --default-character-set=utf8mb4

# 在 MySQL 客户端内执行
mysql> use ecommerce_user;
mysql> source sql/init_all_tables.sql;
```

**方式3：使用 Python 脚本执行（最可靠）**

```python
import pymysql

config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '123456',
    'database': 'ecommerce_user',
    'charset': 'utf8mb4'
}

conn = pymysql.connect(**config)
cursor = conn.cursor()

# 读取 SQL 文件（UTF-8 编码）
with open('sql/init_all_tables.sql', 'r', encoding='utf-8') as f:
    sql = f.read()
    
# 执行 SQL（可以按分号分割执行多条语句）
for statement in sql.split(';'):
    if statement.strip():
        cursor.execute(statement)
        conn.commit()

cursor.close()
conn.close()
```

#### 1.3 修改数据库配置

编辑 `user-service/src/main/resources/application.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3307/ecommerce_user?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root  # 修改为你的数据库用户名
    password: 123456  # 修改为你的数据库密码
```

### 2. Redis配置

确保Redis服务已启动（默认端口6379），如需修改配置，编辑 `application.yml`：

```yaml
spring:
  data:
    redis:
      host: localhost  # Redis地址
      port: 6379       # Redis端口
```

### 3. 邮件服务配置（可选）

如需使用忘记密码功能，需要配置邮件服务。编辑 `application.yml`：

```yaml
spring:
  mail:
    host: smtp.qq.com
    port: 587
    username: your_email@qq.com  # 你的QQ邮箱
    password: your_auth_code     # 你的邮箱授权码
```

### 4. 启动后端服务

```bash
# 进入后端项目目录
cd user-service

# 使用Maven编译打包
mvn clean package

# 启动服务（或使用IDE直接运行 UserServiceApplication）
mvn spring-boot:run
```

后端服务默认运行在：`http://localhost:8081`

### 5. 启动前端应用

```bash
# 进入前端项目目录
cd frontend-app

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm start
```

前端应用默认运行在：`http://localhost:3000`

### 6. 启动管理端（可选）

```bash
# 进入管理端项目目录
cd admin-app

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

管理端默认运行在：`http://localhost:8000`

---

## 📁 项目结构

```
microservice-marketplace/
├── user-service/              # 后端服务
│   ├── src/main/java/        # Java源码
│   │   ├── controller/       # 控制器层
│   │   ├── service/         # 服务层
│   │   ├── mapper/          # 数据访问层
│   │   ├── entity/          # 实体类
│   │   ├── config/           # 配置类
│   │   └── util/            # 工具类
│   ├── src/main/resources/   # 资源文件
│   │   ├── application.yml  # 配置文件
│   │   └── sql/             # SQL脚本
│   └── pom.xml              # Maven配置
├── frontend-app/             # 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 公共组件
│   │   ├── context/         # Context上下文
│   │   └── utils/           # 工具函数
│   └── package.json         # 依赖配置
├── admin-app/                # 管理端
│   ├── src/
│   │   ├── pages/           # 管理页面
│   │   └── services/        # API服务
│   └── package.json
├── sql/                      # 数据库脚本
│   └── init_all_tables.sql  # 初始化脚本（包含所有表）
└── uploads/                  # 上传文件目录
```

---

## 🔧 配置说明

### 后端配置

主要配置文件：`user-service/src/main/resources/application.yml`

- **服务端口**：8081
- **数据库**：MySQL (端口3307)
- **Redis**：localhost:6379
- **JWT密钥**：在配置文件中自定义
- **文件上传**：最大50MB，存储在项目根目录 `uploads/` 文件夹

### 前端配置

- **API地址**：默认 `http://localhost:8081/api`
- **路由**：使用 React Router 进行单页应用路由管理

---

## 📝 API文档

启动后端服务后，访问 Swagger API 文档：

```
http://localhost:8081/swagger-ui.html
```

---

## 🎨 功能截图

（可在此处添加项目截图）

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！
