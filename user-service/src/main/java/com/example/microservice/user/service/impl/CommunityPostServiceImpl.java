package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityPost;
import com.example.microservice.user.mapper.CommunityPostMapper;
import com.example.microservice.user.service.CommunityPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 社区帖子服务实现类
 */
@Service
public class CommunityPostServiceImpl implements CommunityPostService {
    
    @Autowired
    private CommunityPostMapper communityPostMapper;
    
    @Override
    public Page<CommunityPost> page(int pageNum, int pageSize, String type, Integer status) {
        Page<CommunityPost> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CommunityPost> wrapper = new LambdaQueryWrapper<>();
        
        if (type != null && !type.trim().isEmpty()) {
            wrapper.eq(CommunityPost::getType, type.trim());
        }
        if (status != null) {
            wrapper.eq(CommunityPost::getStatus, status);
        } else {
            // 默认只查询正常状态的帖子
            wrapper.eq(CommunityPost::getStatus, 1);
        }
        
        wrapper.orderByDesc(CommunityPost::getCreateTime);
        
        return communityPostMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<CommunityPost> listAll() {
        LambdaQueryWrapper<CommunityPost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CommunityPost::getStatus, 1)
                .orderByDesc(CommunityPost::getCreateTime);
        return communityPostMapper.selectList(wrapper);
    }
    
    @Override
    public CommunityPost getById(Long id) {
        return communityPostMapper.selectById(id);
    }
    
    @Override
    public boolean save(CommunityPost post) {
        post.setCreateTime(LocalDateTime.now());
        post.setUpdateTime(LocalDateTime.now());
        if (post.getViewCount() == null) {
            post.setViewCount(0);
        }
        if (post.getLikeCount() == null) {
            post.setLikeCount(0);
        }
        if (post.getCommentCount() == null) {
            post.setCommentCount(0);
        }
        if (post.getLikedUserIds() == null) {
            post.setLikedUserIds(null); // 初始化为null，表示还没有人点赞
        }
        if (post.getStatus() == null) {
            post.setStatus(1); // 默认正常状态
        }
        return communityPostMapper.insert(post) > 0;
    }
    
    @Override
    public boolean update(CommunityPost post) {
        System.out.println("========== Service.update 开始 ==========");
        System.out.println("接收到的post对象 - ID: " + post.getId());
        System.out.println("标题: " + post.getTitle());
        System.out.println("内容: " + post.getContent());
        System.out.println("类型: " + post.getType());
        System.out.println("图片: " + post.getImages());
        System.out.println("视频: " + post.getVideoUrl());
        System.out.println("likeCount: " + post.getLikeCount() + ", likedUserIds: " + post.getLikedUserIds());
        
        // 先查询原有数据，保留likeCount和likedUserIds（如果新数据中没有提供）
        CommunityPost existingPost = communityPostMapper.selectById(post.getId());
        if (existingPost == null) {
            System.out.println("帖子不存在，ID: " + post.getId());
            return false;
        }
        
        // 使用UpdateWrapper更新所有字段
        LambdaUpdateWrapper<CommunityPost> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(CommunityPost::getId, post.getId());
        
        // 更新标题（必须提供）
        updateWrapper.set(CommunityPost::getTitle, post.getTitle());
        
        // 更新内容（必须提供）
        updateWrapper.set(CommunityPost::getContent, post.getContent());
        
        // 更新类型（必须提供）
        updateWrapper.set(CommunityPost::getType, post.getType());
        
        // 更新图片（允许设置为null，使用setSql确保null值也能更新）
        if (post.getImages() != null) {
            updateWrapper.set(CommunityPost::getImages, post.getImages());
        } else {
            updateWrapper.setSql("images = NULL");
        }
        System.out.println("设置图片: " + post.getImages());
        
        // 更新视频（允许设置为null，使用setSql确保null值也能更新）
        if (post.getVideoUrl() != null) {
            updateWrapper.set(CommunityPost::getVideoUrl, post.getVideoUrl());
        } else {
            updateWrapper.setSql("video_url = NULL");
        }
        System.out.println("设置视频: " + post.getVideoUrl());
        
        // 保留原有的likeCount和likedUserIds（如果新数据中没有提供）
        Integer likeCountValue = post.getLikeCount() != null ? post.getLikeCount() : existingPost.getLikeCount();
        updateWrapper.set(CommunityPost::getLikeCount, likeCountValue != null ? likeCountValue : 0);
        
        String likedUserIdsValue = post.getLikedUserIds() != null ? post.getLikedUserIds() : existingPost.getLikedUserIds();
        if (likedUserIdsValue != null) {
            updateWrapper.set(CommunityPost::getLikedUserIds, likedUserIdsValue);
        } else {
            updateWrapper.setSql("liked_user_ids = NULL");
        }
        
        // 设置更新时间
        updateWrapper.set(CommunityPost::getUpdateTime, LocalDateTime.now());
        
        // 执行更新
        int result = communityPostMapper.update(null, updateWrapper);
        System.out.println("数据库更新执行结果: " + result + " 行受影响");
        
        // 立即查询验证
        if (result > 0) {
            CommunityPost verifyPost = communityPostMapper.selectById(post.getId());
            System.out.println("更新后立即查询验证:");
            System.out.println("  标题: " + verifyPost.getTitle());
            System.out.println("  内容: " + verifyPost.getContent());
            System.out.println("  类型: " + verifyPost.getType());
            System.out.println("  图片: " + verifyPost.getImages());
            System.out.println("  视频: " + verifyPost.getVideoUrl());
            System.out.println("  likeCount: " + verifyPost.getLikeCount() + ", likedUserIds: " + verifyPost.getLikedUserIds());
        }
        
        System.out.println("========== Service.update 结束 ==========");
        return result > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        // 逻辑删除：将状态设置为0
        CommunityPost post = communityPostMapper.selectById(id);
        if (post != null) {
            post.setStatus(0);
            post.setUpdateTime(LocalDateTime.now());
            return communityPostMapper.updateById(post) > 0;
        }
        return false;
    }
    
    @Override
    public boolean incrementViewCount(Long id) {
        CommunityPost post = communityPostMapper.selectById(id);
        if (post != null) {
            post.setViewCount(post.getViewCount() + 1);
            return communityPostMapper.updateById(post) > 0;
        }
        return false;
    }
    
    @Override
    public boolean incrementLikeCount(Long id) {
        CommunityPost post = communityPostMapper.selectById(id);
        if (post != null) {
            post.setLikeCount(post.getLikeCount() + 1);
            return communityPostMapper.updateById(post) > 0;
        }
        return false;
    }
    
    @Override
    public boolean incrementCommentCount(Long id) {
        CommunityPost post = communityPostMapper.selectById(id);
        if (post != null) {
            post.setCommentCount(post.getCommentCount() + 1);
            return communityPostMapper.updateById(post) > 0;
        }
        return false;
    }
    
    @Override
    public Page<CommunityPost> pageByUserId(Long userId, int pageNum, int pageSize, String type, Integer status) {
        Page<CommunityPost> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CommunityPost> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(CommunityPost::getUserId, userId);
        
        if (type != null && !type.trim().isEmpty()) {
            wrapper.eq(CommunityPost::getType, type.trim());
        }
        if (status != null) {
            wrapper.eq(CommunityPost::getStatus, status);
        } else {
            // 默认查询所有状态的帖子（包括已删除的，用于管理）
            // 如果需要只查询正常状态，可以改为 wrapper.eq(CommunityPost::getStatus, 1);
        }
        
        wrapper.orderByDesc(CommunityPost::getCreateTime);
        
        return communityPostMapper.selectPage(page, wrapper);
    }
}

