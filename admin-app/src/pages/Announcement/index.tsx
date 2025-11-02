import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Switch, Tag, DatePicker, Space } from 'antd';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementStatus,
} from '@/services/demo/AnnouncementController';
import AnnouncementForm from './components/AnnouncementForm';
import dayjs from 'dayjs';

const AnnouncementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [formVisible, setFormVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<API.Announcement | null>(null);

  // 处理添加
  const handleAdd = async () => {
    setCurrentAnnouncement(null);
    setFormVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: API.Announcement) => {
    setCurrentAnnouncement(record);
    setFormVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteAnnouncement({ id });
      if (response && response.code === 200) {
        message.success('删除成功');
        actionRef.current?.reload();
        // 使用 localStorage 事件通知用户端刷新（可以跨标签页/窗口通信）
        if (typeof window !== 'undefined') {
          const eventKey = `announcementUpdated_${Date.now()}`;
          localStorage.setItem(eventKey, JSON.stringify({ dataType: 'announcements', timestamp: Date.now() }));
          localStorage.removeItem(eventKey); // 立即移除，只触发 storage 事件
          // 也触发当前窗口的事件（用于同一窗口内通信）
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { dataType: 'announcements' }
          }));
        }
      } else {
        message.error(response?.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理状态切换
  const handleStatusChange = async (id: number, status: number) => {
    try {
      const response = await updateAnnouncementStatus({ id, status });
      if (response && response.code === 200) {
        message.success(status === 1 ? '发布成功' : '取消发布成功');
        actionRef.current?.reload();
        // 使用 localStorage 事件通知用户端刷新（可以跨标签页/窗口通信）
        if (typeof window !== 'undefined') {
          const eventKey = `announcementUpdated_${Date.now()}`;
          localStorage.setItem(eventKey, JSON.stringify({ dataType: 'announcements', timestamp: Date.now() }));
          localStorage.removeItem(eventKey); // 立即移除，只触发 storage 事件
          // 也触发当前窗口的事件（用于同一窗口内通信）
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { dataType: 'announcements' }
          }));
        }
      } else {
        message.error(response?.message || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: API.Announcement) => {
    try {
      let response;
      if (currentAnnouncement?.id) {
        // 更新
        response = await updateAnnouncement(
          { id: currentAnnouncement.id },
          {
            ...values,
            startTime: values.startTime ? dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
            endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
          }
        );
      } else {
        // 创建
        response = await createAnnouncement({
          ...values,
          startTime: values.startTime ? dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
          endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        });
      }

      if (response && response.code === 200) {
        message.success(currentAnnouncement?.id ? '更新成功' : '创建成功');
        setFormVisible(false);
        actionRef.current?.reload();
        // 使用 localStorage 事件通知用户端刷新（可以跨标签页/窗口通信）
        if (typeof window !== 'undefined') {
          const eventKey = `announcementUpdated_${Date.now()}`;
          localStorage.setItem(eventKey, JSON.stringify({ dataType: 'announcements', timestamp: Date.now() }));
          localStorage.removeItem(eventKey); // 立即移除，只触发 storage 事件
          // 也触发当前窗口的事件（用于同一窗口内通信）
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { dataType: 'announcements' }
          }));
        }
      } else {
        message.error(response?.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ProColumns<API.Announcement>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 200,
      fieldProps: {
        placeholder: '请输入标题关键词',
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        ACTIVITY: { text: '活动通知', status: 'Warning' },
        SYSTEM: { text: '系统通知', status: 'Processing' },
        MESSAGE: { text: '私信', status: 'Success' },
      },
      fieldProps: {
        allowClear: true,
        placeholder: '请选择类型',
      },
      render: (_, record) => {
        const typeMap = {
          ACTIVITY: { text: '活动通知', color: 'orange' },
          SYSTEM: { text: '系统通知', color: 'blue' },
          MESSAGE: { text: '私信', color: 'green' },
        };
        const typeInfo = typeMap[record.type as keyof typeof typeMap] || typeMap.SYSTEM;
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: { text: '未发布', status: 'Default' },
        1: { text: '已发布', status: 'Success' },
      },
      fieldProps: {
        allowClear: true,
        placeholder: '请选择状态',
      },
      render: (_, record) => (
        <Switch
          checked={record.status === 1}
          onChange={(checked) => handleStatusChange(record.id!, checked ? 1 : 0)}
          checkedChildren="已发布"
          unCheckedChildren="未发布"
        />
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 180,
      hideInSearch: true,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 180,
      hideInSearch: true,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      hideInSearch: true,
      sorter: true,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这条公告吗？"
          onConfirm={() => handleDelete(record.id!)}
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Announcement>
        headerTitle="公告管理"
        actionRef={actionRef}
        formRef={formRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={handleAdd}>
            新建公告
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          try {
            console.log('公告查询参数:', params);
            const response = await getAnnouncements();
            if (response && response.code === 200 && response.data) {
              let list = response.data || [];

              // 状态筛选
              if (params.status !== undefined && params.status !== null && params.status !== '') {
                const statusValue = Number(params.status);
                list = list.filter((item) => item.status === statusValue);
                console.log('状态筛选后:', list.length, '条');
              }

              // 类型筛选
              if (params.type !== undefined && params.type !== null && params.type !== '') {
                list = list.filter((item) => {
                  const itemType = item.type ? item.type.toUpperCase() : '';
                  const searchType = String(params.type).toUpperCase();
                  return itemType === searchType;
                });
                console.log('类型筛选后:', list.length, '条');
              }

              // 标题搜索（模糊匹配）
              if (params.title !== undefined && params.title !== null && params.title !== '') {
                const titleKeyword = String(params.title).trim();
                if (titleKeyword) {
                  list = list.filter((item) =>
                    item.title && item.title.toLowerCase().includes(titleKeyword.toLowerCase())
                  );
                  console.log('标题搜索后:', list.length, '条');
                }
              }

              // 排序处理
              if (sort && Object.keys(sort).length > 0) {
                const sortKey = Object.keys(sort)[0];
                const sortOrder = sort[sortKey];
                list.sort((a: any, b: any) => {
                  let aVal = a[sortKey];
                  let bVal = b[sortKey];
                  
                  // 处理日期类型
                  if (sortKey === 'createTime' || sortKey === 'startTime' || sortKey === 'endTime') {
                    aVal = aVal ? new Date(aVal).getTime() : 0;
                    bVal = bVal ? new Date(bVal).getTime() : 0;
                  }
                  
                  // 处理数字类型
                  if (sortKey === 'priority' || sortKey === 'id') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                  }
                  
                  if (sortOrder === 'ascend') {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                  } else {
                    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                  }
                });
              }

              // 分页处理
              const current = params.current || 1;
              const pageSize = params.pageSize || 10;
              const start = (current - 1) * pageSize;
              const end = start + pageSize;
              const paginatedList = list.slice(start, end);

              console.log('分页结果:', {
                current,
                pageSize,
                total: list.length,
                dataCount: paginatedList.length
              });

              return {
                data: paginatedList,
                success: true,
                total: list.length,
              };
            }
            return {
              data: [],
              success: false,
              total: 0,
            };
          } catch (error) {
            console.error('获取公告列表失败:', error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <AnnouncementForm
        visible={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setCurrentAnnouncement(null);
        }}
        onSubmit={handleSubmit}
        initialValues={currentAnnouncement || undefined}
      />
    </PageContainer>
  );
};

export default AnnouncementPage;

