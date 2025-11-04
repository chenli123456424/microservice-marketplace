-- 全屋定制相关表

-- 1. 定制案例表
CREATE TABLE IF NOT EXISTS `custom_case` (
  `id` BIGINT AUTO_INCREMENT COMMENT '案例ID',
  `title` VARCHAR(200) NOT NULL COMMENT '案例标题',
  `style` VARCHAR(50) NOT NULL COMMENT '案例风格',
  `area` INT NOT NULL COMMENT '房屋面积（平方米）',
  `budget` DECIMAL(12,2) NOT NULL COMMENT '预算金额',
  `images` TEXT COMMENT '案例图片（多张图片用逗号分隔）',
  `description` TEXT COMMENT '案例描述',
  `highlights` JSON COMMENT '设计亮点（JSON数组）',
  `designer_id` BIGINT COMMENT '设计师ID',
  `designer_name` VARCHAR(50) COMMENT '设计师姓名',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定制案例表';

-- 2. 设计师表
CREATE TABLE IF NOT EXISTS `designer` (
  `id` BIGINT AUTO_INCREMENT COMMENT '设计师ID',
  `name` VARCHAR(50) NOT NULL COMMENT '设计师姓名',
  `title` VARCHAR(50) NOT NULL COMMENT '职称',
  `experience` VARCHAR(20) NOT NULL COMMENT '工作年限',
  `specialties` JSON COMMENT '擅长风格（JSON数组）',
  `avatar` VARCHAR(500) COMMENT '头像图片',
  `case_count` INT DEFAULT 0 COMMENT '已完成案例数',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分（1-5分）',
  `description` TEXT COMMENT '个人简介',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重（越大越靠前）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-离职，1-在职',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设计师表';

-- 3. 定制方案表
CREATE TABLE IF NOT EXISTS `custom_plan` (
  `id` BIGINT AUTO_INCREMENT COMMENT '方案ID',
  `name` VARCHAR(100) NOT NULL COMMENT '方案名称',
  `type` VARCHAR(20) NOT NULL COMMENT '方案类型：basic-基础版，advanced-进阶版，luxury-豪华版',
  `price_range` VARCHAR(50) NOT NULL COMMENT '价格区间（每平米）',
  `price_from` DECIMAL(10,2) NOT NULL COMMENT '起始价格',
  `price_to` DECIMAL(10,2) NOT NULL COMMENT '结束价格',
  `description` TEXT COMMENT '方案描述',
  `includes` JSON COMMENT '包含内容（JSON数组）',
  `highlight` VARCHAR(200) COMMENT '方案亮点',
  `icon` VARCHAR(50) COMMENT '方案图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重（越小越靠前）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定制方案表';

-- 4. 预约信息表
CREATE TABLE IF NOT EXISTS `appointment` (
  `id` BIGINT AUTO_INCREMENT COMMENT '预约ID',
  `user_id` BIGINT COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `area` INT COMMENT '房屋面积（平方米）',
  `style` VARCHAR(50) COMMENT '装修风格',
  `budget` VARCHAR(50) COMMENT '预算范围',
  `remark` TEXT COMMENT '备注信息',
  `designer_id` BIGINT COMMENT '指定设计师ID',
  `status` TINYINT DEFAULT 0 COMMENT '预约状态：0-待处理，1-已联系，2-已量尺，3-已完成，9-已取消',
  `handler_id` BIGINT COMMENT '处理人（管理员ID）',
  `handle_time` DATETIME COMMENT '处理时间',
  `handle_remark` TEXT COMMENT '处理备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_designer_id` (`designer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约信息表';

-- 插入初始数据
-- 设计师初始数据
INSERT INTO `designer` (`name`, `title`, `experience`, `specialties`, `avatar`, `case_count`, `rating`, `description`, `sort_order`, `status`) VALUES
('张设计师', '首席设计师', '10年', '["现代简约", "北欧风格", "空间规划"]', '/images/designer1.jpg', 128, 4.9, '擅长现代简约风格设计，注重空间利用率和实用性。', 100, 1),
('李设计师', '高级设计师', '8年', '["欧式古典", "法式风格", "豪华定制"]', '/images/designer2.jpg', 95, 4.8, '专注于欧式古典风格设计，擅长营造奢华高贵的家居氛围。', 90, 1),
('王设计师', '资深设计师', '12年', '["新中式", "日式风格", "别墅设计"]', '/images/designer3.jpg', 156, 4.9, '新中式风格设计专家，善于将传统文化与现代生活完美结合。', 95, 1),
('赵设计师', '高级设计师', '7年', '["工业风", "极简主义", "小户型"]', '/images/designer4.jpg', 87, 4.7, '小户型设计专家，擅长在有限空间内创造无限可能。', 85, 1);

-- 定制方案初始数据
INSERT INTO `custom_plan` (`name`, `type`, `price_range`, `price_from`, `price_to`, `description`, `includes`, `highlight`, `icon`, `sort_order`, `status`) VALUES
('基础定制套餐', 'basic', '800-1200元/㎡', 800.00, 1200.00, '适合预算有限的家庭，提供高性价比的定制方案', '["优质板材（E0级+实木颗粒板）", "品牌五金配件", "专业设计师服务", "专业安装团队", "3年质保"]', '经济实惠，品质保证', '💰', 1, 1),
('进阶定制套餐', 'advanced', '1200-1800元/㎡', 1200.00, 1800.00, '平衡品质与价格，适合大多数家庭', '["优质板材（E0级+多层实木板）", "国际品牌五金", "资深设计师服务", "资深安装团队", "5年质保"]', '性价比之选', '⭐', 2, 1),
('豪华定制套餐', 'luxury', '1800-3000元/㎡', 1800.00, 3000.00, '高端定制，追求极致品质', '["进口板材（实木多层板）", "进口高端五金", "首席设计师服务", "金牌安装团队", "5年质保 + 终身维护"]', '品质之选，奢华体验', '👑', 3, 1);

-- 定制案例初始数据
INSERT INTO `custom_case` (`title`, `style`, `area`, `budget`, `images`, `description`, `highlights`, `designer_id`, `designer_name`, `view_count`, `like_count`, `sort_order`, `status`) VALUES
('现代简约三居室', '现代简约', 120, 150000.00, '/images/case1-1.jpg,/images/case1-2.jpg', '简洁明快的现代风格，注重功能性与美观的完美结合', '["大量储物空间", "开放式厨房设计", "智能家居系统"]', 1, '张设计师', 523, 89, 100, 1),
('北欧风小户型', '北欧风格', 75, 90000.00, '/images/case2-1.jpg,/images/case2-2.jpg', '温馨自然的北欧风格，小空间大利用', '["多功能家具", "自然采光设计", "环保材料"]', 1, '张设计师', 412, 67, 95, 1),
('新中式别墅', '新中式', 280, 580000.00, '/images/case3-1.jpg,/images/case3-2.jpg', '传统与现代的完美融合，尽显东方韵味', '["古典元素运用", "庭院景观设计", "红木家具定制"]', 3, '王设计师', 896, 156, 98, 1),
('欧式豪华公寓', '欧式古典', 180, 420000.00, '/images/case4-1.jpg,/images/case4-2.jpg', '奢华大气的欧式风格，彰显贵族气质', '["水晶吊灯", "罗马柱设计", "大理石背景墙"]', 2, '李设计师', 678, 123, 90, 1);

