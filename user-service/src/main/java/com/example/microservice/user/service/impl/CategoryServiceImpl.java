package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.MainCategory;
import com.example.microservice.user.entity.SubCategory;
import com.example.microservice.user.mapper.MainCategoryMapper;
import com.example.microservice.user.mapper.SubCategoryMapper;
import com.example.microservice.user.service.CategoryService;
import com.example.microservice.user.vo.MainCategoryVO;
import com.example.microservice.user.vo.SubCategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl extends ServiceImpl<MainCategoryMapper, MainCategory> implements CategoryService {

    @Autowired
    private MainCategoryMapper mainCategoryMapper;

    @Autowired
    private SubCategoryMapper subCategoryMapper;

    @Override
    public List<MainCategoryVO> getCategoryTree() {
        // 获取所有大分类
        List<MainCategory> mainCategories = mainCategoryMapper.selectList(null);

        // 获取所有子分类
        List<SubCategory> subCategories = subCategoryMapper.selectList(null);

        // 转换为VO并构建树形结构
        return mainCategories.stream().map(mainCategory -> {
            MainCategoryVO mainCategoryVO = new MainCategoryVO();
            BeanUtils.copyProperties(mainCategory, mainCategoryVO);

            // 获取当前大分类下的所有子分类
            List<SubCategoryVO> subCategoryVOs = subCategories.stream()
                .filter(sub -> sub.getMainId().equals(mainCategory.getMainId()))
                .map(subCategory -> {
                    SubCategoryVO subCategoryVO = new SubCategoryVO();
                    BeanUtils.copyProperties(subCategory, subCategoryVO);
                    return subCategoryVO;
                })
                .collect(Collectors.toList());

            mainCategoryVO.setSubCategories(subCategoryVOs);
            return mainCategoryVO;
        }).collect(Collectors.toList());
    }
}
