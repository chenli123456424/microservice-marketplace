import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormText, ProFormDigit, ProFormDateTimePicker, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form } from 'antd';

export interface AnnouncementFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: API.Announcement) => Promise<void>;
  initialValues?: API.Announcement;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = (props) => {
  const { visible, onCancel, onSubmit, initialValues } = props;
  const [form] = Form.useForm();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          type: initialValues.type || 'SYSTEM',
          priority: initialValues.priority || 0,
          status: initialValues.status === 1,
          startTime: initialValues.startTime,
          endTime: initialValues.endTime,
        });
        setContent(initialValues.content || '');
      } else {
        form.resetFields();
        setContent('');
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values: any) => {
    try {
      // 表单验证会由ModalForm自动处理
      // 合并表单值和富文本内容
      await onSubmit({
        ...values,
        content,
        status: values.status ? 1 : 0,
      });
      // onSubmit成功后会由父组件调用setFormVisible(false)来关闭模态框
      // 这里不需要手动关闭，让父组件控制
      return true;
    } catch (error) {
      console.error('表单提交失败:', error);
      // 返回false阻止关闭模态框
      return false;
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'color',
    'background',
    'align',
    'link',
    'image',
    'video',
  ];

  const handleCancel = (e?: any) => {
    // 阻止默认行为和事件冒泡（如果是从事件调用）
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    console.log('[AnnouncementForm] handleCancel called');
    form.resetFields();
    setContent('');
    onCancel();
  };

  // 处理模态框打开/关闭状态变化
  const handleOpenChange = (open: boolean) => {
    console.log('[AnnouncementForm] onOpenChange called, open:', open);
    if (!open) {
      // 关闭时清理状态
      handleCancel();
    }
  };

  return (
    <ModalForm
      title={initialValues ? '编辑公告' : '新建公告'}
      width={900}
      open={visible}
      form={form}
      onFinish={handleSubmit}
      onOpenChange={handleOpenChange}
      modalProps={{
        destroyOnClose: true,
        okText: '提交',
        cancelText: '取消',
        maskClosable: true,
        keyboard: true,
        onCancel: handleCancel,
        afterClose: () => {
          // 确保在Modal完全关闭后也清理状态
          form.resetFields();
          setContent('');
        },
      }}
    >
      <ProFormText
        name="title"
        label="公告标题"
        placeholder="请输入公告标题"
        rules={[{ required: true, message: '请输入公告标题' }]}
      />

      <ProFormSelect
        name="type"
        label="公告类型"
        placeholder="请选择公告类型"
        rules={[{ required: true, message: '请选择公告类型' }]}
        options={[
          { label: '活动通知', value: 'ACTIVITY' },
          { label: '系统通知', value: 'SYSTEM' },
          { label: '私信', value: 'MESSAGE' },
        ]}
        initialValue="SYSTEM"
      />

      <Form.Item
        name="content"
        label="公告内容"
        rules={[{ required: true, message: '请输入公告内容' }]}
      >
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          placeholder="请输入公告内容，支持文字、图片、链接、表情等..."
          style={{ height: '400px', marginBottom: '42px' }}
        />
      </Form.Item>

      <ProFormDigit
        name="priority"
        label="优先级"
        initialValue={0}
        min={0}
        max={999}
        tooltip="数字越大，优先级越高，显示越靠前"
      />

      <ProFormSwitch
        name="status"
        label="发布状态"
        initialValue={false}
        checkedChildren="已发布"
        unCheckedChildren="未发布"
      />

      <ProFormDateTimePicker
        name="startTime"
        label="开始时间"
        placeholder="选择开始时间（可选）"
        tooltip="公告生效的开始时间，留空表示立即生效"
      />

      <ProFormDateTimePicker
        name="endTime"
        label="结束时间"
        placeholder="选择结束时间（可选）"
        tooltip="公告失效的结束时间，留空表示永久有效"
      />
    </ModalForm>
  );
};

export default AnnouncementForm;

