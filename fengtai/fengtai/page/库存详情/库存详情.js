frappe.pages['库存详情'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '库存详情',
		single_column: true
	});
	let context = {
		data: {"hello": "world", "warehouse": [],"total":''},
	}


	// // 加载树列表视图
	// tree.load_children(tree.root_node, true);

	// // 监听树节点点击事件
	// tree.$w.on('tree-node-select', function(node) {
	//     // 执行相应的操作
	//     console.log('Selected node:', node);
	// });


	frappe.db.get_list("Warehouse", {fields: ['warehouse_name', 'parent_warehouse'],}).then(result => {
		var treeviewData = convertToTreeviewData(result);
		context.warehouse = treeviewData

		console.log('context', context)
		$(frappe.render_template("库存详情", context)).appendTo(page.main);
		// 转换数据为Bootstrap Treeview需要的格式


		// $('#treeview').treeview({data: treeviewData});
// 创建一个空的树列表视图容器
		// var tree_container = $('<div>').appendTo(page.body);
		var tree_container = $("#left")
		// 创建一个树列表视图实例
		var tree = new frappe.ui.Tree({
			parent: tree_container,
			label: "西安丰泰机械有限公司",
			method: 'erpnext.stock.doctype.warehouse.warehouse.get_children',
			args: {
				doctype: 'Warehouse',
				parent: '',
				company: '西安丰泰机械有限公司',
				include_disabled: false,
				is_root: true
			},
			get_tree_root: false,
			on_click: (node) => {
				console.log('111', node.data.value)
				// var wname = processString(node.data.value);
				var param = {"warehouse": node.data.value}
				frappe.call({
					method: 'fengtai.fengtai.page.库存详情.库存详情.get_info',
					args: {filters: param},
					callback: function (response) {
						var context = response.message;
						// 在这里可以访问从 Python 中传递过来的上下文数据
						console.log('nnn', context);
						var convertedData = convertData(context);
						const datatable = new DataTable('#right', {
							columns: [{name: '名称', width: 200,},
								{name: '数量', width: 100}, {
									name: '仓库',
									width: 100
								}, {name: '描述', width: 300},
								{name: '品牌', width: 300}],
							data: convertedData
						});
						// 计算汇总统计信息
						let totalQuantity = 0;

// 遍历数据并计算总数量
						for (let i = 0; i < convertedData.length; i++) {
							totalQuantity += convertedData[i][1];
						}

						context.total = totalQuantity
						$("#total").html("总计："+totalQuantity)
						console.log('总计',totalQuantity)


					}
				});


			},
		});


	})


	function convertToTreeviewData(data) {
		var treeData = [];

		// 创建一个字典，用于存储每个节点的引用，方便后续快速查找父节点
		var nodeDict = {};

		// 第一次遍历数据，将每个节点存储到字典中
		data.forEach(function (item) {
			var node = {
				text: item.warehouse_name,
				nodes: []
			};
			nodeDict[item.warehouse_name] = node;
			if (item.parent_warehouse === null) {
				// 如果父节点为null，则为顶级节点，直接添加到treeData中
				treeData.push(node);
			}
		});

		// 第二次遍历数据，将每个节点连接到其父节点
		data.forEach(function (item) {
			if (item.parent_warehouse !== null) {
				var parentNode = nodeDict[item.parent_warehouse];
				if (parentNode) {
					// 找到父节点，并将当前节点添加为其子节点
					parentNode.nodes.push(nodeDict[item.warehouse_name]);
				}
			}
		});

		return treeData;
	}

	function convertData(data) {
		var result = [];

		data.forEach(function (item) {
			var newItem = [];
			newItem.push(item.item_name || ''); // 添加 item_name，如果不存在则添加空字符串
			newItem.push(item.actual_qty || 0); // 添加 actual_qty，如果不存在则添加0
			newItem.push(item.warehouse || ''); // 添加 warehouse，如果不存在则添加空字符串
			newItem.push(item.description || ''); // 添加 description，如果不存在则添加空字符串
			newItem.push(item.brand || null); // 添加 brand，如果不存在则添加 null

			result.push(newItem);
		});

		return result;
	}

	function processString(str) {
		// 使用 split 方法将字符串按照 " - " 进行分割，并取第一个元素
		var parts = str.split(" - ");
		return parts[0];
	}
}




