package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.MainCategory;
import com.example.microservice.user.vo.MainCategoryVO;
import java.util.List;

public interface CategoryService extends IService<MainCategory> {
    List<MainCategoryVO> getCategoryTree();
}
