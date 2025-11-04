package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomPlan;

import java.util.List;

/**
 * 定制方案服务接口
 */
public interface CustomPlanService {
    
    /**
     * 分页查询定制方案
     */
    Page<CustomPlan> page(int pageNum, int pageSize, String type, Integer status);
    
    /**
     * 查询所有上架的定制方案
     */
    List<CustomPlan> listAll();
    
    /**
     * 根据ID查询定制方案
     */
    CustomPlan getById(Long id);
    
    /**
     * 保存定制方案
     */
    boolean save(CustomPlan customPlan);
    
    /**
     * 更新定制方案
     */
    boolean update(CustomPlan customPlan);
    
    /**
     * 删除定制方案
     */
    boolean deleteById(Long id);
}
