package com.example.microservice.user.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}
