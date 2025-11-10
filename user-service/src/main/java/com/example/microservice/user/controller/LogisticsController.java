package com.example.microservice.user.controller;

import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/logistics")
@Tag(name = "物流查询")
@CrossOrigin
public class LogisticsController {

    @GetMapping("/track")
    @Operation(summary = "根据订单号查询物流信息")
    public ResponseResult<Map<String, Object>> track(@RequestParam String orderNo) {
        // 物流功能暂未开发，返回提示信息
        Map<String, Object> data = new HashMap<>();
        data.put("message", "物流功能未开发");
        data.put("orderNo", orderNo);
        return ResponseResult.success(data);
    }
}


