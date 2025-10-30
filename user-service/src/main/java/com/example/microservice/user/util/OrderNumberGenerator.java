package com.example.microservice.user.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * 订单号生成器
 * 符合国家规定的订单号格式：年月日时分秒 + 6位随机数
 * 格式：YYYYMMDDHHMMSS + 6位随机数 = 20位订单号
 */
public class OrderNumberGenerator {
    
    private static final Random random = new Random();
    
    /**
     * 生成订单号
     * 格式：YYYYMMDDHHMMSS + 6位随机数
     * 示例：20241218143025123456
     * 
     * @return 20位订单号
     */
    public static String generateOrderNumber() {
        // 获取当前时间，格式化为年月日时分秒
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timeStr = now.format(formatter);
        
        // 生成6位随机数
        int randomNum = random.nextInt(900000) + 100000; // 确保是6位数
        
        // 拼接成20位订单号
        return timeStr + randomNum;
    }
    
    /**
     * 验证订单号格式是否正确
     * 
     * @param orderNumber 订单号
     * @return 是否有效
     */
    public static boolean isValidOrderNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.length() != 20) {
            return false;
        }
        
        // 检查是否全为数字
        return orderNumber.matches("\\d{20}");
    }
    
    /**
     * 从订单号中提取时间信息
     * 
     * @param orderNumber 订单号
     * @return 时间字符串，格式：yyyy-MM-dd HH:mm:ss
     */
    public static String extractTimeFromOrderNumber(String orderNumber) {
        if (!isValidOrderNumber(orderNumber)) {
            return null;
        }
        
        try {
            String timeStr = orderNumber.substring(0, 14);
            DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime dateTime = LocalDateTime.parse(timeStr, inputFormatter);
            return dateTime.format(outputFormatter);
        } catch (Exception e) {
            return null;
        }
    }
}
