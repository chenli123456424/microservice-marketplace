package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Appointment;
import com.example.microservice.user.entity.Designer;
import com.example.microservice.user.mapper.AppointmentMapper;
import com.example.microservice.user.mapper.DesignerMapper;
import com.example.microservice.user.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 预约信息服务实现类
 */
@Service
public class AppointmentServiceImpl implements AppointmentService {
    
    @Autowired
    private AppointmentMapper appointmentMapper;
    
    @Autowired
    private DesignerMapper designerMapper;
    
    /**
     * 填充设计师信息
     */
    private void fillDesignerInfo(Appointment appointment) {
        if (appointment.getDesignerId() != null) {
            Designer designer = designerMapper.selectById(appointment.getDesignerId());
            if (designer != null) {
                appointment.setDesigner(designer);
                appointment.setDesignerName(designer.getName());
            }
        }
    }
    
    /**
     * 批量填充设计师信息
     */
    private void fillDesignerInfo(List<Appointment> appointments) {
        if (appointments != null && !appointments.isEmpty()) {
            appointments.forEach(this::fillDesignerInfo);
        }
    }
    
    @Override
    public Page<Appointment> page(int pageNum, int pageSize, Integer status) {
        Page<Appointment> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        
        if (status != null) {
            wrapper.eq(Appointment::getStatus, status);
        }
        
        wrapper.orderByDesc(Appointment::getCreateTime);
        
        Page<Appointment> result = appointmentMapper.selectPage(page, wrapper);
        // 填充设计师信息
        fillDesignerInfo(result.getRecords());
        return result;
    }
    
    @Override
    public List<Appointment> listAll() {
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Appointment::getCreateTime);
        List<Appointment> list = appointmentMapper.selectList(wrapper);
        // 填充设计师信息
        fillDesignerInfo(list);
        return list;
    }
    
    @Override
    public Appointment getById(Long id) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment != null) {
            fillDesignerInfo(appointment);
        }
        return appointment;
    }
    
    @Override
    public boolean save(Appointment appointment) {
        appointment.setCreateTime(LocalDateTime.now());
        appointment.setUpdateTime(LocalDateTime.now());
        if (appointment.getStatus() == null) {
            appointment.setStatus(0); // 默认待处理
        }
        return appointmentMapper.insert(appointment) > 0;
    }
    
    @Override
    public boolean update(Appointment appointment) {
        appointment.setUpdateTime(LocalDateTime.now());
        return appointmentMapper.updateById(appointment) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        return appointmentMapper.deleteById(id) > 0;
    }
}
