package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Store;

import java.util.List;

/**
 * 门店服务接口
 */
public interface StoreService {
    
    /**
     * 分页查询门店
     */
    Page<Store> page(int pageNum, int pageSize, String name, String city, Integer status);
    
    /**
     * 查询所有营业的门店
     */
    List<Store> listAll();
    
    /**
     * 根据ID查询门店
     */
    Store getById(Long id);
    
    /**
     * 保存门店
     */
    boolean save(Store store);
    
    /**
     * 更新门店
     */
    boolean update(Store store);
    
    /**
     * 删除门店
     */
    boolean deleteById(Long id);
}
