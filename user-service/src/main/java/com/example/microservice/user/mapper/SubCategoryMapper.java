package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.SubCategory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 子分类Mapper接口
 */
@Mapper
public interface SubCategoryMapper extends BaseMapper<SubCategory> {
}