import sys
import urllib2

from pageProfiler import PageProfiler
from pageProfiler import PageParser


given_url = "http://www.ipeen.com.tw/comment/560952"
#given_url = "http://www.ipeen.com.tw/comment/137730"
#given_url = "http://loneying.pixnet.net/blog/post/9358099-%E7%86%8A%E3%81%AE%E9%A3%9F%E6%96%B0%E7%AB%B9%E5%85%89%E5%BE%A9%E5%BA%97%E7%86%8A%E6%89%8B%E5%8C%85%E8%B6%85%E5%83%8F%E6%BC%A2%E5%A0%A1%E5%8C%85%E7%9A%84%E5%88%88%E5%8C%85"
#given_url = "http://meijuily.pixnet.net/blog/post/41041363-%E5%8F%B0%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%97%A9%E5%8D%88%E9%A4%90%E8%8E%8E%E8%8E%8E%E8%8E%89%E6%9C%B5-sausalito-cafe"              
#given_url = "http://www.tripadvisor.com/Attraction_Review-g60763-d1383285-Reviews-Jersey_Boys-New_York_City_New_York.html"
#given_url = "http://www.tripadvisor.com/Hotel_Review-g60763-d93475-Reviews-New_York_Marriott_East_Side-New_York_City_New_York.html"

pp = PageProfiler()
elem_list = pp.profile(url = given_url)
#elem_list = pp.profile(raw_html=html)

for e in elem_list :
	print e.dumpJson()
	
for e in elem_list :
	print e.name
	print e.address
	print e.phone_number
	