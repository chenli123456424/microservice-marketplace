package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Appointment;
import org.apache.ibatis.annotations.Mapper;

/**
 * 预约信息Mapper接口
 */
@Mapper
public interface AppointmentMapper extends BaseMapper<Appointment> {
}
