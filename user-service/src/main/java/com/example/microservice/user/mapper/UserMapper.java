package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 对于简单的CRUD，这里一行代码都不用写！
    // 如果有复杂的自定义SQL，可以在这里定义方法，并在XML文件中实现。
}
