/**
 * 商品数据刷新触发器
 * 当管理端添加/修改/删除商品后，调用此函数通知前端刷新
 * 
 * 使用方法：
 * import { triggerProductRefresh } from '../utils/triggerProductRefresh';
 * 
 * // 添加商品后
 * triggerProductRefresh('create', { productId: 123 });
 * 
 * // 修改商品后
 * triggerProductRefresh('update', { productId: 123 });
 * 
 * // 删除商品后
 * triggerProductRefresh('delete', { productId: 123 });
 */

import { triggerDataRefresh } from './dataRefreshManager';

/**
 * 触发商品数据刷新
 * @param {string} action - 操作类型：'create', 'update', 'delete'
 * @param {Object} options - 可选参数
 * @param {number} options.productId - 商品ID
 */
export function triggerProductRefresh(action, options = {}) {
    triggerDataRefresh('products', {
        action,
        ...options
    });
}

/**
 * 触发分类数据刷新
 */
export function triggerCategoryRefresh(action, options = {}) {
    triggerDataRefresh('categories', {
        action,
        ...options
    });
}

/**
 * 触发订单数据刷新
 */
export function triggerOrderRefresh(action, options = {}) {
    triggerDataRefresh('orders', {
        action,
        ...options
    });
}

