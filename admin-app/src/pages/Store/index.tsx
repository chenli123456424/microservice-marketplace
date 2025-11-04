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

interface Store {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  businessHours: string;
  image: string;
  description: string;
  latitude: number;
  longitude: number;
  status: number;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

const StoreList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | undefined>();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ProColumns<Store>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '门店名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 200,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
      width: 250,
      search: false,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 120,
      search: false,
    },
    {
      title: '营业时间',
      dataIndex: 'businessHours',
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
        0: { text: '关闭', status: 'Default' },
        1: { text: '营业', status: 'Success' },
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
          onClick={async () => {
            setCurrentStore(record);
            
            // 如果有ID，重新获取最新数据
            let latestRecord = record;
            if (record.id) {
              try {
                const response = await request(`/api/stores/${record.id}`);
                if (response.code === 200 && response.data) {
                  latestRecord = response.data;
                }
              } catch (error) {
                console.error('获取门店详情失败:', error);
                message.error('获取门店详情失败: ' + (error as any).message);
              }
            }
            
            // 设置图片URL
            const storeImageUrl = latestRecord.image || '';
            setImageUrl(storeImageUrl);
            
            form.setFieldsValue({
              ...latestRecord,
              status: latestRecord.status === 1,
            });
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            Modal.confirm({
              title: '确认删除',
              content: `确定要删除门店"${record.name}"吗？`,
              onOk: async () => {
                try {
                  const response = await request(`/api/stores/${record.id}`, {
                    method: 'DELETE',
                  });
                  if (response.code === 200) {
                    message.success('删除成功');
                    actionRef.current?.reload();
                  } else {
                    message.error(response.message || '删除失败');
                  }
                } catch (error) {
                  message.error('删除失败: ' + (error as any).message);
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const submitData = {
        ...values,
        image: imageUrl,
        status: values.status ? 1 : 0,
      };
      
      let response;
      if (currentStore?.id) {
        // 更新
        response = await request('/api/stores', {
          method: 'PUT',
          data: { ...submitData, id: currentStore.id },
        });
      } else {
        // 新增
        response = await request('/api/stores', {
          method: 'POST',
          data: submitData,
        });
      }
      
      if (response.code === 200) {
        message.success(currentStore?.id ? '更新成功' : '添加成功');
        setModalVisible(false);
        setCurrentStore(undefined);
        setImageUrl('');
        form.resetFields();
        actionRef.current?.reload();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setCurrentStore(undefined);
    setImageUrl('');
    form.resetFields();
  };

  return (
    <PageContainer>
      <ProTable<Store>
        headerTitle="门店列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentStore(undefined);
              setImageUrl('');
              form.resetFields();
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建门店
          </Button>,
        ]}
        request={async (params) => {
          const response = await request('/api/stores/page', {
            method: 'GET',
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              name: params.name,
              city: params.city,
              status: params.status,
            },
          });
          return {
            data: response?.data?.records || [],
            success: response?.code === 200,
            total: response?.data?.total || 0,
          };
        }}
        columns={columns}
      />

      <Modal
        title={currentStore?.id ? '编辑门店' : '新建门店'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={loading}
        destroyOnClose
        afterClose={() => {
          setImageUrl('');
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: true,
            sortOrder: 0,
          }}
        >
          <Form.Item
            name="name"
            label="门店名称"
            rules={[{ required: true, message: '请输入门店名称' }]}
          >
            <Input placeholder="请输入门店名称" />
          </Form.Item>

          <Form.Item
            name="city"
            label="所在城市"
            rules={[{ required: true, message: '请输入所在城市' }]}
          >
            <Input placeholder="请输入所在城市" />
          </Form.Item>

          <Form.Item
            name="address"
            label="门店地址"
            rules={[{ required: true, message: '请输入门店地址' }]}
          >
            <TextArea rows={2} placeholder="请输入门店地址" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="businessHours"
            label="营业时间"
          >
            <Input placeholder="例如：09:00-21:00" />
          </Form.Item>

          <Form.Item name="image" label="门店图片" hidden>
            <Input />
          </Form.Item>
          
          {/* 图片上传组件 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>门店图片</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* 显示已上传的图片 */}
              {imageUrl && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={imageUrl.startsWith('http') || imageUrl.startsWith('data:') 
                      ? imageUrl 
                      : `http://localhost:8081${imageUrl}`} 
                    alt="门店图片" 
                    style={{ 
                      width: 120, 
                      height: 120, 
                      objectFit: 'cover', 
                      borderRadius: 6,
                      border: '2px solid #1890ff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      backgroundColor: '#f5f5f5'
                    }} 
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22120%22%20height%3D%22120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2230%22%20y%3D%2250%22%3E加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                  <div 
                    style={{ 
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
                      setImageUrl('');
                      form.setFieldsValue({ image: '' });
                    }}>
                    ×
                  </div>
                </div>
              )}
              
              {/* 上传按钮 */}
              <div style={{ 
                width: 120, 
                height: 120, 
                border: '2px dashed #d9d9d9', 
                borderRadius: 6, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s',
                position: 'relative',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="store-image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLoading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      uploadImage(formData)
                        .then(response => {
                          if (response && response.code === 200) {
                            const uploadedImageUrl = response.data;
                            setImageUrl(uploadedImageUrl);
                            form.setFieldsValue({ image: uploadedImageUrl });
                            message.success('图片上传成功');
                          } else {
                            message.error('图片上传失败: ' + (response?.message || '未知错误'));
                          }
                        })
                        .catch(error => {
                          console.error('图片上传失败:', error);
                          message.error('图片上传失败');
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
                      document.getElementById('store-image-upload')?.click();
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
                      <div style={{ fontSize: 12, lineHeight: 1.2 }}>点击上传图片</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="description"
            label="门店描述"
          >
            <TextArea rows={3} placeholder="请输入门店描述" />
          </Form.Item>

          <Form.Item
            name="latitude"
            label="纬度"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入纬度"
              precision={7}
            />
          </Form.Item>

          <Form.Item
            name="longitude"
            label="经度"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入经度"
              precision={7}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序顺序"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入排序顺序"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="营业" unCheckedChildren="关闭" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StoreList;
