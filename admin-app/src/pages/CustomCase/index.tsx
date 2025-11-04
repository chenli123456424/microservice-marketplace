import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import { uploadImage } from '@/services/demo/ProductController';

const { TextArea } = Input;
const { Option } = Select;

interface CustomCase {
  id: number;
  title: string;
  style: string;
  area: number;
  budget: number;
  images: string;
  description: string;
  highlights: string;
  designerId: number;
  designerName: string;
  viewCount: number;
  likeCount: number;
  sortOrder: number;
  status: number;
  createTime: string;
  updateTime: string;
}

const CustomCaseList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCase, setCurrentCase] = useState<CustomCase | undefined>();
  const [form] = Form.useForm();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ProColumns<CustomCase>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '案例标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: '风格',
      dataIndex: 'style',
      width: 100,
      valueType: 'select',
      valueEnum: {
        '现代简约': { text: '现代简约' },
        '北欧风格': { text: '北欧风格' },
        '新中式': { text: '新中式' },
        '欧式古典': { text: '欧式古典' },
        '工业风': { text: '工业风' },
      },
    },
    {
      title: '面积（㎡）',
      dataIndex: 'area',
      width: 100,
      search: false,
    },
    {
      title: '预算（元）',
      dataIndex: 'budget',
      width: 120,
      search: false,
      render: (text) => `¥${Number(text).toLocaleString()}`,
    },
    {
      title: '设计师',
      dataIndex: 'designerName',
      width: 100,
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      width: 80,
      search: false,
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      width: 80,
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
        0: { text: '下架', status: 'Default' },
        1: { text: '上架', status: 'Success' },
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
            setCurrentCase(record);
            setModalVisible(true);
            
            // 如果有ID，重新获取最新数据
            let latestRecord = record;
            if (record.id) {
              try {
                const response = await request(`/api/custom-cases/${record.id}`);
                if (response.code === 200 && response.data) {
                  latestRecord = response.data;
                }
              } catch (error) {
                console.error('获取案例详情失败:', error);
                message.error('获取案例详情失败: ' + (error as any).message);
              }
            }
            
            // 等待Modal渲染完成后再设置表单值
            setTimeout(() => {
              // 处理图片字段：将逗号分隔的URL字符串转换为数组
              let imagesArray: string[] = [];
              if (latestRecord.images) {
                imagesArray = latestRecord.images.split(',').filter(url => url.trim());
              }
              setImageUrls(imagesArray);
              
              form.setFieldsValue({
                ...latestRecord,
                highlights: latestRecord.highlights ? JSON.parse(latestRecord.highlights) : [],
              });
            }, 100);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个案例吗？',
              onOk: async () => {
                try {
                  const response = await request(`/api/custom-cases/${record.id}`, {
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
      // 将图片URL数组转换为逗号分隔的字符串
      const imagesString = imageUrls.filter(url => url.trim()).join(',');
      
      const data = {
        ...values,
        images: imagesString,
        highlights: JSON.stringify(values.highlights || []),
      };

      const url = currentCase ? '/api/custom-cases' : '/api/custom-cases';
      const method = currentCase ? 'PUT' : 'POST';

      if (currentCase) {
        data.id = currentCase.id;
      }

      const response = await request(url, {
        method,
        data,
      });

      if (response.code === 200) {
        message.success(currentCase ? '更新成功' : '创建成功');
        setModalVisible(false);
        form.resetFields();
        setImageUrls([]);
        setCurrentCase(undefined);
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
      <ProTable<CustomCase>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await request('/api/custom-cases/page', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              style: params.style,
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
              setCurrentCase(undefined);
              form.resetFields();
              setImageUrls([]);
              setModalVisible(true);
            }}
            type="primary"
          >
            新建案例
          </Button>,
        ]}
      />

      <Modal
        title={currentCase ? '编辑案例' : '新建案例'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrls([]);
          setCurrentCase(undefined);
        }}
        onOk={() => form.submit()}
        width={800}
        destroyOnClose
        afterClose={() => {
          setImageUrls([]);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 1,
            sortOrder: 0,
            viewCount: 0,
            likeCount: 0,
          }}
        >
          <Form.Item
            name="title"
            label="案例标题"
            rules={[{ required: true, message: '请输入案例标题' }]}
          >
            <Input placeholder="请输入案例标题" />
          </Form.Item>

          <Form.Item
            name="style"
            label="装修风格"
            rules={[{ required: true, message: '请选择装修风格' }]}
          >
            <Select placeholder="请选择装修风格">
              <Option value="现代简约">现代简约</Option>
              <Option value="北欧风格">北欧风格</Option>
              <Option value="新中式">新中式</Option>
              <Option value="欧式古典">欧式古典</Option>
              <Option value="工业风">工业风</Option>
              <Option value="日式风格">日式风格</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="area"
            label="房屋面积（平方米）"
            rules={[{ required: true, message: '请输入房屋面积' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入房屋面积" />
          </Form.Item>

          <Form.Item
            name="budget"
            label="预算金额（元）"
            rules={[{ required: true, message: '请输入预算金额' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预算金额" />
          </Form.Item>

          <Form.Item name="images" label="案例图片（最多5张）" hidden>
            <Input />
          </Form.Item>
          
          {/* 图片上传组件 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>案例图片（最多5张）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, minHeight: 120, maxHeight: 350, overflowY: 'auto', padding: '8px' }}>
              {/* 显示已上传的图片 */}
              {imageUrls.map((url: string, index: number) => (
                <div key={index} style={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  width: 100,
                  height: 100
                }}>
                  <img 
                    src={url.startsWith('data:') ? url : `http://localhost:8081${url}`} 
                    alt={`案例图片${index + 1}`} 
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s'
                  }} 
                  onClick={() => {
                    const newUrls = [...imageUrls];
                    newUrls.splice(index, 1);
                    setImageUrls(newUrls);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ff7875';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ff4d4f';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                    ×
                  </div>
                </div>
              ))}
              
              {/* 上传按钮 */}
              {imageUrls.length < 5 && (
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
                    id="custom-case-image-upload"
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
                              const newUrls = [...imageUrls, imageUrl];
                              setImageUrls(newUrls);
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
                        document.getElementById('custom-case-image-upload')?.click();
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
              )}
            </div>
            
            {/* 提示信息 */}
            <div style={{ 
              marginTop: 8, 
              fontSize: 12, 
              color: '#666',
              backgroundColor: imageUrls.length > 0 ? '#f6ffed' : '#f4f4f4',
              border: `1px solid ${imageUrls.length > 0 ? '#b7eb8f' : '#d9d9d9'}`,
              borderRadius: 4,
              padding: '6px 12px'
            }}>
              {imageUrls.length > 0 
                ? `已上传 ${imageUrls.length} 张图片，点击图片右上角的 × 可删除` 
                : '请上传案例图片，最多5张'}
            </div>
          </div>

          <Form.Item name="description" label="案例描述">
            <TextArea rows={4} placeholder="请输入案例描述" />
          </Form.Item>

          <Form.Item name="highlights" label="设计亮点（多条）">
            <Select mode="tags" placeholder="输入后按回车添加">
              <Option value="大量储物空间">大量储物空间</Option>
              <Option value="开放式厨房">开放式厨房</Option>
              <Option value="智能家居">智能家居</Option>
              <Option value="环保材料">环保材料</Option>
            </Select>
          </Form.Item>

          <Form.Item name="designerName" label="设计师姓名">
            <Input placeholder="请输入设计师姓名" />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越大越靠前" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CustomCaseList;

