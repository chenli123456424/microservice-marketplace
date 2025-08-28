package com.example.microservice.user.dto;

import lombok.Data;

@Data
public class VerifyCodeRequest {
    private String email;
    private String code;
}
