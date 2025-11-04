package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.service.CategoryService;
import com.example.microservice.user.service.ProductService;
import com.example.microservice.user.service.BrandService;
import com.example.microservice.user.service.FilterService;
import com.example.microservice.user.service.HotSearchService;
import com.example.microservice.user.vo.MainCategoryVO;
import com.example.microservice.user.vo.ProductDetailVO;
import com.example.microservice.user.vo.FilterDimensionVO;
import com.example.microservice.user.dto.ProductFilterDTO;
import com.example.microservice.user.util.ResponseResult;
import com.example.microservice.user.dto.ImageListRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    @Autowired
    private HotSearchService hotSearchService;

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

    @GetMapping("/products/{productId}/options")
    @Operation(summary = "获取商品动态可选项（规格/颜色/服务）")
    public ResponseResult<Map<String, Object>> getProductOptions(@PathVariable Long productId) {
        Map<String, Object> options = productService.getProductOptions(productId);
        return ResponseResult.success(options);
    }

    @PostMapping("/products/filter")
    @Operation(summary = "根据筛选条件获取商品列表")
    public ResponseResult<IPage<Product>> getProductsByFilter(@RequestBody ProductFilterDTO filterDTO,
                                                              @RequestParam(defaultValue = "1") Integer page,
                                                              @RequestParam(defaultValue = "10") Integer size) {
        // 如果有搜索关键词，记录到Redis
        if (filterDTO.getSearchKeyword() != null && !filterDTO.getSearchKeyword().trim().isEmpty()) {
            hotSearchService.recordSearch(filterDTO.getSearchKeyword().trim());
        }
        
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
                // 如果表单带有图片URL，调用图片保存接口
                if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                    productService.saveImages(product.getProductId(), product.getImageUrls());
                }
                
                // 保存颜色和规格数据（总是调用，即使为空也要清空旧数据）
                productService.saveProductOptions(product.getProductId(), product.getColors(), product.getSpecs());
                
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
                    // 如果表单带有图片URL，调用图片保存接口（覆盖式）
                    if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                        productService.saveImages(id, product.getImageUrls());
                    }
                    
                    // 保存颜色和规格数据（总是调用，即使为空也要清空旧数据）
                    productService.saveProductOptions(id, product.getColors(), product.getSpecs());
                    
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
     * 设置商品图片（覆盖式保存）
     */
    @PostMapping("/admin/products/{id}/images")
    @Operation(summary = "设置商品图片")
    public ResponseResult<String> setProductImages(@PathVariable Long id, @RequestBody ImageListRequest req) {
        try {
            // 先删除旧图，再按顺序写入
            productService.removeImagesByProductId(id);
            productService.saveImages(id, req.getImageUrls());
            return ResponseResult.success("OK");
        } catch (Exception e) {
            return ResponseResult.error("设置商品图片失败: " + e.getMessage());
        }
    }

    /**
     * 上传图片文件，返回可访问URL
     */
    @PostMapping("/admin/upload")
    @Operation(summary = "上传图片文件")
    public ResponseResult<String> uploadImage(@RequestPart("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseResult.error("文件为空");
            }
            
            // 检查文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseResult.error("只支持图片文件");
            }
            
            // 使用项目根目录下的uploads文件夹
            // 使用与 StaticResourceConfig 一致的路径解析逻辑
            String projectRoot = System.getProperty("user.dir");
            java.nio.file.Path uploadDir;
            if (projectRoot.endsWith("user-service")) {
                uploadDir = java.nio.file.Paths.get(projectRoot, "..", "uploads").toAbsolutePath().normalize();
            } else {
                uploadDir = java.nio.file.Paths.get(projectRoot, "uploads").toAbsolutePath();
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
            String filename = java.util.UUID.randomUUID().toString() + extension;
            
            // 保存文件
            java.nio.file.Path dest = uploadDir.resolve(filename);
            file.transferTo(dest.toFile());
            
            // 返回可访问的URL
            String url = "/uploads/" + filename;
            return ResponseResult.success(url);
        } catch (Exception e) {
            e.printStackTrace(); // 打印详细错误信息
            return ResponseResult.error("上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取上传的图片
     * 注意：此方法已被 StaticResourceConfig 替代
     * StaticResourceConfig 会优先处理静态资源，此方法仅作为备用
     * 如果遇到路径冲突，可以注释掉此方法，完全依赖 StaticResourceConfig
     */
    // @GetMapping("/uploads/**")  // 暂时注释，使用 StaticResourceConfig 处理
    @Operation(summary = "获取上传的图片（已禁用，使用 StaticResourceConfig）")
    public void getUploadedImage(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
        String requestURI = request.getRequestURI();
            // 提取文件名（可能包含子目录，如 subcategory/xxx.jpg）
            String filePath = requestURI.substring("/uploads/".length());
        
            // 使用与 StaticResourceConfig 一致的路径解析逻辑
        String projectRoot = System.getProperty("user.dir");
            java.nio.file.Path uploadDir;
            if (projectRoot.endsWith("user-service")) {
                uploadDir = java.nio.file.Paths.get(projectRoot, "..", "uploads").toAbsolutePath().normalize();
            } else {
                uploadDir = java.nio.file.Paths.get(projectRoot, "uploads").toAbsolutePath();
            }
            
            java.nio.file.Path targetFile = uploadDir.resolve(filePath).normalize();
            
            // 安全检查：确保文件在 uploads 目录内
            if (!targetFile.startsWith(uploadDir)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        
            if (java.nio.file.Files.exists(targetFile) && java.nio.file.Files.isRegularFile(targetFile)) {
                // 根据文件扩展名设置 Content-Type
                String contentType = "image/jpeg"; // 默认
                String filename = targetFile.getFileName().toString().toLowerCase();
                if (filename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                }
                
                response.setContentType(contentType);
            response.setHeader("Cache-Control", "public, max-age=3600");
                java.nio.file.Files.copy(targetFile, response.getOutputStream());
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
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
    
    /**
     * 获取推荐商品
     * @return 包含四种推荐类型的商品数据
     */
    @GetMapping("/recommended-products")
    @Operation(summary = "获取推荐商品")
    public ResponseResult<Map<String, List<Product>>> getRecommendedProducts() {
        try {
            Map<String, List<Product>> recommendedProducts = new HashMap<>();
            
            // 每种类型获取1个商品用于展示
            List<Product> hotProducts = productService.getHotRecommendedProducts(1);
            List<Product> newProducts = productService.getNewArrivalProducts(1);
            List<Product> limitedProducts = productService.getLimitedOfferProducts(1);
            List<Product> bestSellerProducts = productService.getBestSellerProducts(1);
            
            // 为每个商品设置图片信息
            for (Product product : hotProducts) {
                productService.setProductImages(product);
            }
            
            for (Product product : newProducts) {
                productService.setProductImages(product);
            }
            
            for (Product product : limitedProducts) {
                productService.setProductImages(product);
            }
            
            for (Product product : bestSellerProducts) {
                productService.setProductImages(product);
            }
            
            recommendedProducts.put("hotRecommended", hotProducts);
            recommendedProducts.put("newArrival", newProducts);
            recommendedProducts.put("limitedOffer", limitedProducts);
            recommendedProducts.put("bestSeller", bestSellerProducts);
            
            return ResponseResult.success(recommendedProducts);
        } catch (Exception e) {
            return ResponseResult.error("获取推荐商品失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取热门搜索关键词
     */
    @GetMapping("/hot-search-keywords")
    @Operation(summary = "获取热门搜索关键词")
    public ResponseResult<List<String>> getHotSearchKeywords() {
        try {
            List<String> keywords = hotSearchService.getHotSearchKeywords(10);
            return ResponseResult.success(keywords);
        } catch (Exception e) {
            return ResponseResult.error("获取热门搜索关键词失败: " + e.getMessage());
        }
    }

    @PostMapping("/search/record")
    @Operation(summary = "记录搜索关键词")
    public ResponseResult<String> recordSearch(@RequestParam String keyword) {
        try {
            hotSearchService.recordSearch(keyword);
            return ResponseResult.success("搜索记录成功");
        } catch (Exception e) {
            return ResponseResult.error("记录搜索失败: " + e.getMessage());
        }
    }

    @GetMapping("/search/stats/{keyword}")
    @Operation(summary = "获取关键词统计信息")
    public ResponseResult<Map<String, Object>> getKeywordStats(@PathVariable String keyword) {
        try {
            Map<String, Object> stats = hotSearchService.getKeywordStats(keyword);
            return ResponseResult.success(stats);
        } catch (Exception e) {
            return ResponseResult.error("获取关键词统计失败: " + e.getMessage());
        }
    }


    @GetMapping("/products/{productId}/attributes")
    @Operation(summary = "获取商品通用属性")
    public ResponseResult<Map<String, Object>> getProductAttributes(@PathVariable Long productId) {
        try {
            Map<String, Object> attributes = productService.getProductAttributes(productId);
            return ResponseResult.success(attributes);
        } catch (Exception e) {
            return ResponseResult.error("获取商品属性失败: " + e.getMessage());
        }
    }

    @GetMapping("/products/{productId}/extend-attributes")
    @Operation(summary = "获取商品扩展属性")
    public ResponseResult<List<Map<String, Object>>> getProductExtendAttributes(@PathVariable Long productId) {
        try {
            List<Map<String, Object>> extendAttributes = productService.getProductExtendAttributes(productId);
            return ResponseResult.success(extendAttributes);
        } catch (Exception e) {
            return ResponseResult.error("获取商品扩展属性失败: " + e.getMessage());
        }
    }
}