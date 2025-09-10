package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.*;
import com.example.microservice.user.mapper.*;
import com.example.microservice.user.service.ProductService;
import com.example.microservice.user.vo.ProductDetailVO;
import com.example.microservice.user.dto.ProductFilterDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private BrandMapper brandMapper;

    @Autowired
    private MainCategoryMapper mainCategoryMapper;

    @Autowired
    private SubCategoryMapper subCategoryMapper;

    @Autowired
    private ProductCommonAttrMapper productCommonAttrMapper;

    @Autowired
    private ProductExtendAttrMapper productExtendAttrMapper;

    @Autowired
    private ProductImageMapper productImageMapper;

    @Override
    public ProductDetailVO getProductDetail(Long productId) {
        // 1. 查询商品基本信息
        Product product = productMapper.selectById(productId);
        if (product == null || product.getStatus() != 1) {
            return null; // 商品不存在或已下架
        }

        ProductDetailVO vo = new ProductDetailVO();
        BeanUtils.copyProperties(product, vo);

        // 2. 查询品牌名称
        Brand brand = brandMapper.selectById(product.getBrandId());
        if (brand != null) {
            vo.setBrandName(brand.getName());
        }

        // 3. 查询大分类和子分类名称
        MainCategory mainCategory = mainCategoryMapper.selectById(product.getMainId());
        if (mainCategory != null) {
            vo.setMainCategoryName(mainCategory.getName());
        }

        SubCategory subCategory = subCategoryMapper.selectById(product.getSubId());
        if (subCategory != null) {
            vo.setSubCategoryName(subCategory.getName());
        }

        // 4. 查询通用属性
        ProductCommonAttr commonAttr = productCommonAttrMapper.selectOne(
            new QueryWrapper<ProductCommonAttr>().eq("product_id", productId)
        );
        vo.setCommonAttr(commonAttr);

        // 5. 查询扩展属性列表
        List<ProductExtendAttr> extendAttrs = productExtendAttrMapper.selectList(
            new QueryWrapper<ProductExtendAttr>().eq("product_id", productId)
        );
        vo.setExtendAttrs(extendAttrs);

        // 6. 查询商品图片
        List<ProductImage> images = productImageMapper.selectList(
            new QueryWrapper<ProductImage>().eq("product_id", productId).orderByAsc("sort")
        );
        vo.setImages(images);

        return vo;
    }

    @Override
    public IPage<Product> getProductsByFilter(ProductFilterDTO filterDTO, Integer page, Integer size) {
        // 创建分页对象
        Page<Product> pageObj = new Page<>(page, size);

        // 构建查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("main_id", filterDTO.getMainId());
        queryWrapper.eq(filterDTO.getSubId() != null, "sub_id", filterDTO.getSubId());
        queryWrapper.eq("status", 1); // 只查询上架商品

        // 如果有属性筛选条件
        if (filterDTO.getAttrs() != null && !filterDTO.getAttrs().isEmpty()) {
            // 使用子查询方式实现多条件筛选
            StringBuilder subQuery = new StringBuilder();
            subQuery.append("product_id IN (SELECT product_id FROM product_extend_attr WHERE ");

            for (int i = 0; i < filterDTO.getAttrs().size(); i++) {
                if (i > 0) {
                    subQuery.append(" AND product_id IN (SELECT product_id FROM product_extend_attr WHERE ");
                }
                subQuery.append("attr_key = '").append(filterDTO.getAttrs().get(i).getAttrKey())
                        .append("' AND attr_value = '").append(filterDTO.getAttrs().get(i).getAttrValue())
                        .append("')");
            }

            queryWrapper.apply(subQuery.toString());
        }

        // 执行分页查询
        return productMapper.selectPage(pageObj, queryWrapper);
    }
    
    @Override
    public IPage<Product> getProductList(Integer page, Integer size, Integer mainId, Integer subId, Integer brandId) {
        // 创建分页对象
        Page<Product> pageObj = new Page<>(page, size);
        
        // 构建查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 1); // 只查询上架商品
        
        // 添加可选的筛选条件
        if (mainId != null) {
            queryWrapper.eq("main_id", mainId);
        }
        if (subId != null) {
            queryWrapper.eq("sub_id", subId);
        }
        if (brandId != null) {
            queryWrapper.eq("brand_id", brandId);
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");
        
        // 显式指定查询字段，确保 marketPrice 被包含
        queryWrapper.select("product_id", "main_id", "sub_id", "brand_id", "name", "price", "marketPrice", "stock", "status", "create_time");
        
        // 执行分页查询
        return productMapper.selectPage(pageObj, queryWrapper);
    }
    
    @Override
    public IPage<Product> searchProducts(Page<Product> page, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status) {
        // 构建查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        
        // 添加名称模糊查询条件
        if (name != null && !name.isEmpty()) {
            queryWrapper.like("name", name);
        }
        
        // 添加价格精确查询条件
        if (price != null) {
            queryWrapper.eq("price", price);
        }
        
        // 添加市场价精确查询条件
        if (marketPrice != null) {
            queryWrapper.eq("market_price", marketPrice);
        }
        
        // 添加库存精确查询条件
        if (stock != null) {
            queryWrapper.eq("stock", stock);
        }
        
        // 添加状态精确查询条件
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");
        
        // 执行分页查询
        return productMapper.selectPage(page, queryWrapper);
    }

    @Override
    public IPage<Product> searchProducts(Page<Product> productPage, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status, Integer mainId, Integer subId, Integer brandId) {
        // 构建查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();

        // 添加名称模糊查询条件
        if (name != null && !name.isEmpty()) {
            queryWrapper.like("name", name);
        }

        // 添加价格精确查询条件
        if (price != null) {
            queryWrapper.eq("price", price);
        }

        // 添加市场价精确查询条件
        if (marketPrice != null) {
            queryWrapper.eq("market_price", marketPrice);
        }

        // 添加库存精确查询条件
        if (stock != null) {
            queryWrapper.eq("stock", stock);
        }

        // 添加状态精确查询条件
        if (status != null) {
            queryWrapper.eq("status", status);
        }

        // 添加主分类查询条件
        if (mainId != null) {
            queryWrapper.eq("main_id", mainId);
        }

        // 添加子分类查询条件
        if (subId != null) {
            queryWrapper.eq("sub_id", subId);
        }

        // 添加品牌查询条件
        if (brandId != null) {
            queryWrapper.eq("brand_id", brandId);
        }

        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");

        // 执行分页查询
        return productMapper.selectPage(productPage, queryWrapper);
    }

}