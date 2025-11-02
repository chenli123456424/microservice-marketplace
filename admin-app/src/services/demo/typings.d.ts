/*eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface PageInfo {
    /** 
1 */
    current?: number;
    pageSize?: number;
    total?: number;
    list?: Array<Record<string, any>>;
  }

  export interface PageInfo_UserInfo_ {
    records?: API.UserInfo[];
    total: number;
    current: number;
    pageSize: number;
  }

  export interface PageInfo_Product_ {
    records?: API.Product[];
    total: number;
    current: number;
    pageSize: number;
  }

  /**
   * 通用返回结果泛型接口
   * @template T 返回数据类型
   */
  interface Result<T = any> {
    /**
     * 请求是否成功
     * @example true
     */
    success?: boolean;
    
    /**
     * 错误信息（失败时存在）
     * @example "用户名或密码错误"
     */
    errorMessage?: string;
    
    /**
     * 返回消息
     * @example "请求成功"
     */
    message?: string;
    
    /**
     * 返回数据
     */
    data?: T;
    
    /**
     * 状态码
     * @example 200
     */
    code?: number;
  }

  /**
   * 分页信息泛型接口
   * @template T 分页数据类型
   */
  export interface PageInfo<T = any> {
    /**
     * 当前页码
     * @example 1
     */
    current?: number;
    
    /**
     * 每页数量
     * @example 10
     */
    pageSize?: number;
    
    /**
     * 总数量
     * @example 100
     */
    total?: number;
    
    /**
     * 数据列表
     */
    records?: T[];
    
    /**
     * 列表别名，保持兼容性
     */
    list?: T[];
  }

  interface UserInfo {
    id?: number;
    username?: string;
    password?: string; // 添加password属性
    email?: string;
    role?: string; // 确保包含角色字段
  }

  interface Product {
    productId?: number;
    mainId?: number;
    subId?: number;
    brandId?: number;
    name?: string;
    price?: number;
    marketPrice?: number;
    stock?: number;
    status?: number;
    createTime?: string;
    description?: string;
  }

  interface ProductDetailVO {
    productId?: number;
    mainId?: number;
    subId?: number;
    mainCategoryName?: string;
    subCategoryName?: string;
    brandId?: number;
    brandName?: string;
    name?: string;
    price?: number;
    marketPrice?: number;
    stock?: number;
    status?: number;
    createTime?: string;
    commonAttr?: ProductCommonAttr;
    extendAttrs?: ProductExtendAttr[];
    images?: ProductImage[];
  }

  interface ProductCommonAttr {
    attrId?: number;
    productId?: number;
    material?: string;
    spec?: string;
    priceUnit?: string;
    envGrade?: string;
    style?: string;
    warranty?: string;
    power?: string;
  }

  interface ProductExtendAttr {
    extendId?: number;
    productId?: number;
    mainId?: number;
    attrKey?: string;
    attrValue?: string;
  }

  interface ProductImage {
    imageId?: number;
    productId?: number;
    imageUrl?: string;
    sort?: number;
  }

  /**
   * 商品搜索参数
   */
  interface ProductFilterDTO {
    /**
     * 主分类ID
     * @example 1
     */
    mainId?: number;
    
    /**
     * 子分类ID
     * @example 2
     */
    subId?: number;
    
    /**
     * 属性过滤条件
     * @example {"color": "red", "size": "M"}
     */
    attrs?: Record<string, string>;
    
    /**
     * 商品名称关键字搜索
     * @example "手机"
     */
    keyword?: string;
    
    /**
     * 最低价格
     * @example 1000
     */
    minPrice?: number;
    
    /**
     * 最高价格
     * @example 5000
     */
    maxPrice?: number;
    
    /**
     * 排序字段
     * @example "price"
     */
    sortBy?: string;
    
    /**
     * 排序方式：asc/desc
     * @example "asc"
     */
    sortOrder?: string;
  }

  interface MainCategoryVO {
    mainId?: number;
    name?: string;
    subCategories?: SubCategoryVO[];
  }

  interface SubCategoryVO {
    subId?: number;
    mainId?: number;
    name?: string;
    sortOrder?: number;
  }

  interface Brand {
    brandId?: number;
    name?: string;
    logo?: string;
  }

  interface Order {
    orderId?: number;
    orderNo?: string;
    userId?: number;
    username?: string;
    totalAmount?: number;
    discountAmount?: number;
    payAmount?: number;
    orderStatus?: number;
    payStatus?: number;
    payMethod?: string;
    payTime?: string;
    deliveryStatus?: number;
    deliveryTime?: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverAddress?: string;
    remark?: string;
    createTime?: string;
    updateTime?: string;
    orderItems?: OrderItem[];
  }

  interface OrderItem {
    itemId?: number;
    orderId?: number;
    productId?: number;
    productName?: string;
    productImage?: string;
    productPrice?: number;
    quantity?: number;
    totalPrice?: number;
    spec?: string;
    color?: string;
    createTime?: string;
    updateTime?: string;
  }

  type definitions_0 = null;

  /**
   * 带分页信息的泛型结果类
   * @template T 数据类型
   */
  export class PagedResult<T> {
    /**
     * 状态码
     * @example 200
     */
    code: number;
    
    /**
     * 分页数据
     */
    data: T[];
    
    /**
     * 当前页码
     * @example 1
     */
    current: number;
    
    /**
     * 每页数量
     * @example 10
     */
    pageSize: number;
    
    /**
     * 总数量
     * @example 100
     */
    total: number;
  }

  /**
   * 通用结果类
   * @template T 数据类型
   */
  export class Result<T> {
    /**
     * 状态码
     * @example 200
     */
    code: number;
    
    /**
     * 返回消息
     * @example "请求成功"
     */
    message: string;
    
    /**
     * 返回数据
     */
    data: T;
    
    /**
     * 请求是否成功
     * @example true
     */
    success: boolean;
  }

    export interface Result_ProductDetailVO_ {
      code: number;
      message: string;
      data: ProductDetailVO;
      success: boolean;
    }

    export interface Result_string_ {
      errorMessage: string;
      code: number;
      message: string;
      data: string;
      success: boolean;
    }

    export interface Result_Product_ {
      code: number;
      message: string;
      data: Product;
      success: boolean;
    }

    export interface Result_List_Brand_ {
      code: number;
      message: string;
      data: Brand[];
      success: boolean;
    }

    export interface Result_List_MainCategoryVO_ {
      code: number;
      message: string;
      data: MainCategoryVO[];
      success: boolean;
    }

    export interface Result_PageInfo_Product__ {
      code: number;
      message: string;
      data: PageInfo<Product>;
      success: boolean;
    }

    export interface Result_List_Order__ {
      code: number;
      message: string;
      data: Order[];
      success: boolean;
    }

    export interface Result_Order_ {
      code: number;
      message: string;
      data: Order;
      success: boolean;
    }

    export interface Result_String_ {
      code: number;
      message: string;
      data: string;
      success: boolean;
    }

    // 分类管理相关类型
    export interface MainCategory {
      mainId?: number;
      name?: string;
      description?: string;
      sortOrder?: number;
      status?: number;
      createTime?: string;
      updateTime?: string;
    }

    export interface SubCategory {
      subId?: number;
      mainId?: number;
      name?: string;
      description?: string;
      sortOrder?: number;
      status?: number;
      imageUrl?: string;
      createTime?: string;
      updateTime?: string;
    }

    export interface FilterDimension {
      dimensionId?: number;
      mainId?: number;
      subId?: number;
      parentId?: number;
      name?: string;
      level?: number;
      sortOrder?: number;
      status?: number;
      createTime?: string;
      updateTime?: string;
    }

    export interface Page_MainCategory_ {
      records?: API.MainCategory[];
      total: number;
      current: number;
      size: number;
      pages: number;
    }

    export interface Page_SubCategory_ {
      records?: API.SubCategory[];
      total: number;
      current: number;
      size: number;
      pages: number;
    }

    export interface Page_Brand_ {
      records?: API.Brand[];
      total: number;
      current: number;
      size: number;
      pages: number;
    }

    export interface Page_FilterDimension_ {
      records?: API.FilterDimension[];
      total: number;
      current: number;
      size: number;
      pages: number;
    }

    export interface Result_Page_MainCategory__ {
      code: number;
      message: string;
      data: API.Page_MainCategory_;
      success: boolean;
    }

    export interface Result_Page_SubCategory__ {
      code: number;
      message: string;
      data: API.Page_SubCategory_;
      success: boolean;
    }

    export interface Result_Page_Brand__ {
      code: number;
      message: string;
      data: API.Page_Brand_;
      success: boolean;
    }

    export interface Result_Page_FilterDimension__ {
      code: number;
      message: string;
      data: API.Page_FilterDimension_;
      success: boolean;
    }

    export interface Result_List_MainCategory__ {
      code: number;
      message: string;
      data: API.MainCategory[];
      success: boolean;
    }

    export interface Result_List_SubCategory__ {
      code: number;
      message: string;
      data: API.SubCategory[];
      success: boolean;
    }

    export interface Result_List_Brand__ {
      code: number;
      message: string;
      data: API.Brand[];
      success: boolean;
    }

    // 公告相关类型
    export interface Announcement {
      id?: number;
      title?: string;
      content?: string;
      type?: string; // ACTIVITY-活动通知, SYSTEM-系统通知, MESSAGE-私信
      status?: number;
      priority?: number;
      startTime?: string;
      endTime?: string;
      createTime?: string;
      updateTime?: string;
    }

    export interface Result_Announcement_ {
      code: number;
      message: string;
      data: API.Announcement;
      success: boolean;
    }

    export interface Result_List_Announcement_ {
      code: number;
      message: string;
      data: API.Announcement[];
      success: boolean;
    }
}