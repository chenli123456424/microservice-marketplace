package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.CustomCase;
import org.apache.ibatis.annotations.Mapper;

/**
 * 定制案例Mapper接口
 */
@Mapper
public interface CustomCaseMapper extends BaseMapper<CustomCase> {
}
