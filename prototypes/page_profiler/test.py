import sys
import urllib2

from pageProfiler import PageProfiler
from pageProfiler import PageParser


given_url = "http://meijuily.pixnet.net/blog/post/41041363-%E5%8F%B0%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%97%A9%E5%8D%88%E9%A4%90%E8%8E%8E%E8%8E%8E%E8%8E%89%E6%9C%B5-sausalito-cafe"
#given_url = "http://www.ipeen.com.tw/comment/679104"
pp = PageProfiler()
elem_list = pp.profile(url = given_url)
#elem_list = pp.profile(raw_html=html)
for e in elem_list :
	if e.has_key("address") : print e["address"]
	if e.has_key("phone_number") : print e["phone_number"]