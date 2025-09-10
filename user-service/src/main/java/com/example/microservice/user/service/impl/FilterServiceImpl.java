package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.FilterDimension;
import com.example.microservice.user.mapper.FilterDimensionMapper;
import com.example.microservice.user.service.FilterService;
import com.example.microservice.user.vo.FilterDimensionVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FilterServiceImpl extends ServiceImpl<FilterDimensionMapper, FilterDimension> implements FilterService {

    @Autowired
    private FilterDimensionMapper filterDimensionMapper;

    @Override
    public List<FilterDimensionVO> getFilterDimensions(Integer mainId, Integer subId) {
        // 查询指定分类下的所有筛选维度
        QueryWrapper<FilterDimension> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("main_id", mainId);
        queryWrapper.eq("sub_id", subId);
        queryWrapper.orderByAsc("sort_order");

        List<FilterDimension> filterDimensions = filterDimensionMapper.selectList(queryWrapper);

        // 筛选出维度组（level=1）
        List<FilterDimensionVO> parentDimensions = filterDimensions.stream()
            .filter(dimension -> dimension.getLevel() == 1)
            .map(dimension -> {
                FilterDimensionVO vo = new FilterDimensionVO();
                BeanUtils.copyProperties(dimension, vo);
                return vo;
            })
            .collect(Collectors.toList());

        // 为每个维度组添加其子筛选项（level=2）
        parentDimensions.forEach(parent -> {
            List<FilterDimensionVO> children = filterDimensions.stream()
                .filter(dimension -> dimension.getParentId().equals(parent.getDimensionId()))
                .map(dimension -> {
                    FilterDimensionVO vo = new FilterDimensionVO();
                    BeanUtils.copyProperties(dimension, vo);
                    return vo;
                })
                .collect(Collectors.toList());
            parent.setChildren(children);
        });

        return parentDimensions;
    }
}
