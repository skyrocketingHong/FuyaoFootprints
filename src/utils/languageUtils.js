// 分类映射表 - 用于翻译保存的数据
export const categoryMapping = {
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

// 翻译分类的函数
export function getLocalizedCategory(category, currentLanguage) {
  const isEnglish = currentLanguage === 'en';

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
}