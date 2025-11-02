/**
 * React Hook for Data Refresh
 * 提供便捷的React Hook接口，方便在组件中使用数据刷新功能
 */

import { useEffect, useRef, useCallback } from 'react';
import { createSmartRefresher, triggerDataRefresh, enableVisibilityRefresh } from '../utils/dataRefreshManager';

/**
 * 使用数据刷新的Hook
 * @param {Function} fetchFunction - 获取数据的函数
 * @param {string} dataType - 数据类型标识
 * @param {Object} options - 配置选项
 * @param {number} options.pollingInterval - 轮询间隔（毫秒），0表示禁用轮询，默认60000（1分钟）
 * @param {boolean} options.enableVisibilityRefresh - 是否启用页面可见性刷新，默认true
 * @param {boolean} options.immediate - 是否立即执行一次，默认true
 * @returns {Function} 手动刷新函数
 */
export function useDataRefresh(fetchFunction, dataType, options = {}) {
    const {
        pollingInterval = 60000, // 默认1分钟轮询一次
        enableVisibilityRefresh: enableVis = true,
        immediate = true
    } = options;

    const refresherRef = useRef(null);
    const visibilityCleanupRef = useRef(null);

    // 创建刷新函数包装器，确保依赖正确
    const wrappedFetchFunction = useCallback(() => {
        return fetchFunction();
    }, [fetchFunction]);

    useEffect(() => {
        // 创建智能刷新器
        refresherRef.current = createSmartRefresher(
            wrappedFetchFunction,
            dataType,
            pollingInterval,
            { immediate }
        );

        // 启动刷新器
        refresherRef.current.start();

        // 如果启用页面可见性刷新
        if (enableVis) {
            visibilityCleanupRef.current = enableVisibilityRefresh(() => {
                if (refresherRef.current) {
                    refresherRef.current.refresh();
                }
            });
        }

        // 清理函数
        return () => {
            if (refresherRef.current) {
                refresherRef.current.stop();
                refresherRef.current = null;
            }
            if (visibilityCleanupRef.current) {
                visibilityCleanupRef.current();
                visibilityCleanupRef.current = null;
            }
        };
    }, [wrappedFetchFunction, dataType, pollingInterval, enableVis, immediate]);

    // 返回手动刷新函数
    const manualRefresh = useCallback(() => {
        if (refresherRef.current) {
            return refresherRef.current.refresh();
        }
        return Promise.resolve();
    }, []);

    return manualRefresh;
}

/**
 * 触发数据刷新事件的Hook
 * 用于在数据更新后通知其他组件刷新
 */
export function useTriggerDataRefresh() {
    return useCallback((dataType, options) => {
        triggerDataRefresh(dataType, options);
    }, []);
}

