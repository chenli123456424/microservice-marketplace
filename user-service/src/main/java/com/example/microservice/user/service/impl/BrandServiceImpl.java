package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.Brand;
import com.example.microservice.user.mapper.BrandMapper;
import com.example.microservice.user.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BrandServiceImpl extends ServiceImpl<BrandMapper, Brand> implements BrandService {

    @Autowired
    private BrandMapper brandMapper;

    @Override
    public List<Brand> getAllBrands() {
        return brandMapper.selectList(null);
    }
}
