import React from 'react';
import { Link } from 'react-router-dom';

const FooterSection = () => {
    return (
        <footer className="footer-container">
            <style>
                {`
                    /* Footer容器样式 */
                    .footer-container {
                        background-color: #fff; /* 白色背景 */
                        padding: 20px 20px; /* 内边距 */
                    }
                    
                    /* Footer内容容器 */
                    .footer-content {
                        width: 1350px; /* 固定宽度 */
                        margin: 0 auto; /* 水平居中 */
                    }
                    
                    /* 顶部服务信息条容器 */
                    .service-bar {
                        display: flex; /* 弹性布局 */
                        justify-content: center; /* 水平居中 */
                        align-items: center; /* 垂直居中 */
                        gap: 90px; /* 子元素间距 */
                        border-bottom: 1px solid #e5e5e5; /* 底部边框 */
                        padding-bottom: 15px; /* 底部内边距 */
                        margin-bottom: 20px; /* 底部外边距 */
                    }
                    
                    /* 服务项容器 */
                    .service-item {
                        display: flex; /* 弹性布局 */
                        align-items: center; /* 垂直居中 */
                        gap: 8px; /* 子元素间距 */
                        cursor: pointer; /* 鼠标指针样式 */
                    }
                    
                    /* 服务项悬停效果 */
                    .service-item:hover svg,
                    .service-item:hover span {
                        color: #E68B40FF !important; /* 悬停时文字颜色 */
                    }
                    
                    /* 服务图标样式 */
                    .service-icon {
                        color: #666; /* 图标颜色 */
                        transition: color 0.3s ease; /* 颜色过渡效果 */
                    }
                    
                    /* 服务文字样式 */
                    .service-text {
                        color: #666; /* 文字颜色 */
                        font-size: 20px; /* 字体大小 */
                        transition: color 0.3s ease; /* 颜色过渡效果 */
                    }
                    
                    /* 主要导航区域容器 */
                    .main-navigation {
                        display: flex; /* 弹性布局 */
                        flex-wrap: wrap; /* 换行 */
                        justify-content: center; /* 水平居中 */
                        margin-bottom: 20px; /* 底部外边距 */
                        padding: 20px 50px; /* 内边距 */
                        font-size: 20px; /* 字体大小 */
                    }
                    
                    /* 导航列容器 */
                    .nav-column {
                        flex: 1; /* 弹性增长 */
                        min-width: 150px; /* 最小宽度 */
                    }
                    
                    /* 新手指南列 */
                    .nav-column.guide {
                        width: 100px; /* 固定宽度 */
                    }
                    
                    /* 导航标题样式 */
                    .nav-title {
                        font-weight: bold; /* 粗体 */
                        margin-bottom: 15px; /* 底部外边距 */
                        color: #333; /* 文字颜色 */
                    }
                    
                    /* 导航列表样式 */
                    .nav-list {
                        list-style: none; /* 无列表样式 */
                        padding: 0; /* 无内边距 */
                        margin: 0; /* 无外边距 */
                    }
                    
                    /* 导航列表项样式 */
                    .nav-item {
                        display: block; /* 块级元素 */
                        margin-bottom: 8px; /* 底部外边距 */
                    }
                    
                    /* 导航链接样式 */
                    .ddh-nav-link {
                        color: #666;
                        text-decoration: none;
                        transition: color 0.3s ease;
                    }

                    .ddh-nav-link:hover {
                      color: #333;
                    }

                    .footer-button {
                      background: none;
                      border: none;
                      padding: 0;
                      font: inherit;
                      cursor: pointer;
                      color: #666;
                      text-decoration: none;
                      transition: color 0.3s ease;
                      text-align: left;
                    }

                    .footer-button:hover {
                      color: #333;
                    }
                    
                    /* 客服信息列 */
                    .nav-column.contact {
                        text-align: left; /* 文字左对齐 */
                        min-width: 200px; /* 最小宽度 */
                    }
                    
                    /* 客服信息容器 */
                    .contact-info {
                        margin-bottom: 15px; /* 底部外边距 */
                        line-height: 1.5; /* 行高 */
                    }
                    
                    /* 客服电话样式 */
                    .contact-phone {
                        font-size: 22px; /* 字体大小 */
                        font-weight: bold; /* 粗体 */
                        color: #e64340; /* 文字颜色 */
                    }
                    
                    /* 客服时间样式 */
                    .contact-time {
                        font-size: 16px; /* 字体大小 */
                        color: #666; /* 文字颜色 */
                    }
                    
                    /* 客服描述样式 */
                    .contact-description {
                        font-size: 16px; /* 字体大小 */
                        color: #666; /* 文字颜色 */
                        line-height: 1.5; /* 行高 */
                    }
                    
                    /* 客服按钮样式 */
                    .contact-button {
                        background-color: #e64340; /* 背景颜色 */
                        color: white; /* 文字颜色 */
                        border: none; /* 无边框 */
                        padding: 12px 24px; /* 内边距 */
                        cursor: pointer; /* 鼠标指针样式 */
                        font-size: 16px; /* 字体大小 */
                        margin-top: 12px; /* 顶部外边距 */
                    }
                    
                    /* 底部版权信息容器 */
                    .copyright-section {
                        border-top: 1px solid #e5e5e5; /* 顶部边框 */
                        padding-top: 15px; /* 顶部内边距 */
                        padding-bottom: 15px; /* 底部内边距 */
                        text-align: left; /* 文字左对齐 */
                        font-size: 15px; /* 字体大小 */
                        color: #666; /* 文字颜色 */
                        padding-left: 10px; /* 左侧内边距 */
                    }
                    
                    /* Logo和品牌信息容器 */
                    .logo-brand-container {
                        display: flex; /* 弹性布局 */
                        justify-content: flex-start; /* 左对齐 */
                        align-items: center; /* 垂直居中 */
                        gap: 10px; /* 子元素间距 */
                    }
                    
                    /* Logo图片样式 */
                    .footer-logo {
                        width: 60px; /* 宽度 */
                        height: 60px; /* 高度 */
                    }
                    
                    /* 品牌信息文字样式 */
                    .brand-info {
                        font-size: 23px; /* 字体大小 */
                    }
                    
                    /* 品牌链接样式 */
                    .brand-link {
                        text-decoration: none; /* 无下划线 */
                        color: #666666; /* 文字颜色 */
                    }
                    
                    /* 分隔符样式 */
                    .separator {
                        margin: 0 10px; /* 左右外边距 */
                        color: #ccc; /* 文字颜色 */
                    }
                    
                    /* 备案信息样式 */
                    .record-info {
                        margin-bottom: 16px; /* 底部外边距 */
                        line-height: 1.5; /* 行高 */
                        padding-left: 65px; /* 左侧内边距 */
                    }
                    
                    /* 认证图片容器 */
                    .certification-container {
                        display: flex; /* 弹性布局 */
                        justify-content: flex-start; /* 左对齐 */
                        align-items: center; /* 垂直居中 */
                        gap: 10px; /* 子元素间距 */
                        margin-bottom: 16px; /* 底部外边距 */
                        padding-left: 65px; /* 左侧内边距 */
                    }
                    
                    /* 认证图片样式 */
                    .certification-image {
                        width: 120px; /* 宽度 */
                        height: 40px; /* 高度 */
                    }
                    
                    /* 品牌标语样式 */
                    .brand-slogan {
                        color: #999; /* 文字颜色 */
                        font-style: italic; /* 斜体 */
                        font-size: 24px; /* 字体大小 */
                        text-align: center; /* 文字居中 */
                    }
                `}
            </style>
            
            <div className="footer-content">
                {/* 顶部服务信息条 */}
                <div className="service-bar">
                    {/* 预约维修服务 */}
                    <div
                        className="service-item"
                        onClick={() => alert('跳转到预约维修服务页面')}
                    >
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                             className="service-icon">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H11C8.79086 15 7 16.7909 7 19V21"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="service-text">预约维修服务</span>
                    </div>

                    {/* 7天无理由退货 */}
                    <div
                        className="service-item"
                        onClick={() => alert('跳转到7天无理由退货页面')}
                    >
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                             className="service-icon">
                            <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <span className="service-text">7天无理由退货</span>
                    </div>

                    {/* 15天免费换货 */}
                    <div
                        className="service-item"
                        onClick={() => alert('跳转到15天免费换货页面')}
                    >
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                             className="service-icon">
                            <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <span className="service-text">15天免费换货</span>
                    </div>

                    {/* 满69包邮 */}
                    <div
                        className="service-item"
                        onClick={() => alert('跳转到满69包邮页面')}
                    >
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                             className="service-icon">
                            <path d="M12 2V4H8V6H6V10H4V14H6V16H8V18H12V20H16V18H18V16H20V14H18V10H16V6H14V4H12V2Z"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 18L12 16L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <span className="service-text">满69包邮</span>
                    </div>

                    {/* 1100余家售后网点 */}
                    <div
                        className="service-item"
                        onClick={() => alert('跳转到售后网点页面')}
                    >
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                             className="service-icon">
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9C5 10.74 5.8 12.28 7 13.35L12 17L17 13.35C18.2 12.28 19 10.74 19 9C19 5.13 15.87 2 12 2Z"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="service-text">1100余家售后网点</span>
                    </div>
                </div>

                {/* 主要导航区域 */}
                <div className="main-navigation">
                    {/* 新手指南 */}
                    <div className="nav-column guide">
                        <h4 className="nav-title">新手指南</h4>
                        <ul className="nav-list">
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">购物流程</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">会员介绍</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">常见问题</button></li>
                        </ul>
                    </div>

                    {/* 配送方式 */}
                    <div className="nav-column">
                        <h4 className="nav-title">配送方式</h4>
                        <ul className="nav-list">
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">配送范围</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">运费标准</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">验货签收</button></li>
                        </ul>
                    </div>

                    {/* 售后服务 */}
                    <div className="nav-column">
                        <h4 className="nav-title">售后服务</h4>
                        <ul className="nav-list">
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">退换货政策</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">维修服务</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">安装服务</button></li>
                        </ul>
                    </div>

                    {/* 关于我们 */}
                    <div className="nav-column">
                        <h4 className="nav-title">关于我们</h4>
                        <ul className="nav-list">
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">公司介绍</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">联系我们</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">加入我们</button></li>
                        </ul>
                    </div>

                    {/* 关注我们 */}
                    <div className="nav-column">
                        <h4 className="nav-title">关注我们</h4>
                        <ul className="nav-list">
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">新浪微博</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">官方微信</button></li>
                            <li className="nav-item"><button type="button" className="ddh-nav-link footer-button">联系客服</button></li>
                        </ul>
                    </div>

                    {/* 客服电话和人工客服按钮 */}
                    <div className="nav-column contact">
                        <div className="contact-info">
                            <div className="contact-phone">400-888-9999</div>
                            <div className="contact-time">8:00-18:00 (全国免费)</div>
                            <button className="contact-button">
                                人工客服
                            </button>
                        </div>
                        <div className="contact-info">
                            <div className="contact-phone">400-666-7777</div>
                            <div className="contact-time">8:00-18:00 (全国免费)</div>
                            <div className="contact-description">
                                适用于：全屋定制家具、地板瓷砖、门窗五金、灯具照明、软装布艺等<br/>
                                服务覆盖：全国主要城市，支持上门测量、设计咨询、安装指导
                            </div>
                            <button className="contact-button">
                                人工客服
                            </button>
                        </div>
                    </div>
                </div>

                {/* 底部版权信息 */}
                <div className="copyright-section">
                    <div className="logo-brand-container">
                        <img src="/images/logo.png" alt="Logo" className="footer-logo"/>
                        <span className="brand-info">
                            筑家智选
                            <span className="separator">|</span>
                            <Link to="/custom" className="brand-link">全屋定制</Link>
                            <span className="separator">|</span>
                            <Link to="/designers" className="brand-link">设计师</Link>
                            <span className="separator">|</span>
                            <Link to="/stores" className="brand-link">线下门店</Link>
                            <span className="separator">|</span>
                            <Link to="/service" className="brand-link">服务中心</Link>
                            <span className="separator">|</span>
                            <Link to="/community" className="brand-link">社区/灵感</Link>
                        </span>
                    </div>
                    <div className="record-info">
                        © 筑家智选 京ICP证110507号 京ICP备1004444号 京公网安备11010802020134号<br/>
                        （京）网械平台备字（2018）第00005号
                        药品医疗器械网络信息服务备案（京）网药械信息备字（2024）第00478号<br/>
                        增值电信业务经营许可证编号：京B2-20190851 网络食品经营备案 京食药网食备202010048<br/>
                        违法和不良信息举报电话：400-888-9999 和知识产权侵权投诉<br/>
                        本网站所列数据，除特殊说明，所有数据均出自我司实验室测试
                    </div>
                    <div className="certification-container">
                        <img src="/images/certification1.png" alt="认证1" className="certification-image"/>
                        <img src="/images/certification2.png" alt="认证2" className="certification-image"/>
                        <img src="/images/certification3.png" alt="认证3" className="certification-image"/>
                        <img src="/images/certification4.png" alt="认证4" className="certification-image"/>
                    </div>
                    <div className="brand-slogan">
                        让每一个家都拥有品质与温度
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
