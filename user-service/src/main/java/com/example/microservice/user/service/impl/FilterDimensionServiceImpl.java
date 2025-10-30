package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.FilterDimension;
import com.example.microservice.user.mapper.FilterDimensionMapper;
import com.example.microservice.user.service.FilterDimensionService;
import org.springframework.stereotype.Service;

/**
 * 筛选维度服务实现类
 */
@Service
public class FilterDimensionServiceImpl extends ServiceImpl<FilterDimensionMapper, FilterDimension> implements FilterDimensionService {
}
