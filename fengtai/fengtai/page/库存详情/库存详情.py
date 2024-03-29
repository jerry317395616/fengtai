import frappe
import json
def get_context(context):
    context.users = frappe.get_list("User", fields=["first_name", "last_name"])

@frappe.whitelist()
def get_info(filters=None):
	columns, data = [], []
	columns = [
		{"label": "名称", "fieldname": "item_name","width":"200"},
		{"label": "数量", "fieldname": "actual_qty","width":"100"},
		{"label": "仓库", "fieldname": "warehouse","width":"200"},
		{"label": "描述", "fieldname": "description", "width": "500"},
		{"label": "品牌", "fieldname": "brand", "width": "200"},

	]

	# data = frappe.db.get_all("Bin", filters=filters,
	# 						 fields=["item_code", "actual_qty","warehouse"])
	# 查询 Bin 表同时连接 Item 表以获取物料信息的其他字段
	data = frappe.db.sql("""
	      SELECT item.item_name, bin.actual_qty, bin.warehouse, item.description,item.brand
	      FROM `tabBin` AS bin
	      LEFT JOIN `tabItem` AS item ON bin.item_code = item.name
	      WHERE 1=1 and {conditions} order by bin.modified desc
	  """.format(conditions=get_conditions(filters)), as_dict=1)
	return data


def get_conditions(f):
    filters = eval(f)
    conditions = []
    if filters:
        if filters.get("item_code"):
            conditions.append("item_code = '{}'".format(filters.get("item_code")))

        # 可以根据需要添加更多的过滤条件
        if filters.get("warehouse"):
            conditions.append("warehouse = '{}'".format(filters.get("warehouse")))
        # 添加更多过滤条件...
    # 将所有条件连接起来，并用 "AND" 连接
    return " AND ".join(conditions) if conditions else ""
