package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.FilterDimension;
import com.example.microservice.user.vo.FilterDimensionVO;
import java.util.List;

public interface FilterService extends IService<FilterDimension> {
    List<FilterDimensionVO> getFilterDimensions(Integer mainId, Integer subId);
}
