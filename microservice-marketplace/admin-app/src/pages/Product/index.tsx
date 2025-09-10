import {Button, message, Popconfirm, Select} from 'antd';
import React, {useRef, useState} from 'react';
import services from '@/services/demo';
import {ActionType, PageContainer, ProColumns, ProTable,} from '@ant-design/pro-components';
import ProductForm from './components/ProductForm';

const {Option} = Select;

interface ProductFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    initialValues?: any;
}

const {getAdminProductList, addProduct, updateProduct, deleteProduct} = services.ProductController;

// 定义商品类型
interface ProductInfo {
    productId: number;
    name: string;
    price: number;
    mainId: number;
    subId: number;
    brandId: number;
    stock: number;
    status: number;
    createTime?: string;
}

// 添加分类和品牌映射类型
interface CategoryMap {
    [key: number]: string;
}

interface BrandMap {
    [key: number]: string;
}

const ProductList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [formVisible, setFormVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(null);
    const [categoryMap, setCategoryMap] = useState<CategoryMap>({});
    const [brandMap, setBrandMap] = useState<BrandMap>({});

    // 定义表格列
    // @ts-ignore
    const columns: ProColumns<ProductInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'productId',
            tip: '商品ID',
            hideInForm: true,
            hideInSearch: true,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            tip: '商品名称',
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
            title: '价格',
            dataIndex: 'price',
            valueType: 'money',
        },
        {
            title: '市场价',
            dataIndex: 'marketPrice',
            valueType: 'money',
        },
        {
            title: '主分类',
            dataIndex: 'mainId',
            render: (text, record) => (
                <span>{mainCategoryMap[text as number] || '未知'}</span>
            ),
            hideInSearch: true,
        },
        {
            title: '子分类',
            dataIndex: 'subId',
            render: (text,record) => (
                <span>{subCategoryMap[text as number] || '未知'}</span>
            ),
            hideInSearch: true,
        },
        {
            title: '品牌',
            dataIndex: 'brandId',
            render: (text, record) => (
                <span>{brandMap[text as number] || '未知'}</span>
            ),
            hideInSearch: true,
        },
        {
            title: '库存',
            dataIndex: 'stock',
            valueType: 'digit',
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
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
        },
        {
            title: '操作',
            valueType: 'option',
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
                                // 调用删除商品接口
                                const response = await services.ProductController.deleteProduct({
                                    productId: record.productId.toString(),
                                });

                                // 检查后端返回的结果(基于code字段判断)
                                if (response && typeof response === 'object') {
                                    // 根据code判断操作是否成功
                                    if (response.code === 200) {
                                        message.success('删除成功');
                                        actionRef.current?.reload();
                                    } else {
                                        const errorMessage = response.message || '删除失败';
                                        message.error(errorMessage);
                                    }
                                } else {
                                    // 响应格式异常
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
                mainId: params.mainId !== undefined && params.mainId !== '' ? parseInt(params.mainId) : undefined,
                subId: params.subId !== undefined && params.subId !== '' ? parseInt(params.subId) : undefined,
                brandId: params.brandId !== undefined && params.brandId !== '' ? parseInt(params.brandId) : undefined,
            };

            // 调用后端接口
            const response = await searchAdminProducts(searchParams);

            // 手动处理数据转换
            if (response && response.code === 200) {
                const products = response.data?.records?.map((product: any) => ({
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
                })) || [];

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

    // @ts-ignore
    return (
        <PageContainer
            header={{
                title: '商品管理',
            }}
        >
            <ProTable<ProductInfo>
                headerTitle="商品列表"
                actionRef={actionRef}
                rowKey="productId"
                search={{
                    labelWidth: 120,
                    // 添加搜索表单字段
                    filter: {
                        name: {
                            label: '商品名称',
                            initialValue: '',
                        },
                        price: {
                            label: '价格',
                            initialValue: '',
                        },
                        marketPrice: {
                            label: '市场价',
                            initialValue: '',
                        },
                        stock: {
                            label: '库存',
                            initialValue: '',
                        },
                        status: {
                            label: '状态',
                            initialValue: undefined,
                            valueEnum: {
                                0: { text: '下架', status: 'Default' },
                                1: { text: '上架', status: 'Success' },
                            },
                        },
                        mainId: {
                            label: '主分类',
                            initialValue: undefined,
                            valueEnum: Object.keys(mainCategoryMap).reduce((acc, key) => {
                                acc[key] = { text: mainCategoryMap[key], status: 'Default' };
                                return acc;
                            }, {}),
                        },
                        subId: {
                            label: '子分类',
                            initialValue: undefined,
                            valueEnum: Object.keys(subCategoryMap).reduce((acc, key) => {
                                acc[key] = { text: subCategoryMap[key], status: 'Default' };
                                return acc;
                            }, {}),
                        },
                        brandId: {
                            label: '品牌',
                            initialValue: undefined,
                            valueEnum: Object.keys(brandMap).reduce((acc, key) => {
                                acc[key] = { text: brandMap[key], status: 'Default' };
                                return acc;
                            }, {}),
                        },
                    },
                }}
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
                    return fetchData(params, sort, filter);
                }}
                columns={columns}
            />
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
