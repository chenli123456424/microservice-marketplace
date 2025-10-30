package com.example.microservice.user.service.impl;

import com.example.microservice.user.service.HotSearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 热门搜索服务实现类
 */
@Slf4j
@Service
public class HotSearchServiceImpl implements HotSearchService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Redis Key 常量
    private static final String HOT_SEARCH_KEYWORDS_KEY = "hot_search:keywords";
    private static final String HOT_SEARCH_KEYWORD_PREFIX = "hot_search:keyword:";
    private static final String HOT_SEARCH_DAILY_PREFIX = "hot_search:daily:";
    private static final String HOT_SEARCH_HOURLY_PREFIX = "hot_search:hourly:";
    
    // 数据过期时间（3天）
    private static final int EXPIRY_DAYS = 3;
    private static final long EXPIRY_SECONDS = EXPIRY_DAYS * 24 * 60 * 60;

    @Override
    public void recordSearch(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return;
        }
        
        keyword = keyword.trim();
        long currentTime = System.currentTimeMillis();
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String currentHour = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
        
        try {
            // 1. 更新总的热门搜索排序（使用ZSet）
            redisTemplate.opsForZSet().incrementScore(HOT_SEARCH_KEYWORDS_KEY, keyword, 1);
            
            // 2. 更新关键词详细信息（使用Hash）
            String keywordKey = HOT_SEARCH_KEYWORD_PREFIX + keyword;
            redisTemplate.opsForHash().increment(keywordKey, "count", 1);
            redisTemplate.opsForHash().put(keywordKey, "last_seen", currentTime);
            
            // 如果是新关键词，设置首次搜索时间
            if (!redisTemplate.opsForHash().hasKey(keywordKey, "first_seen")) {
                redisTemplate.opsForHash().put(keywordKey, "first_seen", currentTime);
            }
            
            // 3. 按天统计
            String dailyKey = HOT_SEARCH_DAILY_PREFIX + currentDate;
            redisTemplate.opsForZSet().incrementScore(dailyKey, keyword, 1);
            redisTemplate.expire(dailyKey, EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            // 4. 按小时统计
            String hourlyKey = HOT_SEARCH_HOURLY_PREFIX + currentHour;
            redisTemplate.opsForZSet().incrementScore(hourlyKey, keyword, 1);
            redisTemplate.expire(hourlyKey, 24 * 60 * 60, TimeUnit.SECONDS); // 1天过期
            
            // 5. 设置关键词详细信息过期时间
            redisTemplate.expire(keywordKey, EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            log.info("记录搜索关键词: {}, 当前时间: {}", keyword, currentTime);
            
        } catch (Exception e) {
            log.error("记录搜索关键词失败: {}", keyword, e);
        }
    }

    @Override
    public List<String> getHotSearchKeywords(int limit) {
        try {
            // 获取最近3天的热门关键词
            return getHotSearchKeywordsByDays(EXPIRY_DAYS, limit);
        } catch (Exception e) {
            log.error("获取热门搜索关键词失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<String> getHotSearchKeywordsByDays(int days, int limit) {
        try {
            Set<ZSetOperations.TypedTuple<Object>> tuples = redisTemplate.opsForZSet()
                    .reverseRangeWithScores(HOT_SEARCH_KEYWORDS_KEY, 0, limit - 1);
            
            List<String> keywords = new ArrayList<>();
            if (tuples != null) {
                for (ZSetOperations.TypedTuple<Object> tuple : tuples) {
                    Object value = tuple.getValue();
                    if (value != null) {
                        String keyword = value.toString();
                        // 检查关键词是否在有效期内
                        if (isKeywordValid(keyword, days)) {
                            keywords.add(keyword);
                        }
                    }
                }
            }
            
            log.info("获取热门搜索关键词: 天数={}, 限制={}, 结果数量={}", days, limit, keywords.size());
            return keywords;
            
        } catch (Exception e) {
            log.error("获取热门搜索关键词失败: 天数={}, 限制={}", days, limit, e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getKeywordStats(String keyword) {
        Map<String, Object> stats = new HashMap<>();
        try {
            String keywordKey = HOT_SEARCH_KEYWORD_PREFIX + keyword;
            Map<Object, Object> hashData = redisTemplate.opsForHash().entries(keywordKey);
            
            if (!hashData.isEmpty()) {
                stats.put("keyword", keyword);
                stats.put("count", hashData.get("count"));
                stats.put("first_seen", hashData.get("first_seen"));
                stats.put("last_seen", hashData.get("last_seen"));
                
                // 获取在总排序中的排名
                Long rank = redisTemplate.opsForZSet().reverseRank(HOT_SEARCH_KEYWORDS_KEY, keyword);
                stats.put("rank", rank != null ? rank + 1 : -1);
                
                // 获取分数（搜索次数）
                Double score = redisTemplate.opsForZSet().score(HOT_SEARCH_KEYWORDS_KEY, keyword);
                stats.put("score", score != null ? score.intValue() : 0);
            }
            
        } catch (Exception e) {
            log.error("获取关键词统计信息失败: {}", keyword, e);
        }
        
        return stats;
    }

    @Override
    public void cleanExpiredData() {
        try {
            long currentTime = System.currentTimeMillis();
            long expireTime = currentTime - (EXPIRY_DAYS * 24 * 60 * 60 * 1000L);
            
            // 获取所有关键词
            Set<Object> keywords = redisTemplate.opsForZSet().range(HOT_SEARCH_KEYWORDS_KEY, 0, -1);
            
            if (keywords != null) {
                for (Object keywordObj : keywords) {
                    String keyword = keywordObj.toString();
                    String keywordKey = HOT_SEARCH_KEYWORD_PREFIX + keyword;
                    
                    // 检查关键词的最后搜索时间
                    Object lastSeenObj = redisTemplate.opsForHash().get(keywordKey, "last_seen");
                    if (lastSeenObj != null) {
                        long lastSeen = Long.parseLong(lastSeenObj.toString());
                        if (lastSeen < expireTime) {
                            // 删除过期的关键词数据
                            redisTemplate.opsForZSet().remove(HOT_SEARCH_KEYWORDS_KEY, keyword);
                            redisTemplate.delete(keywordKey);
                            log.info("清理过期关键词: {}", keyword);
                        }
                    }
                }
            }
            
            log.info("热门搜索数据清理完成");
            
        } catch (Exception e) {
            log.error("清理过期数据失败", e);
        }
    }

    /**
     * 检查关键词是否在有效期内
     */
    private boolean isKeywordValid(String keyword, int days) {
        try {
            String keywordKey = HOT_SEARCH_KEYWORD_PREFIX + keyword;
            Object lastSeenObj = redisTemplate.opsForHash().get(keywordKey, "last_seen");
            
            if (lastSeenObj != null) {
                long lastSeen = Long.parseLong(lastSeenObj.toString());
                long expireTime = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L);
                return lastSeen > expireTime;
            }
            
            return false;
        } catch (Exception e) {
            log.error("检查关键词有效性失败: {}", keyword, e);
            return false;
        }
    }

    /**
     * 定时清理任务 - 每天凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledCleanExpiredData() {
        log.info("开始执行定时清理任务");
        cleanExpiredData();
    }
}
