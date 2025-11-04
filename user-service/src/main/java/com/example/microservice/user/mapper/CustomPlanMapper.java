package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.CustomPlan;
import org.apache.ibatis.annotations.Mapper;

/**
 * 定制方案Mapper接口
 */
@Mapper
public interface CustomPlanMapper extends BaseMapper<CustomPlan> {
}
