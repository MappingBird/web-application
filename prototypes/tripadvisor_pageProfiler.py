#-*- coding: utf-8 -*-
import os
import sys
import re
import logging
import string
import urllib2
import json
import base64
import datetime

from types import *
from urlparse import urlparse
from bs4 import BeautifulSoup
from lxml import etree
from lxml.html.clean import Cleaner
import lxml.html
import requests


class PlaceInfo:
	def __init__(self):
		self.spec_dic = {
			"id":None, "article_name":None, "publish_dt":None, 
			"place_name":[], "url":[], "offical_url":[], 
			"phone_number":[], "address":[], "avg_price":[], 
			"opening_hours":[], "latlng":[], 
			"content":[], "review":[], "image_url":[]
		}
	
	def writefile_solrAddXML(self, path, prefix) :
		doc = etree.Element('doc')
		
		field = etree.Element('field')
		field.set("name", "id")
		field.text = self.spec_dic["id"]
		doc.append(field)

		field = etree.Element('field')
		field.set("name", "article_name")
		field.text = self.spec_dic["article_name"]
		doc.append(field)
		
		field = etree.Element('field')
		field.set("name", "publish_dt")
		field.text = self.spec_dic["publish_dt"]
		doc.append(field)
		
		for n in self.spec_dic["place_name"] :
			field = etree.Element('field')
			field.set("name", "place_name")
			field.text = n
			doc.append(field)
			
		for u in self.spec_dic["url"]:
			field = etree.Element('field')
			field.set("name", "url")
			field.text = u
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
		f = open(path + prefix + self.spec_dic["id"] + '.xml', 'w')
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
		
		
#-- tripAdvisor
class DomainParser_tripAdvisor :
	api_hotels_dic = {'www.tripadvisor.com.tw':'http://www.tripadvisor.com.tw/Hotels'}
	api_attraction_dic = {'www.tripadvisor.com.tw':'http://www.tripadvisor.com.tw/AttractionsAjax-g{0}'}
	api_restaurant_dic = {'www.tripadvisor.com.tw':'http://www.tripadvisor.com.tw/RestaurantSearch'}
	

	def __init__(self):
		self.DOMAIN_NAME = "www.tripadvisor.com"		
	
	def isHost(self, url=None):
		if url is not None:
			urlComps = urlparse(url)
			if urlComps.netloc == self.DOMAIN_NAME:
				return True			
		return False
		
	def crawl(self, tours):		
		for url_country in tours:
			parsedHostUrl = None
			
			#-- get href(s) of tourism City list
			url_popularCityies = []
			for i in range(0,1000):
				url = "{0}&offset={1}".format(url_country, i)				
				reqs = requests.get(url)
				rawHtml = reqs.text
				html = etree.HTML(rawHtml)
				href_cities = html.xpath("/html/body/a/@href")
				
				#-- stop condition
				if 0 < len(href_cities):
					if any(href_cities[0] in url for url in url_popularCityies):
						break;

				parsedHostUrl = urlparse(url)
				host = parsedHostUrl.netloc				
				schema_host = '{url.scheme}://{url.netloc}'.format(url=parsedHostUrl)
				for href in href_cities:					
					url_popularCityies.append(schema_host + href)
				
			#-- traverse all Cities
			for url in url_popularCityies:
				print "City url: {0}".format(url)
				print 
				
				reqs = requests.get(url)
				rawHtml = reqs.text
				html = etree.HTML(rawHtml)
				href_hotels_nav = html.xpath("//div[@class='navLinks']//a[@data-trk='hotels_nav']/@href")				
				if href_hotels_nav:
					m_geo = re.search('\-g(\d+)\-', href_hotels_nav[0])					
					if 1 <= len(m_geo.groups()):
						geo = m_geo.group(1)
						self.crawl_hotels(geo, parsedHostUrl)
					
				href_attractions_nav = html.xpath("//div[@class='navLinks']//a[@data-trk='attractions_nav']/@href")							
				if href_attractions_nav:
					print href_attractions_nav[0]
					print 
					
				href_restaurants_nav = html.xpath("//div[@class='navLinks']//a[@data-trk='restaurants_nav']/@href")
				if href_restaurants_nav:
					m_geo = re.search('\-g(\d+)\-', href_restaurants_nav[0])					
					if 1 <= len(m_geo.groups()):
						geo = m_geo.group(1)
						self.crawl_restaurants(geo, parsedHostUrl)
				
				break;
								
	def crawl_hotels(self, geo, parsedHostUrl):
		url_ajax_hotels = "http://www.tripadvisor.com.tw/Hotels"
		payload = {
			"seen":"0"
			,"sequence":"1"
			,"sortOrder":"popularity"
			,"geo":""
			,"requestingServlet":"Hotels"
			,"refineForm":"true"
			,"hs":""
			,"o":""
			,"rad":"0"
			,"dateBumped":"NONE"
			,"displayedSortOrder":"popularity"
		}
		payload["geo"] = geo
		payload["o"] = "a0"
		req = requests.post(url_ajax_hotels, data=payload)
			
		html = etree.HTML(req.text)
		href_hotels = html.xpath("//a[@class='property_title']/@href")
		#-- extract hotels in a page
		for h in href_hotels:
			hotel_url = '{url.scheme}://{url.netloc}/{href}'.format(url=parsedHostUrl, href=h)
			print hotel_url			
			reqHotel = requests.get(hotel_url)
			htmlHotel = etree.HTML(reqHotel.text)
			
			#-- name
			h1_head = htmlHotel.xpath("//*[@id='HEADING']")
			if h1_head:
				#if 0 < len(h1_head[0].text.strip()):
				nameStr = h1_head[0].xpath("string()").strip()
				print nameStr
			#h1Span_head = htmlHotel.xpath("//*[@id='HEADING']/span[@class='altHead']")
			#if h1Span_head and h1Span_head[0].text:
			#	print h1Span_head[0].text.strip()
				
			#-- address
			address = ""
			span_fmtAddress = htmlHotel.xpath("//address/span[@rel='v:address']/span[@class='format_address']")
			if span_fmtAddress:
				address = span_fmtAddress[0].xpath("string()")
				print address						
			
			#-- official site url
			span_onclick = htmlHotel.xpath("//div[@class='fl']/span/@onclick")			
			if span_onclick:
				# get encoding redirect service address
				s = re.sub(r'[^{]+{([^}]*)}[^}]+', r'{\1}', span_onclick[0], flags=re.IGNORECASE)
				s = s.replace('\'','"')				
				jsonAddr = json.loads(s)
				encodingRedirPP = jsonAddr["aHref"]
				# decode 
				pathParamystr = self._asdf(encodingRedirPP)
				redirAPI_url = '{url.scheme}://{url.netloc}/{pp}'.format(url=parsedHostUrl, pp=pathParamystr)
				redir_req = requests.get(redirAPI_url)
				print redir_req.url
											
			#-- phone
			scriptPhone = htmlHotel.xpath("//*/div[@class='grayPhone sprite-grayPhone fl icnLink']/../div[2]/script")			
			if scriptPhone:
				script = scriptPhone[0].text.strip()
				for line in script.split('\n'):
					if 0 <= line.strip().find("="):
					#-- compile and execute statements by python
						expr = line								
						exec expr
					if 0 <= line.strip().find("document.write"):
						#-- evaluate final result, e.g. "document.write(a+c+b)"
						expr_aggre = line[line.find('(')+1 : line.find(')')]
						phoneNum = eval(expr_aggre)
						print phoneNum
						break;
			
			#-- photos
			detail = ""
			geo = ""
			for str in h.split('-'):			
				m = re.match("d(\d+)", str)
				if m:
					detail = m.group(1)
				m = re.match("g(\d+)", str)
				if m:
					geo = m.group(1)
			album_url = '{url.scheme}://{url.netloc}/LocationPhotoAlbum?detail={d}&geo={g}'.format(url=parsedHostUrl, d=detail, g=geo)			
			reqPhotos = requests.get(album_url)
			htmlPhotos = etree.HTML(reqPhotos.text)
			div_photos = htmlPhotos.xpath("//div[@class='albumGridItem albumCover']")	
			imgSrc_set = set()	
			if div_photos:
				for d in div_photos:
					img_src = d.xpath(".//img/@src")
					if img_src:
						s = img_src[0]
						s = re.sub(r'photo-\w', 'photo-s', s, flags=re.IGNORECASE)						
						imgSrc_set.add(s)
			#for s in imgSrc_set:
			#	print s
									
			#-- reviews
			div_innerBubbles = htmlHotel.xpath("//div[@class='innerBubble']")			
			for div in div_innerBubbles:
				span_noQuotes = div.xpath("./div/div[@class='quote']/a/span")
				if span_noQuotes:
					noQuotes = span_noQuotes[0].text.strip()
					#print noQuotes
				
				span_entry = div.xpath("./div/div[@class='entry']/p")
				if span_entry:
					entry = span_entry[0].text.strip()							
					#print entry
					
			#-- lat/lng
			#TODO...
			
			print 
			break;
						
	def crawl_restaurants(self, geo, parsedHostUrl):
		url_ajax_hotels = "http://www.tripadvisor.com.tw/RestaurantSearch"
		payload = {
			"Action":"PAGE"
			,"ajax":"1"
			,"geo":""
			,"mapProviderFeature":"ta-maps-gmaps3"
			,"o":""
			,"sortOrder":"popularity"
		}
		payload["geo"] = geo
		payload["o"] = "a0"
		
		params = []
		for k, v in payload.items():
			params.append("{0}={1}".format(k, v))
		paramStr = '&'.join(params)
		url = "{0}?{1}".format(url_ajax_hotels, paramStr)
		
		req = requests.get(url)
		html = etree.HTML(req.text)
		href_rstrnts = html.xpath("//a[@class='property_title ']/@href")
		for h in href_rstrnts:								
			rstrnt_url = '{url.scheme}://{url.netloc}/{href}'.format(url=parsedHostUrl, href=h)
			print rstrnt_url			
			reqRstrnt = requests.get(rstrnt_url)
			htmlRstrnt = etree.HTML(reqRstrnt.text)
			
			#-- head
			h1_head = htmlRstrnt.xpath("//*[@id='HEADING']")			
			if h1_head:
				nameStr = h1_head[0].xpath("string()").strip()
				print nameStr
				
			#-- address
			address = ""
			span_fmtAddress = htmlRstrnt.xpath("//address/span[@rel='v:address']/span[@class='format_address']")
			if span_fmtAddress:
				address = span_fmtAddress[0].xpath("string()")
				print address			
			
			#-- official site url
			span_onclick = htmlRstrnt.xpath("//div[@class='fl']/span/@onclick")			
			if span_onclick:
				# get encoding redirect service address
				s = re.sub(r'[^{]+{([^}]*)}[^}]+', r'{\1}', span_onclick[0], flags=re.IGNORECASE)
				s = s.replace('\'','"')				
				jsonAddr = json.loads(s)
				encodingRedirPP = jsonAddr["aHref"]
				# decode 
				pathParamystr = self._asdf(encodingRedirPP)
				redirAPI_url = '{url.scheme}://{url.netloc}/{pp}'.format(url=parsedHostUrl, pp=pathParamystr)
				redir_req = requests.get(redirAPI_url)
				print redir_req.url				
			
			#-- phone
			div_phoneNumber = htmlRstrnt.xpath("//*/div[@class='fl phoneNumber']")
			if div_phoneNumber:
				print div_phoneNumber[0].text
			
			#-- photos
			detail = ""
			geo = ""
			for str in h.split('-'):			
				m = re.match("d(\d+)", str)
				if m:
					detail = m.group(1)
				m = re.match("g(\d+)", str)
				if m:
					geo = m.group(1)				
			album_url = '{url.scheme}://{url.netloc}/LocationPhotoAlbum?detail={d}&geo={g}'.format(url=parsedHostUrl, d=detail, g=geo)			
			reqPhotos = requests.get(album_url)
			htmlPhotos = etree.HTML(reqPhotos.text)				
			div_photos = htmlPhotos.xpath("//div[@class='photos inHeroList']")
			imgSrc_set = set()			
			if div_photos:
				img_src = div_photos[0].xpath(".//img/@src")
				if img_src:
					for s in img_src:
						s = re.sub(r'photo-\w', 'photo-s', s, flags=re.IGNORECASE)						
						imgSrc_set.add(s)
			#for s in imgSrc_set:
			#	print s
			
			#-- lat/lng
			#div_img = htmlRstrnt.xpath("//div[@id='STATIC_MAP']/span/img")
			### delay load ><				
							
			break;
			
	def _asdf(self, d):		
		h = {
			"": ["&", "=", "p", "6", "?", "H", "%", "B", ".com", "k", "9", ".html", "n", "M", "r", "www.", "h", "b", "t", "a", "0", "/", "d", "O", "j", "http://", "_", "L", "i", "f", "1", "e", "-", "2", ".", "N", "m", "A", "l", "4", "R", "C", "y", "S", "o", "+", "7", "I", "3", "c", "5", "u", 0, "T", "v", "s", "w", "8", "P", 0, "g", 0], 
			"q": [0, "__3F__", 0, "Photos", 0, "https://", ".edu", "*", "Y", ">", 0, 0, 0, 0, 0, 0, "`", "__2D__", "X", "<", "slot", 0, "ShowUrl", "Owners", 0, "[", "q", 0, "MemberProfile", 0, "ShowUserReviews", "\"", "Hotel", 0, 0, "Expedia", "Vacation", "Discount", 0, "UserReview", "Thumbnail", 0, "__2F__", "Inspiration", "V", "Map", ":", "@", 0, "F", "help", 0, 0, "Rental", 0, "Picture", 0, 0, 0, "hotels", 0, "ftp://"],
			"x": [0, 0, "J", 0, 0, "Z", 0, 0, 0, ";", 0, "Text", 0, "(", "x", "GenericAds", "U", 0, "careers", 0, 0, 0, "D", 0, "members", "Search", 0, 0, 0, "Post", 0, 0, 0, "Q", 0, "$", 0, "K", 0, "W", 0, "Reviews", 0, ",", "__2E__", 0, 0, 0, 0, 0, 0, 0, "{", "}", 0, "Cheap", ")", 0, 0, 0, "#", ".org"],
			"z": [0, "Hotels", 0, 0, "Icon", 0, 0, 0, 0, ".net", 0, 0, "z", 0, 0, "pages", 0, "geo", 0, 0, 0, "cnt", "~", 0, 0, "]", "|", 0, "tripadvisor", "Images", "BookingBuddy", 0, "Commerce", 0, 0, "partnerKey", 0, "area", 0, "Deals", "from", "\\", 0, "urlKey", 0, "'", 0, "WeatherUnderground", 0, "MemberSign", "Maps", 0, "matchID", "Packages", "E", "Amenities", "Travel", ".htm", 0, "!", "^", "G"]
		}
		
		b = "";
		gen_i_c = ((i, c) for i, c in enumerate(d))
		for i, c in gen_i_c:			
			j = c
			f = j
			if j in h and i + 1 < len(d) :				
				next_i_c = next(gen_i_c)
				c = next_i_c[1]
				f = "{0}{1}".format(f, c)				
			else :
				j = ""
			
			g = self._getOffset(c);				
			if g < 0 or (type(h[j][g]) is NoneType) :
				b = "{0}{1}".format(b, f)
			else :
				b = "{0}{1}".format(b, h[j][g])
				
		return b 
		
	def _getOffset(seld, a):
		if ord(a) >= 97 and ord(a) <= 122:
			return ord(a) - 61
			
		if ord(a) >= 65 and ord(a) <= 90: 
			return ord(a) - 55
			
		if ord(a) >= 48 and ord(a) <= 71:
			return ord(a) - 48
			
		return -1

		
						
	
	def parse(self, reqs=None):				
		url = reqs.url
		rawHtml = reqs.text
		elem_list = []
		if not self.isHost(url) or reqs is None: 
			return elem_list
		
		pInfo = PlaceInfo()		
		pInfo.spec_dic["id"] = base64.b64encode(url)
		pInfo.spec_dic["url"].append(url)
								
		html = etree.HTML(rawHtml)
		
		#-- article_name		
		h1_articleName = html.xpath("//*[@id='comment']/header//div[@class='info']/h1")
		if h1_articleName:
			articleName = h1_articleName[0].text.strip()
			pInfo.spec_dic["article_name"] = articleName
		
		#-- publish datetime
		span_publishDatetime = html.xpath("//*[@id='comment']/header//div[@class='brief']/p[@class='inline date']/span")
		if span_publishDatetime :
			publish_dt = span_publishDatetime[0].text.strip()
			dt = datetime.datetime.strptime(publish_dt, "%Y-%m-%d %H:%M:%S")
			pInfo.spec_dic["publish_dt"] = dt.isoformat() + 'Z'
		
		#-- also public
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
			#imgSrcs = htmlCleaned.xpath("//*[@id='comment']/section/div/div[@class='description']//img/@src")
			imgSrcs = htmlCleaned.xpath("//div[@class='description']//img/@src")			
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
				pInfo.spec_dic["place_name"].append(a_list[0].text)
			
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
						
					###addr = pp.RegexTWAddress(str)
					###if addr is not None: 
						###pInfo.spec_dic["address"].append(addr.group(0))
						###continue
						
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
	given_url = "http://www.ipeen.com.tw/comment/745228"
	#given_url = "http://www.ipeen.com.tw/comment/11875"
	#given_url = "http://www.ipeen.com.tw/comment/744932"
	#given_url = "http://www.ipeen.com.tw/comment/730024"
	#given_url = "http://www.ipeen.com.tw/comment/737750"
	#given_url = "http://www.ipeen.com.tw/comment/560952"	
	#given_url = "http://www.tripadvisor.com/Attraction_Review-g60763-d1383285-Reviews-Jersey_Boys-New_York_City_New_York.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g60763-d93475-Reviews-New_York_Marriott_East_Side-New_York_City_New_York.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g45992-d124682-Reviews-Atlantis_Casino_Resort_Spa-Reno_Nevada.html"
	#given_url = "http://www.tripadvisor.com/Hotel_Review-g294212-d813642-Reviews-Double_Happiness_Courtyard_Hotel-Beijing.html"
	#given_url = "http://www.tripadvisor.com.tw/Restaurant_Review-g297907-d4273784-Reviews-Salt_Lick-Hualien.html"
	#given_url = "http://www.tripadvisor.com.tw/Attraction_Review-g293913-d4739729-Reviews-Taiwan_Adventures_Hiking_and_Outdoor_Private_Day_Tour-Taipei.html"	
	
	dataRoot = 'data/tripadvisor/'	
	tourism_list = ["http://www.tripadvisor.com/TourismChildrenAjax?geo=293910"]
	ta = DomainParser_tripAdvisor()
	ta.crawl(tourism_list)
		
	
#	for e in elem_list :
#		e.writefile_solrAddXML(dataRoot + dataSubFolder, prefix)
				
