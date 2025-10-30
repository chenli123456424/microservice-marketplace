package com.example.microservice.user.controller;

import com.example.microservice.user.entity.Product;
import com.example.microservice.user.entity.ProductImage;
import com.example.microservice.user.mapper.ProductImageMapper;
import com.example.microservice.user.service.ProductService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

@RestController
@RequestMapping("/api")
@Tag(name = "推荐商品接口")
public class RecommendController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductImageMapper productImageMapper;

    /**
     * 获取推荐商品（包含图片信息）
     */
    @GetMapping("/recommended-products-with-images")
    @Operation(summary = "获取推荐商品（包含图片信息）")
    public ResponseResult<Map<String, List<Product>>> getRecommendedProductsWithImages() {
        try {
            Map<String, List<Product>> recommendedProducts = new HashMap<>();
            
            // 每种类型获取1个商品用于展示
            List<Product> hotProducts = productService.getHotRecommendedProducts(1);
            List<Product> newProducts = productService.getNewArrivalProducts(1);
            List<Product> limitedProducts = productService.getLimitedOfferProducts(1);
            List<Product> bestSellerProducts = productService.getBestSellerProducts(1);
            
            // 为每个商品设置图片信息
            setProductImages(hotProducts);
            setProductImages(newProducts);
            setProductImages(limitedProducts);
            setProductImages(bestSellerProducts);
            
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
     * 为商品列表设置图片信息
     */
    private void setProductImages(List<Product> products) {
        for (Product product : products) {
            if (product != null && product.getProductId() != null) {
                QueryWrapper<ProductImage> wrapper = new QueryWrapper<>();
                wrapper.eq("product_id", product.getProductId());
                wrapper.orderByAsc("sort");
                List<ProductImage> images = productImageMapper.selectList(wrapper);
                
                if (images != null && !images.isEmpty()) {
                    // 设置缩略图（第一张图片）
                    product.setThumbnailUrl(images.get(0).getImageUrl());
                    // 设置所有图片
                    product.setImages(images);
                }
            }
        }
    }
}
