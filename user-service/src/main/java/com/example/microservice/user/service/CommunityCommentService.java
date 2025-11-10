package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityComment;

import java.util.List;

/**
 * 社区评论服务接口
 */
public interface CommunityCommentService {
    
    /**
     * 分页查询社区评论
     */
    Page<CommunityComment> page(Long postId, int pageNum, int pageSize);
    
    /**
     * 查询帖子的所有评论
     */
    List<CommunityComment> listByPostId(Long postId);
    
    /**
     * 根据ID查询评论
     */
    CommunityComment getById(Long id);
    
    /**
     * 保存评论
     */
    boolean save(CommunityComment comment);
    
    /**
     * 更新评论
     */
    boolean update(CommunityComment comment);
    
    /**
     * 删除评论
     */
    boolean deleteById(Long id);
}

