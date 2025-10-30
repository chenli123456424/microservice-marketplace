package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.MainCategory;
import com.example.microservice.user.mapper.MainCategoryMapper;
import com.example.microservice.user.service.MainCategoryService;
import org.springframework.stereotype.Service;

/**
 * 主分类服务实现类
 */
@Service
public class MainCategoryServiceImpl extends ServiceImpl<MainCategoryMapper, MainCategory> implements MainCategoryService {
}
