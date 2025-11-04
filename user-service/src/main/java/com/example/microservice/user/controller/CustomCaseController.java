package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomCase;
import com.example.microservice.user.service.CustomCaseService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 定制案例Controller
 */
@RestController
@RequestMapping("/api/custom-cases")
@CrossOrigin
public class CustomCaseController {
    
    @Autowired
    private CustomCaseService customCaseService;
    
    /**
     * 分页查询定制案例
     */
    @GetMapping("/page")
    public ResponseResult<Page<CustomCase>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) Integer status) {
        
        Page<CustomCase> page = customCaseService.page(pageNum, pageSize, style, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有上架的定制案例
     */
    @GetMapping("/list")
    public ResponseResult<List<CustomCase>> list() {
        List<CustomCase> list = customCaseService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询定制案例
     */
    @GetMapping("/{id}")
    public ResponseResult<CustomCase> getById(@PathVariable Long id) {
        CustomCase customCase = customCaseService.getById(id);
        if (customCase != null) {
            return ResponseResult.success(customCase);
        } else {
            return ResponseResult.error("案例不存在");
        }
    }
    
    /**
     * 新增定制案例
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody CustomCase customCase) {
        boolean success = customCaseService.save(customCase);
        if (success) {
            return ResponseResult.success("保存成功");
        } else {
            return ResponseResult.error("保存失败");
        }
    }
    
    /**
     * 更新定制案例
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody CustomCase customCase) {
        boolean success = customCaseService.update(customCase);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除定制案例
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = customCaseService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
    
    /**
     * 增加浏览次数
     */
    @PostMapping("/{id}/view")
    public ResponseResult<String> incrementViewCount(@PathVariable Long id) {
        boolean success = customCaseService.incrementViewCount(id);
        if (success) {
            return ResponseResult.success("操作成功");
        } else {
            return ResponseResult.error("操作失败");
        }
    }
    
    /**
     * 增加点赞次数
     */
    @PostMapping("/{id}/like")
    public ResponseResult<String> incrementLikeCount(@PathVariable Long id) {
        boolean success = customCaseService.incrementLikeCount(id);
        if (success) {
            return ResponseResult.success("操作成功");
        } else {
            return ResponseResult.error("操作失败");
        }
    }
}

