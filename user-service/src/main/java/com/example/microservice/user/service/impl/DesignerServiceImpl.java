package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Designer;
import com.example.microservice.user.mapper.DesignerMapper;
import com.example.microservice.user.service.DesignerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 设计师服务实现类
 */
@Service
public class DesignerServiceImpl implements DesignerService {
    
    @Autowired
    private DesignerMapper designerMapper;
    
    @Override
    public Page<Designer> page(int pageNum, int pageSize, String name, Integer status) {
        Page<Designer> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Designer> wrapper = new LambdaQueryWrapper<>();
        
        if (name != null && !name.trim().isEmpty()) {
            wrapper.like(Designer::getName, name.trim());
        }
        
        if (status != null) {
            wrapper.eq(Designer::getStatus, status);
        }
        
        wrapper.orderByDesc(Designer::getSortOrder)
                .orderByDesc(Designer::getCreateTime);
        
        return designerMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<Designer> listAll() {
        LambdaQueryWrapper<Designer> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Designer::getStatus, 1)
                .orderByDesc(Designer::getSortOrder)
                .orderByDesc(Designer::getCreateTime);
        return designerMapper.selectList(wrapper);
    }
    
    @Override
    public Designer getById(Long id) {
        return designerMapper.selectById(id);
    }
    
    @Override
    public boolean save(Designer designer) {
        designer.setCreateTime(LocalDateTime.now());
        designer.setUpdateTime(LocalDateTime.now());
        if (designer.getCaseCount() == null) {
            designer.setCaseCount(0);
        }
        if (designer.getRating() == null) {
            designer.setRating(new BigDecimal("5.00"));
        }
        if (designer.getSortOrder() == null) {
            designer.setSortOrder(0);
        }
        if (designer.getStatus() == null) {
            designer.setStatus(1);
        }
        return designerMapper.insert(designer) > 0;
    }
    
    @Override
    public boolean update(Designer designer) {
        designer.setUpdateTime(LocalDateTime.now());
        return designerMapper.updateById(designer) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        return designerMapper.deleteById(id) > 0;
    }
}
