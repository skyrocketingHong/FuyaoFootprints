import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/languageSelector.css';

function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(i18n.language || 'zh');

    // 语言切换处理函数
    const changeLang = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLang(lang);
        setIsDropdownOpen(false);
    };

    // 在语言变化时更新状态
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setCurrentLang(lng);
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen) {
                const mobileToggle = document.getElementById('mobile-language-toggle');
                const dropdown = document.getElementById('language-dropdown');
                if (mobileToggle && dropdown &&
                    !mobileToggle.contains(event.target) &&
                    !dropdown.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <>
            {/* 桌面端语言选择器 */}
            <div className="desktop-language-selector">
                <button
                    className={currentLang === 'zh' ? 'active' : ''}
                    onClick={() => changeLang('zh')}
                >
                    中文
                </button>
                <button
                    className={currentLang === 'en' ? 'active' : ''}
                    onClick={() => changeLang('en')}
                >
                    English
                </button>
            </div>

            {/* 移动端底部下拉式语言选择器 */}
            <div className="mobile-language-selector">
                <button
                    id="mobile-language-toggle"
                    className={isDropdownOpen ? 'active' : ''}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span id="current-language">
                        {currentLang === 'zh' ? '中文' : 'English'}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-chevron-up"
                    >
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </button>
                <div
                    id="language-dropdown"
                    className="language-dropdown"
                    style={{ display: isDropdownOpen ? 'flex' : 'none' }}
                >
                    <a
                        href="#"
                        data-lang="zh"
                        className={currentLang === 'zh' ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); changeLang('zh'); }}
                    >
                        中文
                    </a>
                    <a
                        href="#"
                        data-lang="en"
                        className={currentLang === 'en' ? 'active' : ''}
                        onClick={(e) => { e.preventDefault(); changeLang('en'); }}
                    >
                        English
                    </a>
                </div>
            </div>
        </>
    );
}

export default LanguageSelector;