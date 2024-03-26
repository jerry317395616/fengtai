import frappe


def execute(filters=None):
	if not filters:
		filters = {}

	columns = [
		{"label": "名称", "fieldname": "item_name", "width": "200"},
		{"label": "数量", "fieldname": "actual_qty", "width": "100"},
		{"label": "仓库", "fieldname": "warehouse", "width": "200"},
		{"label": "描述", "fieldname": "description", "width": "500"},
		{"label": "品牌", "fieldname": "brand", "width": "200"},

	]
	data = []

	return columns, data
