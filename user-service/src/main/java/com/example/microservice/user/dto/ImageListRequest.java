package com.example.microservice.user.dto;

import lombok.Data;
import java.util.List;

@Data
public class ImageListRequest {
    private List<String> imageUrls;
}


