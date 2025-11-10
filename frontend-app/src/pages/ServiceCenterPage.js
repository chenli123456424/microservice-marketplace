import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { showModal } from '../utils/modal';
import FooterSection from '../components/FooterSection';

const API_BASE_URL = 'http://localhost:8081/api';

const ServiceCenterPage = () => {
    const [activeTab, setActiveTab] = useState('afterSale'); // afterSale | install | faq | warranty | return | track | contact
    const [faqs, setFaqs] = useState([]);
    const [loadingFaq, setLoadingFaq] = useState(false);

    // 安装预约（简化：复用预约接口）
    const [installForm, setInstallForm] = useState({
        name: '',
        phone: '',
        city: '',
        address: '',
        scheduleDate: '',
        message: ''
    });

    // 工单申请（售后服务）
    const [ticketForm, setTicketForm] = useState({
        name: '',
        phone: '',
        orderNo: '',
        issueType: '安装问题',
        description: ''
    });

    const issueTypes = useMemo(() => ['安装问题', '质量问题', '外观破损', '少件/错件', '其他'], []);

    useEffect(() => {
        // 从公告中加载常见问题（演示：取公告作为FAQ来源）
        const fetchFaqs = async () => {
            try {
                setLoadingFaq(true);
                const res = await axios.get(`${API_BASE_URL}/announcement/active`);
                if (res.data?.code === 200) {
                    const list = (res.data.data || []).slice(0, 8).map((a) => ({
                        id: a.id,
                        q: a.title,
                        a: a.content?.replace(/<[^>]+>/g, '') || '详情请查看公告内容'
                    }));
                    setFaqs(list);
                }
            } catch (e) {
                console.error('加载FAQ失败', e);
            } finally {
                setLoadingFaq(false);
            }
        };
        fetchFaqs();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const submitInstall = async (e) => {
        e.preventDefault();
        if (!installForm.name || !installForm.phone) {
            showModal.error('请填写姓名和联系电话');
            return;
        }
        try {
            // 复用预约接口：仅演示用途
            const payload = {
                name: installForm.name,
                phone: installForm.phone,
                city: installForm.city,
                remark: `【安装预约】地址:${installForm.address} 预约时间:${installForm.scheduleDate} 备注:${installForm.message}`
            };
            const res = await axios.post(`${API_BASE_URL}/appointments`, payload);
            if (res.data?.code === 200) {
                showModal.success('预约提交成功，我们将尽快联系您安排上门安装。');
                setInstallForm({ name: '', phone: '', city: '', address: '', scheduleDate: '', message: '' });
            } else {
                showModal.error(res.data?.message || '预约提交失败');
            }
        } catch (e) {
            console.error(e);
            showModal.error('预约提交失败，请稍后再试');
        }
    };

    const submitTicket = (e) => {
        e.preventDefault();
        if (!ticketForm.name || !ticketForm.phone || !ticketForm.orderNo) {
            showModal.error('请填写姓名、电话与订单号');
            return;
        }
        // 演示：前端提交后直接提示成功
        showModal.success('售后工单已提交，我们将尽快与您联系。');
        setTicketForm({ name: '', phone: '', orderNo: '', issueType: '安装问题', description: '' });
    };

    // 物流查询
    const [trackNo, setTrackNo] = useState('');
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackResult, setTrackResult] = useState(null);
    const [trackError, setTrackError] = useState('');

    const trackOrder = async (e) => {
        e.preventDefault();
        if (!trackNo.trim()) {
            showModal.error('请输入订单号');
            return;
        }
        try {
            setTrackLoading(true);
            setTrackError('');
            setTrackResult(null);
            const res = await axios.get(`${API_BASE_URL}/logistics/track`, { params: { orderNo: trackNo.trim() } });
            if (res.data?.code === 200) {
                setTrackResult(res.data.data);
            } else {
                setTrackError(res.data?.message || '查询失败');
            }
        } catch (err) {
            console.error('物流查询失败', err);
            setTrackError('查询失败，请稍后再试');
        } finally {
            setTrackLoading(false);
        }
    };

    const SectionCard = ({ title, children }) => (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 12px' }}>{title}</h3>
            {children}
        </div>
    );

    return (
        <div style={{ background: '#f5f7fa' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 16px 60px' }}>
                <h1 style={{ margin: '0 0 24px' }}>服务中心</h1>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                        { key: 'afterSale', label: '售后工单' },
                        { key: 'install', label: '安装预约' },
                        { key: 'faq', label: '常见问题' },
                        { key: 'warranty', label: '质保政策' },
                        { key: 'return', label: '退换说明' },
                        { key: 'track', label: '物流查询' },
                        { key: 'contact', label: '联系我们' }
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 8,
                                border: '1px solid #ddd',
                                background: activeTab === t.key ? '#c57237' : '#fff',
                                color: activeTab === t.key ? '#fff' : '#333',
                                cursor: 'pointer'
                            }}
                        >{t.label}</button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'afterSale' && (
                    <SectionCard title="提交售后工单">
                        <form onSubmit={submitTicket} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <input placeholder="姓名*" value={ticketForm.name} onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="联系电话*" value={ticketForm.phone} onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="订单号*" value={ticketForm.orderNo} onChange={(e) => setTicketForm({ ...ticketForm, orderNo: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <select value={ticketForm.issueType} onChange={(e) => setTicketForm({ ...ticketForm, issueType: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
                                {issueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <textarea placeholder="问题描述（选填）" value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} rows={4} style={{ gridColumn: '1/3', padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <div style={{ gridColumn: '1/3', textAlign: 'right' }}>
                                <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#c57237', color: '#fff', fontWeight: 'bold' }}>提交工单</button>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {activeTab === 'install' && (
                    <SectionCard title="预约安装">
                        <form onSubmit={submitInstall} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <input placeholder="姓名*" value={installForm.name} onChange={(e) => setInstallForm({ ...installForm, name: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="联系电话*" value={installForm.phone} onChange={(e) => setInstallForm({ ...installForm, phone: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="所在城市" value={installForm.city} onChange={(e) => setInstallForm({ ...installForm, city: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="详细地址" value={installForm.address} onChange={(e) => setInstallForm({ ...installForm, address: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input type="datetime-local" placeholder="预约时间" value={installForm.scheduleDate} onChange={(e) => setInstallForm({ ...installForm, scheduleDate: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <input placeholder="备注（选填）" value={installForm.message} onChange={(e) => setInstallForm({ ...installForm, message: e.target.value })} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <div style={{ gridColumn: '1/3', textAlign: 'right' }}>
                                <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#c57237', color: '#fff', fontWeight: 'bold' }}>提交预约</button>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {activeTab === 'faq' && (
                    <SectionCard title="常见问题">
                        {loadingFaq ? (
                            <div style={{ color: '#666' }}>加载中...</div>
                        ) : faqs.length === 0 ? (
                            <div style={{ color: '#666' }}>暂时没有常见问题</div>
                        ) : (
                            <div>
                                {faqs.map((f) => (
                                    <div key={f.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Q：{f.q}</div>
                                        <div style={{ color: '#555' }}>A：{f.a}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}

                {activeTab === 'warranty' && (
                    <SectionCard title="质保政策">
                        <ul style={{ lineHeight: 1.9, color: '#555', paddingLeft: 18 }}>
                            <li>主体板材：5年质保；五金件：2年质保；电器：按品牌方政策执行。</li>
                            <li>非人为损坏情况下，提供免费维修服务；人为损坏提供有偿更换。</li>
                            <li>质保范围不含因环境潮湿、暴晒、化学腐蚀等造成的问题。</li>
                            <li>请保留发票及保修卡，作为售后服务凭证。</li>
                        </ul>
                    </SectionCard>
                )}

                {activeTab === 'return' && (
                    <SectionCard title="退换货说明">
                        <ul style={{ lineHeight: 1.9, color: '#555', paddingLeft: 18 }}>
                            <li>签收7日内可申请退换货，需保持商品及包装完好，不影响二次销售。</li>
                            <li>定制类商品非质量问题不支持退换；如存在质量问题，按照国家相关法规处理。</li>
                            <li>退换货产生的运费按照平台及品牌方政策执行。</li>
                            <li>如需帮助，请先提交售后工单，我们将协助处理。</li>
                        </ul>
                    </SectionCard>
                )}

                {activeTab === 'track' && (
                    <SectionCard title="物流查询">
                        <form onSubmit={trackOrder} style={{ display: 'flex', gap: 10 }}>
                            <input placeholder="请输入订单号" value={trackNo} onChange={(e) => setTrackNo(e.target.value)} style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                            <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#c57237', color: '#fff', fontWeight: 'bold' }}>查询</button>
                        </form>
                        {trackLoading && <div style={{ color: '#666', marginTop: 10 }}>查询中...</div>}
                        {trackError && <div style={{ color: '#e64340', marginTop: 10 }}>{trackError}</div>}
                        {trackResult && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ marginBottom: 8, color: '#555' }}>
                                    承运公司：{trackResult.company}　运单号：{trackResult.number}　状态：{trackResult.status}
                                </div>
                                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                                    {(trackResult.events || []).map((ev, idx) => (
                                        <div key={idx} style={{ padding: '10px 6px', borderBottom: idx < trackResult.events.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>{ev.time}</div>
                                            <div style={{ color: '#555', marginTop: 4 }}>{ev.context}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>
                )}

                {activeTab === 'contact' && (
                    <SectionCard title="联系我们">
                        <div style={{ lineHeight: 2, color: '#555' }}>
                            客服热线：400-888-8888（9:00-21:00）<br />
                            企业邮箱：service@smart-home.com<br />
                            售后地址：北京市朝阳区美好路 88 号<br />
                        </div>
                    </SectionCard>
                )}
            </div>
            <FooterSection />
        </div>
    );
};

export default ServiceCenterPage;


