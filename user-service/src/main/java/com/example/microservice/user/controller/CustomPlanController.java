package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomPlan;
import com.example.microservice.user.service.CustomPlanService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 定制方案Controller
 */
@RestController
@RequestMapping("/api/custom-plans")
@CrossOrigin
public class CustomPlanController {
    
    @Autowired
    private CustomPlanService customPlanService;
    
    /**
     * 分页查询定制方案
     */
    @GetMapping("/page")
    public ResponseResult<Page<CustomPlan>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        
        Page<CustomPlan> page = customPlanService.page(pageNum, pageSize, type, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有上架的定制方案
     */
    @GetMapping("/list")
    public ResponseResult<List<CustomPlan>> list() {
        List<CustomPlan> list = customPlanService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询定制方案
     */
    @GetMapping("/{id}")
    public ResponseResult<CustomPlan> getById(@PathVariable Long id) {
        CustomPlan customPlan = customPlanService.getById(id);
        if (customPlan != null) {
            return ResponseResult.success(customPlan);
        } else {
            return ResponseResult.error("方案不存在");
        }
    }
    
    /**
     * 新增定制方案
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody CustomPlan customPlan) {
        boolean success = customPlanService.save(customPlan);
        if (success) {
            return ResponseResult.success("保存成功");
        } else {
            return ResponseResult.error("保存失败");
        }
    }
    
    /**
     * 更新定制方案
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody CustomPlan customPlan) {
        boolean success = customPlanService.update(customPlan);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除定制方案
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = customPlanService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
}
