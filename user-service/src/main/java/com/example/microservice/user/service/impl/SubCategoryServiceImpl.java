package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.SubCategory;
import com.example.microservice.user.mapper.SubCategoryMapper;
import com.example.microservice.user.service.SubCategoryService;
import org.springframework.stereotype.Service;

/**
 * 子分类服务实现类
 */
@Service
public class SubCategoryServiceImpl extends ServiceImpl<SubCategoryMapper, SubCategory> implements SubCategoryService {
}
