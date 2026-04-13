// 恒微足道采购审批系统 - 数据层
const DATA = {
    // 16家门店列表
    stores: [
        { id: 1, code: "NG-ZD", name: "南关总店" },
        { id: 2, code: "NG-FD", name: "南关分店" },
        { id: 3, code: "LX-ZTJ", name: "临夏中天健店" },
        { id: 4, code: "YT", name: "雁滩店" },
        { id: 5, code: "AN-YQ", name: "安宁涌泉店" },
        { id: 6, code: "LX-YW", name: "临夏义乌店" },
        { id: 7, code: "XZ", name: "西站店" },
        { id: 8, code: "LT", name: "临洮店" },
        { id: 9, code: "AN-LJB", name: "安宁刘家堡店" },
        { id: 10, code: "XG", name: "西固店" },
        { id: 11, code: "WH", name: "万辉店" },
        { id: 12, code: "HP", name: "和平店" },
        { id: 13, code: "XQ", name: "新区店" },
        { id: 14, code: "DG", name: "东岗店" },
        { id: 15, code: "YZ-LZP", name: "榆中六中坡店" },
        { id: 16, code: "YZ-HG", name: "榆中华光店" }
    ],

    // 商品库 - 6大类
    products: {
        "蔬菜类": [
            { id: "veg001", name: "上海青", unit: "斤", price: 1.2 },
            { id: "veg002", name: "生菜", unit: "斤", price: 1.5 },
            { id: "veg003", name: "西红柿", unit: "斤", price: 2.2 },
            { id: "veg004", name: "黄瓜", unit: "斤", price: 1.8 },
            { id: "veg005", name: "土豆", unit: "斤", price: 1.0 },
            { id: "veg006", name: "青椒", unit: "斤", price: 2.5 },
            { id: "veg007", name: "葱姜蒜组合", unit: "份", price: 3.0 },
            { id: "veg008", name: "香菜", unit: "斤", price: 4.0 }
        ],
        "面食类": [
            { id: "noodle001", name: "鲜面条", unit: "斤", price: 2.5 },
            { id: "noodle002", name: "饺子皮", unit: "斤", price: 3.0 },
            { id: "noodle003", name: "面粉", unit: "斤", price: 2.2 },
            { id: "noodle004", name: "大米", unit: "斤", price: 2.8 },
            { id: "noodle005", name: "馒头", unit: "个", price: 0.5 },
            { id: "noodle006", name: "粉条", unit: "斤", price: 4.0 },
            { id: "noodle007", name: "方便面", unit: "袋", price: 2.0 }
        ],
        "鲜肉类": [
            { id: "meat001", name: "五花肉", unit: "斤", price: 13.0 },
            { id: "meat002", name: "前腿肉", unit: "斤", price: 12.0 },
            { id: "meat003", name: "牛肉", unit: "斤", price: 38.0 },
            { id: "meat004", name: "鸡胸肉", unit: "斤", price: 9.0 },
            { id: "meat005", name: "鸡腿", unit: "斤", price: 7.0 },
            { id: "meat006", name: "鸡蛋", unit: "斤", price: 5.5 }
        ],
        "调料类": [
            { id: "spice001", name: "食用盐", unit: "袋", price: 1.5 },
            { id: "spice002", name: "生抽", unit: "瓶", price: 8.0 },
            { id: "spice003", name: "陈醋", unit: "瓶", price: 7.0 },
            { id: "spice004", name: "鸡精", unit: "袋", price: 10.0 },
            { id: "spice005", name: "食用油", unit: "升", price: 9.5 },
            { id: "spice006", name: "火锅底料", unit: "袋", price: 15.0 },
            { id: "spice007", name: "辣椒面", unit: "斤", price: 12.0 },
            { id: "spice008", name: "花椒", unit: "斤", price: 25.0 }
        ],
        "干货类": [
            { id: "dry001", name: "干香菇", unit: "斤", price: 35.0 },
            { id: "dry002", name: "干木耳", unit: "斤", price: 28.0 },
            { id: "dry003", name: "干黄花菜", unit: "斤", price: 22.0 },
            { id: "dry004", name: "干豆角", unit: "斤", price: 18.0 },
            { id: "dry005", name: "腐竹", unit: "斤", price: 12.0 }
        ],
        "餐饮耗材类": [
            { id: "sup001", name: "餐盒（大）", unit: "个", price: 0.8 },
            { id: "sup002", name: "餐盒（小）", unit: "个", price: 0.5 },
            { id: "sup003", name: "一次性筷子", unit: "包", price: 3.0 },
            { id: "sup004", name: "小包纸巾", unit: "包", price: 1.5 },
            { id: "sup005", name: "保鲜膜", unit: "卷", price: 8.0 },
            { id: "sup006", name: "大垃圾袋", unit: "卷", price: 12.0 }
        ]
    },

    // 账号列表
    accounts: {
        // 管理员账号
        admin: [
            { username: "18219966272", password: "Lrx6688@", name: "总部采购管理员" }
        ],
        // 门店账号（账号=店名拼音首字母，密码=首字母+123456）
        store: [
            { username: "NGZD", password: "NGZD123456", storeId: 1, name: "南关总店店长" },
            { username: "NGFD", password: "NGFD123456", storeId: 2, name: "南关分店店长" },
            { username: "LXZTJ", password: "LXZTJ123456", storeId: 3, name: "临夏中天健店店长" },
            { username: "YT", password: "YT123456", storeId: 4, name: "雁滩店店长" },
            { username: "ANYQ", password: "ANYQ123456", storeId: 5, name: "安宁涌泉店店长" },
            { username: "LXYW", password: "LXYW123456", storeId: 6, name: "临夏义乌店店长" },
            { username: "XZ", password: "XZ123456", storeId: 7, name: "西站店店长" },
            { username: "LT", password: "LT123456", storeId: 8, name: "临洮店店长" },
            { username: "ANLJB", password: "ANLJB123456", storeId: 9, name: "安宁刘家堡店店长" },
            { username: "XG", password: "XG123456", storeId: 10, name: "西固店店长" },
            { username: "WH", password: "WH123456", storeId: 11, name: "万辉店店长" },
            { username: "HP", password: "HP123456", storeId: 12, name: "和平店店长" },
            { username: "XQ", password: "XQ123456", storeId: 13, name: "新区店店长" },
            { username: "DG", password: "DG123456", storeId: 14, name: "东岗店店长" },
            { username: "YZLZP", password: "YZLZP123456", storeId: 15, name: "榆中六中坡店店长" },
            { username: "YZHG", password: "YZHG123456", storeId: 16, name: "榆中华光店店长" }
        ]
    },

    // 订单状态
    orderStatus: {
        pending: "待审核",
        approved: "已通过",
        rejected: "已驳回",
        purchased: "已采购"
    }
}

// 本地存储工具
const Storage = {
    get(key, defaultValue = null) {
        const val = localStorage.getItem(key)
        return val ? JSON.parse(val) : defaultValue
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

// 初始化数据
if (!Storage.get('orders')) Storage.set('orders', [])
if (!Storage.get('currentUser')) Storage.set('currentUser', null)