import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MapComponent from "./MapComponent";
import LocationList from "./LocationList";
import LocationCreator from "./LocationCreator";
import LanguageSelector from "./LanguageSelector";
import { loadLocationsData } from "../utils/dataUtils";
import "../styles/app.css";
import "../styles/icon-moe.css";

function App() {
    const { t, i18n } = useTranslation();
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [activeCategory, setActiveCategory] = useState(t("common.all"));
    const [activeYear, setActiveYear] = useState(t("common.all"));
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isListVisible, setIsListVisible] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "zh");
    const [showCreator, setShowCreator] = useState(false);

    // 添加固定的页脚
    useEffect(() => {
        const footer = document.createElement("footer");
        footer.setAttribute("data-i18n", "footer.copyright");
        footer.innerHTML = t("footer.copyright");
        document.body.appendChild(footer);

        // 返回清理函数
        return () => {
            if (document.body.contains(footer)) {
                document.body.removeChild(footer);
            }
        };
    }, [t]);

    // 语言变化监听
    useEffect(() => {
        const handleLanguageChange = function (lng) {
            setCurrentLanguage(lng);
            setActiveCategory(t("common.all"));
            setActiveYear(t("common.all"));
        };

        i18n.on("languageChanged", handleLanguageChange);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, [t, i18n]);

    // 设置默认列表显示状态 - 桌面端默认显示，移动端默认折叠
    useEffect(() => {
        const updateListVisibility = () => {
            if (window.innerWidth <= 1024) {
                setIsListVisible(false);
            } else {
                setIsListVisible(true);
            }
        };

        // 初始化时设置
        updateListVisibility();

        // 在窗口大小变化时重新设置
        window.addEventListener("resize", updateListVisibility);

        return () => {
            window.removeEventListener("resize", updateListVisibility);
        };
    }, []);

    // 加载地点数据
    useEffect(() => {
        setIsLoading(true);
        loadLocationsData()
            .then((data) => {
                // 为每个地点添加内部ID（基于数组索引）
                const locationsWithIds = data.map((location, index) => ({
                    ...location,
                    _id: index + 1, // 内部ID，只用于React key和选择
                }));
                setLocations(locationsWithIds);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("加载地点数据失败:", error);
                setIsLoading(false);
            });
    }, []);

    // 检测系统颜色模式并初始化状态
    useEffect(() => {
        // 检测当前系统是否为暗色模式
        const darkModeMediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        // 设置初始状态
        setIsDarkMode(darkModeMediaQuery.matches);

        // 监听系统颜色模式变化
        const handleDarkModeChange = (e) => {
            setIsDarkMode(e.matches);

            // 如果地图已经初始化，立即更新地图样式
            if (mapInstance) {
                mapInstance.setMapStyle(
                    e.matches ? "amap://styles/darkblue" : "amap://styles/macaron"
                );
            }
        };

        // 添加监听器
        darkModeMediaQuery.addEventListener("change", handleDarkModeChange);

        // 清理函数
        return () => {
            darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
        };
    }, [mapInstance]);

    // 获取初始缩放级别的函数
    const getInitialZoom = () => {
        const width = window.innerWidth;
        if (width <= 480) return 3; // 手机屏幕
        if (width <= 768) return 3.5; // 平板竖屏
        if (width <= 1024) return 4; // 平板横屏
        return 4.5; // 桌面
    };

    // 选择地点并将地图中心移动到该地点
    const selectLocation = (location) => {
        setSelectedLocation(location);
        if (mapInstance && location) {
            mapInstance.setCenter(location.coordinates);
            mapInstance.setZoom(12); // 增加缩放级别以便更好地查看

            // 在移动设备上选择地点后自动隐藏列表
            if (window.innerWidth <= 1024) {
                setIsListVisible(false);
            }
        }
    };

    // 重置地图视图，显示所有地点
    const showAllLocations = () => {
        setSelectedLocation(null);
        if (mapInstance) {
            const initialZoom = getInitialZoom();
            mapInstance.setZoom(initialZoom);
            mapInstance.setCenter([104.5, 36.0]);
            console.log("重置地图视图，缩放级别: " + initialZoom);
        }
    };

    // 阻止列表展开时的页面滚动
    useEffect(() => {
        // 定义一个函数来处理列表变化
        const handleListToggle = () => {
            // 当列表展开且在移动设备上时，阻止页面滚动
            if (isListVisible && window.innerWidth <= 1024) {
                document.body.style.overflow = "hidden";

                // 使用 requestAnimationFrame 确保 DOM 已更新
                requestAnimationFrame(() => {
                    // 确保展开的列表不会被固定footer遮挡
                    const listContent = document.querySelector(".list-content-expanded");
                    if (listContent) {
                        const footerHeight = 40; // footer高度
                        const windowHeight = window.innerHeight;
                        const listTop = listContent.getBoundingClientRect().top;

                        // 计算列表可用高度 - 减少额外间距
                        const availableHeight = windowHeight - listTop - footerHeight - 5; // 只预留5px的安全边距

                        // 同时更新实际列表容器的高度
                        const listContainer = listContent.querySelector(".location-list");
                        if (listContainer) {
                            // 获取所有筛选器和标题的实际高度
                            const listHeader = listContent.querySelector(".list-header");
                            const filterContainers =
                                listContent.querySelectorAll(".px-4.pb-2");

                            // 计算精确的其他元素总高度
                            let otherElementsHeight = listHeader
                                ? listHeader.offsetHeight
                                : 56;

                            // 遍历所有筛选器容器，获取实际高度
                            filterContainers.forEach((container) => {
                                otherElementsHeight += container.offsetHeight;
                            });

                            // 额外添加一点边距
                            otherElementsHeight += 10;

                            // 设置列表容器高度为可用高度减去其他元素的实际高度
                            listContainer.style.maxHeight = `${availableHeight - otherElementsHeight
                                }px`;
                        }
                    }
                });
            } else {
                // 否则恢复正常滚动
                document.body.style.overflow = "";
            }
        };

        // 初始执行一次
        handleListToggle();

        // 添加窗口大小变化时的处理
        window.addEventListener("resize", handleListToggle);

        return () => {
            // 清理：确保组件卸载时恢复滚动并移除监听器
            document.body.style.overflow = "";
            window.removeEventListener("resize", handleListToggle);
        };
    }, [isListVisible]);

    return (
        <div className="main-container">
            <h1 className="text-3xl font-bold text-center mb-4 text-indigo-800">
                {t("app.title")}
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {currentLanguage === "zh"
                                ? "正在加载地点数据..."
                                : "Loading location data..."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:flex-row flex-col">
                    <LocationList
                        locations={locations}
                        selectedLocation={selectedLocation}
                        selectLocation={selectLocation}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        activeYear={activeYear}
                        setActiveYear={setActiveYear}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        isListVisible={isListVisible}
                        setIsListVisible={setIsListVisible}
                        currentLanguage={currentLanguage}
                    />

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <MapComponent
                                locations={locations}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={selectLocation}
                                setMapInstance={setMapInstance}
                                currentLanguage={currentLanguage}
                            />

                            {selectedLocation ? (
                                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-2xl font-bold text-indigo-700">
                                            {selectedLocation.name}
                                        </h2>
                                        <button
                                            onClick={showAllLocations}
                                            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors show-all-btn"
                                        >
                                            {t("common.showAllLocations")}
                                        </button>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                        <span>
                                            {t("location.visitDate")}
                                            {selectedLocation.visitDate}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-gray-700">
                                        {selectedLocation.description}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
                                    <p className="text-gray-600">{t("common.selectFromList")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 浮动按钮 */}
            <button
                id="show-creator"
                className="show-creator-btn"
                onClick={() => setShowCreator(true)}
            >
                +
            </button>

            {/* 工具组件 */}
            <LocationCreator
                show={showCreator}
                onClose={() => setShowCreator(false)}
            />
            <LanguageSelector />
        </div>
    );
}

export default App;
