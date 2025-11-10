package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CaseComment;
import com.example.microservice.user.mapper.CaseCommentMapper;
import com.example.microservice.user.service.CaseCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CaseCommentServiceImpl implements CaseCommentService {
    
    @Autowired
    private CaseCommentMapper caseCommentMapper;
    
    @Override
    public Page<CaseComment> page(Long caseId, int pageNum, int pageSize) {
        Page<CaseComment> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CaseComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CaseComment::getCaseId, caseId)
                .eq(CaseComment::getStatus, 1)
                .eq(CaseComment::getParentId, 0) // 只查询顶级评论
                .orderByDesc(CaseComment::getCreateTime);
        return caseCommentMapper.selectPage(page, wrapper);
    }
    
    @Override
    public List<CaseComment> listByCaseId(Long caseId) {
        LambdaQueryWrapper<CaseComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CaseComment::getCaseId, caseId)
                .eq(CaseComment::getStatus, 1)
                .orderByDesc(CaseComment::getCreateTime);
        return caseCommentMapper.selectList(wrapper);
    }
    
    @Override
    public CaseComment getById(Long id) {
        return caseCommentMapper.selectById(id);
    }
    
    @Override
    public boolean save(CaseComment comment) {
        comment.setCreateTime(LocalDateTime.now());
        comment.setUpdateTime(LocalDateTime.now());
        if (comment.getLikeCount() == null) {
            comment.setLikeCount(0);
        }
        if (comment.getStatus() == null) {
            comment.setStatus(1);
        }
        if (comment.getParentId() == null) {
            comment.setParentId(0L);
        }
        return caseCommentMapper.insert(comment) > 0;
    }
    
    @Override
    public boolean update(CaseComment comment) {
        comment.setUpdateTime(LocalDateTime.now());
        return caseCommentMapper.updateById(comment) > 0;
    }
    
    @Override
    public boolean deleteById(Long id) {
        // 软删除：更新状态为0
        CaseComment comment = caseCommentMapper.selectById(id);
        if (comment != null) {
            comment.setStatus(0);
            comment.setUpdateTime(LocalDateTime.now());
            return caseCommentMapper.updateById(comment) > 0;
        }
        return false;
    }
    
    @Override
    public boolean incrementLikeCount(Long id) {
        CaseComment comment = caseCommentMapper.selectById(id);
        if (comment != null) {
            comment.setLikeCount(comment.getLikeCount() + 1);
            comment.setUpdateTime(LocalDateTime.now());
            return caseCommentMapper.updateById(comment) > 0;
        }
        return false;
    }
}

