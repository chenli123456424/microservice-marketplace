    /**
     * 管理端搜索商品列表（分页）
     *
     * @param page 页码
     * @param size 每页数量
     * @param name 商品名称（模糊查询）
     * @param price 价格
     * @param marketPrice 市场价
     * @param stock 库存
     * @param status 状态
     * @param mainId 主分类ID
     * @param subId 子分类ID
     * @param brandId 品牌ID
     * @return 商品列表
     */
    @GetMapping("/admin/products/search")
    @Operation(summary = "管理端搜索商品列表")
    public ResponseResult<IPage<Product>> searchAdminProducts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) BigDecimal marketPrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer mainId,
            @RequestParam(required = false) Integer subId,
            @RequestParam(required = false) Integer brandId) {
        try {
            Page<Product> productPage = new Page<>(page, size);
            IPage<Product> products = productService.searchProducts(productPage, name, price, marketPrice, stock, status, mainId, subId, brandId);
            return ResponseResult.success(products);
        } catch (Exception e) {
            return ResponseResult.error("搜索商品列表失败: " + e.getMessage());
        }
    }