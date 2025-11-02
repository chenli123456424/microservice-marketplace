import React, { useRef, useState } from 'react';
import { Button, Card, Tabs, message } from 'antd';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import services from '@/services/demo';
import MainCategoryForm from './components/MainCategoryForm';
import SubCategoryForm from './components/SubCategoryForm';
import BrandForm from './components/BrandForm';
import FilterDimensionForm from './components/FilterDimensionForm';

// 主分类列表页面
const CategoryManagement: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [activeTab, setActiveTab] = useState('main');
    const [formVisible, setFormVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [formType, setFormType] = useState<'main' | 'sub' | 'brand' | 'filter'>('main');

    // 主分类列定义
    const mainCategoryColumns: ProColumns<API.MainCategory>[] = [
        {
            title: 'ID',
            dataIndex: 'mainId',
            tip: '主分类ID',
            width: 80,
            fixed: 'left',
        },
        {
            title: '分类名称',
            dataIndex: 'name',
            tip: '主分类名称',
            width: 150,
        },
        {
            title: '描述',
            dataIndex: 'description',
            tip: '分类描述',
            width: 200,
            ellipsis: true,
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            tip: '排序顺序',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            tip: '分类状态',
            width: 80,
            valueEnum: {
                1: { text: '启用', status: 'Success' },
                0: { text: '禁用', status: 'Error' },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            tip: '创建时间',
            width: 150,
            valueType: 'dateTime',
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: 150,
            fixed: 'right',
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    onClick={() => handleEdit('main', record)}
                >
                    编辑
                </Button>,
                <Button
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDelete('main', record.mainId!)}
                >
                    删除
                </Button>,
            ],
        },
    ];

    // 子分类列定义
    const subCategoryColumns: ProColumns<API.SubCategory>[] = [
        {
            title: 'ID',
            dataIndex: 'subId',
            tip: '子分类ID',
            width: 80,
            fixed: 'left',
        },
        {
            title: '主分类ID',
            dataIndex: 'mainId',
            tip: '所属主分类ID',
            width: 100,
        },
        {
            title: '分类名称',
            dataIndex: 'name',
            tip: '子分类名称',
            width: 150,
        },
        {
            title: '图片',
            dataIndex: 'imageUrl',
            tip: '子分类图片',
            width: 120,
            hideInSearch: true,
            render: (_, record) => {
                if (record.imageUrl) {
                    return (
                        <img
                            src={`http://localhost:8081${record.imageUrl}`}
                            alt={record.name}
                            style={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                // 可以添加图片预览功能
                                window.open(`http://localhost:8081${record.imageUrl}`, '_blank');
                            }}
                        />
                    );
                }
                return <span style={{ color: '#999' }}>暂无图片</span>;
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            tip: '分类描述',
            width: 200,
            ellipsis: true,
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            tip: '排序顺序',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            tip: '分类状态',
            width: 80,
            valueEnum: {
                1: { text: '启用', status: 'Success' },
                0: { text: '禁用', status: 'Error' },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            tip: '创建时间',
            width: 150,
            valueType: 'dateTime',
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: 150,
            fixed: 'right',
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    onClick={() => handleEdit('sub', record)}
                >
                    编辑
                </Button>,
                <Button
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDelete('sub', record.subId!)}
                >
                    删除
                </Button>,
            ],
        },
    ];

    // 品牌列定义
    const brandColumns: ProColumns<API.Brand>[] = [
        {
            title: 'ID',
            dataIndex: 'brandId',
            tip: '品牌ID',
            width: 80,
            fixed: 'left',
        },
        {
            title: '品牌名称',
            dataIndex: 'name',
            tip: '品牌名称',
            width: 150,
        },
        {
            title: 'Logo',
            dataIndex: 'logo',
            tip: '品牌Logo',
            width: 100,
            render: (_, record) => (
                record.logo ? (
                    <img 
                        src={record.logo} 
                        alt={record.name}
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                    />
                ) : (
                    <span>无Logo</span>
                )
            ),
        },
        {
            title: '描述',
            dataIndex: 'description',
            tip: '品牌描述',
            width: 200,
            ellipsis: true,
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            tip: '排序顺序',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            tip: '品牌状态',
            width: 80,
            valueEnum: {
                1: { text: '启用', status: 'Success' },
                0: { text: '禁用', status: 'Error' },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            tip: '创建时间',
            width: 150,
            valueType: 'dateTime',
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: 150,
            fixed: 'right',
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    onClick={() => handleEdit('brand', record)}
                >
                    编辑
                </Button>,
                <Button
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDelete('brand', record.brandId!)}
                >
                    删除
                </Button>,
            ],
        },
    ];

    // 筛选维度列定义
    const filterDimensionColumns: ProColumns<API.FilterDimension>[] = [
        {
            title: 'ID',
            dataIndex: 'dimensionId',
            tip: '筛选维度ID',
            width: 80,
            fixed: 'left',
        },
        {
            title: '主分类ID',
            dataIndex: 'mainId',
            tip: '所属主分类ID',
            width: 100,
        },
        {
            title: '子分类ID',
            dataIndex: 'subId',
            tip: '所属子分类ID',
            width: 100,
        },
        {
            title: '父级ID',
            dataIndex: 'parentId',
            tip: '父级维度ID',
            width: 100,
        },
        {
            title: '维度名称',
            dataIndex: 'name',
            tip: '筛选维度名称',
            width: 150,
        },
        {
            title: '层级',
            dataIndex: 'level',
            tip: '维度层级',
            width: 80,
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            tip: '排序顺序',
            width: 80,
        },
        {
            title: '状态',
            dataIndex: 'status',
            tip: '维度状态',
            width: 80,
            valueEnum: {
                1: { text: '启用', status: 'Success' },
                0: { text: '禁用', status: 'Error' },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            tip: '创建时间',
            width: 150,
            valueType: 'dateTime',
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: 150,
            fixed: 'right',
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    onClick={() => handleEdit('filter', record)}
                >
                    编辑
                </Button>,
                <Button
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleDelete('filter', record.dimensionId!)}
                >
                    删除
                </Button>,
            ],
        },
    ];

    // 处理编辑
    const handleEdit = (type: 'main' | 'sub' | 'brand' | 'filter', record: any) => {
        console.log('CategoryManagement: 编辑记录，type:', type, 'record:', record);
        setFormType(type);
        setCurrentRecord(record);
        setFormVisible(true);
    };

    // 处理删除
    const handleDelete = async (type: 'main' | 'sub' | 'brand' | 'filter', id: number) => {
        try {
            let result;
            switch (type) {
                case 'main':
                    result = await services.CategoryController.deleteMainCategory(id);
                    break;
                case 'sub':
                    result = await services.CategoryController.deleteSubCategory(id);
                    break;
                case 'brand':
                    result = await services.CategoryController.deleteBrand(id);
                    break;
                case 'filter':
                    result = await services.CategoryController.deleteFilterDimension(id);
                    break;
            }
            
            if (result?.code === 200) {
                message.success('删除成功');
                actionRef.current?.reload();
            } else {
                message.error(result?.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            message.error('删除失败');
        }
    };

    // 处理新增
    const handleAdd = (type: 'main' | 'sub' | 'brand' | 'filter') => {
        setFormType(type);
        setCurrentRecord(null);
        setFormVisible(true);
    };

    // 处理表单提交成功
    const handleFormSuccess = () => {
        setFormVisible(false);
        setCurrentRecord(null);
        actionRef.current?.reload();
    };

    // 渲染表单组件
    const renderForm = () => {
        switch (formType) {
            case 'main':
                return (
                    <MainCategoryForm
                        visible={formVisible}
                        onCancel={() => setFormVisible(false)}
                        onSuccess={handleFormSuccess}
                        initialValues={currentRecord}
                    />
                );
            case 'sub':
                return (
                    <SubCategoryForm
                        visible={formVisible}
                        onCancel={() => setFormVisible(false)}
                        onSuccess={handleFormSuccess}
                        initialValues={currentRecord}
                    />
                );
            case 'brand':
                return (
                    <BrandForm
                        visible={formVisible}
                        onCancel={() => setFormVisible(false)}
                        onSuccess={handleFormSuccess}
                        initialValues={currentRecord}
                    />
                );
            case 'filter':
                return (
                    <FilterDimensionForm
                        visible={formVisible}
                        onCancel={() => setFormVisible(false)}
                        onSuccess={handleFormSuccess}
                        initialValues={currentRecord}
                    />
                );
            default:
                return null;
        }
    };

    const tabItems = [
        {
            key: 'main',
            label: '主分类管理',
            children: (
                <ProTable<API.MainCategory>
                    headerTitle="主分类列表"
                    actionRef={actionRef}
                    rowKey="mainId"
                    search={{
                        labelWidth: 120,
                    }}
                    toolBarRender={() => [
                        <Button
                            key="add"
                            type="primary"
                            onClick={() => handleAdd('main')}
                        >
                            新建主分类
                        </Button>,
                    ]}
                    request={async (params) => {
                        const response = await services.CategoryController.getMainCategoryList({
                            page: params.current,
                            size: params.pageSize,
                            name: params.name,
                        });
                        return {
                            data: response?.data?.records || [],
                            success: response?.code === 200,
                            total: response?.data?.total || 0,
                        };
                    }}
                    columns={mainCategoryColumns}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{ x: 1000 }}
                    tableStyle={{ minWidth: '1000px' }}
                />
            ),
        },
        {
            key: 'sub',
            label: '子分类管理',
            children: (
                <ProTable<API.SubCategory>
                    headerTitle="子分类列表"
                    actionRef={actionRef}
                    rowKey="subId"
                    search={{
                        labelWidth: 120,
                    }}
                    toolBarRender={() => [
                        <Button
                            key="add"
                            type="primary"
                            onClick={() => handleAdd('sub')}
                        >
                            新建子分类
                        </Button>,
                    ]}
                    request={async (params) => {
                        const response = await services.CategoryController.getSubCategoryList({
                            page: params.current,
                            size: params.pageSize,
                            name: params.name,
                            mainId: params.mainId,
                        });
                        return {
                            data: response?.data?.records || [],
                            success: response?.code === 200,
                            total: response?.data?.total || 0,
                        };
                    }}
                    columns={subCategoryColumns}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{ x: 1200 }}
                    tableStyle={{ minWidth: '1200px' }}
                />
            ),
        },
        {
            key: 'brand',
            label: '品牌管理',
            children: (
                <ProTable<API.Brand>
                    headerTitle="品牌列表"
                    actionRef={actionRef}
                    rowKey="brandId"
                    search={{
                        labelWidth: 120,
                    }}
                    toolBarRender={() => [
                        <Button
                            key="add"
                            type="primary"
                            onClick={() => handleAdd('brand')}
                        >
                            新建品牌
                        </Button>,
                    ]}
                    request={async (params) => {
                        const response = await services.CategoryController.getBrandList({
                            page: params.current,
                            size: params.pageSize,
                            name: params.name,
                        });
                        return {
                            data: response?.data?.records || [],
                            success: response?.code === 200,
                            total: response?.data?.total || 0,
                        };
                    }}
                    columns={brandColumns}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{ x: 1000 }}
                    tableStyle={{ minWidth: '1000px' }}
                />
            ),
        },
        {
            key: 'filter',
            label: '筛选维度管理',
            children: (
                <ProTable<API.FilterDimension>
                    headerTitle="筛选维度列表"
                    actionRef={actionRef}
                    rowKey="dimensionId"
                    search={{
                        labelWidth: 120,
                    }}
                    toolBarRender={() => [
                        <Button
                            key="add"
                            type="primary"
                            onClick={() => handleAdd('filter')}
                        >
                            新建筛选维度
                        </Button>,
                    ]}
                    request={async (params) => {
                        const response = await services.CategoryController.getFilterDimensionList({
                            page: params.current,
                            size: params.pageSize,
                            name: params.name,
                            mainId: params.mainId,
                            subId: params.subId,
                        });
                        return {
                            data: response?.data?.records || [],
                            success: response?.code === 200,
                            total: response?.data?.total || 0,
                        };
                    }}
                    columns={filterDimensionColumns}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{ x: 1400 }}
                    tableStyle={{ minWidth: '1400px' }}
                />
            ),
        },
    ];

    return (
        <PageContainer>
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>

            {/* 渲染表单组件 */}
            {renderForm()}
        </PageContainer>
    );
};

export default CategoryManagement;
