package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Store;
import com.example.microservice.user.mapper.StoreMapper;
import com.example.microservice.user.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 门店服务实现类
 */
@Service
public class StoreServiceImpl implements StoreService {
    
    @Autowired
    private StoreMapper storeMapper;
    
    @Override
    public Page<Store> page(int pageNum, int pageSize, String name, String city, Integer status) {
        Page<Store> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Store> wrapper = new LambdaQueryWrapper<>();
        
        if (name != null && !name.trim().isEmpty()) {
            wrapper.like(Store::getName, name.trim());
        }
        
        if (city != null && !city.trim().isEmpty()) {
            wrapper.eq(Store::getCity, city.trim());
        }
        
        if (status != null) {
            wrapper.eq(Store::getStatus, status);
        }
        
        wrapper.orderByAsc(Store::getSortOrder)
               .orderByDesc(Store::getCreateTime);
        
        return storeMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<Store> listAll() {
        LambdaQueryWrapper<Store> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Store::getStatus, 1) // 只查询营业中的门店
               .orderByAsc(Store::getSortOrder)
               .orderByDesc(Store::getCreateTime);
        return storeMapper.selectList(wrapper);
    }
    
    @Override
    public Store getById(Long id) {
        return storeMapper.selectById(id);
    }
    
    @Override
    public boolean save(Store store) {
        store.setCreateTime(LocalDateTime.now());
        store.setUpdateTime(LocalDateTime.now());
        return storeMapper.insert(store) > 0;
    }
    
    @Override
    public boolean update(Store store) {
        store.setUpdateTime(LocalDateTime.now());
        return storeMapper.updateById(store) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        return storeMapper.deleteById(id) > 0;
    }
}
