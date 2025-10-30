package com.example.microservice.user.service;

import java.util.List;
import java.util.Map;

/**
 * 热门搜索服务接口
 */
public interface HotSearchService {
    
    /**
     * 记录搜索关键词
     * @param keyword 搜索关键词
     */
    void recordSearch(String keyword);
    
    /**
     * 获取热门搜索关键词列表
     * @param limit 返回数量限制
     * @return 热门搜索关键词列表
     */
    List<String> getHotSearchKeywords(int limit);
    
    /**
     * 获取关键词详细信息
     * @param keyword 关键词
     * @return 关键词统计信息
     */
    Map<String, Object> getKeywordStats(String keyword);
    
    /**
     * 清理过期数据（超过3天的数据）
     */
    void cleanExpiredData();
    
    /**
     * 获取指定时间范围内的热门关键词
     * @param days 天数
     * @param limit 返回数量限制
     * @return 热门搜索关键词列表
     */
    List<String> getHotSearchKeywordsByDays(int days, int limit);
}
