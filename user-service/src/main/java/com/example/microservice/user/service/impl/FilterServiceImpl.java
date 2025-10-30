package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.FilterDimension;
import com.example.microservice.user.mapper.FilterDimensionMapper;
import com.example.microservice.user.service.FilterService;
import com.example.microservice.user.vo.FilterDimensionVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

// 修改后的 FilterServiceImpl.java
@Service
public class FilterServiceImpl implements FilterService {

    @Autowired
    private FilterDimensionMapper filterDimensionMapper;

    @Override
    public List<FilterDimensionVO> getFilterDimensions(Integer mainId, Integer subId) {
        System.out.println("获取筛选维度: mainId=" + mainId + ", subId=" + subId);

        // 通用查询策略：获取指定mainId和subId的所有筛选维度数据
        QueryWrapper<FilterDimension> wrapper = new QueryWrapper<>();
        wrapper.eq("main_id", mainId);
        
        if (subId != null) {
            wrapper.eq("sub_id", subId);
        }
        
        // 按level和sort_order排序，确保父节点在前，子节点在后
        wrapper.orderByAsc("level", "sort_order");
        
        List<FilterDimension> allDimensions = filterDimensionMapper.selectList(wrapper);
        System.out.println("查询到的筛选维度总数: " + allDimensions.size());
        
        // 打印所有原始数据用于调试
        for (FilterDimension dim : allDimensions) {
            System.out.println("原始数据: " + dim.getDimensionId() + " - " + dim.getName() + 
                             " (mainId=" + dim.getMainId() + ", subId=" + dim.getSubId() + 
                             ", parentId=" + dim.getParentId() + ", level=" + dim.getLevel() + 
                             ", sortOrder=" + dim.getSortOrder() + ")");
        }

        // 如果没有数据，返回空列表
        if (allDimensions.isEmpty()) {
            return Collections.emptyList();
        }

        // 将实体类转换为VO类，并初始化children列表
        List<FilterDimensionVO> dimensionVOs = allDimensions.stream().map(dimension -> {
            FilterDimensionVO vo = new FilterDimensionVO();
            BeanUtils.copyProperties(dimension, vo);
            vo.setChildren(new ArrayList<>()); // 初始化children列表
            return vo;
        }).collect(Collectors.toList());

        // 构建ID映射表
        Map<Integer, FilterDimensionVO> idMap = new HashMap<>();
        for (FilterDimensionVO dim : dimensionVOs) {
            idMap.put(dim.getDimensionId(), dim);
        }

        // 创建结果列表 - 只包含根节点（level=1或parentId=0）
        List<FilterDimensionVO> result = new ArrayList<>();

        // 通用的树形结构构建逻辑
        for (FilterDimensionVO dim : dimensionVOs) {
            System.out.println("处理维度: " + dim.getName() + ", level=" + dim.getLevel() + 
                             ", parentId=" + dim.getParentId() + ", dimensionId=" + dim.getDimensionId());
            
            // 判断是否为根节点：level=1 或 parentId=0 或 parentId=null
            if (dim.getLevel() == 1 || dim.getParentId() == null || dim.getParentId() == 0) {
                result.add(dim);
                System.out.println("添加根节点: " + dim.getName());
            } else {
                // 非根节点，查找其父节点
                FilterDimensionVO parent = idMap.get(dim.getParentId());
                if (parent != null) {
                    parent.getChildren().add(dim);
                    System.out.println("添加子节点: " + dim.getName() + " 到父节点: " + parent.getName());
                } else {
                    // 找不到父节点，作为根节点处理（容错）
                    result.add(dim);
                    System.out.println("找不到父节点parentId=" + dim.getParentId() + "，将 " + dim.getName() + " 作为根节点处理");
                }
            }
        }

        // 对结果进行排序
        result.sort(Comparator.comparingInt(vo -> vo.getSortOrder() != null ? vo.getSortOrder() : 0));

        // 对每个节点的children进行排序
        for (FilterDimensionVO node : result) {
            if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                node.getChildren().sort(Comparator.comparingInt(vo -> vo.getSortOrder() != null ? vo.getSortOrder() : 0));
                System.out.println("维度 " + node.getName() + " 的子项数量: " + node.getChildren().size());
            }
        }

        System.out.println("最终返回的筛选维度数量: " + result.size());
        for (FilterDimensionVO vo : result) {
            System.out.println("- " + vo.getName() + " (子项: " + 
                             (vo.getChildren() != null ? vo.getChildren().size() : 0) + ")");
        }
        
        return result;
    }


    @Override
    public boolean saveBatch(Collection<FilterDimension> entityList, int batchSize) {
        return false;
    }

    @Override
    public boolean saveOrUpdateBatch(Collection<FilterDimension> entityList, int batchSize) {
        return false;
    }

    @Override
    public boolean updateBatchById(Collection<FilterDimension> entityList, int batchSize) {
        return false;
    }

    @Override
    public boolean saveOrUpdate(FilterDimension entity) {
        return false;
    }

    @Override
    public FilterDimension getOne(Wrapper<FilterDimension> queryWrapper, boolean throwEx) {
        return null;
    }

    @Override
    public Optional<FilterDimension> getOneOpt(Wrapper<FilterDimension> queryWrapper, boolean throwEx) {
        return Optional.empty();
    }

    @Override
    public Map<String, Object> getMap(Wrapper<FilterDimension> queryWrapper) {
        return Map.of();
    }

    @Override
    public <V> V getObj(Wrapper<FilterDimension> queryWrapper, Function<? super Object, V> mapper) {
        return null;
    }

    @Override
    public BaseMapper<FilterDimension> getBaseMapper() {
        return null;
    }

    @Override
    public Class<FilterDimension> getEntityClass() {
        return null;
    }
}

