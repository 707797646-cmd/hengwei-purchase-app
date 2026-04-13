// 恒微足道采购审批系统 - 核心逻辑 v2
var App = {
    currentPage: 'login',
    currentUser: null,
    cart: {},
    selectedCategory: '蔬菜类',

    init: function() {
        this.currentUser = Storage.get('currentUser');
        if (this.currentUser) {
            var page = this.currentUser.role === 'admin' ? 'admin-dashboard' : 'store-dashboard';
            this.goToPage(page);
        } else {
            this.renderLogin();
        }
    },

    goToPage: function(page, params) {
        this.currentPage = page;
        var methodName = 'render' + page.split('-').map(function(w, i) {
            return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1);
        }).join('');
        if (this[methodName]) {
            this[methodName](params);
        }
    },

    renderLogin: function() {
        document.body.innerHTML = '<div style="padding:60px 20px 20px;max-width:480px;margin:0 auto;text-align:center">' +
            '<div style="margin-bottom:40px">' +
            '<div style="font-size:48px;margin-bottom:10px">GREEN</div>' +
            '<h1 style="color:#2e7d32;font-size:26px;margin-bottom:6px">恒微足道</h1>' +
            '<p style="color:#666;font-size:15px">16店采购审批系统</p></div>' +
            '<div class="card" style="text-align:left">' +
            '<div class="form-group"><label>账号</label>' +
            '<input type="text" id="username" placeholder="输入账号" autocomplete="off"></div>' +
            '<div class="form-group"><label>密码</label>' +
            '<input type="password" id="password" placeholder="输入密码"></div>' +
            '<button class="btn btn-primary" onclick="App.login()">登 录</button>' +
            '<div style="margin-top:20px;padding:15px;background:#f1f8e9;border-radius:8px;font-size:13px;color:#555;line-height:1.8">' +
            '<b>登录说明：</b><br>管理员：18219966272 / Lrx6688@<br>门店账号：店名拼音首字母（如 NGZD）<br>门店密码：首字母+123456（如 NGZD123456）</div></div></div>';
    },

    login: function() {
        var u = document.getElementById('username').value.trim();
        var p = document.getElementById('password').value.trim();
        if (!u || !p) { alert('请输入账号和密码'); return; }
        var admin = DATA.accounts.admin.find(function(a) { return a.username === u && a.password === p; });
        if (admin) {
            this.currentUser = { username: admin.username, name: admin.name, role: 'admin' };
            Storage.set('currentUser', this.currentUser);
            this.goToPage('admin-dashboard');
            return;
        }
        var storeUser = DATA.accounts.store.find(function(a) { return a.username === u && a.password === p; });
        if (storeUser) {
            var store = DATA.stores.find(function(s) { return s.id === storeUser.storeId; });
            this.currentUser = { username: storeUser.username, name: storeUser.name, role: 'store', storeId: storeUser.storeId, store: store };
            Storage.set('currentUser', this.currentUser);
            this.goToPage('store-dashboard');
            return;
        }
        alert('账号或密码错误');
    },

    bottomNav: function(role) {
        if (role === 'store') {
            return '<div class="bottom-nav"><div class="nav-item" onclick="App.goToPage(\'store-dashboard\')">首页</div><div class="nav-item" onclick="App.goToPage(\'new-order\')">新建</div><div class="nav-item" onclick="App.goToPage(\'order-list\')">订单</div><div class="nav-item" onclick="App.logout()">退出</div></div>';
        }
        return '<div class="bottom-nav"><div class="nav-item" onclick="App.goToPage(\'admin-dashboard\')">首页</div><div class="nav-item" onclick="App.goToPage(\'admin-orders\')">订单</div><div class="nav-item" onclick="App.logout()">退出</div></div>';
    },

    // 门店端首页
    renderStoreDashboard: function() {
        var orders = Storage.get('orders').filter(function(o) { return o.storeId === this.currentUser.storeId; }.bind(this));
        var pending = orders.filter(function(o) { return o.status === 'pending'; }).length;
        var approved = orders.filter(function(o) { return o.status === 'approved'; }).length;
        var recent = orders.slice(-3).reverse();
        var nav = this.bottomNav('store');
        var self = this;
        document.body.innerHTML = '<div class="header"><h1>门店采购端</h1><div class="sub-title">' + this.currentUser.store.name + '</div></div>' +
            '<div class="card"><button class="btn btn-primary" onclick="App.goToPage(\'new-order\')">+ 新建采购单</button></div>' +
            '<div class="card"><h2>订单统计</h2><div style="display:flex;gap:10px;text-align:center">' +
            '<div style="flex:1;padding:14px;background:#fff3e0;border-radius:8px"><div style="font-size:26px;font-weight:bold;color:#f57c00">' + pending + '</div><div style="font-size:13px;color:#666;margin-top:4px">待审核</div></div>' +
            '<div style="flex:1;padding:14px;background:#e8f5e9;border-radius:8px"><div style="font-size:26px;font-weight:bold;color:#2e7d32">' + approved + '</div><div style="font-size:13px;color:#666;margin-top:4px">已通过</div></div>' +
            '<div style="flex:1;padding:14px;background:#e3f2fd;border-radius:8px"><div style="font-size:26px;font-weight:bold;color:#1565c0">' + orders.length + '</div><div style="font-size:13px;color:#666;margin-top:4px">总订单</div></div></div></div>' +
            '<div class="card"><h2>最近订单</h2>' + (recent.length === 0 ? '<p style="text-align:center;color:#999;padding:15px">暂无订单</p>' : recent.map(function(o) { return self.orderItemHTML(o); }).join('')) + '</div>' + nav;
    },

    renderNewOrder: function() {
        this.cart = {};
        this.selectedCategory = '蔬菜类';
        this._renderOrderForm();
    },

    _renderOrderForm: function() {
        var cats = Object.keys(DATA.products);
        var products = DATA.products[this.selectedCategory];
        var total = 0;
        var catTotals = {};
        var self = this;
        for (var catKey in DATA.products) {
            if (!DATA.products.hasOwnProperty(catKey)) continue;
            var items = DATA.products[catKey];
            var ct = 0;
            for (var i = 0; i < items.length; i++) {
                var p = items[i];
                if (this.cart[p.id]) {
                    var amt = p.price * this.cart[p.id];
                    ct += amt;
                    total += amt;
                }
            }
            catTotals[catKey] = ct;
        }
        var activeCats = Object.keys(catTotals).filter(function(c) { return catTotals[c] > 0; });
        var tabsHTML = cats.map(function(c) {
            return '<div class="category-tab ' + (c === self.selectedCategory ? 'active' : '') + '" onclick="App._switchCat(\'' + c + '\')">' + c + (catTotals[c] > 0 ? ' ¥' + catTotals[c].toFixed(0) : '') + '</div>';
        }).join('');
        var prodsHTML = products.map(function(p) {
            return '<div class="product-item"><div class="product-info"><div class="product-name">' + p.name + '</div><div class="product-spec">¥' + p.price + '/' + p.unit + '</div></div><div style="display:flex;align-items:center;gap:8px"><input type="number" min="0" step="0.5" value="' + (self.cart[p.id] || '') + '" placeholder="0" onchange="App._updateCart(\'' + p.id + '\',this.value)" style="width:72px;padding:8px 4px;text-align:center;border:2px solid #e0e0e0;border-radius:6px;font-size:16px"><span style="font-size:13px;color:#999">' + p.unit + '</span></div></div>';
        }).join('');
        var totalHTML = activeCats.length > 0 ? '<div class="total-box">' + activeCats.map(function(c) { return '<div class="total-row"><span>' + c + '</span><span>¥' + catTotals[c].toFixed(2) + '</span></div>'; }).join('') + '<div class="total-row total"><span>总金额</span><span>¥' + total.toFixed(2) + '</span></div></div>' : '';
        var nav = this.bottomNav('store');
        document.body.innerHTML = '<div class="header"><h1>新建采购单</h1><div class="sub-title">' + this.currentUser.store.name + '</div></div>' +
            '<div class="category-tabs">' + tabsHTML + '</div>' +
            '<div class="card"><h2>' + this.selectedCategory + '</h2>' + prodsHTML + '</div>' +
            totalHTML +
            '<div class="card"><div class="form-group"><label>预计到货日期</label><input type="date" id="arrivalDate" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
            '<div class="form-group"><label>采购备注</label><textarea id="remark" rows="2" placeholder="填写特殊要求"></textarea></div>' +
            '<button class="btn btn-primary" onclick="App._submitOrder()">提交采购单</button>' +
            '<button class="btn btn-secondary" onclick="App.goToPage(\'store-dashboard\')">取消</button></div>' + nav;
    },

    _switchCat: function(cat) {
        this.selectedCategory = cat;
        this._renderOrderForm();
    },

    _updateCart: function(id, val) {
        var n = parseFloat(val) || 0;
        if (n > 0) this.cart[id] = n;
        else delete this.cart[id];
        this._renderOrderForm();
    },

    _submitOrder: function() {
        if (Object.keys(this.cart).length === 0) { alert('请至少选择一种商品'); return; }
        var arrivalDate = document.getElementById('arrivalDate').value;
        var remark = document.getElementById('remark').value.trim();
        var items = [];
        var total = 0;
        var catMap = {};
        var self = this;
        for (var pid in this.cart) {
            if (!this.cart.hasOwnProperty(pid)) continue;
            var qty = this.cart[pid];
            var prod = null, cat = '';
            for (var catKey in DATA.products) {
                if (!DATA.products.hasOwnProperty(catKey)) continue;
                var ps = DATA.products[catKey];
                for (var j = 0; j < ps.length; j++) {
                    if (ps[j].id === pid) { prod = ps[j]; cat = catKey; break; }
                }
                if (prod) break;
            }
            if (!prod) continue;
            var subtotal = prod.price * qty;
            total += subtotal;
            if (!catMap[cat]) catMap[cat] = 0;
            catMap[cat] += subtotal;
            items.push({ id: prod.id, name: prod.name, unit: prod.unit, price: prod.price, quantity: qty, subtotal: subtotal, category: cat });
        }
        var order = {
            id: Date.now(),
            storeId: this.currentUser.storeId,
            storeName: this.currentUser.store.name,
            createTime: new Date().toLocaleString('zh-CN'),
            arrivalDate: arrivalDate,
            remark: remark,
            items: items,
            totalAmount: total,
            catTotals: catMap,
            status: 'pending',
            auditRemark: '',
            auditTime: ''
        };
        var orders = Storage.get('orders');
        orders.unshift(order);
        Storage.set('orders', orders);
        alert('采购单已提交！等待总部审核');
        this.goToPage('store-dashboard');
    },

    renderOrderList: function() {
        var orders = Storage.get('orders').filter(function(o) { return o.storeId === this.currentUser.storeId; }.bind(this));
        var nav = this.bottomNav('store');
        var self = this;
        document.body.innerHTML = '<div class="header"><h1>我的订单</h1><div class="sub-title">共 ' + orders.length + ' 个订单</div></div>' +
            (orders.length === 0 ? '<div class="card"><p style="text-align:center;color:#999;padding:20px">暂无订单</p></div>' : orders.map(function(o) { return self.orderItemHTML(o); }).join('')) + nav;
    },

    orderItemHTML: function(o) {
        var statusLabel = { pending: '待审核', approved: '已通过', rejected: '已驳回', purchased: '已采购' };
        var cls = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected', purchased: 'status-purchased' };
        var rejectNote = o.status === 'rejected' ? '<div class="order-info" style="color:#d32f2f">驳回原因: ' + o.auditRemark + '</div>' : '';
        return '<div class="order-item" onclick="App.goToPage(\'order-detail\',\'' + o.id + '\')"><div class="order-header"><div class="order-store">' + o.storeName + '</div><div class="order-status ' + cls[o.status] + '">' + statusLabel[o.status] + '</div></div><div class="order-info">订单号: ' + o.id + '</div><div class="order-info">时间: ' + o.createTime + '</div><div class="order-info">总金额: <b style="color:#f57c00">¥' + o.totalAmount.toFixed(2) + '</b></div>' + rejectNote + '</div>';
    },

    renderOrderDetail: function(id) {
        var order = Storage.get('orders').find(function(o) { return o.id == id; });
        if (!order) { alert('订单不存在'); this.goToPage('store-dashboard'); return; }
        var statusLabel = { pending: '待审核', approved: '已通过', rejected: '已驳回', purchased: '已采购' };
        var cls = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected', purchased: 'status-purchased' };
        var catGroups = {};
        for (var i = 0; i < order.items.length; i++) {
            var item = order.items[i];
            var cat = item.category || '';
            if (!catGroups[cat]) catGroups[cat] = [];
            catGroups[cat].push(item);
        }
        var groupsHTML = '';
        for (var cat in catGroups) {
            if (!catGroups.hasOwnProperty(cat)) continue;
            var items = catGroups[cat];
            var itemsHTML = '';
            for (var j = 0; j < items.length; j++) {
                var it = items[j];
                itemsHTML += '<div class="product-item"><div class="product-info"><div class="product-name">' + it.name + '</div><div class="product-spec">¥' + it.price + '/' + it.unit + ' x ' + it.quantity + it.unit + '</div></div><div style="font-weight:bold;color:#f57c00">¥' + it.subtotal.toFixed(2) + '</div></div>';
            }
            groupsHTML += '<div class="card"><h2>' + cat + '</h2>' + itemsHTML + '</div>';
        }
        var remarkHTML = order.remark ? '<div class="order-info">备注: ' + order.remark + '</div>' : '';
        var auditHTML = order.auditRemark ? '<div class="order-info" style="color:' + (order.status === 'rejected' ? '#d32f2f' : '#2e7d32') + '">审批备注: ' + order.auditRemark + '</div>' : '';
        var resubmitBtn = order.status === 'rejected' ? '<div class="card"><button class="btn btn-primary" onclick="App._resubmit(' + order.id + ')">修改后重新提交</button></div>' : '';
        var nav = this.bottomNav('store');
        document.body.innerHTML = '<div class="header"><h1>订单详情</h1><div class="sub-title">订单号: ' + order.id + '</div></div>' +
            '<div class="card"><h2>基本信息</h2><div class="order-info">门店: <b>' + order.storeName + '</b></div><div class="order-info">时间: ' + order.createTime + '</div><div class="order-info">到货: ' + order.arrivalDate + '</div><div class="order-info">状态: <span class="order-status ' + cls[order.status] + '">' + statusLabel[order.status] + '</span></div>' + remarkHTML + auditHTML + '</div>' +
            groupsHTML +
            '<div class="total-box"><div class="total-row total"><span>总金额</span><span>¥' + order.totalAmount.toFixed(2) + '</span></div></div>' +
            resubmitBtn +
            '<div class="card"><button class="btn btn-secondary" onclick="App.goToPage(\'order-list\')">返回</button></div>' + nav;
    },

    _resubmit: function(id) {
        var order = Storage.get('orders').find(function(o) { return o.id == id; });
        if (!order) return;
        this.cart = {};
        for (var i = 0; i < order.items.length; i++) {
            this.cart[order.items[i].id] = order.items[i].quantity;
        }
        this._renderOrderForm();
        var self = this;
        setTimeout(function() {
            var ad = document.getElementById('arrivalDate');
            var rm = document.getElementById('remark');
            if (ad) ad.value = order.arrivalDate;
            if (rm) rm.value = order.remark || '';
        }, 100);
    },

    // 管理员端
    renderAdminDashboard: function() {
        var orders = Storage.get('orders');
        var pending = orders.filter(function(o) { return o.status === 'pending'; });
        var approved = orders.filter(function(o) { return o.status === 'approved'; }).length;
        var nav = this.bottomNav('admin');
        var alertHTML = pending.length > 0 ?
            '<div class="card" style="border-left:4px solid #f57c00"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="font-size:36px">NEW</div><div><div style="font-size:22px;font-weight:bold;color:#f57c00">' + pending.length + ' 个待审核订单</div><div style="font-size:13px;color:#666;margin-top:4px">有新采购单需要处理</div></div></div><button class="btn btn-primary" onclick="App.goToPage(\'admin-orders\')">立即处理</button></div>' :
            '<div class="card"><p style="text-align:center;color:#999;padding:20px">目前没有待审核订单</p></div>';
        document.body.innerHTML = '<div class="header"><h1>总部管理端</h1><div class="sub-title">欢迎，管理员</div></div>' +
            alertHTML +
            '<div class="card"><h2>今日概况</h2><div style="display:flex;gap:10px;text-align:center">' +
            '<div style="flex:1;padding:14px;background:#fff3e0;border-radius:8px"><div style="font-size:24px;font-weight:bold;color:#f57c00">' + pending.length + '</div><div style="font-size:13px;color:#666">待审核</div></div>' +
            '<div style="flex:1;padding:14px;background:#e8f5e9;border-radius:8px"><div style="font-size:24px;font-weight:bold;color:#2e7d32">' + approved + '</div><div style="font-size:13px;color:#666">已通过</div></div>' +
            '<div style="flex:1;padding:14px;background:#e3f2fd;border-radius:8px"><div style="font-size:24px;font-weight:bold;color:#1565c0">' + orders.length + '</div><div style="font-size:13px;color:#666">总订单</div></div></div></div>' +
            '<div class="card"><h2>操作</h2><button class="btn btn-secondary" onclick="App.goToPage(\'admin-orders\')">查看全部订单</button><button class="btn btn-secondary" onclick="App._exportAll()">导出全部Excel</button></div>' + nav;
    },

    renderAdminOrders: function() {
        var orders = Storage.get('orders');
        var nav = this.bottomNav('admin');
        var self = this;
        document.body.innerHTML = '<div class="header"><h1>订单管理</h1><div class="sub-title">共 ' + orders.length + ' 个订单</div></div>' +
            '<div style="padding:10px 15px;display:flex;gap:6px;flex-wrap:wrap">' +
            '<button class="btn btn-small btn-primary" onclick="App._filterOrders(\'all\')">全部</button>' +
            '<button class="btn btn-small" style="background:#fff3e0;color:#f57c00;border:1px solid #ffcc80" onclick="App._filterOrders(\'pending\')">待审核</button>' +
            '<button class="btn btn-small" style="background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9" onclick="App._filterOrders(\'approved\')">已通过</button>' +
            '<button class="btn btn-small" style="background:#ffebee;color:#d32f2f;border:1px solid #ffcdd2" onclick="App._filterOrders(\'rejected\')">已驳回</button></div>' +
            '<div id="order-list">' + orders.map(function(o) { return self._adminOrderItem(o); }).join('') + '</div>' + nav;
    },

    _filterOrders: function(status) {
        var orders = Storage.get('orders');
        var filtered = status === 'all' ? orders : orders.filter(function(o) { return o.status === status; });
        document.getElementById('order-list').innerHTML = filtered.length > 0 ? filtered.map(function(o) { return App._adminOrderItem(o); }).join('') : '<div class="card"><p style="text-align:center;color:#999;padding:20px">无订单</p></div>';
    },

    _adminOrderItem: function(o) {
        var statusLabel = { pending: '待审核', approved: '已通过', rejected: '已驳回', purchased: '已采购' };
        var cls = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected', purchased: 'status-purchased' };
        var rejectNote = o.auditRemark ? '<div class="order-info" style="color:#d32f2f">驳回原因: ' + o.auditRemark + '</div>' : '';
        var remarkNote = o.remark ? '<div class="order-info" style="color:#555">备注: ' + o.remark + '</div>' : '';

        // 构建商品明细
        var detailHTML = '';
        if (o.items && o.items.length > 0) {
            var catGroups = {};
            for (var k = 0; k < o.items.length; k++) {
                var it = o.items[k];
                var cat = it.category || '其他';
                if (!catGroups[cat]) catGroups[cat] = [];
                catGroups[cat].push(it);
            }
            var allItemsHTML = '';
            for (var cat in catGroups) {
                if (!catGroups.hasOwnProperty(cat)) continue;
                var catItems = catGroups[cat];
                var catSubtotal = 0;
                var rows = '';
                for (var m = 0; m < catItems.length; m++) {
                    var item = catItems[m];
                    catSubtotal += item.subtotal;
                    rows += '<tr><td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;font-size:14px">' + item.name + '</td>' +
                        '<td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#888">' + item.price + '/' + item.unit + '</td>' +
                        '<td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px">x' + item.quantity + '</td>' +
                        '<td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#f57c00;font-weight:bold">¥' + item.subtotal.toFixed(2) + '</td></tr>';
                }
                rows += '<tr><td colspan="3" style="padding:6px 4px;text-align:right;font-size:13px;color:#666;background:#f9f9f9">小计</td>' +
                    '<td style="padding:6px 4px;text-align:right;font-size:13px;color:#2e7d32;font-weight:bold;background:#f9f9f9">¥' + catSubtotal.toFixed(2) + '</td></tr>';
                allItemsHTML += '<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:bold;color:#2e7d32;padding:6px 10px;background:#e8f5e9;border-radius:6px;margin-bottom:4px">' + cat + '</div>' +
                    '<table style="width:100%;border-collapse:collapse;background:white;border-radius:6px;overflow:hidden"><thead><tr style="background:#f5f5f5"><th style="padding:6px 4px;text-align:left;font-size:12px;color:#999">商品</th><th style="padding:6px 4px;text-align:center;font-size:12px;color:#999">单价</th><th style="padding:6px 4px;text-align:center;font-size:12px;color:#999">数量</th><th style="padding:6px 4px;text-align:right;font-size:12px;color:#999">金额</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
            }
            detailHTML = '<div style="margin:10px 0;padding:10px;background:#fffde7;border-radius:8px;border:1px solid #fff59d">' +
                '<div style="font-size:13px;font-weight:bold;color:#f57c00;margin-bottom:8px">采购明细（共' + o.items.length + '项）</div>' +
                allItemsHTML +
                '<div style="text-align:right;padding:8px 10px;background:#2e7d32;color:white;border-radius:6px;font-size:15px;font-weight:bold;margin-top:4px">订单总金额：¥' + o.totalAmount.toFixed(2) + '</div></div>';
        }

        var actions = '';
        if (o.status === 'pending') {
            actions = '<button class="btn btn-small" style="background:#2e7d32;color:white" onclick="App._approve(\'' + o.id + '\')">通过</button>' +
                '<button class="btn btn-small btn-danger" onclick="App._reject(\'' + o.id + '\')">驳回</button>' +
                '<button class="btn btn-small" style="background:#f57c00;color:white" onclick="App._exportOne(\'' + o.id + '\')">导出</button>';
        } else if (o.status === 'approved') {
            actions = '<button class="btn btn-small" style="background:#1565c0;color:white" onclick="App._exportOne(\'' + o.id + '\')">导出</button>' +
                '<button class="btn btn-small btn-secondary" onclick="App._markPurchased(\'' + o.id + '\')">已采购</button>';
        } else {
            actions = '<button class="btn btn-small" style="background:#1565c0;color:white" onclick="App._exportOne(\'' + o.id + '\')">导出</button>';
        }
        return '<div class="order-item"><div class="order-header"><div class="order-store">' + o.storeName + '</div><div class="order-status ' + cls[o.status] + '">' + statusLabel[o.status] + '</div></div>' +
            '<div class="order-info">订单号: ' + o.id + '</div><div class="order-info">时间: ' + o.createTime + '</div>' +
            '<div class="order-info">到货: ' + (o.arrivalDate || '-') + '</div>' +
            remarkNote + rejectNote +
            detailHTML +
            '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' + actions + '</div></div>';
    },

    _approve: function(id) {
        var orders = Storage.get('orders');
        var o = orders.find(function(x) { return x.id == id; });
        if (!o) return;
        o.status = 'approved';
        o.auditTime = new Date().toLocaleString('zh-CN');
        Storage.set('orders', orders);
        this._filterOrders('pending');
        alert('已通过！');
    },

    _reject: function(id) {
        var reason = prompt('请输入驳回原因（必填）：');
        if (!reason) return;
        var orders = Storage.get('orders');
        var o = orders.find(function(x) { return x.id == id; });
        if (!o) return;
        o.status = 'rejected';
        o.auditRemark = reason;
        o.auditTime = new Date().toLocaleString('zh-CN');
        Storage.set('orders', orders);
        this._filterOrders('rejected');
        alert('已驳回');
    },

    _markPurchased: function(id) {
        var orders = Storage.get('orders');
        var o = orders.find(function(x) { return x.id == id; });
        if (!o) return;
        o.status = 'purchased';
        Storage.set('orders', orders);
        alert('已标记为已采购');
        this._filterOrders('approved');
    },

    _exportOne: function(id) {
        var orders = Storage.get('orders');
        var o = orders.find(function(x) { return x.id == id; });
        if (!o) return;
        this._doExport([o], '采购订单_' + o.id + '_' + o.storeName);
    },

    _exportAll: function() {
        var orders = Storage.get('orders');
        if (orders.length === 0) { alert('暂无订单'); return; }
        this._doExport(orders, '恒微足道全部采购订单_' + new Date().toLocaleDateString('zh-CN'));
    },

    _doExport: function(orders, filename) {
        var csv = '门店名称,订单号,下单时间,到货日期,审核状态,商品名称,单位,单价,数量,单商品金额,分类,订单总金额,备注,审批备注\r\n';
        for (var i = 0; i < orders.length; i++) {
            var o = orders[i];
            for (var j = 0; j < o.items.length; j++) {
                var item = o.items[j];
                csv += '"' + o.storeName + '",';
                csv += o.id + ',';
                csv += '"' + o.createTime + '",';
                csv += o.arrivalDate + ',';
                csv += '"' + (DATA.orderStatus[o.status] || o.status) + '",';
                csv += '"' + item.name + '",';
                csv += '"' + item.unit + '",';
                csv += item.price + ',';
                csv += item.quantity + ',';
                csv += item.subtotal.toFixed(2) + ',';
                csv += '"' + (item.category || '') + '",';
                csv += o.totalAmount.toFixed(2) + ',';
                csv += '"' + (o.remark || '') + '",';
                csv += '"' + (o.auditRemark || '') + '"\r\n';
            }
        }
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename + '.csv';
        a.click();
        URL.revokeObjectURL(url);
    },

    logout: function() {
        if (confirm('确定退出登录？')) {
            Storage.set('currentUser', null);
            this.currentUser = null;
            this.renderLogin();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
