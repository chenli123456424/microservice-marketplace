sql.append("SELECT pl.unified_tag, pl.product_id, ");
sql.append("COALESCE(f.category, bm.category, kbg.category, ht.category, l.category, sf.category) as category, ");
sql.append("COALESCE(f.subcategory, bm.subcategory, kbg.subcategory, ht.subcategory, l.subcategory, sf.subcategory) as subcategory, ");
sql.append("COALESCE(f.name, bm.name, kbg.name, ht.name, l.name, sf.name) as name, ");
sql.append("COALESCE(f.price, bm.price, kbg.price, ht.price, l.price, sf.price) as price ");
// 添加来自 furniture 表的额外字段
sql.append(", f.space, f.style, f.material, f.brand, f.color, f.seats, f.fabric, f.product_function, f.size ");
// 添加来自 kitchen_bathroom_goods 表的额外字段
sql.append(", kbg.toilet_type, kbg.flush_method, kbg.pit_distance, kbg.drainage_method, kbg.water_efficiency_level, ");
sql.append("kbg.shower_room_type, kbg.glass_thickness, kbg.faucet_type, kbg.outflow_mode, kbg.bathroom_cabinet_material, kbg.bathroom_cabinet_size ");
// 添加来自 hardware_tools 表的额外字段
sql.append(", ht.opening_method, ht.security_level, ht.lock_type, ht.unlocking_method, ht.applicable_door_type, ");
sql.append("ht.hinge_type, ht.slide_track_type, ht.window_accessories_type ");
// 添加来自 lighting 表的额外字段
sql.append(", l.classification, l.light_source_type, l.power, l.color_temperature, l.control_method, l.lampshade_material ");
// 添加来自 soft_furnishings 表的额外字段
sql.append(", sf.pattern ");
    @Override
    public IPage<Product> searchProducts(Page<Product> page, String name, BigDecimal price, BigDecimal marketPrice, Integer stock, Integer status, Integer mainId, Integer subId, Integer brandId) {
        // 构建查询条件
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        
        // 添加名称模糊查询条件
        if (name != null && !name.isEmpty()) {
            queryWrapper.like("name", name);
        }
        
        // 添加价格精确查询条件
        if (price != null) {
            queryWrapper.eq("price", price);
        }
        
        // 添加市场价精确查询条件
        if (marketPrice != null) {
            queryWrapper.eq("market_price", marketPrice);
        }
        
        // 添加库存精确查询条件
        if (stock != null) {
            queryWrapper.eq("stock", stock);
        }
        
        // 添加状态精确查询条件
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        // 添加主分类精确查询条件
        if (mainId != null) {
            queryWrapper.eq("main_id", mainId);
        }
        
        // 添加子分类精确查询条件
        if (subId != null) {
            queryWrapper.eq("sub_id", subId);
        }
        
        // 添加品牌精确查询条件
        if (brandId != null) {
            queryWrapper.eq("brand_id", brandId);
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderByDesc("create_time");
        
        // 执行分页查询
        return productMapper.selectPage(page, queryWrapper);
    }