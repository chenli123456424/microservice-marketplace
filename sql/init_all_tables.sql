-- ========================================
-- 微服务电商平台 - 数据库表结构初始化脚本
-- 包含所有业务表的建表语句
-- ========================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. 用户表
-- ========================================
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像URL',
  `role` VARCHAR(20) DEFAULT 'USER' COMMENT '角色：USER-普通用户，ADMIN-管理员',
  `follow_count` INT DEFAULT 0 COMMENT '关注量',
  `follower_count` INT DEFAULT 0 COMMENT '粉丝量',
  `like_received_count` INT DEFAULT 0 COMMENT '获赞量',
  `cancellation_status` TINYINT DEFAULT 0 COMMENT '注销状态：0-正常，1-已注销（等待期），2-已删除',
  `cancellation_time` DATETIME DEFAULT NULL COMMENT '注销时间',
  `cancellation_revoke_time` DATETIME DEFAULT NULL COMMENT '撤销注销时间',
  `create_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_create_at` (`create_at`),
  KEY `idx_cancellation_status` (`cancellation_status`),
  KEY `idx_cancellation_time` (`cancellation_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================================
-- 2. 主分类表
-- ========================================
DROP TABLE IF EXISTS `main_category`;
CREATE TABLE `main_category` (
  `main_id` INT NOT NULL AUTO_INCREMENT COMMENT '主分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`main_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主分类表';

-- ========================================
-- 3. 子分类表
-- ========================================
DROP TABLE IF EXISTS `sub_category`;
CREATE TABLE `sub_category` (
  `sub_id` INT NOT NULL AUTO_INCREMENT COMMENT '子分类ID',
  `main_id` INT NOT NULL COMMENT '主分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `image_url` VARCHAR(500) DEFAULT NULL COMMENT '分类图片URL',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`sub_id`),
  KEY `idx_main_id` (`main_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子分类表';

-- ========================================
-- 4. 品牌表
-- ========================================
DROP TABLE IF EXISTS `brand`;
CREATE TABLE `brand` (
  `brand_id` INT NOT NULL AUTO_INCREMENT COMMENT '品牌ID',
  `name` VARCHAR(50) NOT NULL COMMENT '品牌名称',
  `logo` VARCHAR(500) DEFAULT NULL COMMENT '品牌Logo URL',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '品牌描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`brand_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';

-- ========================================
-- 5. 商品表
-- ========================================
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `product_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `main_id` INT DEFAULT NULL COMMENT '主分类ID',
  `sub_id` INT DEFAULT NULL COMMENT '子分类ID',
  `brand_id` INT DEFAULT NULL COMMENT '品牌ID',
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '商品价格',
  `market_price` DECIMAL(10,2) DEFAULT NULL COMMENT '市场价格',
  `stock` INT DEFAULT 0 COMMENT '库存数量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `is_hot_recommended` TINYINT(1) DEFAULT 0 COMMENT '是否热门推荐',
  `is_new_arrival` TINYINT(1) DEFAULT 0 COMMENT '是否新品上市',
  `is_limited_offer` TINYINT(1) DEFAULT 0 COMMENT '是否限时特惠',
  `is_best_seller` TINYINT(1) DEFAULT 0 COMMENT '是否爆款热销',
  `is_promotion` TINYINT(1) DEFAULT 0 COMMENT '是否促销',
  `promotion_price` DECIMAL(10,2) DEFAULT NULL COMMENT '促销价格',
  `promotion_start_time` DATETIME DEFAULT NULL COMMENT '促销开始时间',
  `promotion_end_time` DATETIME DEFAULT NULL COMMENT '促销结束时间',
  `support_installment` TINYINT(1) DEFAULT 0 COMMENT '是否支持分期',
  `installment_months` INT DEFAULT NULL COMMENT '分期月数',
  `is_hot_search` TINYINT(1) DEFAULT 0 COMMENT '是否热门搜索',
  `search_keywords` VARCHAR(200) DEFAULT NULL COMMENT '搜索关键词',
  `stock_status` TINYINT(1) DEFAULT 1 COMMENT '库存状态：0-缺货，1-有货',
  `sales_count` INT DEFAULT 0 COMMENT '销量',
  `view_count` INT DEFAULT 0 COMMENT '浏览量',
  `detail_description` TEXT COMMENT '商品详情（富文本）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`product_id`),
  KEY `idx_main_id` (`main_id`),
  KEY `idx_sub_id` (`sub_id`),
  KEY `idx_brand_id` (`brand_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_hot_recommended` (`is_hot_recommended`),
  KEY `idx_is_new_arrival` (`is_new_arrival`),
  KEY `idx_is_limited_offer` (`is_limited_offer`),
  KEY `idx_is_best_seller` (`is_best_seller`),
  KEY `idx_sales_count` (`sales_count`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ========================================
-- 6. 商品图片表
-- ========================================
DROP TABLE IF EXISTS `product_image`;
CREATE TABLE `product_image` (
  `image_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort` INT DEFAULT 0 COMMENT '排序顺序',
  PRIMARY KEY (`image_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';

-- ========================================
-- 7. 商品通用属性表
-- ========================================
DROP TABLE IF EXISTS `product_common_attr`;
CREATE TABLE `product_common_attr` (
  `attr_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '属性ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `material` VARCHAR(100) DEFAULT NULL COMMENT '材质',
  `spec` VARCHAR(100) DEFAULT NULL COMMENT '规格',
  `price_info` VARCHAR(200) DEFAULT NULL COMMENT '价格信息',
  `env_grade` VARCHAR(50) DEFAULT NULL COMMENT '环保等级',
  `style` VARCHAR(50) DEFAULT NULL COMMENT '风格',
  `warranty` VARCHAR(100) DEFAULT NULL COMMENT '保修',
  `power` VARCHAR(50) DEFAULT NULL COMMENT '功率',
  PRIMARY KEY (`attr_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品通用属性表';

-- ========================================
-- 8. 商品扩展属性表
-- ========================================
DROP TABLE IF EXISTS `product_extend_attr`;
CREATE TABLE `product_extend_attr` (
  `extend_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '扩展属性ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `main_id` INT DEFAULT NULL COMMENT '主分类ID',
  `attr_key` VARCHAR(100) NOT NULL COMMENT '属性键',
  `attr_value` VARCHAR(500) DEFAULT NULL COMMENT '属性值',
  PRIMARY KEY (`extend_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_main_id` (`main_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品扩展属性表';

-- ========================================
-- 9. 筛选维度表
-- ========================================
DROP TABLE IF EXISTS `filter_dimension`;
CREATE TABLE `filter_dimension` (
  `dimension_id` INT NOT NULL AUTO_INCREMENT COMMENT '维度ID',
  `main_id` INT DEFAULT NULL COMMENT '主分类ID',
  `sub_id` INT DEFAULT NULL COMMENT '子分类ID',
  `parent_id` INT DEFAULT 0 COMMENT '父维度ID',
  `name` VARCHAR(100) NOT NULL COMMENT '维度名称',
  `level` INT DEFAULT 1 COMMENT '层级',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`dimension_id`),
  KEY `idx_main_id` (`main_id`),
  KEY `idx_sub_id` (`sub_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='筛选维度表';

-- ========================================
-- 10. 购物车表
-- ========================================
DROP TABLE IF EXISTS `cart_item`;
CREATE TABLE `cart_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '购物车项ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `spec` VARCHAR(50) DEFAULT NULL COMMENT '规格',
  `color` VARCHAR(50) DEFAULT NULL COMMENT '颜色',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ========================================
-- 11. 订单表
-- ========================================
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `order_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
  `order_status` TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态：1-待付款，2-待发货（已付款），3-待收货（已发货），4-待评价（已收货），5-已完成（已评价），6-退款/售后',
  `pay_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付',
  `pay_method` VARCHAR(20) DEFAULT NULL COMMENT '支付方式：alipay-支付宝，wechat-微信，bank-银行卡',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `delivery_status` TINYINT NOT NULL DEFAULT 0 COMMENT '发货状态：0-未发货，1-已发货',
  `delivery_time` DATETIME DEFAULT NULL COMMENT '发货时间',
  `receive_time` DATETIME DEFAULT NULL COMMENT '收货时间',
  `receiver_name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `receiver_phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
  `receiver_address` VARCHAR(200) NOT NULL COMMENT '收货地址',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '订单备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_pay_status` (`pay_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ========================================
-- 12. 订单商品详情表
-- ========================================
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `item_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单商品ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `product_image` VARCHAR(200) DEFAULT NULL COMMENT '商品图片',
  `product_price` DECIMAL(10,2) NOT NULL COMMENT '商品单价',
  `quantity` INT NOT NULL COMMENT '购买数量',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT '商品总价',
  `spec` VARCHAR(100) DEFAULT NULL COMMENT '商品规格',
  `color` VARCHAR(50) DEFAULT NULL COMMENT '商品颜色',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`item_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品详情表';

-- ========================================
-- 13. 订单评价表
-- ========================================
DROP TABLE IF EXISTS `order_review`;
CREATE TABLE `order_review` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `order_item_id` BIGINT DEFAULT NULL COMMENT '订单项ID（可选，如果是对整个订单评价则为NULL）',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `rating` TINYINT NOT NULL DEFAULT 5 COMMENT '评分（1-5分）',
  `content` TEXT COMMENT '评价内容',
  `images` TEXT COMMENT '晒单图片（多张图片用逗号分隔）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-待审核',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_item_id` (`order_item_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单评价表';

-- ========================================
-- 14. 全屋定制 - 定制案例表
-- ========================================
DROP TABLE IF EXISTS `custom_case`;
CREATE TABLE `custom_case` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '案例ID',
  `title` VARCHAR(200) NOT NULL COMMENT '案例标题',
  `style` VARCHAR(50) NOT NULL COMMENT '案例风格',
  `area` INT NOT NULL COMMENT '房屋面积（平方米）',
  `budget` DECIMAL(12,2) NOT NULL COMMENT '预算金额',
  `images` MEDIUMTEXT COMMENT '案例图片（多张图片用逗号分隔）',
  `description` TEXT COMMENT '案例描述',
  `highlights` JSON COMMENT '设计亮点（JSON数组）',
  `designer_id` BIGINT DEFAULT NULL COMMENT '设计师ID',
  `designer_name` VARCHAR(50) DEFAULT NULL COMMENT '设计师姓名',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `like_count` INT DEFAULT 0 COMMENT '点赞次数',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重（越大越靠前）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_designer_id` (`designer_id`),
  KEY `idx_style` (`style`),
  KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定制案例表';

-- ========================================
-- 15. 全屋定制 - 设计师表
-- ========================================
DROP TABLE IF EXISTS `designer`;
CREATE TABLE `designer` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '设计师ID',
  `name` VARCHAR(50) NOT NULL COMMENT '设计师姓名',
  `title` VARCHAR(50) NOT NULL COMMENT '职称',
  `experience` VARCHAR(20) NOT NULL COMMENT '工作年限',
  `specialties` JSON COMMENT '擅长风格（JSON数组）',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像图片URL',
  `case_count` INT DEFAULT 0 COMMENT '已完成案例数',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分（1-5分）',
  `description` TEXT COMMENT '个人简介',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重（越大越靠前）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-离职，1-在职',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设计师表';

-- ========================================
-- 16. 全屋定制 - 定制方案表
-- ========================================
DROP TABLE IF EXISTS `custom_plan`;
CREATE TABLE `custom_plan` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '方案ID',
  `name` VARCHAR(100) NOT NULL COMMENT '方案名称',
  `type` VARCHAR(20) NOT NULL COMMENT '方案类型：basic-基础版，advanced-进阶版，luxury-豪华版',
  `price_range` VARCHAR(50) NOT NULL COMMENT '价格区间（每平米）',
  `price_from` DECIMAL(10,2) NOT NULL COMMENT '起始价格',
  `price_to` DECIMAL(10,2) NOT NULL COMMENT '结束价格',
  `description` TEXT COMMENT '方案描述',
  `includes` JSON COMMENT '包含内容（JSON数组）',
  `highlight` VARCHAR(200) DEFAULT NULL COMMENT '方案亮点',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '方案图标（emoji）',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重（越小越靠前）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定制方案表';

-- ========================================
-- 17. 全屋定制 - 预约信息表
-- ========================================
DROP TABLE IF EXISTS `appointment`;
CREATE TABLE `appointment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '预约ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `area` INT DEFAULT NULL COMMENT '房屋面积（平方米）',
  `style` VARCHAR(50) DEFAULT NULL COMMENT '装修风格',
  `budget` VARCHAR(50) DEFAULT NULL COMMENT '预算范围',
  `remark` TEXT COMMENT '备注信息',
  `designer_id` BIGINT DEFAULT NULL COMMENT '指定设计师ID',
  `status` TINYINT DEFAULT 0 COMMENT '预约状态：0-待处理，1-已联系，2-已量尺，3-已完成，9-已取消',
  `handler_id` BIGINT DEFAULT NULL COMMENT '处理人（管理员ID）',
  `handle_time` DATETIME DEFAULT NULL COMMENT '处理时间',
  `handle_remark` TEXT COMMENT '处理备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_designer_id` (`designer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约信息表';

-- ========================================
-- 18. 案例评论表
-- ========================================
DROP TABLE IF EXISTS `case_comment`;
CREATE TABLE `case_comment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `case_id` BIGINT NOT NULL COMMENT '案例ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID（用于回复功能，0表示顶级评论）',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案例评论表';

-- ========================================
-- 19. 社区帖子表
-- ========================================
DROP TABLE IF EXISTS `community_post`;
CREATE TABLE `community_post` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID（发布者）',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容（支持富文本）',
  `images` TEXT DEFAULT NULL COMMENT '图片URLs（多个图片用逗号分隔）',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '视频URL（可选）',
  `type` VARCHAR(20) NOT NULL DEFAULT 'INSPIRATION' COMMENT '类型：INSPIRATION-灵感分享, QUESTION-问答, SHOWCASE-作品展示',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `liked_user_ids` TEXT DEFAULT NULL COMMENT '点赞用户ID列表（JSON数组格式，如：[1,2,3]）',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `view_count` INT DEFAULT 0 COMMENT '浏览数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-审核中',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区帖子表';

-- ========================================
-- 20. 社区评论表
-- ========================================
DROP TABLE IF EXISTS `community_comment`;
CREATE TABLE `community_comment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` BIGINT NOT NULL COMMENT '帖子ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID（用于回复功能，0表示顶级评论）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区评论表';

-- ========================================
-- 21. 公告表
-- ========================================
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content` MEDIUMTEXT NOT NULL COMMENT '公告内容（富文本HTML）',
  `type` VARCHAR(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '公告类型：ACTIVITY-活动通知, SYSTEM-系统通知, MESSAGE-私信',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-未发布，1-已发布',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级，数字越大越优先',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_priority_create_time` (`priority`, `create_time`),
  KEY `idx_status_start_time` (`status`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ========================================
-- 22. 门店表
-- ========================================
DROP TABLE IF EXISTS `store`;
CREATE TABLE `store` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '门店ID',
  `name` VARCHAR(100) NOT NULL COMMENT '门店名称',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `address` VARCHAR(200) NOT NULL COMMENT '门店地址',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `business_hours` VARCHAR(100) DEFAULT NULL COMMENT '营业时间',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '门店图片URL',
  `description` TEXT COMMENT '门店描述',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `status` INT DEFAULT 1 COMMENT '状态：0-关闭，1-营业',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_city` (`city`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店表';

-- ========================================
-- 恢复外键检查
-- ========================================
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 执行完成提示
-- ========================================
SELECT '数据库表结构初始化完成！' AS '提示信息';
SELECT '共创建22张业务表' AS '表信息';

