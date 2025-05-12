import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/locationList.css';

function LocationList({
    locations,
    selectedLocation,
    selectLocation,
    activeCategory,
    setActiveCategory,
    activeYear,
    setActiveYear,
    searchTerm,
    setSearchTerm,
    isListVisible,
    setIsListVisible,
    currentLanguage
}) {
    const { t } = useTranslation();

    // 翻译分类
    const getLocalizedCategory = (category) => {
        const isEnglish = currentLanguage === 'en';

        // 分类映射
        const categoryMapping = {
            zh: {
                city: "城市",
                nature: "自然景观",
                historical: "历史遗迹",
                food: "美食",
                other: "其他",
            },
            en: {
                "城市": "city",
                "自然景观": "nature",
                "历史遗迹": "historical",
                "美食": "food",
                "其他": "other",
            }
        };

        // 如果是英文，需要将中文分类转为英文
        if (isEnglish) {
            // 使用映射表或根据分类名直接翻译
            return categoryMapping.en[category] || category;
        }

        // 如果是中文但保存的是英文分类名，需要转换
        if (categoryMapping.zh[category]) {
            return categoryMapping.zh[category];
        }

        // 否则原样返回
        return category;
    };

    // 获取并翻译分类列表
    const categories = useMemo(() => {
        // 先获取所有不同的分类
        const uniqueCategories = [...new Set(locations.map(loc => loc.category))];

        // 添加"全部"作为第一个选项
        const allOption = t('common.all');

        // 如果当前是英文，翻译每个中文分类
        if (currentLanguage === 'en') {
            const translatedCategories = uniqueCategories.map(cat => getLocalizedCategory(cat));
            return [allOption, ...translatedCategories];
        }

        // 否则返回原始分类
        return [allOption, ...uniqueCategories];
    }, [locations, currentLanguage, t]); // 添加t依赖以确保在语言变化时重新计算

    // 提取所有年份
    const years = useMemo(() => {
        const yearsSet = new Set(
            locations.map(loc => {
                // 从日期字符串中提取年份 (格式如: "2022-05-10")
                return loc.visitDate.split('-')[0];
            })
        );

        // 将年份转换为数组并排序（降序）
        const yearsArray = Array.from(yearsSet).sort((a, b) => b - a);

        // 在前面添加"全部"选项
        return [t('common.all'), ...yearsArray];
    }, [locations, t]); // 使用t确保在语言变化时重新计算

    // 过滤地点
    const filteredLocations = useMemo(() => {
        return locations.filter(location => {
            // 类别匹配逻辑 - 考虑语言切换情况
            let matchesCategory = false;

            if (activeCategory === t('common.all')) {
                // 如果是"全部"分类，则始终匹配
                matchesCategory = true;
            } else if (currentLanguage === 'en') {
                // 英文UI下，将地点中文分类转为英文进行比较
                const localizedLocationCategory = getLocalizedCategory(location.category);
                matchesCategory = localizedLocationCategory === activeCategory;
            } else {
                // 中文UI下，直接比较中文分类
                matchesCategory = location.category === activeCategory;
            }

            // 年份和搜索匹配逻辑
            const matchesYear = activeYear === t('common.all') || location.visitDate.split('-')[0] === activeYear;
            const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesCategory && matchesYear && matchesSearch;
        });
    }, [locations, activeCategory, activeYear, searchTerm, currentLanguage, t]);

    return (
        <div className="lg:col-span-1 list-column">
            {/* 列表内容容器 */}
            <div className={`list-content ${isListVisible ? 'list-content-expanded' : 'list-content-collapsed'}`}>
                {/* 仅在移动端显示的列表标题和折叠按钮 */}
                <div
                    className="list-header lg:hidden"
                    onClick={() => setIsListVisible(!isListVisible)}
                    style={{ height: '56px' }}
                >
                    <h3 className="font-bold text-lg">{t('list.title')}</h3>
                    <div className="text-indigo-600">
                        {isListVisible ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        )}
                    </div>
                </div>

                {/* 桌面端显示的列表标题 */}
                <div className="hidden lg:block px-4 pt-4 pb-2">
                    <h3 className="font-bold text-lg">{t('list.title')}</h3>
                </div>

                {/* 列表内容 - 在桌面端始终显示，在移动端根据isListVisible控制显示 */}
                {(isListVisible || window.innerWidth > 1024) && (
                    <>
                        {/* 年份和类别筛选区域优化 - 更紧凑的布局 */}
                        <div className="px-3 pb-1 pt-2">
                            {/* 组合筛选器标题和内容到一行 */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="text-xs font-medium text-gray-700 mr-1">
                                    {t('common.filter')}:
                                </h4>

                                {/* 类别筛选按钮 */}
                                <div className="inline-flex flex-wrap gap-1">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            className={`px-2 py-0.5 rounded-full text-xs filter-button ${activeCategory === category
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 年份筛选区域 */}
                            <div className="flex flex-wrap items-center gap-1 mb-2">
                                <h4 className="text-xs font-medium text-gray-700 mr-1">
                                    {t('common.year')}:
                                </h4>
                                <div className="inline-flex flex-wrap gap-1">
                                    {years.map((year) => (
                                        <button
                                            key={year}
                                            className={`px-2 py-0.5 rounded-full text-xs filter-button ${activeYear === year
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setActiveYear(year)}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 筛选统计信息 - 更紧凑 */}
                        <div className="px-3 py-1 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                    {t('list.stats', { count: filteredLocations.length })}
                                    {filteredLocations.length !== locations.length &&
                                        t('list.statsFiltered', { total: locations.length })}
                                </span>
                                {(activeCategory !== t('common.all') ||
                                    activeYear !== t('common.all') ||
                                    searchTerm) && (
                                        <button
                                            className="text-xs text-indigo-600 hover:text-indigo-800 clear-filter-btn"
                                            onClick={() => {
                                                setActiveCategory(t('common.all'));
                                                setActiveYear(t('common.all'));
                                                setSearchTerm('');
                                            }}
                                        >
                                            {t('common.clearFilter')}
                                        </button>
                                    )}
                            </div>
                        </div>

                        <div className="location-list">
                            {filteredLocations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filteredLocations.map((location) => (
                                        <div
                                            key={location._id}
                                            className={`location-card p-2 rounded-md border border-gray-200 cursor-pointer ${selectedLocation && selectedLocation._id === location._id ? 'active' : ''
                                                }`}
                                            onClick={() => selectLocation(location)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-base leading-tight">
                                                        {location.name}
                                                    </h3>
                                                    <div className="text-xs text-gray-600">
                                                        {location.visitDate}
                                                    </div>
                                                </div>
                                                <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                                                    {currentLanguage === 'en'
                                                        ? getLocalizedCategory(location.category)
                                                        : location.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    {t('list.noLocations')}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LocationList;