import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/map.css';

function MapComponent({ locations, selectedLocation, setSelectedLocation, setMapInstance, currentLanguage }) {
    const { t } = useTranslation();
    const mapContainer = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [infoWindows, setInfoWindows] = useState([]);

    // 翻译地点分类
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

    // 初始化地图
    useEffect(() => {
        // 获取当前是否为暗色模式
        const isDarkModeNow = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 根据屏幕宽度计算初始缩放级别
        const getInitialZoom = () => {
            const width = window.innerWidth;
            if (width <= 480) return 3; // 手机屏幕
            if (width <= 768) return 3.5; // 平板竖屏
            if (width <= 1024) return 4; // 平板横屏
            return 4.5; // 桌面
        };

        // 创建地图实例
        if (window.AMap && mapContainer.current) {
            const map = new window.AMap.Map(mapContainer.current, {
                resizeEnable: true,
                zoom: getInitialZoom(),
                center: [104.5, 36.0], // 调整中国中心位置
                viewMode: '3D',
                zooms: [3, 20], // 设置允许的最小缩放级别为3
                mapStyle: isDarkModeNow ? 'amap://styles/darkblue' : 'amap://styles/macaron', // 根据当前夜间模式设置地图样式
            });

            // 设置地图适应性显示
            const resizeMapView = () => {
                const newZoom = getInitialZoom();
                // 只有在未选中地点时才调整视图
                if (!selectedLocation) {
                    map.setZoom(newZoom);
                    map.setCenter([104.5, 36.0]);
                }
            };

            // 监听窗口大小变化，调整地图视图
            window.addEventListener('resize', resizeMapView);

            // 添加地图控件
            if (window.AMap.ToolBar && window.AMap.Scale && window.AMap.MapType) {
                // 添加工具栏控件，放在左上角
                map.addControl(new window.AMap.ToolBar({
                    position: 'LT',
                }));
                // 添加比例尺控件，放在左下角
                map.addControl(new window.AMap.Scale({
                    position: 'LB',
                }));
                // 添加地图类型切换控件，放在右上角
                map.addControl(new window.AMap.MapType({
                    defaultType: 0,
                    position: 'RT',
                    showRoad: false, // 默认不显示路网
                }));
            }

            // 设置地图实例
            setMapInstance(map);

            // 添加标记和信息窗口
            if (locations.length > 0) {
                const newMarkers = [];
                const newInfoWindows = [];

                locations.forEach((location) => {
                    // 创建自定义标记
                    const markerContent = document.createElement('div');
                    markerContent.className = `custom-marker ${location.category === '城市' ? 'city' : 'nature'}`;

                    // 创建标记
                    const marker = new window.AMap.Marker({
                        position: new window.AMap.LngLat(location.coordinates[0], location.coordinates[1]),
                        content: markerContent,
                        offset: new window.AMap.Pixel(-12.5, -12.5),
                        zIndex: 10,
                    });

                    // 创建信息窗口内容
                    const createInfoWindowContent = () => {
                        // 本地化类别名称
                        const localizedCategory = getLocalizedCategory(location.category);

                        // 创建信息窗口内容 - 适配国际化
                        const visitDateLabel = t('location.visitDate');

                        return `
              <div>
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${location.name}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 5px;">${visitDateLabel} ${location.visitDate}</p>
                <p style="font-size: 13px;">${location.description.substring(0, 50)}${location.description.length > 50 ? '...' : ''}</p>
              </div>
            `;
                    };

                    // 创建信息窗口
                    const infoWindow = new window.AMap.InfoWindow({
                        content: createInfoWindowContent(),
                        offset: new window.AMap.Pixel(0, -35),
                        closeWhenClickMap: true,
                    });

                    // 点击标记执行与点击列表项相同的操作
                    marker.on('click', () => {
                        setSelectedLocation(location);

                        // 设置相同的缩放级别和中心点
                        map.setCenter(location.coordinates);
                        map.setZoom(12); // 与列表点击时相同的缩放级别
                    });

                    // 将标记添加到地图
                    marker.setMap(map);

                    newMarkers.push(marker);
                    newInfoWindows.push(infoWindow);
                });

                setMarkers(newMarkers);
                setInfoWindows(newInfoWindows);
            }

            // 清理函数
            return () => {
                window.removeEventListener('resize', resizeMapView);
                if (map) {
                    markers.forEach((marker) => {
                        marker.setMap(null);
                    });
                    map.destroy();
                }
            };
        }
    }, [locations, t]);

    // 当选中地点变化时更新标记和信息窗口
    useEffect(() => {
        if (markers.length > 0 && infoWindows.length > 0 && locations.length > 0) {
            // 先关闭所有信息窗口
            infoWindows.forEach((infoWindow) => {
                infoWindow.close();
            });

            // 重置所有标记样式
            markers.forEach((marker, index) => {
                if (index < locations.length) {
                    const markerContent = marker.getContent();
                    markerContent.className = `custom-marker ${locations[index].category === '城市' ? 'city' : 'nature'}`;
                }
            });

            // 如果有选中的地点，更新对应的标记和信息窗口
            if (selectedLocation) {
                // 查找选中地点在locations数组中的索引
                const selectedIndex = locations.findIndex(loc => loc._id === selectedLocation._id);

                if (selectedIndex !== -1 && selectedIndex < markers.length) {
                    // 更新选中标记的样式
                    const markerContent = markers[selectedIndex].getContent();
                    markerContent.className = `custom-marker ${locations[selectedIndex].category === '城市' ? 'city' : 'nature'} active`;

                    // 显示信息窗口
                    infoWindows[selectedIndex].open(mapContainer.current.map, markers[selectedIndex].getPosition());
                }
            }
        }
    }, [selectedLocation, markers, infoWindows, locations]);

    // 当语言改变时，更新信息窗口内容
    useEffect(() => {
        if (infoWindows.length > 0 && locations.length > 0) {
            infoWindows.forEach((infoWindow, index) => {
                if (index < locations.length) {
                    // 更新信息窗口内容
                    const location = locations[index];

                    // 创建更新后的内容
                    const visitDateLabel = t('location.visitDate');

                    const newContent = `
            <div>
              <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${location.name}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 5px;">${visitDateLabel} ${location.visitDate}</p>
              <p style="font-size: 13px;">${location.description.substring(0, 50)}${location.description.length > 50 ? '...' : ''}</p>
            </div>
          `;

                    infoWindow.setContent(newContent);
                }
            });
        }
    }, [currentLanguage, infoWindows, locations, t]);

    return (
        <div ref={mapContainer} className="map-container" />
    );
}

export default MapComponent;