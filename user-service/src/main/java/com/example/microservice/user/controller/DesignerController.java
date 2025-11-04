package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Designer;
import com.example.microservice.user.service.DesignerService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 设计师Controller
 */
@RestController
@RequestMapping("/api/designers")
@CrossOrigin
public class DesignerController {
    
    @Autowired
    private DesignerService designerService;
    
    /**
     * 分页查询设计师
     */
    @GetMapping("/page")
    public ResponseResult<Page<Designer>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        
        Page<Designer> page = designerService.page(pageNum, pageSize, name, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有在职的设计师
     */
    @GetMapping("/list")
    public ResponseResult<List<Designer>> list() {
        List<Designer> list = designerService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询设计师
     */
    @GetMapping("/{id}")
    public ResponseResult<Designer> getById(@PathVariable Long id) {
        Designer designer = designerService.getById(id);
        if (designer != null) {
            return ResponseResult.success(designer);
        } else {
            return ResponseResult.error("设计师不存在");
        }
    }
    
    /**
     * 新增设计师
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody Designer designer) {
        boolean success = designerService.save(designer);
        if (success) {
            return ResponseResult.success("保存成功");
        } else {
            return ResponseResult.error("保存失败");
        }
    }
    
    /**
     * 更新设计师
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody Designer designer) {
        boolean success = designerService.update(designer);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除设计师
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = designerService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
}

