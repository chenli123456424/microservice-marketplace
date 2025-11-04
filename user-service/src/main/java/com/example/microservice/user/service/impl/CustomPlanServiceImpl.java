package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomPlan;
import com.example.microservice.user.mapper.CustomPlanMapper;
import com.example.microservice.user.service.CustomPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 定制方案服务实现类
 */
@Service
public class CustomPlanServiceImpl implements CustomPlanService {
    
    @Autowired
    private CustomPlanMapper customPlanMapper;
    
    @Override
    public Page<CustomPlan> page(int pageNum, int pageSize, String type, Integer status) {
        Page<CustomPlan> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CustomPlan> wrapper = new LambdaQueryWrapper<>();
        
        if (type != null && !type.trim().isEmpty()) {
            wrapper.eq(CustomPlan::getType, type.trim());
        }
        
        if (status != null) {
            wrapper.eq(CustomPlan::getStatus, status);
        }
        
        wrapper.orderByAsc(CustomPlan::getSortOrder)
                .orderByDesc(CustomPlan::getCreateTime);
        
        return customPlanMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<CustomPlan> listAll() {
        LambdaQueryWrapper<CustomPlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CustomPlan::getStatus, 1)
                .orderByAsc(CustomPlan::getSortOrder)
                .orderByDesc(CustomPlan::getCreateTime);
        return customPlanMapper.selectList(wrapper);
    }
    
    @Override
    public CustomPlan getById(Long id) {
        return customPlanMapper.selectById(id);
    }
    
    @Override
    public boolean save(CustomPlan customPlan) {
        customPlan.setCreateTime(LocalDateTime.now());
        customPlan.setUpdateTime(LocalDateTime.now());
        if (customPlan.getSortOrder() == null) {
            customPlan.setSortOrder(0);
        }
        if (customPlan.getStatus() == null) {
            customPlan.setStatus(1);
        }
        return customPlanMapper.insert(customPlan) > 0;
    }
    
    @Override
    public boolean update(CustomPlan customPlan) {
        customPlan.setUpdateTime(LocalDateTime.now());
        return customPlanMapper.updateById(customPlan) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        return customPlanMapper.deleteById(id) > 0;
    }
}
