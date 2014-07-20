#-*- coding: utf-8 -*-
import os
import sys
import re
import logging
import string
import urllib2
import json

from urlparse import urlparse
from bs4 import BeautifulSoup
from lxml import etree

		
class PlaceInfo:
	def __init__(self): 
		self.name = None
		self.address = None
		self.phone_number = None
	
	def is_ascii(sefl, str):
		return all(ord(c) < 128 for c in str)
		
	def dumpJson(self):
		ensureAscii = True		
		if not self.is_ascii(self.address) :
			ensureAscii = False
		
		jsonStr = json.dumps({
			"name" : self.name,
			"address" : self.address,
			"phone_number" : self.phone_number
		}, ensure_ascii=ensureAscii)

		return jsonStr
		

class PageProfiler :	
	def profile(self, url=None, raw_html=None) :
		elem_list = []
		if url is None and raw_html is None:
			return 	elem_list

		try:
			if not raw_html and url :
				hdr = {'User-Agent' : 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'}
				req = urllib2.Request(url, headers = hdr)
				resp = urllib2.urlopen(req)
				raw_html = resp.read()	
				
			if not raw_html :
				return elem_list
				
			dp_ipeen = DomainParser_iPeen()
			elem_list = dp_ipeen.parse(url, raw_html)
			if elem_list is not None and 0 < len(elem_list):				
				return elem_list

			dp_tripadv = DomainParser_Tripadvisor()
			elem_list = dp_tripadv.parse(url, raw_html)
			if elem_list is not None and 0 < len(elem_list):
				return elem_list
			
			dp_yelp = DomainParser_Yelp()
			elem_list = dp_yelp.parse(url, raw_html)
			if elem_list is not None and 0 < len(elem_list):
				return elem_list
			
			
			soup = BeautifulSoup(raw_html)			
			pp = PageParser()
			
			curTagName = ""
			addrTagName = None
			phoneTagName = None
			pairAddrPhone_stack = []
			pairTagAddrPhone_stack = []			
			
			for child in soup.recursiveChildGenerator() :
				name = getattr(child, "name", None)
				if name is not None :
					#logging.info(name)					
					curTagName = name
					
					#-- aggregate tags's content <address>
					if "address" == name.lower() : 
						tagAdd = TagAddress()
						tagAdd.recursiveChildren(child)
						pairAddrPhone_stack.append(tagAdd.address)
						pairTagAddrPhone_stack.append('A')												
						continue
						
				elif not child.isspace() and curTagName.lower() != 'script' : # leaf node
					#logging.info(child)					
					mAddress = pp.RegexTWAddress(child)
					mPhoneNum = pp.RegexTWPhoneNum(child)
					
					mUSPhoneNum = pp.RegexUSPhoneNum(child)
					if mUSPhoneNum :						
						tPhone = mUSPhoneNum.group(0)
						pairAddrPhone_stack.append(tPhone)
						pairTagAddrPhone_stack.append('P')						
					
					if mAddress :
						addr = mAddress.group(0)						
						###self.response.write(u"{0} {1} <br>".format(curTagName, addr))
						pairAddrPhone_stack.append(addr)
						pairTagAddrPhone_stack.append('A')
					
					if mPhoneNum :
						tPhone = mPhoneNum.group(0)
						###self.response.write(u"{0} {1} <br>".format(curTagName, tPhone ))
						pairAddrPhone_stack.append(tPhone)
						pairTagAddrPhone_stack.append('P')					
					
				#-- pop pair-wrised Address/TelephoneNum
				if 2 <= len(pairTagAddrPhone_stack) :
					stk = pairTagAddrPhone_stack[-2:]						
					stk.sort()					
					if 'A' == stk[0] and 'P' == stk[1]: 
						addr = None
						tPhone = None
						placeInfo_dict = PlaceInfo()
						for i in range(2) :
							tag = pairTagAddrPhone_stack.pop()
							val = pairAddrPhone_stack.pop()
							if tag == 'A' : addr = val
							if tag == 'P' : tPhone = val
						placeInfo_dict.address = addr
						placeInfo_dict.phone_number = tPhone
						elem_list.append(placeInfo_dict)		
			
			placeInfo_dict = PlaceInfo()
			for i in range(len(pairTagAddrPhone_stack)) :
				tag = pairTagAddrPhone_stack.pop()
				val = pairAddrPhone_stack.pop()
				if tag == 'A' : placeInfo_dict.address = val
				if tag == 'P' : placeInfo_dict.phone_number = val
				elem_list.append(placeInfo_dict)
							
		except urllib2.HTTPError, e:
			logging.error(e.fp.read())
		#except:
		#	logging.error("Unexpected error: {0}".format(sys.exc_info()[0]))
			
		return elem_list		

		
#-- Yelp
class DomainParser_Yelp :
	def __init__(self):
		self.DOMAIN_NAME = "www.yelp.com"
	
	def isHost(self, url=None):
		if url is not None:
			urlComps = urlparse(url)
			if urlComps.netloc == self.DOMAIN_NAME:
				return True			
		return False
	
	def parse(self, url=None, raw_html=None):
		if not self.isHost(url) or raw_html is None: 
			return []
		
		pInfo = PlaceInfo()
		soup = BeautifulSoup(raw_html)
		
		h1_biz_page_title = soup.find("h1", class_=re.compile("biz-page-title.*"))
		if h1_biz_page_title is not None and h1_biz_page_title.string is not None:
			pInfo.name = h1_biz_page_title.string.strip()
		
		#-- div for map box information
		div_mapbox = soup.find("div", class_="mapbox")
		
		#-- div for place information
		div_mapbox_text = div_mapbox.find("div", class_="mapbox-text")
			
		#-- address
		address = div_mapbox_text.find("address", attrs={"itemprop" : "address"})
		addr = ""
		for str in address.stripped_strings :
			if str is not None : 				
				addr += str
		if 0 < len(addr) : pInfo.address = addr
				
		#-- phone
		span_biz_phone = div_mapbox_text.find("span", class_="biz-phone")
		if span_biz_phone.string is not None :
			pInfo.phone_number = span_biz_phone.string.strip()						
		
		elem_list = []
		elem_list.append(pInfo)
		return elem_list
		

#-- Tripadvisor
class DomainParser_Tripadvisor :
	def __init__(self):
		self.DOMAIN_NAME = "www.tripadvisor.com"
	
	def isHost(self, url=None):
		if url is not None:
			urlComps = urlparse(url)			
			if 0 == urlComps.netloc.find(self.DOMAIN_NAME):
				return True			
		return False
	
	def parse(self, url=None, raw_html=None):		
		if not self.isHost(url) or raw_html is None: 
			return []
		
		pInfo = PlaceInfo()
		soup = BeautifulSoup(raw_html)
		
		#-- div for place information
		div_heading_group = soup.find("div", id="HEADING_GROUP")		
		
		#-- place name
		h1_heading = div_heading_group.find("h1", id="HEADING")		
		for str in h1_heading.stripped_strings :
			pInfo.name = str			
		
		#-- address
		addr = ""
		span_format_address = div_heading_group.find("span", class_="format_address")
		for str in span_format_address.stripped_strings :
			if str is not None :
				addr += str
		if 0 < len(addr) : pInfo.address = addr	
		
		#-- phone		
		#e.g. 
		#
		# <div class="fl phoneNumber">02-23465867</div>
		#
		div_f1_phoneNumber = div_heading_group.find("div", class_="fl phoneNumber")
		if div_f1_phoneNumber is not None :
			pInfo.phone_number = div_f1_phoneNumber.string
		#e.g. 
		#
		# <div class="fl notLast">
		# <div class="grayPhone sprite-grayPhone fl icnLink"></div>
		# <div class="fl">
		# <script>
		# <!--
		# function escramble_899(){
		# var a,b,c
		# a='+1 '
		# b='21-'
		# a+='800-'
		# b+='2080'
		# c='8'
		# document.write(a+c+b)
		# }
		# escramble_899()
		# //-->
		# </script>
		# </div>
		# </div>
		# 
		else :
			div_f1_all = div_heading_group.find_all("div", class_="fl notLast")			
			for div_f1 in div_f1_all :
				if div_f1.find("div", class_="grayPhone sprite-grayPhone fl icnLink") is not None :
					script = div_f1.find("script")
					if script is not None : 
						for line in script.string.strip().splitlines():
							if 0 <= line.strip().find("="):
								#-- compile and execute statements by python
								expr = line								
								exec expr
							if 0 <= line.strip().find("document.write"):
								#-- evaluate final result, e.g. "document.write(a+c+b)"
								expr_aggre = line[line.find('(')+1 : line.find(')')]
								rs = eval(expr_aggre)
								pInfo.phone_number = rs
								break;
		
		elem_list = []
		elem_list.append(pInfo)
		return elem_list
		
		
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
	
	def parse(self, url=None, raw_html=None):
		if not self.isHost(url) or raw_html is None: 
			return []
		
		pInfo = PlaceInfo()				
		html = etree.HTML(raw_html)
		
		#-- <div class="info shop">...</div>
		div_info_shop = html.xpath("//div[contains(@class, 'info shop')]")
		#print etree.tostring(div[0], pretty_print=True, method="html", encoding="big5")		
		
		if div_info_shop is not None and 0 < len(div_info_shop) :
			a_list = div_info_shop[0].xpath(("//a[contains(@data-action, 'info_shopname')]"))
			#-- place name
			if a_list is not None and 0 < len(a_list):
				pInfo.name = a_list[0].text
			
			#-- address and phone number
			pp = PageParser()
			li_list = div_info_shop[0].xpath(("ul/li"))
			for li in li_list:
				if li.text is not None:
					str = li.text.strip()								
					phoneNum = pp.RegexTWPhoneNum(str)
					if phoneNum is not None: pInfo.phone_number = phoneNum.group(0)									
					addr = pp.RegexTWAddress(str)
					if addr is not None: pInfo.address = addr.group(0)
		
		elem_list = []
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
		regex_tw_address = re.compile("\(?(0[1-9]{1,2})\)?[\s\-]?(\d{3,4})\-?(\d{3,4})")
		match = regex_tw_address.search(line)
		if match : 
			if len(line) / len(match.group(0)) != 1: 
				match = None
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
	

def benchmark(text):
	import time
	dict_load_defaults()
	print ">>>> load dict done!"
    
	for i in range(100):
		begin = time.time()
		wlist = [word for word in Algorithm(text)]
		end = time.time()
		print ">>>> times: %f" % float(end-begin)
        

if __name__=="__main__":
	'''
	pProfiler = PageProfiler()
	elem_list = pProfiler.profile("http://www.ipeen.com.tw/comment/560952")	
	for e in elem_list :
		if e.has_key("address") : print(e["address"])
		if e.has_key("phone_number") : print(e["phone_number"])

	print("--")
	elem_list2 = pProfiler.profile("http://www.tripadvisor.com/Hotel_Review-g60878-d613399-Reviews-Hotel_1000-Seattle_Washington.html")
	for e in elem_list2 :
		if e.has_key("address") : print(e["address"])
		if e.has_key("phone_number") : print(e["phone_number"])
	'''
	pp = PageParser()
	mAddress = pp.RegexTWAddress(u"基隆市中正區信三路13號")
	if mAddress :
		print mAddress.group(0)
	print "end"
	
