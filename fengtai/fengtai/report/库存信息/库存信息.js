// Copyright (c) 2024, jerry and contributors
// For license information, please see license.txt

frappe.query_reports["库存信息"] = {
	"filters": [],
	"formatter": function (value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);
		// 选择包含 "Total" 文本的 div 元素
		$(document).ready(function () {
			var totalDiv = $('.dt-footer');
			var totalTag = totalDiv.find('.dt-cell__content[title="Total"]');

			// 检查是否成功获取到目标元素
			if (totalTag.length > 0) {
				totalTag.text("合计");
				console.log(totalTag);
			} else {
				console.log("未找到匹配的元素");
			}
		});
		return value;
	}
};
