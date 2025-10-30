# 订单管理功能设置说明

## 问题诊断

订单列表显示"暂无数据"的可能原因：

1. **数据库表未创建** - 需要执行SQL脚本创建订单表
2. **字段映射问题** - 已修复实体类字段映射
3. **API调用问题** - 已添加调试日志

## 解决步骤

### 1. 执行数据库脚本

**重要：必须先执行SQL脚本创建订单表！**

```sql
-- 在MySQL中执行以下脚本
source user-service/src/main/resources/sql/order_table.sql;
```

或者直接在MySQL客户端中复制粘贴SQL内容执行。

### 2. 验证表创建

执行以下SQL验证表是否创建成功：

```sql
-- 检查表是否存在
SHOW TABLES LIKE 'order';
SHOW TABLES LIKE 'order_item';

-- 查看表结构
DESCRIBE `order`;
DESCRIBE `order_item`;

-- 查看数据
SELECT COUNT(*) FROM `order`;
SELECT COUNT(*) FROM `order_item`;
```

### 3. 重启后端服务

执行SQL脚本后，重启user-service服务：

```bash
# 在user-service目录下
mvn spring-boot:run
```

### 4. 测试API

访问测试接口验证API是否正常：

```
GET http://localhost:8081/api/orders/test
```

### 5. 查看调试日志

启动后端服务后，查看控制台输出：

- 应该看到 "开始获取订单列表..."
- 应该看到 "OrderService: 基本查询订单数量: X"
- 应该看到 "OrderService: 带用户信息查询订单数量: X"

### 6. 前端调试

打开浏览器开发者工具，查看Console输出：

- 应该看到 "前端：开始获取订单列表，参数: ..."
- 应该看到 "前端：API响应: ..."
- 应该看到 "前端：获取订单成功，数据: ..."

## 测试数据

SQL脚本包含4个测试订单：

- ORD20241201001 - 已付款订单
- ORD20241201002 - 已发货订单  
- ORD20241201003 - 待付款订单
- ORD20241201004 - 已完成订单

## 常见问题

1. **表不存在错误**：确保执行了SQL脚本
2. **字段映射错误**：已修复，重启服务即可
3. **API调用失败**：检查后端服务是否启动
4. **跨域问题**：已配置CORS，应该正常

## 下一步

如果按照以上步骤操作后仍有问题，请：

1. 检查后端控制台日志
2. 检查浏览器开发者工具Network和Console
3. 确认数据库连接正常
4. 确认表和数据已正确创建
