import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/locationCreator.css';

function LocationCreator({ show, onClose }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [category, setCategory] = useState('城市');
    const [coordinates, setCoordinates] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [showJson, setShowJson] = useState(false);

    // 初始化高德地图自动完成插件
    useEffect(() => {
        if (show && window.AMap) {
            // 初始化自动完成
            window.AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch'], function () {
                const searchAutoComplete = new window.AMap.AutoComplete({
                    input: 'place-search',
                });

                // 注册选择事件
                searchAutoComplete.on('select', function (e) {
                    // 获取选中的POI信息
                    const poi = e.poi;
                    if (poi && poi.location) {
                        // 更新经纬度显示
                        setCoordinates(`${poi.location.lng}, ${poi.location.lat}`);
                    }
                });
            });
        }
    }, [show]);

    // 生成JSON按钮处理函数
    const handleGenerateJson = () => {
        // 简单验证
        if (!name) {
            alert(t('creator.alerts.noName'));
            return;
        }
        if (!coordinates) {
            alert(t('creator.alerts.noCoordinates'));
            return;
        }
        if (!description) {
            alert(t('creator.alerts.noDescription'));
            return;
        }
        if (!visitDate) {
            alert(t('creator.alerts.noDate'));
            return;
        }

        // 解析经纬度
        const [lng, lat] = coordinates.split(',').map(coord => parseFloat(coord.trim()));

        // 创建地点对象
        const locationObj = {
            name: name,
            description: description,
            coordinates: [lng, lat],
            visitDate: visitDate,
            category: category,
        };

        // 显示JSON
        setJsonOutput(JSON.stringify(locationObj, null, 2));
        setShowJson(true);

        // 复制到剪贴板
        navigator.clipboard.writeText(JSON.stringify(locationObj, null, 2))
            .then(() => {
                alert(t('creator.alerts.jsonCopied'));
            })
            .catch((err) => {
                console.error(t('creator.alerts.copyError'), err);
            });
    };

    // 关闭时重置状态
    const handleClose = () => {
        setName('');
        setDescription('');
        setVisitDate('');
        setCategory('城市');
        setCoordinates('');
        setJsonOutput('');
        setShowJson(false);
        onClose();
    };

    return (
        <div className={`location-creator-container ${show ? 'active' : ''}`}>
            <div className="location-creator-content">
                <h3 className="creator-title">{t('creator.title')}</h3>

                <div className="form-group">
                    <label htmlFor="place-search">{t('creator.name')}</label>
                    <input
                        id="place-search"
                        type="text"
                        placeholder={t('creator.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="place-description">{t('creator.description')}</label>
                    <textarea
                        id="place-description"
                        placeholder={t('creator.descriptionPlaceholder')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="place-date">{t('creator.date')}</label>
                    <input
                        id="place-date"
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="place-category">{t('creator.category')}</label>
                    <select
                        id="place-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="城市">{t('categories.city')}</option>
                        <option value="自然景观">{t('categories.nature')}</option>
                        <option value="历史遗迹">{t('categories.historical')}</option>
                        <option value="美食">{t('categories.food')}</option>
                        <option value="其他">{t('categories.other')}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="place-lnglat">{t('creator.coordinates')}</label>
                    <input
                        id="place-lnglat"
                        type="text"
                        readOnly
                        value={coordinates}
                        className="readonly-input"
                    />
                </div>

                <div className="editor-hint">
                    <h3 className="hint-title">{t('editor.title')}</h3>
                    <p className="hint-paragraph">{t('editor.step1')}</p>
                    <p className="hint-paragraph">{t('editor.step2')}</p>
                    <p className="hint-paragraph">{t('editor.step3')}</p>
                </div>

                <div className="button-group">
                    <button
                        id="generate-json"
                        className="generate-btn"
                        onClick={handleGenerateJson}
                    >
                        {t('creator.generate')}
                    </button>
                    <button
                        id="close-creator"
                        className="close-btn"
                        onClick={handleClose}
                    >
                        {t('common.close')}
                    </button>
                </div>

                {showJson && (
                    <div className="json-output">
                        <pre>{jsonOutput}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocationCreator;