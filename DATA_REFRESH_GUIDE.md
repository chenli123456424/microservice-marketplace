# 数据实时刷新机制使用指南

## 概述

本项目实现了通用的数据实时刷新机制，支持商品信息、用户信息等各类数据的自动同步更新。当管理端修改数据后，用户端会自动获取最新数据，无需手动刷新页面。

## 核心机制

### 1. 轮询机制（Polling）
- 定期请求API获取最新数据
- 可配置轮询间隔
- 适用于需要保证数据实时性的场景

### 2. 事件通知机制（Event Notification）
- 通过全局事件通知组件刷新
- 适用于特定操作后的即时刷新
- 可与轮询机制结合使用

### 3. 页面可见性检测
- 当页面从隐藏切换到可见时自动刷新
- 确保用户看到的始终是最新数据

## 使用方法

### 在组件中使用数据刷新

```javascript
import { useDataRefresh } from '../hooks/useDataRefresh';

function YourComponent() {
    const [data, setData] = useState([]);
    
    // 定义获取数据的函数
    const fetchData = useCallback(async () => {
        const response = await axios.get('/api/your-data');
        if (response.data.code === 200) {
            setData(response.data.data);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 使用数据刷新Hook
    useDataRefresh(fetchData, 'yourDataType', {
        pollingInterval: 60000, // 60秒轮询一次，设置为0禁用轮询
        enableVisibilityRefresh: true, // 页面可见性刷新
        immediate: true // 是否立即执行一次
    });

    return <div>...</div>;
}
```

### 触发数据刷新事件

当数据发生变化时（如管理端添加/修改商品），可以触发刷新事件：

```javascript
import { triggerDataRefresh } from '../utils/dataRefreshManager';

// 在数据更新后触发刷新
triggerDataRefresh('products', {
    action: 'update', // 'create', 'update', 'delete'
    productId: 123
});
```

## 已集成的组件

### 商品相关
- ✅ `ProductFilter.js` - 商品列表页（1分钟轮询）
- ✅ `ProductDetailPage.js` - 商品详情页（30秒轮询）
- ✅ `CategoryProductSection.js` - 分类商品展示（仅事件通知）
- ✅ `RecommendedProductsSection.js` - 推荐商品（1分钟轮询）

### 用户相关
- ✅ `TopNavigation.js` - 导航栏用户信息（Context自动更新）
- ✅ `ProfilePage.js` - 个人信息页（手动更新后同步）

## 配置说明

### useDataRefresh 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fetchFunction | Function | 必填 | 获取数据的异步函数 |
| dataType | String | 必填 | 数据类型标识，用于事件匹配 |
| options.pollingInterval | Number | 60000 | 轮询间隔（毫秒），0表示禁用轮询 |
| options.enableVisibilityRefresh | Boolean | true | 是否启用页面可见性刷新 |
| options.immediate | Boolean | true | 是否立即执行一次 |

### 轮询间隔建议

- **高频数据**（如商品详情）：30秒
- **中频数据**（如商品列表）：60秒
- **低频数据**（如分类信息）：120秒或更长
- **仅事件通知**：设置为0，禁用轮询

## 最佳实践

### 1. 合理设置轮询间隔
- 不要设置过短的轮询间隔（建议不少于30秒）
- 避免同时有多个组件高频轮询相同数据

### 2. 使用事件通知优化性能
- 对于管理端操作，优先使用事件通知
- 轮询作为备用机制，确保数据最终一致性

### 3. 组件清理
- Hook会自动处理清理工作，无需手动管理
- 组件卸载时自动停止轮询和事件监听

### 4. 错误处理
- 刷新函数内部的错误会被自动捕获和记录
- 不会影响后续的轮询执行

## 扩展新数据类型

### 步骤1：在组件中使用Hook

```javascript
import { useDataRefresh } from '../hooks/useDataRefresh';

const fetchYourData = useCallback(async () => {
    // 你的数据获取逻辑
}, []);

useDataRefresh(fetchYourData, 'yourDataType', {
    pollingInterval: 60000
});
```

### 步骤2：在数据更新处触发事件

```javascript
import { triggerDataRefresh } from '../utils/dataRefreshManager';

// 更新成功后
triggerDataRefresh('yourDataType', {
    action: 'update',
    id: yourDataId
});
```

## 注意事项

1. **性能考虑**：轮询会增加服务器压力，合理设置间隔
2. **网络优化**：使用事件通知可以减少不必要的请求
3. **用户体验**：数据更新时应避免闪烁，可以考虑过渡动画
4. **缓存策略**：可以与HTTP缓存配合使用，减少重复请求

## 故障排查

### 数据没有自动刷新
1. 检查是否正确使用了 `useDataRefresh` Hook
2. 确认轮询间隔设置是否合理
3. 检查浏览器控制台是否有错误信息
4. 验证API响应格式是否正确

### 轮询过于频繁
1. 检查是否有多个组件同时轮询相同数据
2. 适当增加轮询间隔
3. 考虑使用事件通知替代轮询

### 事件通知不工作
1. 确认 `dataType` 是否匹配
2. 检查事件触发时机是否正确
3. 验证组件是否已正确注册监听器

## 未来优化方向

1. **WebSocket支持**：实现真正的实时推送
2. **数据版本控制**：基于版本号判断是否需要刷新
3. **智能轮询**：根据用户活动动态调整轮询频率
4. **缓存策略**：集成更完善的缓存机制

