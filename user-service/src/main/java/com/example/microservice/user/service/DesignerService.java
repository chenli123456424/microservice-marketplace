package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Designer;

import java.util.List;

/**
 * 设计师服务接口
 */
public interface DesignerService {
    
    /**
     * 分页查询设计师
     */
    Page<Designer> page(int pageNum, int pageSize, String name, Integer status);
    
    /**
     * 查询所有在职的设计师
     */
    List<Designer> listAll();
    
    /**
     * 根据ID查询设计师
     */
    Designer getById(Long id);
    
    /**
     * 保存设计师
     */
    boolean save(Designer designer);
    
    /**
     * 更新设计师
     */
    boolean update(Designer designer);
    
    /**
     * 删除设计师
     */
    boolean deleteById(Long id);
}
