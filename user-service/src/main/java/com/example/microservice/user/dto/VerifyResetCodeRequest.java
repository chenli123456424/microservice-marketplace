package com.example.microservice.user.dto;

import lombok.Data;

@Data
public class VerifyResetCodeRequest {
    private String email;
    private String code;
}
