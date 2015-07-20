#-*- coding: utf-8 -*-
import os
import sys
import re
import logging
import string
import urllib2
import json
import base64

from urlparse import urlparse
from bs4 import BeautifulSoup
from lxml import etree
from lxml.html.clean import Cleaner
import lxml.html
import requests


class PlaceInfo:
	def __init__(self):
		self.spec_dic = {
			"id":None, "url":[], 
			"name":[], "phone_number":[], "address":[],  
			"avg_price":[], "opening_hours":[], "latlng":[],
			"content":[], "image_url":[]}	
	
	def writefile_solrAddXML(self) :
		doc = etree.Element('doc')
		
		field = etree.Element('field')
		field.set("name", "id")
		field.text = self.spec_dic["id"]
		doc.append(field)
		
		for u in self.spec_dic["url"]:
			field = etree.Element('field')
			field.set("name", "url")
			field.text = u
			doc.append(field)
		
		for n in self.spec_dic["name"] :
			field = etree.Element('field')
			field.set("name", "name")
			field.text = n
			doc.append(field)
			
		for phone in self.spec_dic["phone_number"] :
			field = etree.Element('field')
			field.set("name", "phone_number")
			field.text = phone
			doc.append(field)
		
		for addr in self.spec_dic["address"] :
			field = etree.Element('field')
			field.set("name", "address")
			field.text = addr
			doc.append(field)
			
		for price in self.spec_dic["avg_price"] :
			field = etree.Element('field')
			field.set("name", "avg_price")
			field.text = price
			doc.append(field)
		
		for open_h in self.spec_dic["opening_hours"] :
			field = etree.Element('field')
			field.set("name", "opening_hours")
			field.text = open_h
			doc.append(field)

		for latlng in self.spec_dic["latlng"] :
			field = etree.Element('field')
			field.set("name", "latlng")
			field.text = latlng
			doc.append(field)			

		for c in self.spec_dic["content"] :
			field = etree.Element('field')
			field.set("name", "content")
			field.text = c
			doc.append(field)	
		
		for img in self.spec_dic["image_url"] :
			field = etree.Element('field')
			field.set("name", "image_url")
			field.text = img
			doc.append(field)		
		
		root = etree.Element('add')			
		root.append(doc)
		
		str = etree.tostring(root, pretty_print=True, encoding="UTF-8")
		f = open(self.spec_dic["id"] + '.xml', 'w')
		f.write(str)
		f.close()
	
	def is_ascii(self, str):
		if str is None:
			return True			
		return all(ord(c) < 128 for c in str)
		
	def dumpJson(self):
		ensureAscii = True		
#		if not self.is_ascii(self.name) or not self.is_ascii(self.address) or not self.is_ascii(self.phone_number):
#			ensureAscii = False			
		
		jsonStr = json.dumps({
			"name" : self.spec_dic["name"],
			"address" : self.spec_dic["address"],
			"phone_number" : self.spec_dic["phone_number"]
		}, ensure_ascii=ensureAscii)

		return jsonStr
		
		
#-- iPeen
class DomainParser_iPeen :
	def __init__(self):
		self.DOMAIN_NAME = "www.ipeen.com.tw"
	
	def isHost(self, url=None):
		if url is not None:
			urlComps = urlparse(url)
			if urlComps.netloc == self.DOMAIN_NAME:
				return True			
		return False
	
	def parse(self, reqs=None):				
		url = reqs.url
		rawHtml = reqs.text
		elem_list = []
		if not self.isHost(url) or reqs is None: 
			return elem_list
		
		pInfo = PlaceInfo()		
		pInfo.spec_dic["id"] = 'ipeen_' + base64.b64encode(url)
		pInfo.spec_dic["url"].append(url)
		
		#-- also public
		html = etree.HTML(rawHtml)
		a_alsoPublic = html.xpath("//*[@id='comment']/header//div[@class='brief']/p[@class='inline']/a")
		if a_alsoPublic:
			url_alsoPub = a_alsoPublic[0].attrib["href"]
			pInfo.spec_dic["url"].append(url_alsoPub)		
		
		#-- content
		cleaner = Cleaner()
		cleanedHtml = cleaner.clean_html(rawHtml)		
		htmlCleaned = lxml.html.fromstring(cleanedHtml)
		div_desc = htmlCleaned.find_class('description')		
		if div_desc :						
			content = div_desc[0].text_content()
			pInfo.spec_dic["content"].append(content)		
			#-- url of images
			imgSrcs = htmlCleaned.xpath("//*[@id='comment']/section/div/div[@class='description']//img/@src")
			if imgSrcs :
				for src in imgSrcs :
					if not src.endswith('gif'):
						pInfo.spec_dic["image_url"].append(src)
				
		#-- <div class="info shop">...</div>
		div_info_shop = html.xpath("//div[contains(@class, 'info shop')]")				
		if div_info_shop :
			a_list = div_info_shop[0].xpath(("//a[contains(@data-action, 'info_shopname')]"))
			#-- place name			
			if a_list is not None and 0 < len(a_list):
				pInfo.spec_dic["name"].append(a_list[0].text)
			
			#-- Address, Phone number, Average consumption
			pp = PageParser()
			li_list = div_info_shop[0].xpath(("ul/li"))
			for li in li_list:
				if li.text is not None:
					str = li.text.strip()
#					print str.encode("cp950")
					
					phoneNum = pp.RegexTWPhoneNum(str)
					if phoneNum is not None: 
						pInfo.spec_dic["phone_number"].append(phoneNum.group(0))
						continue
					
					ITEM_NAME = u"地址：";
					if str.startswith(ITEM_NAME) :
						str = str[len(ITEM_NAME):]
						str = str.strip()
						pInfo.spec_dic["address"].append(str)
						continue
						
					#addr = pp.RegexTWAddress(str)
					#if addr is not None: 
						#pInfo.spec_dic["address"].append(addr.group(0))
						#continue
						
					dollar = pp.RegexTWDollars(str)
					if dollar is not None: 
						pInfo.spec_dic["avg_price"].append(dollar.group(0).replace(",", ""))
						continue
						
			#-- Latitude and Longitude
			a_geoMap = div_info_shop[0].xpath(u"//a[@data-action='info_address']")			
			if a_geoMap :
				href = a_geoMap[0].attrib["href"]
				url = urlparse(href)
				m = re.search("c=[\d\-.,]+", url.fragment)				
				pInfo.spec_dic["latlng"].append(m.group(0).replace("c=",""))
		else:
			return elem_list

		elem_list.append(pInfo)
		return elem_list
		

class TagAddress :	
	def __init__(self):
		self.address = ""
		
	def recursiveChildren(self, x):
		if "childGenerator" in dir(x):
			for child in x.childGenerator():
				name = getattr(child, "name", None)
				#if name is not None : 
				#	logging.info("[Container Node] " + name)
				self.recursiveChildren(child)
		else:
			if not x.isspace(): #Just to avoid printing "\n" parsed from document.
				#logging.info("[Terminal Node] " + x)			
				self.address += x;

		
class PageParser :
	NUM_TOPK_CAND = 5
	PUN_SET = set(string.punctuation)
	
	def __init__(self) :
		self.place_list = []		

	def RegexDigit(self, inStr) :
		p = re.compile('\d+')
		m = p.match(inStr)
		if m :
			return True
		else:
			return False
	
	def RegexTWAddress(self, line) :
		match = None
		#-- filter by number of puncutations
		pun_count = sum(1 for ch in line if ch in self.PUN_SET)	
		if pun_count <= 2 :
			#regex_tw_address = re.compile(u"(?P<zipcode>(\d{5}|\d{3})?)(?P<city>\D{1,2}[縣市])(?P<district>\D+?(市區|鎮區|鎮市|[鄉鎮市區]))(?P<others>.+)")
			regex_tw_address = re.compile(u"(?P<zipcode>(\d{5}|\d{3})?)(?P<city>\D{1,2}[縣市])(?P<district>(\D+(市區|鎮區|鎮市|[鄉鎮市區]))?)(?P<others>.+)")
			match = regex_tw_address.search(line)
		return match
		
	def RegexTWAddress_YahooMap(self, line) :
		#TODO....
		return ""
	
	def RegexTWPhoneNum(self, line) :
		regex_tw_phonenum = re.compile("\(?(0[1-9]{1,2})\)?[\s\-]?(\d{3,4})\-?(\d{3,4})")
		match = regex_tw_phonenum.search(line)
		if match : 
			if len(line) / len(match.group(0)) != 1: 
				match = None
		return match
	
	def RegexTWDollars(self, line) :		
		regex_tw_dollars = re.compile(u"([1-9]{1}[\d]{0,2}(\,[\d]{3})*(\.[\d]{0,2})?|[1-9]{1}[\d]{0,}(\.[\d]{0,2})?|0(\.[\d]{0,2})?|(\.[\d]{1,2})?) *(元|圓|NT|NTD)")
		match = regex_tw_dollars.search(line)
		if match :
			match = re.search("[\d,.]+", match.group(0))			
		return match
		
	def RegexUSAddress(self, line) :	
		regex_us_address = re.compile(r"[ \w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,},\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?")
		match = regex_us_address.search(line, re.IGNORECASE)
		return match
	
	def RegexUSPhoneNum(self, line) :
		regex_us_phone = re.compile("\(\d{3}\) ?\d{3}( |-)?\d{4}|\d{3}( |-)?\d{3}( |-)?\d{4}")
		match = regex_us_phone.search(line)
		if match : 
			if len(line) / len(match.group(0)) != 1: 
				match = None
		return match

	def RegexURL(self, line) :
		regex_url = re.compile(r"(?i)\b((?:[a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))");
		match = regex_url.search(line, re.IGNORECASE)
		return match
			
	def GetPlaceKeywords(self, text, topK = NUM_TOPK_CAND):
		wlist = [word for word in Algorithm(text)]	
		#-- de-duplicate
		wlist = list(set(wlist))
		placeCands = sorted(wlist, reverse=True, key = lambda w: len(w))	
		
		for p in placeCands:
			if topK <= len(self.place_list) :
				break;
			if not self.RegexDigit(p) :
				self.place_list.append(p)
		return self.place_list
		
	def ContentParser(self, text, topK = NUM_TOPK_CAND) :
		trim_line = []	
		lines = re.split('[%s]' % zhon.unicode.PUNCTUATION, text)	
	#	lines = text.split('\n')
	
		for line in lines : 		
			match = self.RegexTWAddress(line)
			if match :
				grp = match.group(0)
				self.place_list.append(grp)
		
			match = self.RegexUSAddress(line)		
			if match :
				grp = match.group(0)
				self.place_list.append(grp)

			match = self.RegexURL(line)
			if match :
				grp = match.group(0)
				line = line.replace(grp,"")					
				
			trim_line.append(line);
				
		trimText = '\n'.join(trim_line)
		self.GetPlaceKeywords(trimText, topK)
		
		return self.place_list;	
		

if __name__=="__main__":	
	given_url = "http://www.ipeen.com.tw/comment/11875"
	#given_url = "http://www.ipeen.com.tw/comment/744932"
	#given_url = "http://www.ipeen.com.tw/comment/730024"
	#given_url = "http://www.ipeen.com.tw/comment/737750"
	#given_url = "http://www.ipeen.com.tw/comment/560952"
	#given_url = "http://www.ipeen.com.tw/comment/626800"
	#given_url = "http://www.ipeen.com.tw/comment/137730"
	#given_url = "http://www.ipeen.com.tw/comment/647564"	
	#given_url = "http://www.ipeen.com.tw/comment/7377500000"
	#given_url = "http://www.ipeen.com.tw/shop/57052-高山拉麵"
	#given_url = "http://www.ipeen.com.tw/shop/57052-%E9%AB%98%E5%B1%B1%E6%8B%89%E9%BA%B5"
	#given_url = "http://loneying.pixnet.net/blog/post/9358099-%E7%86%8A%E3%81%AE%E9%A3%9F%E6%96%B0%E7%AB%B9%E5%85%89%E5%BE%A9%E5%BA%97%E7%86%8A%E6%89%8B%E5%8C%85%E8%B6%85%E5%83%8F%E6%BC%A2%E5%A0%A1%E5%8C%85%E7%9A%84%E5%88%88%E5%8C%85"
	#given_url = "http://meijuily.pixnet.net/blog/post/41041363-%E5%8F%B0%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%97%A9%E5%8D%88%E9%A4%90%E8%8E%8E%E8%8E%8E%E8%8E%89%E6%9C%B5-sausalito-cafe"              
	#given_url = "http://www.tripadvisor.com/Attraction_Review-g60763-d1383285-Reviews-Jersey_Boys-New_York_City_New_York.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g60763-d93475-Reviews-New_York_Marriott_East_Side-New_York_City_New_York.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g45992-d124682-Reviews-Atlantis_Casino_Resort_Spa-Reno_Nevada.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g294212-d813642-Reviews-Double_Happiness_Courtyard_Hotel-Beijing.html"
	#given_url = "http://www.tripadvisor.com.tw/Restaurant_Review-g297907-d4273784-Reviews-Salt_Lick-Hualien.html"
	#given_url = "http://www.tripadvisor.com.tw/Attraction_Review-g293913-d4739729-Reviews-Taiwan_Adventures_Hiking_and_Outdoor_Private_Day_Tour-Taipei.html"
	#given_url = "http://www.yelp.com/biz/lazy-bear-san-francisco"
	#given_url = "http://www.yelp.com/biz/gary-danko-san-francisco"
	#given_url = "https://foursquare.com/v/%E4%B8%AD%E5%8F%8B%E7%99%BE%E8%B2%A8%E5%85%AC%E5%8F%B8-chung-yo-department-store/4baf4b1ef964a52014f63be3"
	#given_url = "https://foursquare.com/v/%E5%8B%A4%E7%BE%8E%E8%AA%A0%E5%93%81%E7%B6%A0%E5%9C%92%E9%81%93-park-lane/4bbafbc498c7ef3b6ea23302"

	url_prefix = "http://www.ipeen.com.tw/comment/"
	for i in range(10000, 20000) :
		given_url = "{0}{1}".format(url_prefix, i)	
		print given_url
	
		reqs = requests.get(given_url)
		dp_ipeen = DomainParser_iPeen()
		elem_list = dp_ipeen.parse(reqs)	
		for e in elem_list :		
			e.writefile_solrAddXML()
