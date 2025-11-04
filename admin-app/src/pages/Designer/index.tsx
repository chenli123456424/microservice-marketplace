import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { uploadImage } from '@/services/demo/ProductController';

const { TextArea } = Input;
const { Option } = Select;

interface Designer {
  id: number;
  name: string;
  title: string;
  experience: string;
  specialties: string;
  avatar: string;
  caseCount: number;
  rating: number;
  description: string;
  phone: string;
  sortOrder: number;
  status: number;
  createTime: string;
  updateTime: string;
}

const DesignerList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDesigner, setCurrentDesigner] = useState<Designer | undefined>();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ProColumns<Designer>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '职称',
      dataIndex: 'title',
      width: 120,
      search: false,
    },
    {
      title: '工作年限',
      dataIndex: 'experience',
      width: 100,
      search: false,
    },
    {
      title: '擅长风格',
      dataIndex: 'specialties',
      width: 200,
      search: false,
      render: (text) => {
        try {
          const arr = JSON.parse(text as string);
          return arr.join('、');
        } catch {
          return text;
        }
      },
    },
    {
      title: '案例数',
      dataIndex: 'caseCount',
      width: 80,
      search: false,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 80,
      search: false,
      render: (text) => `${text}分`,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 120,
      search: false,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        0: { text: '离职', status: 'Default' },
        1: { text: '在职', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentDesigner(record);
            setAvatarUrl(record.avatar || '');
            form.setFieldsValue({
              ...record,
              specialties: record.specialties ? JSON.parse(record.specialties) : [],
            });
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个设计师吗？',
              onOk: async () => {
                try {
                  const response = await request(`/api/designers/${record.id}`, {
                    method: 'DELETE',
                  });
                  if (response.code === 200) {
                    message.success('删除成功');
                    actionRef.current?.reload();
                  } else {
                    message.error(response.message || '删除失败');
                  }
                } catch (error) {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        specialties: JSON.stringify(values.specialties || []),
        status: values.status ? 1 : 0,
      };

      const url = '/api/designers';
      const method = currentDesigner ? 'PUT' : 'POST';

      if (currentDesigner) {
        data.id = currentDesigner.id;
      }

      const response = await request(url, {
        method,
        data,
      });

              if (response.code === 200) {
          message.success(currentDesigner ? '更新成功' : '创建成功');
          setModalVisible(false);
          form.resetFields();
          setAvatarUrl('');
          setCurrentDesigner(undefined);
          actionRef.current?.reload();
        } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer>
      <ProTable<Designer>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await request('/api/designers/page', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              name: params.name,
              status: params.status,
            },
          });
          return {
            data: response.data?.records || [],
            success: response.code === 200,
            total: response.data?.total || 0,
          };
        }}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 1400 }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
                          onClick={() => {
                setCurrentDesigner(undefined);
                form.resetFields();
                setAvatarUrl('');
                setModalVisible(true);
              }}
            type="primary"
          >
            新建设计师
          </Button>,
        ]}
      />

      <Modal
        title={currentDesigner ? '编辑设计师' : '新建设计师'}
        open={modalVisible}
                  onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setAvatarUrl('');
            setCurrentDesigner(undefined);
          }}
          afterClose={() => {
            setAvatarUrl('');
          }}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 1,
            sortOrder: 0,
            caseCount: 0,
            rating: 5.0,
          }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="title"
            label="职称"
            rules={[{ required: true, message: '请输入职称' }]}
          >
            <Select placeholder="请选择职称">
              <Option value="首席设计师">首席设计师</Option>
              <Option value="资深设计师">资深设计师</Option>
              <Option value="高级设计师">高级设计师</Option>
              <Option value="中级设计师">中级设计师</Option>
              <Option value="初级设计师">初级设计师</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="experience"
            label="工作年限"
            rules={[{ required: true, message: '请输入工作年限' }]}
          >
            <Input placeholder="例如：10年" />
          </Form.Item>

          <Form.Item
            name="specialties"
            label="擅长风格"
            rules={[{ required: true, message: '请选择擅长风格' }]}
          >
            <Select mode="multiple" placeholder="请选择擅长风格">
              <Option value="现代简约">现代简约</Option>
              <Option value="北欧风格">北欧风格</Option>
              <Option value="新中式">新中式</Option>
              <Option value="欧式古典">欧式古典</Option>
              <Option value="工业风">工业风</Option>
              <Option value="日式风格">日式风格</Option>
              <Option value="空间规划">空间规划</Option>
              <Option value="别墅设计">别墅设计</Option>
              <Option value="小户型">小户型</Option>
            </Select>
          </Form.Item>

          <Form.Item name="avatar" label="头像图片" hidden>
            <Input />
          </Form.Item>
          
          {/* 头像上传组件 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>头像图片</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* 显示已上传的头像 */}
              {avatarUrl && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={avatarUrl.startsWith('data:') ? avatarUrl : `http://localhost:8081${avatarUrl}`} 
                    alt="设计师头像" 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 6,
                      border: '2px solid #1890ff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      backgroundColor: '#f5f5f5'
                    }} 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2230%22%20y%3D%2250%22%3E加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -8, 
                    background: '#ff4d4f', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} 
                  onClick={() => {
                    setAvatarUrl('');
                    form.setFieldsValue({ avatar: '' });
                  }}>
                    ×
                  </div>
                </div>
              )}
              
              {/* 上传按钮 */}
              <div style={{ 
                width: 100, 
                height: 100, 
                border: '2px dashed #d9d9d9', 
                borderRadius: 6, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#fafafa',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="designer-avatar-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLoading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      uploadImage(formData)
                        .then(response => {
                          if (response && response.code === 200) {
                            const imageUrl = response.data;
                            setAvatarUrl(imageUrl);
                            form.setFieldsValue({ avatar: imageUrl });
                            message.success('头像上传成功');
                          } else {
                            message.error('头像上传失败: ' + (response?.message || '未知错误'));
                          }
                        })
                        .catch(error => {
                          console.error('头像上传失败:', error);
                          message.error('头像上传失败');
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    }
                    e.target.value = '';
                  }}
                />
                <div 
                  onClick={() => {
                    if (!loading) {
                      document.getElementById('designer-avatar-upload')?.click();
                    }
                  }}
                  style={{ textAlign: 'center', color: '#999' }}
                >
                  {loading ? (
                    <div style={{ fontSize: 12, lineHeight: 1.2 }}>
                      <div style={{ 
                        width: 28, 
                        height: 28, 
                        margin: '0 auto 8px',
                        border: '2px solid #1890ff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                      上传中...
                    </div>
                  ) : (
                    <>
                      <UploadOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                      <div style={{ fontSize: 12, lineHeight: 1.2 }}>点击上传头像</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Form.Item name="caseCount" label="已完成案例数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="rating" label="评分（1-5分）">
            <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="个人简介">
            <TextArea rows={3} placeholder="请输入个人简介" />
          </Form.Item>

          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越大越靠前" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="在职" unCheckedChildren="离职" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DesignerList;

