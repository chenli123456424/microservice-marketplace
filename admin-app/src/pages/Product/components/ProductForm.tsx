import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormSwitch,
  ProFormGroup,
  ProFormList,
  ProFormFieldSet,
} from '@ant-design/pro-components';
import { message, Upload, Button } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { uploadImage } from '@/services/demo/ProductController';
import services from '@/services/demo';

const { getCategories, getBrands } = services.ProductController;

export interface ProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
}

const ProductForm: React.FC<ProductFormProps> = (props) => {
  const { visible, onCancel, onSubmit, initialValues } = props;
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | undefined>(
    initialValues?.mainId,
  );
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取分类和品牌数据
  const fetchCategoryAndBrandData = async () => {
    try {
      // 获取分类树
      const categoryResponse = await getCategories();
      if (categoryResponse && categoryResponse.code === 200) {
        const categories = categoryResponse.data || [];
        setMainCategories(categories);

        // 如果有初始值，设置子分类
        if (initialValues?.mainId) {
          const mainCategory = categories.find((item: any) => item.mainId === initialValues.mainId);
          if (mainCategory && mainCategory.subCategories) {
            setSubCategories(mainCategory.subCategories);
          }
        }
      }

      // 获取品牌列表
      const brandResponse = await getBrands();
      if (brandResponse && brandResponse.code === 200) {
        setBrands(brandResponse.data || []);
      }
    } catch (error) {
      console.error('获取分类和品牌数据失败:', error);
      message.error('获取分类和品牌数据失败');
    }
  };

  useEffect(() => {
    // 每次打开表单时重置图片状态
    if (!visible) {
      setImageUrls([]);
      setFileList([]);
      return;
    }

    fetchCategoryAndBrandData();
    
    // 重置图片状态
    setImageUrls([]);
    setFileList([]);
    
    // 初始化图片数据
    console.log('初始化图片数据，initialValues:', initialValues);
    
    // 1. 优先使用imageUrls（如果存在）
    if (initialValues?.imageUrls && initialValues.imageUrls.length > 0) {
      console.log('从imageUrls加载图片:', initialValues.imageUrls);
      setImageUrls(initialValues.imageUrls);
    }
    // 2. 其次使用images数组
    else if (initialValues?.images && initialValues.images.length > 0) {
      const urls = initialValues.images.map((img: any) => img.imageUrl);
      console.log('从images数组加载图片:', urls);
      setImageUrls(urls);
    }
    // 3. 最后使用缩略图
    else if (initialValues?.thumbnailUrl) {
      console.log('从缩略图加载图片:', initialValues.thumbnailUrl);
      setImageUrls([initialValues.thumbnailUrl]);
    } else {
      console.log('没有图片数据，保持空数组');
    }
    
    // 打印最终的图片数组
    console.log('图片初始化完成，当前图片数组:', imageUrls);
  }, [visible, initialValues]);

  const handleMainCategoryChange = (value: number) => {
    setSelectedMainCategory(value);
    const mainCategory = mainCategories.find((item: any) => item.mainId === value);
    if (mainCategory && mainCategory.subCategories) {
      setSubCategories(mainCategory.subCategories);
    } else {
      setSubCategories([]);
    }
  };

  return (
    <ModalForm
      title={initialValues ? '编辑商品' : '新建商品'}
      width="800px"
      open={visible}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          // 清理图片状态
          setImageUrls([]);
          setFileList([]);
          // 调用原来的onCancel
          onCancel();
        },
        afterClose: () => {
          // 确保在Modal完全关闭后也清理状态
          setImageUrls([]);
          setFileList([]);
        }
      }}
      onFinish={async (values) => {
        // 处理提交的数据
        const submitValues = {
          ...values,
          status: values.status ? 1 : 0, // 转换开关状态为数字
        };
        
        // 处理图片URL数组
        // 1. 过滤掉空值
        const filteredImageUrls = imageUrls.filter((u: string) => !!u);
        // 2. 确保是一个有效的数组
        submitValues.imageUrls = filteredImageUrls.length > 0 ? filteredImageUrls : [];
        
        // 处理颜色和规格数据
        // 将ProFormList的数据格式转换为数组
        console.log('原始颜色数据:', values.colors);
        console.log('原始规格数据:', values.specs);
        
        if (values.colors && Array.isArray(values.colors)) {
          submitValues.colors = values.colors
            .map(item => item.color)
            .filter(color => color && color.trim());
        } else {
          submitValues.colors = [];
        }
        
        if (values.specs && Array.isArray(values.specs)) {
          submitValues.specs = values.specs
            .map(item => item.spec)
            .filter(spec => spec && spec.trim());
        } else {
          submitValues.specs = [];
        }
        
        console.log('提交前的图片数组:', imageUrls);
        console.log('过滤后的图片数组:', filteredImageUrls);
        console.log('最终提交的图片数据:', submitValues.imageUrls);
        console.log('提交的颜色数据:', submitValues.colors);
        console.log('提交的规格数据:', submitValues.specs);
        console.log('完整提交数据:', submitValues);
        
        await onSubmit(submitValues);
      }}
      initialValues={{
        ...initialValues,
        status: initialValues?.status === 1, // 转换数字状态为布尔值
        // 处理颜色和规格数据，转换为ProFormList需要的格式
        colors: initialValues?.colors ? initialValues.colors.map(color => ({ color })) : [],
        specs: initialValues?.specs ? initialValues.specs.map(spec => ({ spec })) : [],
      }}
    >
      <ProFormText
        name="name"
        label="商品名称"
        rules={[{ required: true, message: '请输入商品名称！' }]}
        placeholder="请输入商品名称"
        width="xl"
      />
      <ProFormGroup>
        <ProFormSelect
          name="mainId"
          label="主分类"
          rules={[{ required: true, message: '请选择主分类！' }]}
          options={mainCategories.map((item: any) => ({
            label: item.name,
            value: item.mainId,
          }))}
          fieldProps={{
            onChange: handleMainCategoryChange,
          }}
          width="md"
        />
        <ProFormSelect
          name="subId"
          label="子分类"
          rules={[{ required: true, message: '请选择子分类！' }]}
          options={subCategories.map((item: any) => ({
            label: item.name,
            value: item.subId,
          }))}
          width="md"
        />
      </ProFormGroup>
      <ProFormSelect
        name="brandId"
        label="品牌"
        rules={[{ required: true, message: '请选择品牌！' }]}
        options={brands.map((item: any) => ({
          label: item.name,
          value: item.brandId,
        }))}
        width="md"
      />
      <ProFormGroup>
        <ProFormDigit
          name="price"
          label="价格"
          rules={[{ required: true, message: '请输入价格！' }]}
          fieldProps={{ precision: 2, addonAfter: '元' }}
          width="sm"
        />
        <ProFormDigit
          name="marketPrice"
          label="市场价"
          fieldProps={{ precision: 2, addonAfter: '元' }}
          width="sm"
        />
        <ProFormDigit
          name="stock"
          label="库存"
          rules={[{ required: true, message: '请输入库存！' }]}
          fieldProps={{ precision: 0 }}
          width="sm"
        />
      </ProFormGroup>
      <ProFormSwitch
        name="status"
        label="上架状态"
        checkedChildren="上架"
        unCheckedChildren="下架"
      />
      <ProFormTextArea 
        name="detailDescription" 
        label="商品详情" 
        placeholder="请输入商品详情（支持长文本）" 
        width="xl"
        fieldProps={{ rows: 4 }}
      />

      {/* 颜色和规格字段 */}
      <ProFormGroup>
        <ProFormList
          name="colors"
          label="颜色选项"
          copyIconProps={false}
          deleteIconProps={{
            tooltipText: '删除此颜色',
          }}
          creatorButtonProps={{
            creatorButtonText: '添加颜色',
            type: 'dashed',
            style: { width: '100%' },
          }}
          itemRender={({ listDom, action }, { index }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                marginBottom: '8px',
                backgroundColor: '#fafafa',
              }}
            >
              <span style={{ minWidth: '60px', fontSize: '14px' }}>颜色 {index + 1}:</span>
              {listDom}
              {action}
            </div>
          )}
        >
          <ProFormText
            name="color"
            placeholder="请输入颜色名称，如：白色"
            rules={[{ required: true, message: '请输入颜色名称' }]}
            style={{ flex: 1 }}
          />
        </ProFormList>
        
        <ProFormList
          name="specs"
          label="规格选项"
          copyIconProps={false}
          deleteIconProps={{
            tooltipText: '删除此规格',
          }}
          creatorButtonProps={{
            creatorButtonText: '添加规格',
            type: 'dashed',
            style: { width: '100%' },
          }}
          itemRender={({ listDom, action }, { index }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                marginBottom: '8px',
                backgroundColor: '#fafafa',
              }}
            >
              <span style={{ minWidth: '60px', fontSize: '14px' }}>规格 {index + 1}:</span>
              {listDom}
              {action}
            </div>
          )}
        >
          <ProFormText
            name="spec"
            placeholder="请输入规格名称，如：800x800mm"
            rules={[{ required: true, message: '请输入规格名称' }]}
            style={{ flex: 1 }}
          />
        </ProFormList>
      </ProFormGroup>

      {/* 简单图片URL列表（可替换为真实上传）*/}
      {/* 本地上传：将上传后的URL写入 imageUrls 列表 */}
      <ProFormText name="imageUrls" label="商品图片" hidden />
      
      {/* 增强的图片上传和预览组件 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>商品图片</div>
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
                alt={`商品图片${index + 1}`} 
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
                  console.error('图片加载失败:', url);
                  // 显示错误占位图而不是隐藏
                  e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2230%22%20y%3D%2250%22%3E加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                }}
                onLoad={() => {
                  console.log('图片加载成功:', url);
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
                // 删除指定索引的图片
                const newUrls = [...imageUrls]; // 创建新数组避免直接修改原数组
                newUrls.splice(index, 1); // 使用splice而不是filter来确保正确删除
                setImageUrls(newUrls);
                console.log('删除图片:', index, '删除后图片数组:', newUrls);
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
              id="image-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // 使用FormData上传到服务器
                  setLoading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  uploadImage(formData)
                    .then(response => {
                      if (response && response.code === 200) {
                        const imageUrl = response.data;
                        // 确保不会覆盖现有图片，而是真正添加到数组中
                        const newUrls = [...imageUrls, imageUrl];
                        console.log('上传前图片数组:', imageUrls);
                        console.log('上传后图片数组:', newUrls);
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
                // 清空input值，允许重复选择同一文件
                e.target.value = '';
              }}
            />
            <div 
              onClick={() => {
                if (!loading) {
                  document.getElementById('image-upload')?.click();
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
            : '请上传商品图片，第一张图片将作为商品列表缩略图'}
        </div>
      </div>
    </ModalForm>
  );
};

export default ProductForm;