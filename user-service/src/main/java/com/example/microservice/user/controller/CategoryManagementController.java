package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.*;
import com.example.microservice.user.service.*;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分类管理控制器
 */
@RestController
@RequestMapping("/api/admin/category")
@CrossOrigin(origins = "*")
public class CategoryManagementController {

    @Autowired
    private MainCategoryService mainCategoryService;
    
    @Autowired
    private SubCategoryService subCategoryService;
    
    @Autowired
    private BrandService brandService;
    
    @Autowired
    private FilterDimensionService filterDimensionService;

    // ==================== 主分类管理 ====================
    
    @GetMapping("/main/list")
    @Operation(summary = "获取主分类列表")
    public ResponseResult<Page<MainCategory>> getMainCategoryList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name) {
        try {
            Page<MainCategory> pageObj = new Page<>(page, size);
            QueryWrapper<MainCategory> queryWrapper = new QueryWrapper<>();
            
            if (name != null && !name.trim().isEmpty()) {
                queryWrapper.like("name", name.trim());
            }
            
            queryWrapper.orderByAsc("sort_order");
            Page<MainCategory> result = mainCategoryService.page(pageObj, queryWrapper);
            return ResponseResult.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取主分类列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/main/add")
    @Operation(summary = "添加主分类")
    public ResponseResult<String> addMainCategory(@RequestBody MainCategory mainCategory) {
        try {
            mainCategory.setCreateTime(LocalDateTime.now());
            mainCategory.setUpdateTime(LocalDateTime.now());
            boolean success = mainCategoryService.save(mainCategory);
            if (success) {
                return ResponseResult.success("添加主分类成功");
            } else {
                return ResponseResult.error("添加主分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("添加主分类失败: " + e.getMessage());
        }
    }

    @PutMapping("/main/update")
    @Operation(summary = "更新主分类")
    public ResponseResult<String> updateMainCategory(@RequestBody MainCategory mainCategory) {
        try {
            mainCategory.setUpdateTime(LocalDateTime.now());
            boolean success = mainCategoryService.updateById(mainCategory);
            if (success) {
                return ResponseResult.success("更新主分类成功");
            } else {
                return ResponseResult.error("更新主分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("更新主分类失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/main/delete/{id}")
    @Operation(summary = "删除主分类")
    public ResponseResult<String> deleteMainCategory(@PathVariable Integer id) {
        try {
            // 检查是否有子分类
            QueryWrapper<SubCategory> subQuery = new QueryWrapper<>();
            subQuery.eq("main_id", id);
            long subCount = subCategoryService.count(subQuery);
            if (subCount > 0) {
                return ResponseResult.error("该主分类下还有子分类，无法删除");
            }
            
            boolean success = mainCategoryService.removeById(id);
            if (success) {
                return ResponseResult.success("删除主分类成功");
            } else {
                return ResponseResult.error("删除主分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("删除主分类失败: " + e.getMessage());
        }
    }

    // ==================== 子分类管理 ====================
    
    @GetMapping("/sub/list")
    @Operation(summary = "获取子分类列表")
    public ResponseResult<Page<SubCategory>> getSubCategoryList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer mainId) {
        try {
            Page<SubCategory> pageObj = new Page<>(page, size);
            QueryWrapper<SubCategory> queryWrapper = new QueryWrapper<>();
            
            if (name != null && !name.trim().isEmpty()) {
                queryWrapper.like("name", name.trim());
            }
            
            if (mainId != null) {
                queryWrapper.eq("main_id", mainId);
            }
            
            queryWrapper.orderByAsc("main_id", "sort_order");
            Page<SubCategory> result = subCategoryService.page(pageObj, queryWrapper);
            return ResponseResult.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取子分类列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/sub/add")
    @Operation(summary = "添加子分类")
    public ResponseResult<String> addSubCategory(@RequestBody SubCategory subCategory) {
        try {
            subCategory.setCreateTime(LocalDateTime.now());
            subCategory.setUpdateTime(LocalDateTime.now());
            boolean success = subCategoryService.save(subCategory);
            if (success) {
                return ResponseResult.success("添加子分类成功");
            } else {
                return ResponseResult.error("添加子分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("添加子分类失败: " + e.getMessage());
        }
    }

    @PutMapping("/sub/update")
    @Operation(summary = "更新子分类")
    public ResponseResult<String> updateSubCategory(@RequestBody SubCategory subCategory) {
        try {
            subCategory.setUpdateTime(LocalDateTime.now());
            boolean success = subCategoryService.updateById(subCategory);
            if (success) {
                return ResponseResult.success("更新子分类成功");
            } else {
                return ResponseResult.error("更新子分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("更新子分类失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/sub/delete/{id}")
    @Operation(summary = "删除子分类")
    public ResponseResult<String> deleteSubCategory(@PathVariable Integer id) {
        try {
            // 检查是否有商品使用该子分类
            // 这里可以添加商品检查逻辑
            
            boolean success = subCategoryService.removeById(id);
            if (success) {
                return ResponseResult.success("删除子分类成功");
            } else {
                return ResponseResult.error("删除子分类失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("删除子分类失败: " + e.getMessage());
        }
    }

    // ==================== 品牌管理 ====================
    
    @GetMapping("/brand/list")
    @Operation(summary = "获取品牌列表")
    public ResponseResult<Page<Brand>> getBrandList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name) {
        try {
            Page<Brand> pageObj = new Page<>(page, size);
            QueryWrapper<Brand> queryWrapper = new QueryWrapper<>();
            
            if (name != null && !name.trim().isEmpty()) {
                queryWrapper.like("name", name.trim());
            }
            
            queryWrapper.orderByAsc("sort_order");
            Page<Brand> result = brandService.page(pageObj, queryWrapper);
            return ResponseResult.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取品牌列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/brand/add")
    @Operation(summary = "添加品牌")
    public ResponseResult<String> addBrand(@RequestBody Brand brand) {
        try {
            brand.setCreateTime(LocalDateTime.now());
            brand.setUpdateTime(LocalDateTime.now());
            boolean success = brandService.save(brand);
            if (success) {
                return ResponseResult.success("添加品牌成功");
            } else {
                return ResponseResult.error("添加品牌失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("添加品牌失败: " + e.getMessage());
        }
    }

    @PutMapping("/brand/update")
    @Operation(summary = "更新品牌")
    public ResponseResult<String> updateBrand(@RequestBody Brand brand) {
        try {
            brand.setUpdateTime(LocalDateTime.now());
            boolean success = brandService.updateById(brand);
            if (success) {
                return ResponseResult.success("更新品牌成功");
            } else {
                return ResponseResult.error("更新品牌失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("更新品牌失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/brand/delete/{id}")
    @Operation(summary = "删除品牌")
    public ResponseResult<String> deleteBrand(@PathVariable Integer id) {
        try {
            // 检查是否有商品使用该品牌
            // 这里可以添加商品检查逻辑
            
            boolean success = brandService.removeById(id);
            if (success) {
                return ResponseResult.success("删除品牌成功");
            } else {
                return ResponseResult.error("删除品牌失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("删除品牌失败: " + e.getMessage());
        }
    }

    // ==================== 筛选维度管理 ====================
    
    @GetMapping("/filter/list")
    @Operation(summary = "获取筛选维度列表")
    public ResponseResult<Page<FilterDimension>> getFilterDimensionList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer mainId,
            @RequestParam(required = false) Integer subId) {
        try {
            Page<FilterDimension> pageObj = new Page<>(page, size);
            QueryWrapper<FilterDimension> queryWrapper = new QueryWrapper<>();
            
            if (name != null && !name.trim().isEmpty()) {
                queryWrapper.like("name", name.trim());
            }
            
            if (mainId != null) {
                queryWrapper.eq("main_id", mainId);
            }
            
            if (subId != null) {
                queryWrapper.eq("sub_id", subId);
            }
            
            queryWrapper.orderByAsc("main_id", "sub_id", "level", "sort_order");
            Page<FilterDimension> result = filterDimensionService.page(pageObj, queryWrapper);
            return ResponseResult.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取筛选维度列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/filter/add")
    @Operation(summary = "添加筛选维度")
    public ResponseResult<String> addFilterDimension(@RequestBody FilterDimension filterDimension) {
        try {
            filterDimension.setCreateTime(LocalDateTime.now());
            filterDimension.setUpdateTime(LocalDateTime.now());
            boolean success = filterDimensionService.save(filterDimension);
            if (success) {
                return ResponseResult.success("添加筛选维度成功");
            } else {
                return ResponseResult.error("添加筛选维度失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("添加筛选维度失败: " + e.getMessage());
        }
    }

    @PutMapping("/filter/update")
    @Operation(summary = "更新筛选维度")
    public ResponseResult<String> updateFilterDimension(@RequestBody FilterDimension filterDimension) {
        try {
            filterDimension.setUpdateTime(LocalDateTime.now());
            boolean success = filterDimensionService.updateById(filterDimension);
            if (success) {
                return ResponseResult.success("更新筛选维度成功");
            } else {
                return ResponseResult.error("更新筛选维度失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("更新筛选维度失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/filter/delete/{id}")
    @Operation(summary = "删除筛选维度")
    public ResponseResult<String> deleteFilterDimension(@PathVariable Integer id) {
        try {
            // 检查是否有子维度
            QueryWrapper<FilterDimension> childQuery = new QueryWrapper<>();
            childQuery.eq("parent_id", id);
            long childCount = filterDimensionService.count(childQuery);
            if (childCount > 0) {
                return ResponseResult.error("该筛选维度下还有子维度，无法删除");
            }
            
            boolean success = filterDimensionService.removeById(id);
            if (success) {
                return ResponseResult.success("删除筛选维度成功");
            } else {
                return ResponseResult.error("删除筛选维度失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("删除筛选维度失败: " + e.getMessage());
        }
    }

    // ==================== 辅助接口 ====================
    
    @GetMapping("/main/all")
    @Operation(summary = "获取所有主分类")
    public ResponseResult<List<MainCategory>> getAllMainCategories() {
        try {
            QueryWrapper<MainCategory> queryWrapper = new QueryWrapper<>();
            queryWrapper.orderByAsc("sort_order");
            List<MainCategory> list = mainCategoryService.list(queryWrapper);
            return ResponseResult.success(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取主分类列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/sub/all")
    @Operation(summary = "获取所有子分类")
    public ResponseResult<List<SubCategory>> getAllSubCategories(@RequestParam(required = false) Integer mainId) {
        try {
            QueryWrapper<SubCategory> queryWrapper = new QueryWrapper<>();
            if (mainId != null) {
                queryWrapper.eq("main_id", mainId);
            }
            queryWrapper.orderByAsc("main_id", "sort_order");
            List<SubCategory> list = subCategoryService.list(queryWrapper);
            return ResponseResult.success(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取子分类列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/brand/all")
    @Operation(summary = "获取所有品牌")
    public ResponseResult<List<Brand>> getAllBrands() {
        try {
            QueryWrapper<Brand> queryWrapper = new QueryWrapper<>();
            queryWrapper.orderByAsc("sort_order");
            List<Brand> list = brandService.list(queryWrapper);
            return ResponseResult.success(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("获取品牌列表失败: " + e.getMessage());
        }
    }

    // ==================== 图片上传管理 ====================
    
    /**
     * 上传子分类图片
     */
    @PostMapping("/sub/upload-image")
    @Operation(summary = "上传子分类图片")
    public ResponseResult<String> uploadSubCategoryImage(@RequestPart("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseResult.error("文件为空");
            }
            
            // 检查文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseResult.error("只支持图片文件");
            }
            
            // 统一使用项目根目录下的uploads/subcategory文件夹
            String projectRoot = System.getProperty("user.dir");
            java.nio.file.Path uploadDir;
            if (projectRoot.endsWith("user-service")) {
                // 如果当前工作目录是user-service，向上一级找到项目根目录
                uploadDir = java.nio.file.Paths.get(projectRoot, "..", "uploads", "subcategory").toAbsolutePath().normalize();
            } else {
                // 如果当前工作目录已经是项目根目录
                uploadDir = java.nio.file.Paths.get(projectRoot, "uploads", "subcategory").toAbsolutePath();
            }
            
            // 确保目录存在
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "subcategory_" + java.util.UUID.randomUUID().toString() + extension;
            
            // 保存文件
            java.nio.file.Path dest = uploadDir.resolve(filename);
            file.transferTo(dest.toFile());
            
            // 返回可访问的URL
            String url = "/uploads/subcategory/" + filename;
            return ResponseResult.success(url);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("上传失败: " + e.getMessage());
        }
    }
}
