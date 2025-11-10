package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.CaseComment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CaseCommentMapper extends BaseMapper<CaseComment> {
}

