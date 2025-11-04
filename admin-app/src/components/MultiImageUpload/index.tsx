import React, { useState, useEffect, useRef } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

interface MultiImageUploadProps {
  value?: string;
  onChange?: (urls: string) => void;
  maxCount?: number;
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ 
  value, 
  onChange, 
  maxCount = 5 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const prevValueRef = useRef<string | undefined>(value);
  const isUserActionRef = useRef<boolean>(false);

  // 初始化文件列表 - 只在value从外部改变时更新（避免与用户操作冲突）
  useEffect(() => {
    console.log('MultiImageUpload useEffect触发，value:', value ? `长度${value.length}` : '空');
    console.log('prevValueRef.current:', prevValueRef.current ? `长度${prevValueRef.current.length}` : '空');
    console.log('isUserActionRef.current:', isUserActionRef.current);
    
    // 如果value没有改变，不更新
    if (prevValueRef.current === value) {
      console.log('value未改变，跳过更新');
      return;
    }
    
    // 如果是用户操作导致的onChange，跳过外部更新
    if (isUserActionRef.current) {
      console.log('用户操作导致的变化，跳过外部更新');
      isUserActionRef.current = false;
      prevValueRef.current = value;
      return;
    }

    // value从外部改变，更新fileList
    if (value) {
      const urls = value.split(',').filter(url => url.trim());
      console.log('解析出URL数量:', urls.length);
      const files = urls.map((url, index) => {
        const trimmedUrl = url.trim();
        return {
          uid: `-${index}-${Date.now()}`,
          name: trimmedUrl.startsWith('data:') ? `image-${index}.jpg` : `image-${index}.png`,
          status: 'done' as const,
          url: trimmedUrl,
        };
      });
      console.log('设置fileList，文件数量:', files.length);
      setFileList(files);
    } else {
      console.log('value为空，清空fileList');
      setFileList([]);
    }
    
    prevValueRef.current = value;
  }, [value]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    // 优先级：url > response > preview > 从originFileObj生成
    let imageUrl = file.url || file.response || (file.preview as string);
    
    if (!imageUrl && file.originFileObj) {
      imageUrl = await getBase64(file.originFileObj as RcFile);
      file.preview = imageUrl;
    }

    setPreviewImage(imageUrl);
    setPreviewOpen(true);
    // 生成预览标题
    const title = file.name || 
                  (imageUrl?.startsWith('data:') ? '预览图片' : 
                   imageUrl?.substring(imageUrl.lastIndexOf('/') + 1) || '预览图片');
    setPreviewTitle(title);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList, file }) => {
    // 如果文件状态是 done，确保URL被正确设置
    if (file && file.status === 'done') {
      // 如果file.response存在（来自customRequest的onSuccess），将其设置为url
      if (file.response && !file.url) {
        file.url = file.response;
      }
      // 如果file.preview存在但没有url，也使用preview
      if (file.preview && !file.url) {
        file.url = file.preview as string;
      }
    }
    
    // 更新fileList
    setFileList(newFileList);
    
    // 提取所有已完成上传的图片URL
    const urls = newFileList
      .filter(file => file.status === 'done')
      .map(file => {
        // 优先级：url > response > preview
        const url = file.url || file.response || (file.preview as string);
        return url;
      })
      .filter(url => url)
      .join(',');
    
    // 标记这是用户操作
    isUserActionRef.current = true;
    
    // 通知父组件值改变
    if (urls) {
      onChange?.(urls);
    } else if (newFileList.length === 0) {
      // 如果列表为空，也通知父组件
      onChange?.('');
    }
  };

  // 自定义上传逻辑
  const customRequest = async ({ file, onSuccess, onProgress, onError }: any) => {
    try {
      const base64 = await getBase64(file as RcFile);
      // 模拟上传进度
      onProgress?.({ percent: 100 });
      // 将Base64数据传递给onSuccess，这会被设置为file.response
      onSuccess(base64, file);
    } catch (error) {
      console.error('图片转换失败:', error);
      message.error('图片上传失败');
      onError?.(error);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
        maxCount={maxCount}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default MultiImageUpload;

