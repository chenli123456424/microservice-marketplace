# 清理 localStorage 数据

如果页面出现 JSON 解析错误，请按照以下步骤清理 localStorage 数据：

## 方法1：使用浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console（控制台）标签
3. 输入以下命令并按回车：

```javascript
// 清理所有用户相关数据
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('undefined');

// 验证清理结果
console.log('token:', localStorage.getItem('token'));
console.log('user:', localStorage.getItem('user'));
```

4. 刷新页面

## 方法2：手动清理

1. 打开浏览器开发者工具（F12）
2. 切换到 Application（应用程序）标签
3. 在左侧找到 Storage > Local Storage
4. 选择你的网站域名（localhost:3000）
5. 删除以下键值：
   - `token`
   - `user`
   - `undefined`（如果存在）
6. 刷新页面

## 方法3：清除所有网站数据

1. 在浏览器地址栏输入：`chrome://settings/content/all`
2. 搜索 `localhost:3000`
3. 点击垃圾桶图标删除所有数据
4. 刷新页面

## 修复后的功能

清理完成后，请：

1. **重新登录**：使用用户名密码或邮箱验证码登录
2. **测试支付功能**：尝试立即购买或购物车结算
3. **检查控制台**：确认没有 JSON 解析错误

## 预防措施

修复后的代码已经添加了错误处理，可以防止类似问题再次发生：

- 检查 localStorage 数据是否有效
- 处理 JSON 解析异常
- 自动清理无效数据
