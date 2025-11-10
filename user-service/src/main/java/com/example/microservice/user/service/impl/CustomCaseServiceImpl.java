package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomCase;
import com.example.microservice.user.mapper.CustomCaseMapper;
import com.example.microservice.user.service.CustomCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定制案例服务实现类
 */
@Service
public class CustomCaseServiceImpl implements CustomCaseService {
    
    @Autowired
    private CustomCaseMapper customCaseMapper;
    
    @Override
    public Page<CustomCase> page(int pageNum, int pageSize, String style, Integer status) {
        Page<CustomCase> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CustomCase> wrapper = new LambdaQueryWrapper<>();
        
        if (style != null && !style.isEmpty()) {
            wrapper.eq(CustomCase::getStyle, style);
        }
        if (status != null) {
            wrapper.eq(CustomCase::getStatus, status);
        }
        
        wrapper.orderByDesc(CustomCase::getSortOrder)
                .orderByDesc(CustomCase::getCreateTime);
        
        return customCaseMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<CustomCase> listAll() {
        LambdaQueryWrapper<CustomCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CustomCase::getStatus, 1)
                .orderByDesc(CustomCase::getSortOrder)
                .orderByDesc(CustomCase::getCreateTime);
        return customCaseMapper.selectList(wrapper);
    }
    
    @Override
    public CustomCase getById(Long id) {
        return customCaseMapper.selectById(id);
    }
    
    @Override
    public boolean save(CustomCase customCase) {
        customCase.setCreateTime(LocalDateTime.now());
        customCase.setUpdateTime(LocalDateTime.now());
        if (customCase.getViewCount() == null) {
            customCase.setViewCount(0);
        }
        if (customCase.getLikeCount() == null) {
            customCase.setLikeCount(0);
        }
        if (customCase.getSortOrder() == null) {
            customCase.setSortOrder(0);
        }
        if (customCase.getStatus() == null) {
            customCase.setStatus(1);
        }
        return customCaseMapper.insert(customCase) > 0;
    }
    
    @Override
    public boolean update(CustomCase customCase) {
        // 使用UpdateWrapper强制更新likeCount和likedUserIds字段
        LambdaUpdateWrapper<CustomCase> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(CustomCase::getId, customCase.getId());
        
        // 强制设置likeCount，确保不为null
        Integer likeCountValue = customCase.getLikeCount() != null ? customCase.getLikeCount() : 0;
        updateWrapper.set(CustomCase::getLikeCount, likeCountValue);
        
        // 强制设置likedUserIds（可以是null）
        updateWrapper.set(CustomCase::getLikedUserIds, customCase.getLikedUserIds());
        
        // 设置更新时间
        updateWrapper.set(CustomCase::getUpdateTime, LocalDateTime.now());
        
        // 执行更新
        int result = customCaseMapper.update(null, updateWrapper);
        return result > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        return customCaseMapper.deleteById(id) > 0;
    }
    
    @Override
    public boolean incrementViewCount(Long id) {
        CustomCase customCase = customCaseMapper.selectById(id);
        if (customCase != null) {
            customCase.setViewCount(customCase.getViewCount() + 1);
            return customCaseMapper.updateById(customCase) > 0;
        }
        return false;
    }
    
    @Override
    public boolean incrementLikeCount(Long id) {
        CustomCase customCase = customCaseMapper.selectById(id);
        if (customCase != null) {
            customCase.setLikeCount(customCase.getLikeCount() + 1);
            return customCaseMapper.updateById(customCase) > 0;
        }
        return false;
    }
}
