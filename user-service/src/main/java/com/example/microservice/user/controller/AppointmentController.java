package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Appointment;
import com.example.microservice.user.service.AppointmentService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 预约信息Controller
 */
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    /**
     * 分页查询预约信息
     */
    @GetMapping("/page")
    public ResponseResult<Page<Appointment>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer status) {
        
        Page<Appointment> page = appointmentService.page(pageNum, pageSize, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有预约信息
     */
    @GetMapping("/list")
    public ResponseResult<List<Appointment>> list() {
        List<Appointment> list = appointmentService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询预约信息
     */
    @GetMapping("/{id}")
    public ResponseResult<Appointment> getById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getById(id);
        if (appointment != null) {
            return ResponseResult.success(appointment);
        } else {
            return ResponseResult.error("预约信息不存在");
        }
    }
    
    /**
     * 新增预约信息（用户端预约接口）
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody Appointment appointment) {
        boolean success = appointmentService.save(appointment);
        if (success) {
            return ResponseResult.success("预约成功");
        } else {
            return ResponseResult.error("预约失败");
        }
    }
    
    /**
     * 更新预约信息
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody Appointment appointment) {
        boolean success = appointmentService.update(appointment);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除预约信息
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = appointmentService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
}
