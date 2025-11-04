package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Appointment;

import java.util.List;

/**
 * 预约信息服务接口
 */
public interface AppointmentService {
    
    /**
     * 分页查询预约信息
     */
    Page<Appointment> page(int pageNum, int pageSize, Integer status);
    
    /**
     * 查询所有预约信息
     */
    List<Appointment> listAll();
    
    /**
     * 根据ID查询预约信息
     */
    Appointment getById(Long id);
    
    /**
     * 保存预约信息
     */
    boolean save(Appointment appointment);
    
    /**
     * 更新预约信息
     */
    boolean update(Appointment appointment);
    
    /**
     * 删除预约信息
     */
    boolean deleteById(Long id);
}
