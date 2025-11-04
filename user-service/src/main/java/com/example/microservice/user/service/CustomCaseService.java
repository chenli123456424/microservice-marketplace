package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomCase;

import java.util.List;

/**
 * 定制案例服务接口
 */
public interface CustomCaseService {
    
    /**
     * 分页查询定制案例
     */
    Page<CustomCase> page(int pageNum, int pageSize, String style, Integer status);
    
    /**
     * 查询所有上架的定制案例
     */
    List<CustomCase> listAll();
    
    /**
     * 根据ID查询定制案例
     */
    CustomCase getById(Long id);
    
    /**
     * 保存定制案例
     */
    boolean save(CustomCase customCase);
    
    /**
     * 更新定制案例
     */
    boolean update(CustomCase customCase);
    
    /**
     * 删除定制案例
     */
    boolean deleteById(Long id);
    
    /**
     * 增加浏览次数
     */
    boolean incrementViewCount(Long id);
    
    /**
     * 增加点赞次数
     */
    boolean incrementLikeCount(Long id);
}
