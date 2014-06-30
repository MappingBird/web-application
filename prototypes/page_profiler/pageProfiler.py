#-*- coding: utf-8 -*-
import os
import sys
import re
import logging
import string
import urllib2

# sys.path.insert(0, 'libs')
# from bs4 import BeautifulSoup
from BeautifulSoup import BeautifulSoup


class Enum(set):
    def __getattr__(self, name):
        if name in self:
            return name
        raise AttributeError
	

class PageProfiler :
	def __init__(self) : 
		self.AttrEnum = Enum(["address", "phone_number"])
		
	def profile(self, url=None, raw_html=None) :
		elem_list = []
		if url is None and raw_html is None:
			return 	elem_list
	
		try:
			if url :
				hdr = {'User-Agent' : 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'}
				req = urllib2.Request(url, headers = hdr)
				resp = urllib2.urlopen(req)
				raw_html = resp.read()	
			if not raw_html :
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
						placeInfo_dict = {}
						for i in range(2) :
							tag = pairTagAddrPhone_stack.pop()
							val = pairAddrPhone_stack.pop()
							if tag == 'A' : addr = val
							if tag == 'P' : tPhone = val
						placeInfo_dict["address"] = addr
						placeInfo_dict["phone_number"] = tPhone
						elem_list.append(placeInfo_dict)		
			
			placeInfo_dict = {}
			for i in range(len(pairTagAddrPhone_stack)) :
				tag = pairTagAddrPhone_stack.pop()
				val = pairAddrPhone_stack.pop()
				if tag == 'A' : placeInfo_dict["address"] = val
				if tag == 'P' : placeInfo_dict["phone_number"] = val
				elem_list.append(placeInfo_dict)
							
		except urllib2.HTTPError, e:
			logging.error(e.fp.read())
		#except:
		#	logging.error("Unexpected error: {0}".format(sys.exc_info()[0]))
			
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
	
