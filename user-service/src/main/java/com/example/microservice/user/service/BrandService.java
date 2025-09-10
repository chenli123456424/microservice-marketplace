package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.Brand;
import java.util.List;

public interface BrandService extends IService<Brand> {
    List<Brand> getAllBrands();
}
