/**
 * 数据刷新管理器
 * 提供通用的数据实时刷新机制，支持：
 * 1. 全局事件通知机制
 * 2. 可配置的轮询刷新
 * 3. 统一的数据更新接口
 */

/**
 * 触发数据更新事件
 * 当后端数据发生变化时（如管理端添加/修改商品），调用此方法通知前端刷新
 * @param {string} dataType - 数据类型，如 'products', 'categories', 'orders' 等
 * @param {Object} options - 可选参数
 * @param {*} options.data - 可选，如果已有最新数据，直接传入
 * @param {string} options.action - 操作类型，如 'create', 'update', 'delete'
 * @param {number} options.id - 相关数据ID
 */
export function triggerDataRefresh(dataType, options = {}) {
    const event = new CustomEvent('dataUpdated', {
        detail: {
            dataType,
            ...options
        }
    });
    window.dispatchEvent(event);
    console.log(`[DataRefresh] 触发数据更新事件: ${dataType}`, options);
}

/**
 * 监听数据更新事件
 * @param {string} dataType - 要监听的数据类型
 * @param {Function} callback - 回调函数，当数据更新时调用
 * @returns {Function} 清理函数，调用以移除监听器
 */
export function onDataUpdate(dataType, callback) {
    const handleDataUpdate = (event) => {
        const { dataType: updatedType, ...rest } = event.detail;
        // 如果类型匹配，或者是 'all' 类型
        if (updatedType === dataType || updatedType === 'all') {
            callback(rest);
        }
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    console.log(`[DataRefresh] 注册数据更新监听器: ${dataType}`);

    // 返回清理函数
    return () => {
        window.removeEventListener('dataUpdated', handleDataUpdate);
        console.log(`[DataRefresh] 移除数据更新监听器: ${dataType}`);
    };
}

/**
 * 创建轮询刷新器
 * 定期请求API获取最新数据
 * @param {Function} fetchFunction - 获取数据的函数，返回Promise
 * @param {number} interval - 轮询间隔（毫秒），默认30秒
 * @param {Object} options - 配置选项
 * @param {boolean} options.autoStart - 是否自动开始，默认true
 * @param {boolean} options.immediate - 是否立即执行一次，默认true
 * @returns {Object} 控制器对象 { start, stop, refresh }
 */
export function createPollingRefresher(fetchFunction, interval = 30000, options = {}) {
    const { autoStart = true, immediate = true } = options;
    let pollingTimer = null;
    let isActive = false;

    const start = () => {
        if (isActive) {
            console.log('[Polling] 轮询已经在运行中');
            return;
        }

        isActive = true;
        console.log(`[Polling] 开始轮询，间隔: ${interval}ms`);

        if (immediate) {
            // 立即执行一次
            fetchFunction().catch(err => {
                console.error('[Polling] 立即刷新失败:', err);
            });
        }

        // 设置定时器
        pollingTimer = setInterval(() => {
            if (isActive) {
                fetchFunction().catch(err => {
                    console.error('[Polling] 轮询刷新失败:', err);
                });
            }
        }, interval);
    };

    const stop = () => {
        if (pollingTimer) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
        isActive = false;
        console.log('[Polling] 停止轮询');
    };

    const refresh = () => {
        if (isActive) {
            return fetchFunction();
        }
        return Promise.resolve();
    };

    // 如果设置了自动开始，则立即开始
    if (autoStart) {
        start();
    }

    return { start, stop, refresh };
}

/**
 * 创建智能刷新器
 * 结合事件通知和轮询机制
 * @param {Function} fetchFunction - 获取数据的函数
 * @param {string} dataType - 数据类型
 * @param {number} pollingInterval - 轮询间隔（毫秒），0表示不轮询
 * @param {Object} options - 配置选项
 * @returns {Object} 控制器对象 { start, stop, refresh, unsubscribe }
 */
export function createSmartRefresher(fetchFunction, dataType, pollingInterval = 60000, options = {}) {
    let eventUnsubscribe = null;
    let pollingController = null;

    const refresh = async () => {
        try {
            await fetchFunction();
        } catch (error) {
            console.error(`[SmartRefresh] 刷新失败 (${dataType}):`, error);
        }
    };

    const start = () => {
        console.log(`[SmartRefresh] 启动智能刷新器: ${dataType}`);

        // 监听数据更新事件
        eventUnsubscribe = onDataUpdate(dataType, (eventData) => {
            console.log(`[SmartRefresh] 收到事件通知，刷新数据: ${dataType}`, eventData);
            refresh();
        });

        // 如果设置了轮询间隔，启动轮询
        if (pollingInterval > 0) {
            pollingController = createPollingRefresher(fetchFunction, pollingInterval, {
                autoStart: true,
                immediate: false // 事件机制已经会立即刷新，轮询不需要立即执行
            });
        }
    };

    const stop = () => {
        console.log(`[SmartRefresh] 停止智能刷新器: ${dataType}`);
        
        if (eventUnsubscribe) {
            eventUnsubscribe();
            eventUnsubscribe = null;
        }

        if (pollingController) {
            pollingController.stop();
            pollingController = null;
        }
    };

    return {
        start,
        stop,
        refresh,
        get unsubscribe() {
            return stop;
        }
    };
}

/**
 * 页面可见性检测
 * 当页面从隐藏切换到可见时，自动刷新数据
 * @param {Function} refreshFunction - 刷新函数
 */
export function enableVisibilityRefresh(refreshFunction) {
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            console.log('[VisibilityRefresh] 页面变为可见，刷新数据');
            refreshFunction();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}

