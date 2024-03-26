frappe.pages['hello'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '库存信息',
        single_column: true

    });
	page.set_secondary_action("Refresh", () => page.capacity_dashboard.refresh(), "refresh");
	page.start = 0;
	page.item_field = page.add_field({
		fieldname: "item_code",
		label: __("Item"),
		fieldtype: "Link",
		options: "Item",
		change: function () {
			page.capacity_dashboard.start = 0;
			page.capacity_dashboard.refresh();
		},
	});

    // 添加一个容器用于显示Doctype记录
    frappe.require('item-dashboard.bundle.js', function () {
        $(frappe.render_template('hello', {})).appendTo(page.main);
    });

    frappe.db.get_list('Item Group', {
        fields: ['item_group_name', 'name', 'parent_item_group', 'is_group'],
    }).then(records => {
        console.log('12321321', records);
        console.log(JSON.stringify(records))

        // 根据父级分组记录
        var groupedRecords = {};
        records.forEach(record => {
            var parent = record.parent_item_group || ''; // 如果没有父级，则为空字符串
            if (!groupedRecords[parent]) {
                groupedRecords[parent] = [];
            }
            groupedRecords[parent].push(record);
        });

        // 递归函数，用于生成树形结构
        function buildTree(parent) {
            var $ul = $('<ul>'); // 创建一个<ul>元素
            if (groupedRecords[parent]) {
                groupedRecords[parent].forEach(record => {
                    var $li = $('<li class="list-group-item">').text(record.item_group_name);
                    $li.attr('data-record', JSON.stringify(record));
                    $li.click(function (event) {
                        // 获取当前节点信息
                        event.stopPropagation();
                        var currentRecord = JSON.parse($(this).attr('data-record'));
                        console.log('Clicked:', currentRecord);
                        let groupName = currentRecord.name
                        frappe.db.get_list('Item', {
                            fields: ['item_code', 'item_group'],
                        }).then(itemRecord => {

                            let itemList = []
                            itemRecord.forEach(item => {
                                if (item.item_group == groupName) {
                                    itemList.push(item)
                                }
                            })
                            console.log('item', itemList)

                            frappe.db.get_list('Bin', {
                                fields: ['item_code', 'name', 'warehouse', 'actual_qty'],
                            }).then(binRecord => {
                                console.log('bin', binRecord)
                                let tableList = []
                                itemList.forEach(item=>{
                                    binRecord.forEach(bin=>{
                                        if(item.item_code==bin.item_code){
                                            bin.item_group = groupName
                                            tableList.push(bin)
                                        }
                                    })
                                })
                                console.log('表格',tableList)

                                // 生成表格
                                generateTable(tableList);

                            })
                        })


                    });
                    $li.appendTo($ul);
                    var $children = buildTree(record.name); // 递归调用，生成子节点
                    if ($children.children().length > 0) {
                        $children.appendTo($li);
                    }
                });
            }
            return $ul;
        }

        // 显示树形结构
        var $tree = buildTree('');
        $tree.appendTo($("#tree"));
    });

    // 生成表格的函数
    function generateTable(tableList) {
        // 清空现有表格内容
        $('#table-container').empty();

        // 创建表格
        var $table = $('<table class="table">');
        var $thead = $('<thead>');
        var $tbody = $('<tbody>');

        // 添加表头
        var $headRow = $('<tr>');
        $headRow.append('<th scope="col">#</th>');
        $headRow.append('<th scope="col">名称</th>');
        $headRow.append('<th scope="col">分类</th>');
        $headRow.append('<th scope="col">仓库</th>');
        $headRow.append('<th scope="col">实际剩余</th>');
        $thead.append($headRow);
        $table.append($thead);

        // 添加表格内容
		 var totalActualQty = 0; // 初始化实际数量合计
        tableList.forEach(function (item, index) {
            var $row = $('<tr>');
            $row.append('<th scope="row">' + (index + 1) + '</th>');
            $row.append('<td>' + item.item_code + '</td>');
            $row.append('<td>' + item.item_group + '</td>');
            $row.append('<td>' + item.warehouse + '</td>');
            $row.append('<td>' + item.actual_qty + '</td>');
			 totalActualQty += parseFloat(item.actual_qty); // 计算实际数量合计
            $tbody.append($row);
        });

		  // 添加合计行
        var $totalRow = $('<tr>');
        $totalRow.append('<th scope="row" colspan="4">合计</th>');
        $totalRow.append('<td>' + totalActualQty + '</td>');
        $tbody.append($totalRow);

        $table.append($tbody);

        // 将表格添加到页面中
        $('#table-container').append($table);
    }
}
