package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.vo.ProductDetailVO;
import com.example.microservice.user.dto.ProductFilterDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ProductService extends IService<Product> {
    ProductDetailVO getProductDetail(Long productId);

    IPage<Product> getProductsByFilter(ProductFilterDTO filterDTO, Integer page, Integer size);
    
    IPage<Product> getProductList(Integer page, Integer size, Integer mainId, Integer subId, Integer brandId);

    IPage<Product> searchProducts(Page<Product> page, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status);

    IPage<Product> searchProducts(Page<Product> productPage, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status, Integer mainId, Integer subId, Integer brandId);
    
    // 推荐商品查询方法
    List<Product> getHotRecommendedProducts(int limit);
    List<Product> getNewArrivalProducts(int limit);
    List<Product> getLimitedOfferProducts(int limit);
    List<Product> getBestSellerProducts(int limit);
    
    // 热门搜索关键词查询方法
    List<String> getHotSearchKeywords();
    
    // 商品详情页相关方法
    Map<String, Object> getProductAttributes(Long productId);
    List<Map<String, Object>> getProductExtendAttributes(Long productId);

    /**
     * 聚合并返回商品可选项（规格、颜色、可选服务等）
     */
    Map<String, Object> getProductOptions(Long productId);

    // 图片维护
    void removeImagesByProductId(Long productId);
    void saveImages(Long productId, java.util.List<String> imageUrls);
    
    // 设置商品图片
    void setProductImages(Product product);
    
    // 保存商品颜色和规格数据
    void saveProductOptions(Long productId, java.util.List<String> colors, java.util.List<String> specs);
}