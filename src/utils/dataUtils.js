// 默认地点数据
const defaultLocationsData = [
    {
        name: "北京",
        description: "中国首都，有长城、故宫等著名景点。",
        coordinates: [116.4074, 39.9042],
        visitDate: "2022-05-10",
        category: "城市",
    },
    {
        name: "上海",
        description: "中国经济中心，有外滩、东方明珠等地标。",
        coordinates: [121.4737, 31.2304],
        visitDate: "2022-06-15",
        category: "城市",
    },
];

// 加载外部JSON数据的函数
export function loadLocationsData() {
    return new Promise((resolve, reject) => {
        try {
            // 尝试加载locations.json文件
            fetch("locations.json")
                .then((response) => {
                    if (!response.ok) {
                        // 如果文件不存在或无法加载，使用默认数据
                        console.log("未找到locations.json文件，使用默认数据");
                        resolve(defaultLocationsData);
                        return;
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data) resolve(data);
                    else resolve(defaultLocationsData);
                })
                .catch((error) => {
                    console.error("加载数据错误:", error);
                    resolve(defaultLocationsData);
                });
        } catch (e) {
            console.error("异常:", e);
            resolve(defaultLocationsData);
        }
    });
}