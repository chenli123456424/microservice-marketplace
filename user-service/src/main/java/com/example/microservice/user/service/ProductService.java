package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.vo.ProductDetailVO;
import com.example.microservice.user.dto.ProductFilterDTO;

import java.math.BigDecimal;

public interface ProductService extends IService<Product> {
    ProductDetailVO getProductDetail(Long productId);

    IPage<Product> getProductsByFilter(ProductFilterDTO filterDTO, Integer page, Integer size);
    
    IPage<Product> getProductList(Integer page, Integer size, Integer mainId, Integer subId, Integer brandId);

    IPage<Product> searchProducts(Page<Product> page, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status);

    IPage<Product> searchProducts(Page<Product> productPage, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status, Integer mainId, Integer subId, Integer brandId);
}