-- 门店表
CREATE TABLE IF NOT EXISTS `store` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '门店ID',
    `name` varchar(200) NOT NULL COMMENT '门店名称',
    `city` varchar(50) NOT NULL COMMENT '所在城市',
    `address` varchar(500) NOT NULL COMMENT '门店地址',
    `phone` varchar(20) NOT NULL COMMENT '联系电话',
    `business_hours` varchar(50) DEFAULT NULL COMMENT '营业时间',
    `image` varchar(500) DEFAULT NULL COMMENT '门店图片URL',
    `description` text COMMENT '门店描述',
    `latitude` decimal(10, 7) DEFAULT NULL COMMENT '纬度',
    `longitude` decimal(10, 7) DEFAULT NULL COMMENT '经度',
    `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：0-关闭，1-营业',
    `sort_order` int(11) DEFAULT '0' COMMENT '排序顺序',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_city` (`city`),
    KEY `idx_status` (`status`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店表';

-- 插入示例数据
INSERT INTO `store` (`name`, `city`, `address`, `phone`, `business_hours`, `image`, `description`, `latitude`, `longitude`, `status`, `sort_order`) VALUES
('筑家智选旗舰店（北京朝阳店）', '北京', '北京市朝阳区建国路88号SOHO现代城A座1层', '010-88888888', '09:00-21:00', '/images/store1.jpg', '旗舰店面积1000平方米，展示全系列产品，提供专业咨询服务', 39.9042, 116.4074, 1, 1),
('筑家智选体验店（上海浦东店）', '上海', '上海市浦东新区陆家嘴环路1000号恒生银行大厦1层', '021-66666666', '10:00-22:00', '/images/store2.jpg', '体验店提供VR全景看房服务，让您身临其境感受装修效果', 31.2304, 121.4737, 1, 2),
('筑家智选精品店（广州天河店）', '广州', '广州市天河区天河路208号粤海天河城1层', '020-77777777', '09:30-21:30', '/images/store3.jpg', '精品店主打高端定制服务，一对一专属设计师为您服务', 23.1291, 113.2644, 1, 3),
('筑家智选标准店（深圳南山店）', '深圳', '深圳市南山区深南大道9678号大冲商务中心A座1层', '0755-99999999', '09:00-20:00', '/images/store4.jpg', '标准店提供基础产品和安装服务，满足日常家装需求', 22.5431, 114.0579, 1, 4);
