package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.CartItem;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CartItemMapper extends BaseMapper<CartItem> {
    
    @Select("SELECT c.*, p.name as productName, " +
            "(SELECT pi.image_url FROM product_image pi WHERE pi.product_id = c.product_id ORDER BY pi.sort LIMIT 1) as thumbnailUrl, " +
            "CASE WHEN p.promotion_price > 0 THEN p.promotion_price ELSE p.price END as price, " +
            "CASE WHEN p.promotion_price > 0 THEN p.promotion_price * c.quantity ELSE p.price * c.quantity END as totalPrice " +
            "FROM cart_item c " +
            "LEFT JOIN product p ON c.product_id = p.product_id " +
            "WHERE c.user_id = #{userId}")
    List<CartItem> selectCartItemsWithProduct(Long userId);
    
    @Delete("DELETE FROM cart_item WHERE user_id = #{userId} AND product_id = #{productId} AND " +
            "COALESCE(spec, '') = COALESCE(#{spec}, '') AND COALESCE(color, '') = COALESCE(#{color}, '')")
    int deleteByUserIdAndProductIdAndSpecAndColor(Long userId, Long productId, String spec, String color);
}
