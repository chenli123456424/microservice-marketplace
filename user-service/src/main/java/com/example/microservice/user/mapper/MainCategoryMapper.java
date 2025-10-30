package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.MainCategory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 主分类Mapper接口
 */
@Mapper
public interface MainCategoryMapper extends BaseMapper<MainCategory> {
}