import React, {useRef, useState} from 'react';
import {Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Tag} from 'antd';
import {ActionType, PageContainer, ProColumns, ProTable} from '@ant-design/pro-components';
import {getOrderList, updateOrderStatus, updatePayStatus, cancelOrder} from '@/services/demo/OrderController';

// 订单信息接口
interface OrderInfo {
    orderId: number;
    orderNo: string;
    userId: number;
    username?: string;
    totalAmount: number;
    discountAmount: number;
    payAmount: number;
    orderStatus: number;
    payStatus: number;
    payMethod?: string;
    payTime?: string;
    deliveryStatus: number;
    deliveryTime?: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    remark?: string;
    createTime: string;
    updateTime: string;
    orderItems?: OrderItem[];
}

// 订单商品信息接口
interface OrderItem {
    itemId: number;
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
    spec?: string;
    color?: string;
}

// 订单列表页面
const OrderList: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [formVisible, setFormVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<OrderInfo | null>(null);
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

    // 获取订单状态标签
    const getOrderStatusTag = (status: number) => {
        const statusMap = {
            1: { color: 'orange', text: '待付款' },
            2: { color: 'blue', text: '待发货' },
            3: { color: 'cyan', text: '待收货' },
            4: { color: 'purple', text: '待评价' },
            5: { color: 'red', text: '退款/售后' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    };

    // 获取支付状态标签
    const getPayStatusTag = (status: number) => {
        return status === 1 ? <Tag color="green">已支付</Tag> : <Tag color="red">未支付</Tag>;
    };

    // 更新订单状态
    const handleUpdateOrderStatus = async (orderId: number, status: number) => {
        try {
            const response = await updateOrderStatus({ orderId, status });
            if (response && response.code === 200) {
                message.success('订单状态更新成功');
                actionRef.current?.reload();
            } else {
                message.error(response?.message || '订单状态更新失败');
            }
        } catch (error) {
            message.error('订单状态更新失败');
        }
    };

    // 更新支付状态
    const handleUpdatePayStatus = async (orderId: number, payStatus: number, payMethod?: string) => {
        try {
            const response = await updatePayStatus({ orderId, payStatus, payMethod });
            if (response && response.code === 200) {
                message.success('支付状态更新成功');
                actionRef.current?.reload();
            } else {
                message.error(response?.message || '支付状态更新失败');
            }
        } catch (error) {
            message.error('支付状态更新失败');
        }
    };

    // 确认发货（将订单状态改为待收货）
    const handleConfirmShipment = async (orderId: number) => {
        try {
            const response = await updateOrderStatus({ orderId, status: 3 }); // 3 = 待收货
            if (response && response.code === 200) {
                message.success('发货成功，订单已进入待收货状态');
                actionRef.current?.reload();
            } else {
                message.error(response?.message || '发货失败');
            }
        } catch (error) {
            message.error('发货失败');
        }
    };

    // 取消订单
    const handleCancelOrder = async (orderId: number, reason?: string) => {
        try {
            const response = await cancelOrder({ orderId, reason });
            if (response && response.code === 200) {
                message.success('订单取消成功');
                actionRef.current?.reload();
            } else {
                message.error(response?.message || '订单取消失败');
            }
        } catch (error) {
            message.error('订单取消失败');
        }
    };

    // 定义表格列
    const columns: ProColumns<OrderInfo>[] = [
        {
            title: '订单ID',
            dataIndex: 'orderId',
            tip: '订单ID',
            hideInForm: true,
            hideInSearch: true,
            width: 80,
            fixed: 'left',
        },
        {
            title: '订单号',
            dataIndex: 'orderNo',
            tip: '订单号',
            width: 150,
            fixed: 'left',
        },
        {
            title: '用户',
            dataIndex: 'username',
            tip: '下单用户',
            width: 100,
        },
        {
            title: '订单金额',
            dataIndex: 'totalAmount',
            tip: '订单总金额',
            width: 100,
            hideInSearch: true,
            render: (_, record) => `¥${record.totalAmount}`,
        },
        {
            title: '实付金额',
            dataIndex: 'payAmount',
            tip: '实际支付金额',
            width: 100,
            hideInSearch: true,
            render: (_, record) => `¥${record.payAmount}`,
        },
        {
            title: '订单状态',
            dataIndex: 'orderStatus',
            tip: '订单状态',
            width: 100,
            valueType: 'select',
            valueEnum: {
                1: { text: '待付款', status: 'Warning' },
                2: { text: '待发货', status: 'Processing' },
                3: { text: '待收货', status: 'Processing' },
                4: { text: '待评价', status: 'Success' },
                5: { text: '退款/售后', status: 'Error' },
            },
            render: (_, record) => getOrderStatusTag(record.orderStatus),
        },
        {
            title: '支付状态',
            dataIndex: 'payStatus',
            tip: '支付状态',
            width: 100,
            valueType: 'select',
            valueEnum: {
                0: { text: '未支付', status: 'Error' },
                1: { text: '已支付', status: 'Success' },
            },
            render: (_, record) => getPayStatusTag(record.payStatus),
        },
        {
            title: '收货人',
            dataIndex: 'receiverName',
            tip: '收货人姓名',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '收货电话',
            dataIndex: 'receiverPhone',
            tip: '收货人电话',
            width: 120,
            hideInSearch: true,
        },
        {
            title: '收货地址',
            dataIndex: 'receiverAddress',
            tip: '收货地址',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '下单时间',
            dataIndex: 'createTime',
            tip: '订单创建时间',
            width: 150,
            hideInSearch: true,
            valueType: 'dateTime',
        },
        {
            title: '操作',
            valueType: 'option',
            width: 320,
            fixed: 'right',
            render: (_, record) => [
                <Button
                    key="view"
                    type="link"
                    size="small"
                    onClick={() => {
                        setCurrentOrder(record);
                        setFormVisible(true);
                    }}
                >
                    查看详情
                </Button>,
                <Button
                    key="status"
                    type="link"
                    size="small"
                    onClick={() => {
                        Modal.confirm({
                            title: '更新订单状态',
                            content: (
                                <Select
                                    defaultValue={record.orderStatus}
                                    style={{ width: '100%', marginTop: 10 }}
                                    onChange={(value) => {
                                        handleUpdateOrderStatus(record.orderId, value);
                                    }}
                                >
                                    <Select.Option value={1}>待付款</Select.Option>
                                    <Select.Option value={2}>待发货</Select.Option>
                                    <Select.Option value={3}>待收货</Select.Option>
                                    <Select.Option value={4}>待评价</Select.Option>
                                    <Select.Option value={5}>退款/售后</Select.Option>
                                </Select>
                            ),
                            onOk: () => {},
                        });
                    }}
                >
                    更新状态
                </Button>,
                record.orderStatus === 1 || record.orderStatus === 2 ? (
                    <Popconfirm
                        key="cancel"
                        title="取消订单"
                        description={`确定要取消订单 ${record.orderNo} 吗？库存将自动恢复。`}
                        onConfirm={() => handleCancelOrder(record.orderId, '管理员取消订单')}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                        >
                            取消订单
                        </Button>
                    </Popconfirm>
                ) : null,
                record.orderStatus === 2 ? (
                    <Popconfirm
                        key="shipment"
                        title="确认发货"
                        description={`确定要发货订单 ${record.orderNo} 吗？发货后订单将进入待收货状态。`}
                        onConfirm={() => handleConfirmShipment(record.orderId)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                        >
                            确认发货
                        </Button>
                    </Popconfirm>
                ) : null,
            ],
        },
    ];

    // 获取数据
    const fetchData = async (
        params: { pageSize?: number; current?: number; [key: string]: any },
        sort: Record<string, any>,
        filter: Record<string, any>
    ): Promise<{ data: OrderInfo[]; success: boolean; total: number }> => {
        try {
            console.log('前端：开始获取订单列表，参数:', params);
            const response = await getOrderList({
                current: params.current,
                pageSize: params.pageSize,
                orderNo: params.orderNo,
                username: params.username,
                orderStatus: params.orderStatus,
                payStatus: params.payStatus,
                deliveryStatus: params.deliveryStatus,
            });
            console.log('前端：API响应:', response);

            if (response && response.code === 200) {
                console.log('前端：获取订单成功，数据:', response.data);
                return {
                    data: response.data || [],
                    success: true,
                    total: response.data?.length || 0,
                };
            } else {
                console.log('前端：API返回失败，响应:', response);
                return {
                    data: [],
                    success: false,
                    total: 0,
                };
            }
        } catch (error) {
            console.error('前端：获取订单列表失败:', error);
            return {
                data: [],
                success: false,
                total: 0,
            };
        }
    };

    return (
        <PageContainer>
            <ProTable<OrderInfo>
                headerTitle="订单列表"
                actionRef={actionRef}
                rowKey="orderId"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => [
                    <Button
                        key="refresh"
                        type="primary"
                        onClick={() => {
                            actionRef.current?.reload();
                        }}
                    >
                        刷新
                    </Button>,
                ]}
                request={fetchData}
                columns={columns}
                scroll={{ x: 1500 }}
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

            {/* 订单详情Modal */}
            <Modal
                title="订单详情"
                open={formVisible}
                onCancel={() => {
                    setFormVisible(false);
                    setCurrentOrder(null);
                }}
                footer={null}
                width={1000}
                centered
            >
                {currentOrder && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <h3>订单基本信息</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div><strong>订单号：</strong>{currentOrder.orderNo}</div>
                                <div><strong>下单用户：</strong>{currentOrder.username}</div>
                                <div><strong>订单金额：</strong>¥{currentOrder.totalAmount}</div>
                                <div><strong>实付金额：</strong>¥{currentOrder.payAmount}</div>
                                <div><strong>订单状态：</strong>{getOrderStatusTag(currentOrder.orderStatus)}</div>
                                <div><strong>支付状态：</strong>{getPayStatusTag(currentOrder.payStatus)}</div>
                                <div><strong>支付方式：</strong>{currentOrder.payMethod || '未支付'}</div>
                                <div><strong>下单时间：</strong>{currentOrder.createTime}</div>
                                <div><strong>支付时间：</strong>{currentOrder.payTime || '未支付'}</div>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: 20 }}>
                            <h3>收货信息</h3>
                            <div>
                                <div><strong>收货人：</strong>{currentOrder.receiverName}</div>
                                <div><strong>联系电话：</strong>{currentOrder.receiverPhone}</div>
                                <div><strong>收货地址：</strong>{currentOrder.receiverAddress}</div>
                                {currentOrder.remark && <div><strong>备注：</strong>{currentOrder.remark}</div>}
                            </div>
                        </div>

                        {currentOrder.orderItems && currentOrder.orderItems.length > 0 && (
                            <div>
                                <h3>商品清单</h3>
                                <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
                                    {currentOrder.orderItems.map((item) => (
                                        <div key={item.itemId} style={{ 
                                            padding: 15, 
                                            borderBottom: '1px solid #f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 15
                                        }}>
                                            <div style={{ width: 60, height: 60, flexShrink: 0 }}>
                                                {item.productImage ? (
                                                    <img 
                                                        src={item.productImage.startsWith('data:') 
                                                            ? item.productImage 
                                                            : `http://localhost:8081${item.productImage}`}
                                                        alt={item.productName}
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'cover', 
                                                            borderRadius: 4,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleImagePreview(item.productImage || '')}
                                                    />
                                                ) : (
                                                    <div style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        backgroundColor: '#f0f0f0', 
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#999',
                                                        fontSize: 12
                                                    }}>
                                                        无图
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                                    {item.productName}
                                                </div>
                                                <div style={{ color: '#666', fontSize: 12, marginBottom: 5 }}>
                                                    {item.spec && <span>规格：{item.spec} </span>}
                                                    {item.color && <span>颜色：{item.color}</span>}
                                                </div>
                                                <div style={{ color: '#666', fontSize: 12 }}>
                                                    单价：¥{item.productPrice} × {item.quantity} = ¥{item.totalPrice}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </PageContainer>
    );
};

export default OrderList;
