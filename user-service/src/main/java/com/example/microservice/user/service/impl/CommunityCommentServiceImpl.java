package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityComment;
import com.example.microservice.user.mapper.CommunityCommentMapper;
import com.example.microservice.user.service.CommunityCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 社区评论服务实现类
 */
@Service
public class CommunityCommentServiceImpl implements CommunityCommentService {
    
    @Autowired
    private CommunityCommentMapper communityCommentMapper;
    
    @Override
    public Page<CommunityComment> page(Long postId, int pageNum, int pageSize) {
        Page<CommunityComment> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CommunityComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CommunityComment::getPostId, postId)
                .eq(CommunityComment::getStatus, 1)
                .eq(CommunityComment::getParentId, 0) // 只查询顶级评论
                .orderByDesc(CommunityComment::getCreateTime);
        return communityCommentMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<CommunityComment> listByPostId(Long postId) {
        LambdaQueryWrapper<CommunityComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CommunityComment::getPostId, postId)
                .eq(CommunityComment::getStatus, 1)
                .orderByDesc(CommunityComment::getCreateTime);
        return communityCommentMapper.selectList(wrapper);
    }
    
    @Override
    public CommunityComment getById(Long id) {
        return communityCommentMapper.selectById(id);
    }
    
    @Override
    public boolean save(CommunityComment comment) {
        comment.setCreateTime(LocalDateTime.now());
        comment.setUpdateTime(LocalDateTime.now());
        if (comment.getStatus() == null) {
            comment.setStatus(1);
        }
        if (comment.getParentId() == null) {
            comment.setParentId(0L);
        }
        return communityCommentMapper.insert(comment) > 0;
    }
    
    @Override
    public boolean update(CommunityComment comment) {
        comment.setUpdateTime(LocalDateTime.now());
        return communityCommentMapper.updateById(comment) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        // 逻辑删除
        CommunityComment comment = communityCommentMapper.selectById(id);
        if (comment != null) {
            comment.setStatus(0);
            comment.setUpdateTime(LocalDateTime.now());
            return communityCommentMapper.updateById(comment) > 0;
        }
        return false;
    }
}

