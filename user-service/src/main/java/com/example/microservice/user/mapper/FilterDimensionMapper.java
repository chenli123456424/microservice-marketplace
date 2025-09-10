package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.FilterDimension;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FilterDimensionMapper extends BaseMapper<FilterDimension> {
}
