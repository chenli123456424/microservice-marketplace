package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Designer;
import org.apache.ibatis.annotations.Mapper;

/**
 * 设计师Mapper接口
 */
@Mapper
public interface DesignerMapper extends BaseMapper<Designer> {
}
