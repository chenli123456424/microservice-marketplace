package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Store;
import com.example.microservice.user.service.StoreService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 门店Controller
 */
@RestController
@RequestMapping("/api/stores")
@CrossOrigin
public class StoreController {
    
    @Autowired
    private StoreService storeService;
    
    /**
     * 分页查询门店
     */
    @GetMapping("/page")
    public ResponseResult<Page<Store>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer status) {
        
        Page<Store> page = storeService.page(pageNum, pageSize, name, city, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有营业的门店
     */
    @GetMapping("/list")
    public ResponseResult<List<Store>> list() {
        List<Store> list = storeService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询门店
     */
    @GetMapping("/{id}")
    public ResponseResult<Store> getById(@PathVariable Long id) {
        Store store = storeService.getById(id);
        if (store != null) {
            return ResponseResult.success(store);
        } else {
            return ResponseResult.error("门店不存在");
        }
    }
    
    /**
     * 新增门店
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody Store store) {
        boolean success = storeService.save(store);
        if (success) {
            return ResponseResult.success("保存成功");
        } else {
            return ResponseResult.error("保存失败");
        }
    }
    
    /**
     * 更新门店
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody Store store) {
        boolean success = storeService.update(store);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除门店
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = storeService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
}
