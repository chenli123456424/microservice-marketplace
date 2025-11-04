package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Store;
import org.apache.ibatis.annotations.Mapper;

/**
 * 门店Mapper接口
 */
@Mapper
public interface StoreMapper extends BaseMapper<Store> {
}
