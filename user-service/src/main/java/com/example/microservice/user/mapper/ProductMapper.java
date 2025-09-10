package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.vo.ProductVO;
import com.example.microservice.user.dto.ProductFilterDTO;
import org.apache.ibatis.annotations.Param;

public interface ProductMapper extends BaseMapper<Product> {
    //分页查询商品列表（关联子分类和品牌）
    IPage<ProductVO> selectProductPage(IPage<Product> page, @Param(Constants.WRAPPER) Wrapper<Product> queryWrapper);

    //按筛选条件查询商品（关联扩展属性）
    IPage<ProductVO> selectByFilter(IPage<Product> page, @Param("dto") ProductFilterDTO dto);

}