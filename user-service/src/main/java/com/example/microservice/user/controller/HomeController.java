package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.service.CategoryService;
import com.example.microservice.user.service.ProductService;
import com.example.microservice.user.service.BrandService;
import com.example.microservice.user.service.FilterService;
import com.example.microservice.user.vo.MainCategoryVO;
import com.example.microservice.user.vo.ProductDetailVO;
import com.example.microservice.user.vo.FilterDimensionVO;
import com.example.microservice.user.dto.ProductFilterDTO;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "家居装修平台接口")
public class HomeController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private BrandService brandService;

    @Autowired
    private FilterService filterService;

    @GetMapping("/categories")
    @Operation(summary = "获取分类树形结构")
    public ResponseResult<List<MainCategoryVO>> getCategoryTree() {
        List<MainCategoryVO> categoryTree = categoryService.getCategoryTree();
        return ResponseResult.success(categoryTree);
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "获取商品详情")
    public ResponseResult<ProductDetailVO> getProductDetail(@PathVariable Long productId) {
        ProductDetailVO productDetail = productService.getProductDetail(productId);
        if (productDetail == null) {
            return ResponseResult.error("商品不存在或已下架");
        }
        return ResponseResult.success(productDetail);
    }

    @PostMapping("/products/filter")
    @Operation(summary = "根据筛选条件获取商品列表")
    public ResponseResult<IPage<Product>> getProductsByFilter(@RequestBody ProductFilterDTO filterDTO,
                                                              @RequestParam(defaultValue = "1") Integer page,
                                                              @RequestParam(defaultValue = "10") Integer size) {
        IPage<Product> products = productService.getProductsByFilter(filterDTO, page, size);
        return ResponseResult.success(products);
    }

    @GetMapping("/products")
    @Operation(summary = "获取商品列表")
    public ResponseResult<IPage<Product>> getProductList(@RequestParam(defaultValue = "1") Integer page,
                                                         @RequestParam(defaultValue = "10") Integer size,
                                                         @RequestParam(required = false) Integer mainId,
                                                         @RequestParam(required = false) Integer subId,
                                                         @RequestParam(required = false) Integer brandId) {
        IPage<Product> products = productService.getProductList(page, size, mainId, subId, brandId);
        return ResponseResult.success(products);
    }

    @GetMapping("/brands")
    @Operation(summary = "获取所有品牌")
    public ResponseResult<List<com.example.microservice.user.entity.Brand>> getAllBrands() {
        List<com.example.microservice.user.entity.Brand> brands = brandService.getAllBrands();
        return ResponseResult.success(brands);
    }

    @GetMapping("/filters")
    @Operation(summary = "获取筛选维度")
    public ResponseResult<List<FilterDimensionVO>> getFilterDimensions(@RequestParam Integer mainId,
                                                                       @RequestParam(required = false) Integer subId) {
        List<FilterDimensionVO> filters = filterService.getFilterDimensions(mainId, subId);
        return ResponseResult.success(filters);
    }

    // 以下为商品管理接口

    /**
     * 管理端搜索商品列表（分页）
     *
     * @param page 页码
     * @param size 每页数量
     * @param name 商品名称（模糊查询）
     * @param price 价格
     * @param marketPrice 市场价
     * @param stock 库存
     * @param status 状态
     * @param mainId 主分类ID
     * @param subId 子分类ID
     * @param brandId 品牌ID
     * @return 商品列表
     */
    @GetMapping("/admin/products/search")
    @Operation(summary = "管理端搜索商品列表")
    public ResponseResult<IPage<Product>> searchAdminProducts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) BigDecimal marketPrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer mainId,
            @RequestParam(required = false) Integer subId,
            @RequestParam(required = false) Integer brandId) {
        try {
            Page<Product> productPage = new Page<>(page, size);
            IPage<Product> products = productService.searchProducts(productPage, name, price, marketPrice, stock, status, mainId, subId, brandId);
            return ResponseResult.success(products);
        } catch (Exception e) {
            return ResponseResult.error("搜索商品列表失败: " + e.getMessage());
        }
    }

    /**
     * 管理端获取商品列表（分页）
     *
     * @param page 页码
     * @param size 每页数量
     * @return 商品列表
     */
    @GetMapping("/admin/products")
    @Operation(summary = "管理端获取商品列表")
    public ResponseResult<IPage<Product>> getAdminProductList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            Page<Product> productPage = new Page<>(page, size);
            IPage<Product> products = productService.page(productPage);
            return ResponseResult.success(products);
        } catch (Exception e) {
            return ResponseResult.error("获取商品列表失败: " + e.getMessage());
        }
    }

    /**
     * 管理端根据ID获取商品详情
     *
     * @param id 商品ID
     * @return 商品详情
     */
    @GetMapping("/admin/products/{id}")
    @Operation(summary = "管理端获取商品详情")
    public ResponseResult<Product> getAdminProductById(@PathVariable Long id) {
        try {
            Product product = productService.getById(id);
            if (product != null) {
                return ResponseResult.success(product);
            } else {
                return ResponseResult.error("商品不存在");
            }
        } catch (Exception e) {
            return ResponseResult.error("获取商品详情失败: " + e.getMessage());
        }
    }

    /**
     * 新增商品
     *
     * @param product 商品信息
     * @return 新增结果
     */
    @PostMapping("/admin/products")
    @Operation(summary = "新增商品")
    public ResponseResult<Product> addProduct(@RequestBody Product product) {
        try {
            // 设置默认状态为上架(1)
            if (product.getStatus() == null) {
                product.setStatus(1);
            }
            
            // 如果 create_time 未设置，则设置为当前时间
            if (product.getCreateTime() == null) {
                product.setCreateTime(LocalDateTime.now());
            }
            
            boolean saved = productService.save(product);
            if (saved) {
                return ResponseResult.success(product);
            } else {
                return ResponseResult.error("新增商品失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("新增商品失败: " + e.getMessage());
        }
    }

    /**
     * 更新商品
     *
     * @param id 商品ID
     * @param product 商品信息
     * @return 更新结果
     */
    @PutMapping("/admin/products/{id}")
    @Operation(summary = "更新商品")
    public ResponseResult<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product existingProduct = productService.getById(id);
            if (existingProduct != null) {
                product.setProductId(id);
                boolean updated = productService.updateById(product);
                if (updated) {
                    Product updatedProduct = productService.getById(id);
                    return ResponseResult.success(updatedProduct); // 确保 success 为 true
                } else {
                    return ResponseResult.error("更新商品失败");
                }
            } else {
                return ResponseResult.error("商品不存在");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新商品失败: " + e.getMessage());
        }
    }

    /**
     * 删除商品
     *
     * @param id 商品ID
     * @return 删除结果
     */
    @DeleteMapping("/admin/products/{id}")
    @Operation(summary = "删除商品")
    public ResponseResult<String> deleteProduct(@PathVariable Long id) {
        try {
            Product existingProduct = productService.getById(id);
            if (existingProduct != null) {
                boolean removed = productService.removeById(id);
                if (removed) {
                    // 确保 success 字段存在且为 true
                    return ResponseResult.success("商品删除成功");
                } else {
                    // 确保 success 字段存在且为 false
                    return ResponseResult.error("删除商品失败");
                }
            } else {
                // 确保 success 字段存在且为 false
                return ResponseResult.error("商品不存在");
            }
        } catch (Exception e) {
            // 确保 success 字段存在且为 false
            return ResponseResult.error("删除商品失败: " + e.getMessage());
        }
    }
}