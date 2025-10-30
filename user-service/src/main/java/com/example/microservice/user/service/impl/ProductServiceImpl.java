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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

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
        System.out.println("开始执行商品筛选查询，筛选条件: " + filterDTO);
        
        // 创建分页对象
        Page<Product> pageObj = new Page<>(page, size);

        // 构建基本查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        
        // 只有当mainId不为空时才添加主分类条件
        if (filterDTO.getMainId() != null) {
            queryWrapper.eq("main_id", filterDTO.getMainId());
        }
        
        if (filterDTO.getSubId() != null) {
            queryWrapper.eq("sub_id", filterDTO.getSubId());
        }
        
        queryWrapper.eq("status", 1); // 只查询上架商品

        System.out.println("基本查询条件: mainId=" + filterDTO.getMainId() + ", subId=" + filterDTO.getSubId());

        // 如果有筛选维度条件
        if (filterDTO.getAttrs() != null && !filterDTO.getAttrs().isEmpty()) {
            System.out.println("添加筛选维度条件，条件数量: " + filterDTO.getAttrs().size());
            System.out.println("筛选条件详情: " + filterDTO.getAttrs());
            
            // 构建多条件筛选的子查询
            for (ProductFilterDTO.AttrFilterDTO attr : filterDTO.getAttrs()) {
                System.out.println("处理筛选条件: " + attr.getAttrKey() + " = " + attr.getAttrValue());
                
                // 判断是通用属性还是扩展属性
                if (isCommonAttribute(attr.getAttrKey())) {
                    // 通用属性：从 product_common_attr 表查询
                    String columnName = getCommonAttrColumnName(attr.getAttrKey());
                    String subQuery = String.format(
                        "EXISTS (SELECT 1 FROM product_common_attr pca WHERE pca.product_id = product.product_id " +
                        "AND pca.%s = '%s')", 
                        columnName, attr.getAttrValue()
                    );
                    System.out.println("通用属性查询SQL: " + subQuery);
                    queryWrapper.apply(subQuery);
                } else {
                    // 扩展属性：从 product_extend_attr 表查询
                    String subQuery = String.format(
                        "EXISTS (SELECT 1 FROM product_extend_attr pea WHERE pea.product_id = product.product_id " +
                        "AND pea.attr_key = '%s' AND pea.attr_value = '%s')", 
                        attr.getAttrKey(), attr.getAttrValue()
                    );
                    System.out.println("扩展属性查询SQL: " + subQuery);
                    queryWrapper.apply(subQuery);
                }
            }
        } else {
            System.out.println("没有筛选维度条件");
        }
        
        // 添加促销筛选条件
        if (filterDTO.getIsPromotion() != null && filterDTO.getIsPromotion()) {
            System.out.println("添加促销筛选条件");
            queryWrapper.eq("is_promotion", 1);
        }
        
        // 添加分期筛选条件
        if (filterDTO.getSupportInstallment() != null && filterDTO.getSupportInstallment()) {
            System.out.println("添加分期筛选条件");
            queryWrapper.eq("support_installment", 1);
        }
        
        // 添加仅看有货筛选条件
        if (filterDTO.getOnlyInStock() != null && filterDTO.getOnlyInStock()) {
            System.out.println("添加仅看有货筛选条件");
            queryWrapper.eq("stock_status", 1).gt("stock", 0);
        }
        
        // 添加热门搜索关键词筛选条件
        if (filterDTO.getHotSearchKeywords() != null && !filterDTO.getHotSearchKeywords().trim().isEmpty()) {
            System.out.println("添加热门搜索关键词筛选条件: " + filterDTO.getHotSearchKeywords());
            queryWrapper.like("search_keywords", filterDTO.getHotSearchKeywords());
        }
        
        // 添加搜索关键字筛选条件
        if (filterDTO.getSearchKeyword() != null && !filterDTO.getSearchKeyword().trim().isEmpty()) {
            System.out.println("添加搜索关键字筛选条件: " + filterDTO.getSearchKeyword());
            queryWrapper.like("name", filterDTO.getSearchKeyword());
        }

        // 根据排序类型进行排序
        applySorting(queryWrapper, filterDTO.getSortType(), filterDTO.getSortOrder());

        System.out.println("最终SQL查询条件: " + queryWrapper.getSqlSegment());

        // 执行分页查询
        IPage<Product> result = productMapper.selectPage(pageObj, queryWrapper);
        System.out.println("查询结果数量: " + result.getRecords().size() + "/" + result.getTotal());
        
        // 为列表结果补充首图与图片集合
        for (Product p : result.getRecords()) {
            List<ProductImage> imgs = productImageMapper.selectList(new QueryWrapper<ProductImage>()
                    .eq("product_id", p.getProductId())
                    .orderByAsc("sort"));
            p.setImages(imgs);
            if (imgs != null && !imgs.isEmpty()) {
                p.setThumbnailUrl(imgs.get(0).getImageUrl());
            }
        }

        return result;
    }
    
    /**
     * 判断是否为通用属性
     */
    private boolean isCommonAttribute(String attrKey) {
        return "材质".equals(attrKey) || "规格".equals(attrKey) || "价格".equals(attrKey) || 
               "环保等级".equals(attrKey) || "风格".equals(attrKey) || "保修期".equals(attrKey) || 
               "功率".equals(attrKey);
    }
    
    /**
     * 获取通用属性对应的数据库列名
     */
    private String getCommonAttrColumnName(String attrKey) {
        switch (attrKey) {
            case "材质": return "material";
            case "规格": return "spec";
            case "价格": return "price_info";
            case "环保等级": return "env_grade";
            case "风格": return "style";
            case "保修期": return "warranty";
            case "功率": return "power";
            default: return attrKey.toLowerCase();
        }
    }
    
    /**
     * 应用排序逻辑
     */
    private void applySorting(QueryWrapper<Product> queryWrapper, String sortType, String sortOrder) {
        if (sortType == null || sortType.trim().isEmpty()) {
            // 默认排序：按创建时间倒序，相同时间按ID倒序
            queryWrapper.orderByDesc("create_time").orderByDesc("product_id");
            return;
        }
        
        boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
        
        switch (sortType) {
            case "综合":
                // 综合排序：按创建时间倒序，相同时间按ID倒序
                queryWrapper.orderByDesc("create_time").orderByDesc("product_id");
                break;
            case "新品":
                // 新品排序：按创建时间倒序
                queryWrapper.orderByDesc("create_time");
                break;
            case "销量":
                // 销量排序：按销量倒序，相同销量按创建时间倒序
                queryWrapper.orderByDesc("sales_count").orderByDesc("create_time");
                break;
            case "价格":
                // 价格排序：按价格排序
                if (isAsc) {
                    queryWrapper.orderByAsc("price");
                } else {
                    queryWrapper.orderByDesc("price");
                }
                break;
            default:
                // 默认排序
                queryWrapper.orderByDesc("create_time").orderByDesc("product_id");
                break;
        }
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
        
        // 按创建时间倒序排列，相同时间按ID倒序排列（确保获取最新商品）
        queryWrapper.orderByDesc("create_time").orderByDesc("product_id");
        
        // 显式指定查询字段，确保 market_price 被包含
        queryWrapper.select("product_id", "main_id", "sub_id", "brand_id", "name", "price", "market_price", "stock", "status", "create_time");
        
        // 执行分页查询
        IPage<Product> result = productMapper.selectPage(pageObj, queryWrapper);
        
        // 为每个商品设置图片信息
        for (Product product : result.getRecords()) {
            setProductImages(product);
        }
        
        return result;
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
        IPage<Product> result = productMapper.selectPage(page, queryWrapper);
        
        // 为每个商品设置图片信息
        for (Product product : result.getRecords()) {
            setProductImages(product);
        }
        
        return result;
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
        IPage<Product> result = productMapper.selectPage(productPage, queryWrapper);
        
        // 为每个商品设置图片信息
        for (Product product : result.getRecords()) {
            setProductImages(product);
        }
        
        return result;
    }
    
    @Override
    public List<Product> getHotRecommendedProducts(int limit) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_hot_recommended", 1)
                   .eq("status", 1)  // 状态为启用
                   .orderByDesc("create_time")
                   .last("LIMIT " + limit);
        return productMapper.selectList(queryWrapper);
    }
    
    @Override
    public List<Product> getNewArrivalProducts(int limit) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_new_arrival", 1)
                   .eq("status", 1)  // 状态为启用
                   .orderByDesc("create_time")
                   .last("LIMIT " + limit);
        return productMapper.selectList(queryWrapper);
    }
    
    @Override
    public List<Product> getLimitedOfferProducts(int limit) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_limited_offer", 1)
                   .eq("status", 1)  // 状态为启用
                   .orderByDesc("create_time")
                   .last("LIMIT " + limit);
        return productMapper.selectList(queryWrapper);
    }
    
    @Override
    public List<Product> getBestSellerProducts(int limit) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_best_seller", 1)
                   .eq("status", 1)  // 状态为启用
                   .orderByDesc("create_time")
                   .last("LIMIT " + limit);
        return productMapper.selectList(queryWrapper);
    }
    
    @Override
    public List<String> getHotSearchKeywords() {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("is_hot_search", 1)
                   .eq("status", 1)
                   .isNotNull("search_keywords")
                   .ne("search_keywords", "")
                   .select("search_keywords")
                   .orderByDesc("create_time")
                   .last("LIMIT 10");
        
        List<Product> products = productMapper.selectList(queryWrapper);
        List<String> keywords = new ArrayList<>();
        
        for (Product product : products) {
            if (product.getSearchKeywords() != null && !product.getSearchKeywords().trim().isEmpty()) {
                // 分割关键词并添加到列表中
                String[] keywordArray = product.getSearchKeywords().split(",");
                for (String keyword : keywordArray) {
                    String trimmedKeyword = keyword.trim();
                    if (!trimmedKeyword.isEmpty() && !keywords.contains(trimmedKeyword)) {
                        keywords.add(trimmedKeyword);
                    }
                }
            }
        }
        
        return keywords;
    }

    @Override
    public Map<String, Object> getProductAttributes(Long productId) {
        // 查询商品通用属性
        QueryWrapper<ProductCommonAttr> attrWrapper = new QueryWrapper<>();
        attrWrapper.eq("product_id", productId);
        ProductCommonAttr commonAttr = productCommonAttrMapper.selectOne(attrWrapper);
        
        Map<String, Object> attributes = new HashMap<>();
        if (commonAttr != null) {
            attributes.put("material", commonAttr.getMaterial());
            attributes.put("spec", commonAttr.getSpec());
            attributes.put("price_info", commonAttr.getPriceInfo());
            attributes.put("env_grade", commonAttr.getEnvGrade());
            attributes.put("style", commonAttr.getStyle());
            attributes.put("warranty", commonAttr.getWarranty());
            attributes.put("power", commonAttr.getPower());
        }
        
        return attributes;
    }

    @Override
    public List<Map<String, Object>> getProductExtendAttributes(Long productId) {
        // 查询商品扩展属性
        QueryWrapper<ProductExtendAttr> extendWrapper = new QueryWrapper<>();
        extendWrapper.eq("product_id", productId);
        List<ProductExtendAttr> extendAttrs = productExtendAttrMapper.selectList(extendWrapper);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProductExtendAttr attr : extendAttrs) {
            Map<String, Object> attrMap = new HashMap<>();
            attrMap.put("attrKey", attr.getAttrKey());
            attrMap.put("attrValue", attr.getAttrValue());
            result.add(attrMap);
        }
        
        return result;
    }

    @Override
    public Map<String, Object> getProductOptions(Long productId) {
        Map<String, Object> options = new HashMap<>();

        // 规格
        ProductCommonAttr commonAttr = productCommonAttrMapper.selectOne(
            new QueryWrapper<ProductCommonAttr>().eq("product_id", productId)
        );
        if (commonAttr != null && commonAttr.getSpec() != null && !commonAttr.getSpec().isEmpty()) {
            String[] specs = commonAttr.getSpec().split(",");
            List<String> specList = new ArrayList<>();
            for (String s : specs) {
                String t = s.trim();
                if (!t.isEmpty()) specList.add(t);
            }
            if (!specList.isEmpty()) options.put("specs", specList);
        }

        // 颜色与服务等从扩展属性提取
        List<ProductExtendAttr> extendAttrs = productExtendAttrMapper.selectList(
            new QueryWrapper<ProductExtendAttr>().eq("product_id", productId)
        );
        List<String> colors = new ArrayList<>();
        List<String> services = new ArrayList<>();
        for (ProductExtendAttr attr : extendAttrs) {
            if ("颜色".equals(attr.getAttrKey())) {
                colors.add(attr.getAttrValue());
            } else if ("服务".equals(attr.getAttrKey())) {
                services.add(attr.getAttrValue());
            }
        }
        if (!colors.isEmpty()) options.put("colors", colors);
        if (!services.isEmpty()) options.put("services", services);

        return options;
    }

    @Override
    public void removeImagesByProductId(Long productId) {
        QueryWrapper<ProductImage> wrapper = new QueryWrapper<>();
        wrapper.eq("product_id", productId);
        productImageMapper.delete(wrapper);
    }

    @Override
    public void saveImages(Long productId, List<String> imageUrls) {
        if (imageUrls == null) return;
        
        // 先删除该商品的所有旧图片
        removeImagesByProductId(productId);
        
        // 插入新图片
        int sort = 0;
        for (String url : imageUrls) {
            if (url == null || url.trim().isEmpty()) continue;
            ProductImage img = new ProductImage();
            img.setProductId(productId);
            img.setImageUrl(url.trim());
            img.setSort(sort++);
            productImageMapper.insert(img);
        }
    }
    
    /**
     * 为商品设置图片信息
     */
    @Override
    public void setProductImages(Product product) {
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
    
    @Override
    public void saveProductOptions(Long productId, List<String> colors, List<String> specs) {
        System.out.println("保存商品选项 - 商品ID: " + productId);
        System.out.println("接收到的颜色数据: " + colors);
        System.out.println("接收到的规格数据: " + specs);
        
        // 保存规格数据到product_common_attr表
        // 先删除旧的规格数据
        QueryWrapper<ProductCommonAttr> commonAttrWrapper = new QueryWrapper<>();
        commonAttrWrapper.eq("product_id", productId);
        int deletedSpecs = productCommonAttrMapper.delete(commonAttrWrapper);
        System.out.println("删除的规格记录数: " + deletedSpecs);
        
        if (specs != null && !specs.isEmpty()) {
            // 插入新的规格数据
            ProductCommonAttr commonAttr = new ProductCommonAttr();
            commonAttr.setProductId(productId);
            commonAttr.setSpec(String.join(",", specs));
            // 设置所有必填字段的默认值，避免数据库插入失败
            commonAttr.setMaterial("默认材质");
            commonAttr.setPriceInfo("默认价格信息");
            commonAttr.setEnvGrade("默认环保等级");
            commonAttr.setStyle("默认风格");
            commonAttr.setWarranty("默认保修");
            commonAttr.setPower("默认功率");
            int insertedSpecs = productCommonAttrMapper.insert(commonAttr);
            System.out.println("插入的规格记录数: " + insertedSpecs);
        }
        
        // 保存颜色数据到product_extend_attr表
        // 先删除旧的颜色数据
        QueryWrapper<ProductExtendAttr> extendAttrWrapper = new QueryWrapper<>();
        extendAttrWrapper.eq("product_id", productId);
        extendAttrWrapper.eq("attr_key", "颜色");
        int deletedColors = productExtendAttrMapper.delete(extendAttrWrapper);
        System.out.println("删除的颜色记录数: " + deletedColors);
        
        if (colors != null && !colors.isEmpty()) {
            // 插入新的颜色数据
            for (String color : colors) {
                ProductExtendAttr extendAttr = new ProductExtendAttr();
                extendAttr.setProductId(productId);
                extendAttr.setMainId(1); // 设置main_id默认值，避免数据库插入失败
                extendAttr.setAttrKey("颜色");
                extendAttr.setAttrValue(color);
                int insertedColor = productExtendAttrMapper.insert(extendAttr);
                System.out.println("插入颜色: " + color + ", 结果: " + insertedColor);
            }
        }
        
        System.out.println("商品选项保存完成");
    }
}