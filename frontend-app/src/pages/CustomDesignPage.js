import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import FooterSection from '../components/FooterSection';
import RightSidebar from '../components/RightSidebar';
import { showModal } from '../utils/modal';

const API_BASE_URL = 'http://localhost:8081/api';

const CustomDesignPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // 从URL参数中获取tab，如果没有则默认为'service'
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        return tab || 'service';
    });
    
    // 当URL参数变化时，更新activeTab
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        } else {
            // 如果没有tab参数，默认显示服务介绍
            setActiveTab('service');
        }
    }, [searchParams]);
    
    // 从后端获取的数据
    const [cases, setCases] = useState([]);
    const [designers, setDesigners] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 获取案例数据
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/custom-cases/list`);
                if (response.data.code === 200) {
                    setCases(response.data.data);
                }
            } catch (error) {
                console.error('获取案例数据失败:', error);
            }
        };
        fetchCases();
    }, []);
    
    // 获取设计师数据
    useEffect(() => {
        const fetchDesigners = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/designers/list`);
                if (response.data.code === 200) {
                    setDesigners(response.data.data);
                }
            } catch (error) {
                console.error('获取设计师数据失败:', error);
            }
        };
        fetchDesigners();
    }, []);

    // URL参数带入的设计师自动选中 + 自动切换到预约tab
    useEffect(() => {
        const idFromUrl = searchParams.get('designerId');
        if (idFromUrl) {
            setFormData(prev => ({ ...prev, designerId: idFromUrl }));
            // 如果未显式传入tab，也切到预约
            const tab = searchParams.get('tab');
            if (!tab) {
                setActiveTab('appointment');
            }
        }
    }, [searchParams]);
    
    // 获取定制方案数据
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/custom-plans/list`);
                if (response.data.code === 200) {
                    setPlans(response.data.data);
                }
            } catch (error) {
                console.error('获取方案数据失败:', error);
            }
        };
        fetchPlans();
    }, []);
    
    // 统一的箭头图标组件
    const Arrow = ({ direction = 'right' }) => {
        const icons = {
            right: '»',
            left: '«',
            down: '»'
        };
        
        const getRotation = () => {
            if (direction === 'down') return 'rotate(90deg)';
            return 'rotate(0deg)';
        };
        
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: direction === 'down' ? '50%' : '70px',
                fontSize: '56px',
                color: '#ff4444',
                fontWeight: 'bold',
                transform: getRotation()
            }}>
                {icons[direction]}
            </div>
        );
    }; // service, process, cases, designers, calculator, plans, appointment
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        area: '',
        style: '',
        budget: '',
        message: '',
        designerId: ''
    });
    const [calculatorData, setCalculatorData] = useState({
        roomType: '',
        area: '',
        style: '',
        material: '',
        includeInstallation: false
    });

    // 定制流程步骤
    const processSteps = [
        {
            step: 1,
            title: '在线预约',
            description: '填写基本信息，预约免费上门量尺',
            icon: '📝'
        },
        {
            step: 2,
            title: '专业量尺',
            description: '设计师上门精准测量，了解需求',
            icon: '📏'
        },
        {
            step: 3,
            title: '方案设计',
            description: '3-7天提供3套专属设计方案',
            icon: '🎨'
        },
        {
            step: 4,
            title: '确认方案',
            description: '面对面沟通，确定最终方案',
            icon: '✅'
        },
        {
            step: 5,
            title: '生产制作',
            description: '工厂生产，严格质检，保质保量',
            icon: '🏭'
        },
        {
            step: 6,
            title: '安装交付',
            description: '专业安装团队上门安装，验收交付',
            icon: '🏠'
        },
        {
            step: 7,
            title: '售后服务',
            description: '5年质保，终身维护服务',
            icon: '🛠️'
        }
    ];


    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            showModal.error('请填写姓名和联系电话');
            return;
        }
        
        setLoading(true);
        try {
            // 提交预约信息到后端API
            const response = await axios.post(`${API_BASE_URL}/appointments`, {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                area: formData.area ? parseInt(formData.area) : null,
                style: formData.style,
                budget: formData.budget,
                remark: formData.message,
                designerId: formData.designerId ? parseInt(formData.designerId) : null
            });
            
            if (response.data.code === 200) {
                showModal.success(response.data.message || '预约成功！我们的设计师将在24小时内与您联系。');
                setFormData({
                    name: '',
                    phone: '',
                    city: '',
                    area: '',
                    style: '',
                    budget: '',
                    message: '',
                    designerId: ''
                });
            } else {
                showModal.error(response.data.message || '预约失败');
            }
        } catch (error) {
            console.error('提交预约失败:', error);
            showModal.error('预约失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 计算价格
    const calculatePrice = () => {
        if (!calculatorData.area || !calculatorData.roomType) {
            return 0;
        }
        const area = parseFloat(calculatorData.area);
        let basePrice = 0;
        
        // 根据房间类型设置基础价格
        const priceMap = {
            'living': 1200,
            'bedroom': 1000,
            'kitchen': 1500,
            'bathroom': 800,
            'study': 900,
            'whole': 1288
        };
        
        basePrice = priceMap[calculatorData.roomType] || 1200;
        
        // 风格加成
        if (calculatorData.style === 'luxury') {
            basePrice *= 1.5;
        } else if (calculatorData.style === 'classic') {
            basePrice *= 1.3;
        }
        
        // 材料加成
        if (calculatorData.material === 'imported') {
            basePrice *= 1.4;
        } else if (calculatorData.material === 'solid') {
            basePrice *= 1.2;
        }
        
        // 安装费用
        const installationFee = calculatorData.includeInstallation ? area * 100 : 0;
        
        return Math.round(area * basePrice + installationFee);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <RightSidebar />
            
            {/* 页面顶部横幅 */}
            <div style={{
                backgroundImage: 'url(/images/custom-design-banner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                padding: '80px 250px',
                color: 'white',
                textAlign: 'center'
            }}>
                {/* 半透明遮罩层，确保文字清晰可读 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        全屋定制服务
                    </h1>
                    <p style={{ fontSize: '20px', opacity: 0.95, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        专业设计 · 精工制作 · 品质保障 · 一站式服务
                    </p>
                </div>
            </div>

            {/* 导航标签 */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '2px solid #e5e5e5',
                padding: '0 250px',
                display: 'flex',
                gap: '40px'
            }}>
                {[
                    { key: 'service', label: '服务介绍' },
                    { key: 'process', label: '定制流程' },
                    { key: 'cases', label: '案例展示' },
                    { key: 'plans', label: '定制方案' },
                    { key: 'designers', label: '设计师' },
                    { key: 'calculator', label: '价格计算' },
                    { key: 'appointment', label: '立即预约' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            // 更新URL参数，但不刷新页面
                            navigate(`/custom?tab=${tab.key}`, { replace: true });
                        }}
                        style={{
                            padding: '20px 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '16px',
                            fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                            color: activeTab === tab.key ? '#667eea' : '#666',
                            borderBottom: activeTab === tab.key ? '3px solid #667eea' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 内容区域 */}
            <div style={{ padding: '60px 250px' }}>
                {/* 服务介绍 */}
                {activeTab === 'service' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            为什么选择我们的全屋定制服务？
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '30px',
                            marginBottom: '60px'
                        }}>
                            {[
                                {
                                    icon: '🎨',
                                    title: '专业设计团队',
                                    description: '10年+设计经验，根据您的需求和喜好，提供个性化设计方案'
                                },
                                {
                                    icon: '🏭',
                                    title: '工厂直供',
                                    description: '自有工厂，采用先进设备，严格质检，确保每一件产品品质'
                                },
                                {
                                    icon: '💰',
                                    title: '透明价格',
                                    description: '无隐藏费用，价格透明，性价比高，让您省心省力'
                                },
                                {
                                    icon: '⚡',
                                    title: '快速交付',
                                    description: '标准化生产流程，30-45天快速交付，不耽误入住时间'
                                },
                                {
                                    icon: '🛠️',
                                    title: '专业安装',
                                    description: '经验丰富的安装团队，确保安装质量，一次到位'
                                },
                                {
                                    icon: '✅',
                                    title: '品质保障',
                                    description: '5年质保，终身维护，让您无后顾之忧'
                                }
                            ].map((item, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'white',
                                    padding: '40px 30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    textAlign: 'center',
                                    transition: 'transform 0.3s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{ fontSize: '20px', marginBottom: '15px', fontWeight: 'bold' }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ color: '#666', lineHeight: '1.6' }}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 服务范围 */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '50px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontSize: '28px', marginBottom: '30px', textAlign: 'center' }}>
                                服务范围
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '30px'
                            }}>
                                {[
                                    '全屋定制家具', '厨房定制', '衣柜定制', '书柜定制',
                                    '电视柜定制', '榻榻米定制', '阳台柜定制', '酒柜定制'
                                ].map((service, index) => (
                                    <div key={index} style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                                            {index === 0 && '🏠'}
                                            {index === 1 && '🍳'}
                                            {index === 2 && '👔'}
                                            {index === 3 && '📚'}
                                            {index === 4 && '📺'}
                                            {index === 5 && '🛏️'}
                                            {index === 6 && '🌞'}
                                            {index === 7 && '🍷'}
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {service}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 定制流程 */}
                {activeTab === 'process' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '50px', textAlign: 'center' }}>
                            全屋定制流程
                        </h2>
                        <div style={{
                            maxWidth: '1100px',
                            margin: '0 auto',
                            padding: '20px'
                        }}>
                            {/* 第一行：步骤1 → 步骤2 */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                {/* 步骤1 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>1</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                在线预约
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        填写基本信息，预约免费上门量尺
                                    </p>
                                </div>
                                
                                {/* 箭头 1→2 */}
                                <Arrow direction="right" />
                                
                                {/* 步骤2 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>2</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📏</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                专业量尺
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        设计师上门精准测量，了解需求
                                    </p>
                                </div>
                            </div>
                            
                            {/* 箭头 2→3（垂直向下） */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                <Arrow direction="down" />
                            </div>
                            
                            {/* 第二行：步骤4 ← 步骤3 */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexDirection: 'row-reverse' }}>
                                {/* 步骤3 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>3</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                方案设计
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        3-7天提供3套专属设计方案
                                    </p>
                                </div>
                                
                                {/* 箭头 3→4 */}
                                <Arrow direction="left" />
                                
                                {/* 步骤4 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>4</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                确认方案
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        面对面沟通，确定最终方案
                                    </p>
                                </div>
                            </div>
                            
                            {/* 箭头 4→5（垂直向下） */}
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                                <Arrow direction="down" />
                            </div>
                            
                            {/* 第三行：步骤5 → 步骤6 */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* 步骤5 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>5</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏭</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                生产制作
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        工厂生产，严格检验，保障质量
                                    </p>
                                </div>
                                
                                {/* 箭头 5→6 */}
                                <Arrow direction="right" />
                                
                                {/* 步骤6 */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            marginRight: '15px',
                                            flexShrink: 0
                                        }}>6</div>
                                        <div>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏠</div>
                                            <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                                                安装交付
                                            </h3>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '85px' }}>
                                        专业安装团队上门安装，验收交付
                                    </p>
                                </div>
                            </div>
                            
                         </div>
                     </div>
                 )}

                {/* 案例展示 */}
                {activeTab === 'cases' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            成功案例展示
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '30px'
                        }}>
                            {cases.length === 0 ? (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    textAlign: 'center', 
                                    padding: '60px', 
                                    color: '#999' 
                                }}>
                                    暂无案例数据
                                </div>
                            ) : cases.map(caseItem => (
                                <div key={caseItem.id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                onClick={() => {
                                    navigate(`/case/${caseItem.id}`);
                                }}
                                >
                                    <div style={{
                                        height: '300px',
                                        backgroundColor: '#f0f0f0',
                                        backgroundImage: `url(${caseItem.images ? 
                                            (caseItem.images.split(',')[0].startsWith('http') ? 
                                                caseItem.images.split(',')[0] : 
                                                `http://localhost:8081${caseItem.images.split(',')[0]}`) : 
                                            '/images/default.jpg'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '20px',
                                            backgroundColor: 'rgba(102, 126, 234, 0.9)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '18px',
                                            fontWeight: 'bold'
                                        }}>
                                            {caseItem.budget ? `¥${(caseItem.budget / 10000).toFixed(1)}万` : '面议'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '30px' }}>
                                        <h3 style={{ fontSize: '24px', marginBottom: '15px', fontWeight: 'bold' }}>
                                            {caseItem.title}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: '20px',
                                            marginBottom: '15px',
                                            color: '#666'
                                        }}>
                                            <span>📐 {caseItem.area}㎡</span>
                                            <span>🎨 {caseItem.style}</span>
                                            {caseItem.designerName && <span>👤 {caseItem.designerName}</span>}
                                        </div>
                                        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                                            {caseItem.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {(caseItem.highlights ? JSON.parse(caseItem.highlights) : []).map((feature, idx) => (
                                                <span key={idx} style={{
                                                    backgroundColor: '#f0f0f0',
                                                    padding: '5px 12px',
                                                    borderRadius: '15px',
                                                    fontSize: '14px',
                                                    color: '#666'
                                                }}>
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 定制方案 */}
                {activeTab === 'plans' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            选择适合您的定制方案
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '30px'
                        }}>
                            {plans.length === 0 ? (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    textAlign: 'center', 
                                    padding: '60px', 
                                    color: '#999' 
                                }}>
                                    暂无方案数据
                                </div>
                            ) : plans.map(plan => (
                                <div key={plan.id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '40px 30px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    textAlign: 'center',
                                    position: 'relative',
                                    border: plan.id === 2 ? '3px solid #667eea' : '3px solid transparent',
                                    transition: 'transform 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {plan.id === 2 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-15px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            padding: '5px 20px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            推荐
                                        </div>
                                    )}
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                                        {plan.icon || '📦'}
                                    </div>
                                    <h3 style={{ fontSize: '28px', marginBottom: '15px', fontWeight: 'bold' }}>
                                        {plan.name}
                                    </h3>
                                    <div style={{
                                        fontSize: '36px',
                                        color: '#667eea',
                                        fontWeight: 'bold',
                                        marginBottom: '20px'
                                    }}>
                                        {plan.priceRange || `${plan.priceFrom}-${plan.priceTo}元/㎡`}
                                    </div>
                                    <p style={{ color: '#666', marginBottom: '30px' }}>
                                        {plan.description}
                                    </p>
                                    <div style={{
                                        textAlign: 'left',
                                        marginBottom: '30px',
                                        minHeight: '200px'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                                            包含内容：
                                        </div>
                                        {(plan.includes ? JSON.parse(plan.includes) : []).map((item, idx) => (
                                            <div key={idx} style={{
                                                marginBottom: '10px',
                                                paddingLeft: '20px',
                                                position: 'relative'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    left: '0',
                                                    color: '#667eea'
                                                }}>✓</span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    {plan.highlight && (
                                        <div style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            color: '#666'
                                        }}>
                                            {plan.highlight}
                                        </div>
                                    )}
                                    <button style={{
                                        width: '100%',
                                        padding: '15px',
                                        backgroundColor: plan.id === 2 ? '#667eea' : '#f0f0f0',
                                        color: plan.id === 2 ? 'white' : '#666',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (plan.id !== 2) {
                                            e.target.style.backgroundColor = '#667eea';
                                            e.target.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (plan.id !== 2) {
                                            e.target.style.backgroundColor = '#f0f0f0';
                                            e.target.style.color = '#666';
                                        }
                                    }}
                                    onClick={() => {
                                        setActiveTab('appointment');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    >
                                        立即预约
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 设计师推荐 */}
                {activeTab === 'designers' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            专业设计师团队
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '30px'
                        }}>
                            {designers.length === 0 ? (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    textAlign: 'center', 
                                    padding: '60px', 
                                    color: '#999' 
                                }}>
                                    暂无设计师数据
                                </div>
                            ) : designers.map(designer => (
                                <div key={designer.id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '30px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    gap: '25px'
                                }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f0f0f0',
                                        backgroundImage: `url(${designer.avatar ? 
                                            (designer.avatar.startsWith('http') ? 
                                                designer.avatar : 
                                                `http://localhost:8081${designer.avatar}`) : 
                                            '/images/default-avatar.jpg'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        flexShrink: 0
                                    }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '10px'
                                        }}>
                                            <div>
                                                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '5px' }}>
                                                    {designer.name}
                                                </h3>
                                                <div style={{ color: '#666', fontSize: '14px' }}>
                                                    {designer.title} · {designer.experience}经验
                                                </div>
                                            </div>
                                            <div style={{
                                                backgroundColor: '#fff3cd',
                                                color: '#856404',
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}>
                                                ⭐ {designer.rating}
                                            </div>
                                        </div>
                                        <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
                                            {designer.description}
                                        </p>
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                                擅长风格：
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {(designer.specialties ? JSON.parse(designer.specialties) : []).map((specialty, idx) => (
                                                    <span key={idx} style={{
                                                        backgroundColor: '#f0f0f0',
                                                        padding: '5px 12px',
                                                        borderRadius: '15px',
                                                        fontSize: '13px',
                                                        color: '#666'
                                                    }}>
                                                        {specialty}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ color: '#666', fontSize: '14px' }}>
                                                📊 已完成 {designer.caseCount || 0} 个案例
                                            </div>
                                            <button style={{
                                                padding: '8px 20px',
                                                backgroundColor: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '20px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                                            onClick={() => {
                                                // 设置选中的设计师ID
                                                setFormData(prev => ({
                                                    ...prev,
                                                    designerId: designer.id.toString()
                                                }));
                                                // 更新URL参数，包含tab和designerId
                                                navigate(`/custom?tab=appointment&designerId=${designer.id}`, { replace: true });
                                                // 切换到预约标签页
                                                setActiveTab('appointment');
                                                // 滚动到顶部
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            >
                                                选择设计师
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 价格计算器 */}
                {activeTab === 'calculator' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            价格计算器
                        </h2>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '50px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '30px',
                                marginBottom: '40px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px'
                                    }}>
                                        房间类型
                                    </label>
                                    <select
                                        value={calculatorData.roomType}
                                        onChange={(e) => setCalculatorData({
                                            ...calculatorData,
                                            roomType: e.target.value
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <option value="">请选择</option>
                                        <option value="living">客厅</option>
                                        <option value="bedroom">卧室</option>
                                        <option value="kitchen">厨房</option>
                                        <option value="bathroom">卫生间</option>
                                        <option value="study">书房</option>
                                        <option value="whole">全屋定制</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px'
                                    }}>
                                        面积（㎡）
                                    </label>
                                    <input
                                        type="number"
                                        value={calculatorData.area}
                                        onChange={(e) => setCalculatorData({
                                            ...calculatorData,
                                            area: e.target.value
                                        })}
                                        placeholder="请输入面积"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px'
                                    }}>
                                        风格
                                    </label>
                                    <select
                                        value={calculatorData.style}
                                        onChange={(e) => setCalculatorData({
                                            ...calculatorData,
                                            style: e.target.value
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <option value="">标准</option>
                                        <option value="simple">简约</option>
                                        <option value="classic">古典</option>
                                        <option value="luxury">豪华</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px'
                                    }}>
                                        材料等级
                                    </label>
                                    <select
                                        value={calculatorData.material}
                                        onChange={(e) => setCalculatorData({
                                            ...calculatorData,
                                            material: e.target.value
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <option value="">标准</option>
                                        <option value="solid">实木</option>
                                        <option value="imported">进口</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{
                                marginBottom: '30px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={calculatorData.includeInstallation}
                                        onChange={(e) => setCalculatorData({
                                            ...calculatorData,
                                            includeInstallation: e.target.checked
                                        })}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            marginRight: '10px'
                                        }}
                                    />
                                    <span style={{ fontSize: '16px' }}>包含安装费用</span>
                                </label>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '30px',
                                backgroundColor: '#667eea',
                                borderRadius: '12px',
                                color: 'white'
                            }}>
                                <div style={{ fontSize: '18px', marginBottom: '10px', opacity: 0.9 }}>
                                    预估价格
                                </div>
                                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                                    ¥{calculatePrice().toLocaleString()}
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                                    （实际价格以设计师报价为准）
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setActiveTab('appointment');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                style={{
                                    width: '100%',
                                    marginTop: '30px',
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    color: '#667eea',
                                    border: '2px solid #667eea',
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#667eea';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#667eea';
                                }}
                            >
                                预约免费量尺
                            </button>
                        </div>
                    </div>
                )}

                {/* 预约表单 */}
                {activeTab === 'appointment' && (
                    <div>
                        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
                            免费预约量尺
                        </h2>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '50px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            <form onSubmit={handleSubmit}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '25px',
                                    marginBottom: '25px'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            姓名 <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                name: e.target.value
                                            })}
                                            required
                                            placeholder="请输入您的姓名"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            联系电话 <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                phone: e.target.value
                                            })}
                                            required
                                            placeholder="请输入您的手机号"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            所在城市
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                city: e.target.value
                                            })}
                                            placeholder="请输入所在城市"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            房屋面积（㎡）
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.area}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                area: e.target.value
                                            })}
                                            placeholder="请输入房屋面积"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            偏好风格
                                        </label>
                                        <select
                                            value={formData.style}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                style: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <option value="">请选择</option>
                                            <option value="modern">现代简约</option>
                                            <option value="nordic">北欧风格</option>
                                            <option value="chinese">新中式</option>
                                            <option value="european">欧式古典</option>
                                            <option value="industrial">工业风</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            预算范围
                                        </label>
                                        <select
                                            value={formData.budget}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                budget: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <option value="">请选择</option>
                                            <option value="under-10">10万以下</option>
                                            <option value="10-20">10-20万</option>
                                            <option value="20-30">20-30万</option>
                                            <option value="30-50">30-50万</option>
                                            <option value="over-50">50万以上</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            选择设计师
                                        </label>
                                        <select
                                            value={formData.designerId}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                designerId: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <option value="">请选择（可选）</option>
                                            {designers.map(designer => (
                                                <option key={designer.id} value={designer.id}>
                                                    {designer.name} - {designer.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '10px',
                                        fontWeight: 'bold',
                                        fontSize: '16px'
                                    }}>
                                        其他需求说明
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            message: e.target.value
                                        })}
                                        placeholder="请描述您的具体需求，如：需要定制的房间、特殊要求等"
                                        rows="5"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                                >
                                    提交预约
                                </button>
                                <div style={{
                                    marginTop: '20px',
                                    textAlign: 'center',
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    <p>📞 客服热线：400-888-8888</p>
                                    <p>⏰ 服务时间：周一至周日 9:00-21:00</p>
                                    <p>✅ 我们承诺：24小时内联系您，免费上门量尺</p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* 底部 */}
            <FooterSection />
        </div>
    );
};

export default CustomDesignPage;
