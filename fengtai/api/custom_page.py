# apps/my_custom_app/my_custom_app/api/custom_page.py

import frappe
from frappe import _

@frappe.whitelist()
def get_custom_doctype_page(docname):
    # 获取自定义Doctype文档
    doc = frappe.get_doc("MyCustomDoctype", docname)
    # 渲染HTML模板并传递数据
    return frappe.render_template("includes/custom_doctype_page.html", {"doc": doc})
