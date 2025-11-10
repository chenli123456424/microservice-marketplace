package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityPost;

import java.util.List;

/**
 * 社区帖子服务接口
 */
public interface CommunityPostService {
    
    /**
     * 分页查询社区帖子
     */
    Page<CommunityPost> page(int pageNum, int pageSize, String type, Integer status);
    
    /**
     * 查询所有正常状态的帖子
     */
    List<CommunityPost> listAll();
    
    /**
     * 根据ID查询帖子
     */
    CommunityPost getById(Long id);
    
    /**
     * 保存帖子
     */
    boolean save(CommunityPost post);
    
    /**
     * 更新帖子
     */
    boolean update(CommunityPost post);
    
    /**
     * 删除帖子（逻辑删除）
     */
    boolean deleteById(Long id);
    
    /**
     * 增加浏览次数
     */
    boolean incrementViewCount(Long id);
    
    /**
     * 增加点赞数
     */
    boolean incrementLikeCount(Long id);
    
    /**
     * 增加评论数
     */
    boolean incrementCommentCount(Long id);
    
    /**
     * 根据用户ID分页查询帖子
     */
    Page<CommunityPost> pageByUserId(Long userId, int pageNum, int pageSize, String type, Integer status);
}

