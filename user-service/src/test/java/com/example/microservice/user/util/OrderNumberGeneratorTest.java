package com.example.microservice.user.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 订单号生成器测试类
 */
public class OrderNumberGeneratorTest {

    @Test
    public void testGenerateOrderNumber() {
        // 测试生成订单号
        String orderNumber = OrderNumberGenerator.generateOrderNumber();
        
        // 验证订单号不为空
        assertNotNull(orderNumber);
        
        // 验证订单号长度为20位
        assertEquals(20, orderNumber.length());
        
        // 验证订单号全为数字
        assertTrue(orderNumber.matches("\\d{20}"));
        
        System.out.println("生成的订单号: " + orderNumber);
    }

    @Test
    public void testIsValidOrderNumber() {
        // 测试有效订单号
        String validOrderNumber = "20241218143025123456";
        assertTrue(OrderNumberGenerator.isValidOrderNumber(validOrderNumber));
        
        // 测试无效订单号（长度不对）
        String invalidLength = "2024121814302512345";
        assertFalse(OrderNumberGenerator.isValidOrderNumber(invalidLength));
        
        // 测试无效订单号（包含非数字）
        String invalidChars = "2024121814302512345a";
        assertFalse(OrderNumberGenerator.isValidOrderNumber(invalidChars));
        
        // 测试空订单号
        assertFalse(OrderNumberGenerator.isValidOrderNumber(null));
        assertFalse(OrderNumberGenerator.isValidOrderNumber(""));
    }

    @Test
    public void testExtractTimeFromOrderNumber() {
        // 测试提取时间
        String orderNumber = "20241218143025123456";
        String extractedTime = OrderNumberGenerator.extractTimeFromOrderNumber(orderNumber);
        
        assertNotNull(extractedTime);
        assertEquals("2024-12-18 14:30:25", extractedTime);
        
        System.out.println("提取的时间: " + extractedTime);
    }

    @Test
    public void testMultipleOrderNumbers() {
        // 测试生成多个订单号，确保不重复
        String orderNumber1 = OrderNumberGenerator.generateOrderNumber();
        String orderNumber2 = OrderNumberGenerator.generateOrderNumber();
        
        assertNotEquals(orderNumber1, orderNumber2);
        
        System.out.println("订单号1: " + orderNumber1);
        System.out.println("订单号2: " + orderNumber2);
    }
}
