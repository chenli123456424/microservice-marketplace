package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    /**
     * 根据条件分页查询用户
     *
     * @param page         分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    IPage<User> page(Page<User> page, @Param("ew") QueryWrapper<User> queryWrapper);

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    @Select("SELECT * FROM t_user WHERE username = #{username}")
    User selectByUsername(@Param("username") String username);

}
