package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CaseComment;

import java.util.List;

public interface CaseCommentService {
    
    /**
     * 分页查询案例评论
     */
    Page<CaseComment> page(Long caseId, int pageNum, int pageSize);
    
    /**
     * 查询案例的所有评论（树形结构）
     */
    List<CaseComment> listByCaseId(Long caseId);
    
    /**
     * 根据ID查询评论
     */
    CaseComment getById(Long id);
    
    /**
     * 保存评论
     */
    boolean save(CaseComment comment);
    
    /**
     * 更新评论
     */
    boolean update(CaseComment comment);
    
    /**
     * 删除评论
     */
    boolean deleteById(Long id);
    
    /**
     * 增加点赞数
     */
    boolean incrementLikeCount(Long id);
}

