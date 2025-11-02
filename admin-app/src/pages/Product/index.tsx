import React, {useRef, useState} from 'react';
import {Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select} from 'antd';
import {ActionType, PageContainer, ProColumns, ProTable} from '@ant-design/pro-components';
import ProductForm from './components/ProductForm';
import services from '@/services/demo';
import { setProductImages } from '@/services/demo/ProductController';
import {deleteProduct, searchAdminProducts} from "@/services/demo/ProductController";

// 添加样式
const styles = {
    searchContainer: {
        padding: '16px',
        backgroundColor: '#f0f2f5',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #d9d9d9',
    },
    searchForm: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
    },
    searchItem: {
        flex: '1 1 200px',
        minWidth: '200px',
    },
    searchLabel: {
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
    },
    searchInput: {
        width: '100%',
    }
};

// 定义商品类型
interface ProductInfo {
    productId: number;
    name: string;
    price: number;
    marketPrice?: number;
    mainId: number;
    subId: number;
    brandId: number;
    stock: number;
    status: number;
    createTime?: string;
    thumbnailUrl?: string;
    detailDescription?: string;
    // 新增颜色和规格字段
    colors?: string[];
    specs?: string[];
}

// 添加分类和品牌映射类型
interface CategoryMap {
    [key: number]: string;
}

interface BrandMap {
    [key: number]: string;
}

// 商品列表页面
const ProductList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [mainCategoryMap, setMainCategoryMap] = useState<CategoryMap>({});
    const [subCategoryMap, setSubCategoryMap] = useState<CategoryMap>({});
    const [brandMap, setBrandMap] = useState<BrandMap>({});
    const [formVisible, setFormVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // 处理图片预览
    const handleImagePreview = (imageUrl: string) => {
        const fullImageUrl = imageUrl?.startsWith('data:') 
            ? imageUrl 
            : `http://localhost:8081${imageUrl}?t=${new Date().getTime()}`;
        setPreviewImage(fullImageUrl);
        setIsPreviewVisible(true);
    };

    // 获取分类和品牌数据
    const fetchCategoryAndBrandData = async () => {
        try {
            // 获取分类树
            const categoryResponse = await services.ProductController.getCategories();
            if (categoryResponse && categoryResponse.code === 200) {
                const categories = categoryResponse.data || [];
                const mainMap: CategoryMap = {};
                const subMap: CategoryMap = {};

                // 构建分类映射 - 分别处理主分类和子分类
                const buildCategoryMap = (items: any[]) => {
                    items.forEach(item => {
                        // 主分类映射 - 使用 mainId 字段
                        if (item.mainId) {
                            mainMap[item.mainId] = item.name;
                        }

                        // 子分类映射 - 使用 subId 字段
                        if (item.subCategories && item.subCategories.length > 0) {
                            item.subCategories.forEach((subItem: any) => {
                                if (subItem.subId) {
                                    subMap[subItem.subId] = subItem.name;
                                }
                            });
                        }

                        // 递归处理子分类
                        if (item.children && item.children.length > 0) {
                            buildCategoryMap(item.children);
                        }
                    });
                };

                buildCategoryMap(categories);
                setMainCategoryMap(mainMap);
                setSubCategoryMap(subMap);
            }

            // 获取品牌列表
            const brandResponse = await services.ProductController.getBrands();
            if (brandResponse && brandResponse.code === 200) {
                const brands = brandResponse.data || [];
                const map: BrandMap = {};
                brands.forEach((brand: any) => {
                    // 注意：品牌数据中的brandId字段对应商品数据中的brandId
                    if (brand.brandId) {
                        map[brand.brandId] = brand.name;
                    }
                });
                setBrandMap(map);
            }
        } catch (error) {
            console.error('获取分类和品牌数据失败:', error);
            message.error('获取分类和品牌数据失败');
        }
    };

    // 定义表格列
    // @ts-ignore
    const columns: ProColumns<ProductInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'productId',
            tip: '商品ID',
            hideInForm: true,
            hideInSearch: true,
            width: 80,
            fixed: 'left',
        },
        {
            title: '图片',
            dataIndex: 'thumbnailUrl',
            hideInSearch: true,
            width: 80,
            render: (_, record) => {
                if (!record.thumbnailUrl) {
                    return <span style={{color: '#999'}}>无</span>;
                }
                
                // 构建图片URL
                const imageUrl = record.thumbnailUrl?.startsWith('data:') 
                    ? record.thumbnailUrl 
                    : `http://localhost:8081${record.thumbnailUrl}?t=${new Date().getTime()}`;
                
                return (
                    <img 
                        key={`${record.productId}_${new Date().getTime()}`}
                        src={imageUrl} 
                        style={{
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover', 
                            borderRadius: 4,
                            cursor: 'pointer'
                        }} 
                        alt="商品图片"
                        onClick={() => handleImagePreview(record.thumbnailUrl || '')}
                        onError={(e) => {
                            // 显示错误占位图而不是隐藏
                            e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2050%2050%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2215%22%20y%3D%2225%22%3E无图%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                        }}
                    />
                );
            },
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            tip: '商品名称',
            width: 200,
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '商品名称为必填项',
                    },
                ],
            },
        },
        {
            title: '商品详情',
            dataIndex: 'detailDescription',
            hideInSearch: true,
            width: 150,
            render: (_, record) => (
                <span>{(record.detailDescription || '').slice(0, 30) || '—'}{(record.detailDescription || '').length > 30 ? '…' : ''}</span>
            ),
        },
        {
            title: '价格',
            dataIndex: 'price',
            valueType: 'money',
            width: 100,
        },
        {
            title: '市场价',
            dataIndex: 'marketPrice',
            valueType: 'money',
            width: 100,
        },
        {
            title: '主分类',
            dataIndex: 'mainId',
            render: (text, record) => (
                <span>{mainCategoryMap[text as number] || '未知'}</span>
            ),
            hideInSearch: false,
            width: 100,
        },
        {
            title: '子分类',
            dataIndex: 'subId',
            render: (text, record) => (
                <span>{subCategoryMap[text as number] || '未知'}</span>
            ),
            hideInSearch: false,
            width: 100,
        },
        {
            title: '品牌',
            dataIndex: 'brandId',
            render: (text, record) => (
                <span>{brandMap[text as number] || '未知'}</span>
            ),
            hideInSearch: false,
            width: 100,
        },
        {
            title: '颜色',
            dataIndex: 'colors',
            hideInSearch: true,
            width: 120,
            render: (_, record) => {
                if (!record.colors || record.colors.length === 0) {
                    return <span style={{color: '#999'}}>—</span>;
                }
                return (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                        {record.colors.map((color, index) => (
                            <span 
                                key={index}
                                style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#666'
                                }}
                            >
                                {color}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            title: '规格',
            dataIndex: 'specs',
            hideInSearch: true,
            width: 120,
            render: (_, record) => {
                if (!record.specs || record.specs.length === 0) {
                    return <span style={{color: '#999'}}>—</span>;
                }
                return (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                        {record.specs.map((spec, index) => (
                            <span 
                                key={index}
                                style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#e6f7ff',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#1890ff'
                                }}
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            title: '库存',
            dataIndex: 'stock',
            valueType: 'digit',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            width: 80,
            valueEnum: {
                0: {text: '下架', status: 'Default'},
                1: {text: '上架', status: 'Success'},
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            hideInSearch: true,
            width: 150,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <>
                    <a
                        onClick={() => {
                            setCurrentProduct(record);
                            setFormVisible(true);
                        }}
                    >
                        编辑
                    </a>
                    <Popconfirm
                        title="删除商品"
                        description="确定要删除这个商品吗？"
                        onConfirm={async () => {
                            try {
                                // 使用 String() 进行类型转换
                                const response = await services.ProductController.deleteProduct({
                                    productId: String(record.productId),
                                });

                                if (response && typeof response === 'object') {
                                    if (response.code === 200) {
                                        message.success('删除成功');
                                        actionRef.current?.reload();
                                    } else {
                                        const errorMessage = response.message || '删除失败';
                                        message.error(errorMessage);
                                    }
                                } else {
                                    message.error('删除失败：响应格式异常');
                                }
                            } catch (error) {
                                message.error('删除失败');
                            }
                        }}
                        okText="确定"
                        cancelText="取消"
                    >
                        <a style={{marginLeft: 10}}>删除</a>
                    </Popconfirm>
                </>
            ),
        },
    ];

    // 获取商品数据
    const fetchData = async (
        params: { pageSize?: number; current?: number; [key: string]: any },
        sort: Record<string, any>,
        filter: Record<string, any>
    ): Promise<{ data: ProductInfo[]; success: boolean; total: number }> => {
        try {
            // 构建搜索参数
            const searchParams = {
                page: params.current || 1,
                size: params.pageSize || 20,
                name: params.name || undefined,
                price: params.price !== undefined && params.price !== '' ? parseFloat(params.price) : undefined,
                marketPrice: params.marketPrice !== undefined && params.marketPrice !== '' ? parseFloat(params.marketPrice) : undefined,
                stock: params.stock !== undefined && params.stock !== '' ? parseInt(params.stock) : undefined,
                status: params.status !== undefined ? parseInt(params.status as string) : undefined,
                mainId: params.mainId !== undefined ? parseInt(params.mainId as string) : undefined,
                subId: params.subId !== undefined ? parseInt(params.subId as string) : undefined,
                brandId: params.brandId !== undefined ? parseInt(params.brandId as string) : undefined,
            };

            // 调用后端接口
            const response = await searchAdminProducts(searchParams);

            // 手动处理数据转换
            if (response && response.code === 200) {
                const products = await Promise.all(
                    (response.data?.records || []).map(async (product: any) => {
                        // 获取商品的颜色和规格数据
                        let colors: string[] = [];
                        let specs: string[] = [];
                        
                        try {
                            const optionsResponse = await services.ProductController.getProductOptions({
                                productId: product.productId
                            });
                            if (optionsResponse && optionsResponse.code === 200) {
                                const options = optionsResponse.data || {};
                                colors = options.colors || [];
                                specs = options.specs || [];
                            }
                        } catch (error) {
                            console.warn(`获取商品 ${product.productId} 的颜色和规格失败:`, error);
                        }

                        return {
                            productId: product.productId,
                            name: product.name,
                            price: product.price,
                            marketPrice: product.marketPrice, // 确保 marketPrice 字段被正确映射
                            mainId: product.mainId,
                            subId: product.subId,
                            brandId: product.brandId,
                            stock: product.stock,
                            status: product.status,
                            createTime: product.createTime,
                            // 后端已在列表结果填充 thumbnailUrl 与 images
                            thumbnailUrl: product.thumbnailUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : undefined),
                            images: product.images || [], // 确保传递所有图片信息
                            imageUrls: product.images ? product.images.map((img: any) => img.imageUrl) : [], // 添加imageUrls字段
                            detailDescription: product.detailDescription,
                            // 添加颜色和规格数据
                            colors: colors,
                            specs: specs,
                        };
                    })
                );

                return {
                    data: products,
                    success: true,
                    total: response.data?.total || 0,
                };
            } else {
                message.error(response?.message || '获取商品列表失败');
                return {
                    data: [],
                    success: false,
                    total: 0,
                };
            }
        } catch (error) {
            console.error('获取商品列表失败:', error);
            message.error('获取商品列表失败');
            return {
                data: [],
                success: false,
                total: 0,
            };
        }
    };

    // 页面加载时获取分类和品牌数据
    React.useEffect(() => {
        fetchCategoryAndBrandData();
    }, []);

    // 确保在分类和品牌数据加载完成后重新渲染搜索框
    React.useEffect(() => {
        if (Object.keys(mainCategoryMap).length > 0 &&
            Object.keys(subCategoryMap).length > 0 &&
            Object.keys(brandMap).length > 0) {
            // 触发重新渲染以确保搜索框正确显示
            console.log('分类和品牌数据已加载完成');
            // 延迟执行以确保DOM已更新
            setTimeout(() => {
                actionRef.current?.reload();
            }, 100);
        }
    }, [mainCategoryMap, subCategoryMap, brandMap]);

    /**
     * 处理商品表单提交
     * @param values 表单提交的数据
     *
     * 该函数用于处理商品的新增和编辑操作，根据 currentProduct 是否存在判断是新增还是编辑。
     * 提交后会根据后端返回结果显示成功或失败消息，并相应地更新UI状态。
     */
    const handleSubmit = async (values: any) => {
        try {
            let response;
            if (currentProduct) {
                // 编辑商品
                response = await services.ProductController.updateProduct(
                    {productId: currentProduct.productId.toString()},
                    values
                );
            } else {
                // 新增商品
                // 确保 create_time 字段被正确设置
                values.createTime = new Date().toISOString();
                response = await services.ProductController.addProduct(values);
            }

                    // 检查后端返回的结果(基于code字段判断)
                if (response && typeof response === 'object') {
                    // 根据code判断操作是否成功
                    if (response.code === 200) {
                        message.success(currentProduct ? '编辑成功' : '创建成功');
                        
                        // 如果是编辑操作，总是调用setProductImages API设置图片，无论是添加、更新还是删除
                        if (currentProduct) {
                            try {
                                // 确保有imageUrls字段，即使是空数组（删除所有图片的情况）
                                const imageUrlsToUpdate = values.imageUrls || [];
                                console.log('设置商品图片:', imageUrlsToUpdate);
                                console.log('图片数量:', imageUrlsToUpdate.length);
                                
                                // 调用setProductImages API设置商品图片
                                const imgResponse = await setProductImages(
                                    { productId: currentProduct.productId.toString() },
                                    { imageUrls: imageUrlsToUpdate }
                                );
                                
                                if (imgResponse && imgResponse.code === 200) {
                                    console.log('图片设置成功');
                                } else {
                                    console.error('图片设置失败:', imgResponse?.message);
                                }
                            } catch (error) {
                                console.error('设置商品图片失败:', error);
                                // 不阻止后续流程
                            }
                        }

                        // 确保面板关闭
                        setFormVisible(false);

                        // 清空当前商品
                        setCurrentProduct(null);

                        // 刷新表格数据
                        actionRef.current?.reload();
                    } else {
                    const errorMessage = response.message || (currentProduct ? '编辑失败' : '创建失败');
                    message.error(errorMessage);
                }
            } else {
                // 响应格式异常
                message.error('操作失败：响应格式异常');
            }
        } catch (error) {
            console.error('提交失败:', error);
            message.error(currentProduct ? '编辑失败' : '创建失败');
        }
    };

    const handleDelete = async (productId: number) => {
        try {
            // 明确类型转换
            const response = await deleteProduct({
                productId: String(productId),
            });

            if (response && typeof response === 'object') {
                if (response.success !== undefined && typeof response.success === 'boolean') {
                    if (response.success) {
                        message.success('删除成功');
                        actionRef.current?.reload();
                    } else {
                        const errorMessage = response.message || response.errorMessage || '删除失败';
                        message.error(errorMessage);
                    }
                } else {
                    message.error('操作失败：响应格式异常');
                }
            } else {
                message.error('操作失败：响应格式异常');
            }
        } catch (error) {
            console.error('删除失败:', error);
            message.error('删除失败');
        }
    };

    const [searchForm] = Form.useForm();

    // 处理搜索
    const handleSearch = (values: any) => {
        // 将搜索参数传递给 fetchData 函数
        actionRef.current?.reset();
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        actionRef.current?.reset();
    };

    // @ts-ignore
    return (
        <PageContainer
            header={{
                title: '商品管理',
            }}
        >
            {/* 自定义搜索表单 */}
            <div style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                marginBottom: '16px'
            }}>
                <Form
                    form={searchForm}
                    layout="inline"
                    onFinish={handleSearch}
                    style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}
                >
                    <Form.Item name="name" label="商品名称">
                        <Input
                            placeholder="请输入商品名称"
                            style={{width: '200px'}}
                        />
                    </Form.Item>
                    <Form.Item name="price" label="价格">
                        <InputNumber
                            placeholder="请输入价格"
                            style={{width: '200px'}}
                            precision={2}
                            addonAfter="元"
                        />
                    </Form.Item>
                    <Form.Item name="marketPrice" label="市场价">
                        <InputNumber
                            placeholder="请输入市场价"
                            style={{width: '200px'}}
                            precision={2}
                            addonAfter="元"
                        />
                    </Form.Item>
                    <Form.Item name="stock" label="库存">
                        <InputNumber
                            placeholder="请输入库存"
                            style={{width: '200px'}}
                            precision={0}
                        />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select
                            placeholder="请选择状态"
                            style={{width: '200px'}}
                            options={[
                                {label: '下架', value: 0},
                                {label: '上架', value: 1}
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="mainId" label="主分类">
                        <Select
                            placeholder="请选择主分类"
                            style={{width: '200px', marginLeft: '16px'}}
                            showSearch
                            optionFilterProp="children"
                            options={Object.keys(mainCategoryMap).map(key => ({
                                label: mainCategoryMap[Number(key)],
                                value: Number(key)
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="subId" label="子分类">
                        <Select
                            placeholder="请选择子分类"
                            style={{width: '200px'}}
                            showSearch
                            optionFilterProp="children"
                            options={Object.keys(subCategoryMap).map(key => ({
                                label: subCategoryMap[Number(key)],
                                value: Number(key)
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="brandId" label="品牌">
                        <Select
                            placeholder="请选择品牌"
                            style={{width: '200px'}}
                            showSearch
                            optionFilterProp="children"
                            options={Object.keys(brandMap).map(key => ({
                                label: brandMap[Number(key)],
                                value: Number(key)
                            }))}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            onClick={handleReset}
                            style={{marginRight: '8px'}}
                        >
                            重置
                        </Button>
                        <Button type="primary" htmlType="submit" style={{marginLeft: '8px'}}>
                            搜索
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <ProTable<ProductInfo>
                headerTitle="商品列表"
                actionRef={actionRef}
                rowKey="productId"
                search={false} // 关闭默认搜索框
                scroll={{ x: 1500 }} // 设置水平滚动，当表格宽度超过容器宽度时出现滚动条
                toolBarRender={() => [
                    <Button
                        key="1"
                        type="primary"
                        onClick={() => {
                            setCurrentProduct(null);
                            setFormVisible(true);
                        }}
                    >
                        新建商品
                    </Button>,
                ]}
                request={async (params, sort, filter) => {
                    // 获取搜索表单的值
                    const searchValues = searchForm.getFieldsValue();
                    // 将搜索值合并到 params 中
                    const mergedParams = {...params, ...searchValues};
                    return fetchData(mergedParams, sort, filter);
                }}
                columns={columns}
                pagination={{
                    defaultPageSize: 10,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
                // 添加表格样式，确保表头固定
                tableStyle={{
                    minWidth: '1500px' // 设置表格最小宽度
                }}
            />
            
            {/* 图片预览Modal */}
            <Modal
                title="商品图片预览"
                open={isPreviewVisible}
                onCancel={() => setIsPreviewVisible(false)}
                footer={null}
                width={800}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <img 
                        src={previewImage} 
                        alt="商品图片预览"
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '600px',
                            objectFit: 'contain'
                        }}
                        onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                        }}
                    />
                </div>
            </Modal>
            
            <ProductForm
                visible={formVisible}
                onCancel={() => {
                    setFormVisible(false);
                    setCurrentProduct(null);
                }}
                onSubmit={handleSubmit}
                initialValues={currentProduct}
            />
        </PageContainer>
    );
};

export default ProductList;
