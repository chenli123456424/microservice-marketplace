import services from '@/services/demo';
import {
    ActionType,
    FooterToolbar,
    PageContainer,
    ProColumns,
    ProDescriptions,
    ProDescriptionsItemProps,
    ProTable,
} from '@ant-design/pro-components';
// @ts-ignore
import {Button, Divider, Drawer, message, Popconfirm} from 'antd';
import React, {useRef, useState} from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm, {FormValueType} from './components/UpdateForm';
import {searchUsersWithPage} from "@/services/demo/UserController";

const {addUser, deleteUser, modifyUser, getAllUsers} =
    services.UserController;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UserInfo) => {
    const hide = message.loading('正在添加');
    try {
        const response = await addUser({...fields});
        hide();

        // 检查后端返回的结果
        if (response && response.success) {
            message.success('添加成功');
            return true;
        } else {
            message.error(response?.message || '添加失败请重试！');
            return false;
        }
    } catch (error) {
        hide();
        message.error('添加失败请重试！');
        return false;
    }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
    const hide = message.loading('正在更新');
    try {
        const response = await modifyUser(
            {
                userId: fields.id ? fields.id.toString() : '',
            },
            {
                username: fields.username || '',
                email: fields.email || '',
                role: fields.role || '', // 添加角色字段
            },
        );
        hide();

        // 检查后端返回的结果
        if (response && response.success) {
            message.success('修改成功');
            return true;
        } else {
            message.error(response?.message || '修改失败请重试！');
            return false;
        }
    } catch (error) {
        hide();
        message.error('修改失败请重试！');
        return false;
    }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UserInfo[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
        const response = await deleteUser({
            userId: selectedRows.find((row) => row.id)?.id?.toString() || '',
        });
        hide();

        // 检查后端返回的结果
        if (response && response.success) {
            message.success('删除成功，即将刷新');
            return true;
        } else {
            message.error(response?.message || '删除失败，请重试');
            return false;
        }
    } catch (error) {
        hide();
        message.error('删除失败，请重试');
        return false;
    }
};

/**
 * 用户管理页面
 */
const TableList: React.FC<unknown> = () => {
    const [createModalVisible, handleModalVisible] = useState<boolean>(false);
    const [updateModalVisible, handleUpdateModalVisible] =
        useState<boolean>(false);
    const [stepFormValues, setStepFormValues] = useState<API.UserInfo>({});
    const actionRef = useRef<ActionType>();
    const [row, setRow] = useState<API.UserInfo>();
    const [selectedRowsState, setSelectedRows] = useState<API.UserInfo[]>([]);

    // 为ProTable定义列类型
    const tableColumns: ProColumns<API.UserInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            tip: '用户ID',
            hideInForm: true,
            hideInSearch: true,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            valueType: 'text',
            tip: '用户名是唯一的 key',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '用户名为必填项',
                    },
                ],
            },
            fieldProps: {
                placeholder: '请输入用户名',
            },
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            valueType: 'text',
            fieldProps: {
                placeholder: '请输入邮箱',
            },
        },
        {
            title: '角色',
            dataIndex: 'role',
            valueType: 'select',
            valueEnum: {
                USER: { text: '普通用户', status: 'Default' },
                MERCHANT: { text: '商家', status: 'Success' },
                SUPER_ADMIN: { text: '超级管理员', status: 'Error' },
            },
            fieldProps: {
                placeholder: '请选择角色',
            },
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => (
                <>
                    <a
                        onClick={() => {
                            handleUpdateModalVisible(true);
                            setStepFormValues(record);
                        }}
                    >
                        编辑
                    </a>
                    <Divider type="vertical"/>
                    <Popconfirm
                        title="删除用户"
                        description="确定要删除这个用户吗？"
                        onConfirm={async () => {
                            const success = await handleRemove([record]);
                            if (success) {
                                actionRef.current?.reloadAndRest?.();
                            }
                        }}
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                    >
                        <a style={{marginLeft: 10}}>删除</a>
                    </Popconfirm>
                </>
            ),
        },
    ];

    // 为ProDescriptions定义列类型
    const descriptionColumns: ProDescriptionsItemProps<API.UserInfo>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            tip: '用户ID',
        },
        {
            title: '用户名',
            dataIndex: 'username',
            tip: '用户名是唯一的 key',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            valueType: 'text',
        },
        {
            title: '角色',
            dataIndex: 'role',
            valueType: 'select',
            valueEnum: {
                USER: { text: '普通用户', status: 'Default' },
                MERCHANT: { text: '商家', status: 'Success' },
                SUPER_ADMIN: { text: '超级管理员', status: 'Error' },
            },
        },
    ];

    return (
        <PageContainer
            header={{
                title: '用户管理',
            }}
        >
            <ProTable<API.UserInfo>
                headerTitle="用户列表"
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                    defaultCollapsed: false,
                }}
                toolBarRender={() => [
                    <Button
                        key="1"
                        type="primary"
                        onClick={() => handleModalVisible(true)}
                    >
                        新建用户
                    </Button>,
                ]}
                request={
                    async (params, sorter, filter) => {
                        console.log('=== Request Start ===');
                        console.log('Params:', params);
                        console.log('Sorter:', sorter);
                        console.log('Filter:', filter);

                        try {
                            // 构建查询参数
                            let keyword = '';
                            if (params.username) {
                                keyword = params.username;
                            } else if (params.email) {
                                keyword = params.email;
                            }

                            const queryParam = {
                                current: params.current || 1,
                                pageSize: params.pageSize || 10,
                                keyword: keyword || undefined,
                                role: params.role || undefined
                            };

                            // 调用新的分页+搜索接口
                            const response = await searchUsersWithPage(queryParam);

                            console.log('Response:', response);

                            if (response && typeof response === 'object' && 'data' in response) {
                                const data = response.data?.records || [];
                                const total = response.data?.total || 0;

                                return {
                                    data,
                                    success: response.success !== undefined ? response.success : true,
                                    total,
                                };
                            } else {
                                return {
                                    data: [],
                                    success: false,
                                    total: 0,
                                };
                            }
                        } catch (error) {
                            console.error('Request failed:', error);
                            return {
                                data: [],
                                success: false,
                                total: 0,
                            };
                        }
                    }
                }
                columns={tableColumns}
                rowSelection={{
                    onChange: (_, selectedRows) => setSelectedRows(selectedRows),
                }}
            />
            {selectedRowsState?.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            已选择{' '}
                            <a style={{fontWeight: 600}}>{selectedRowsState.length}</a>{' '}
                            项&nbsp;&nbsp;
                        </div>
                    }
                >
                    <Popconfirm
                        title="批量删除用户"
                        description={`确定要删除这 ${selectedRowsState.length} 个用户吗？`}
                        onConfirm={async () => {
                            const success = await handleRemove(selectedRowsState);
                            if (success) {
                                setSelectedRows([]);
                                actionRef.current?.reloadAndRest?.();
                            }
                        }}
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                    >
                        <Button
                            onClick={() => {}}
                            danger
                        >
                            批量删除
                        </Button>
                    </Popconfirm>
                </FooterToolbar>
            )}
            <CreateForm
                onCancel={() => handleModalVisible(false)}
                onSubmit={async (value) => {
                    const success = await handleAdd(value);
                    if (success) {
                        handleModalVisible(false);
                        if (actionRef.current) {
                            actionRef.current.reload();
                        }
                    }
                }}
                modalVisible={createModalVisible}
            />

            {stepFormValues && Object.keys(stepFormValues).length ? (
                <UpdateForm
                    onSubmit={async (value) => {
                        const success = await handleUpdate(value);
                        if (success) {
                            handleUpdateModalVisible(false);
                            setStepFormValues({});
                            if (actionRef.current) {
                                actionRef.current.reload();
                            }
                        }
                    }}
                    onCancel={() => {
                        handleUpdateModalVisible(false);
                        setStepFormValues({});
                    }}
                    updateModalVisible={updateModalVisible}
                    values={stepFormValues}
                />
            ) : null}

            <Drawer
                width={600}
                open={!!row}
                onClose={() => {
                    setRow(undefined);
                }}
                closable={false}
            >
                {row?.username && (
                    <ProDescriptions<API.UserInfo>
                        column={2}
                        title={row?.username}
                        request={async () => ({
                            data: row || {},
                        })}
                        params={{
                            id: row?.username,
                        }}
                        columns={descriptionColumns}
                    />
                )}
            </Drawer>
        </PageContainer>
    );
};

export default TableList;
