import jinja2
import os
import cgi
import datetime
import json
import logging
import webapp2
import urlparse
import urllib
import urllib2
import string
import re
import sys

sys.path.append('libs')
	
from google.appengine.ext import db
from google.appengine.api import users

from pageProfiler import PageProfiler
from pageProfiler import PageParser
#from goose import Goose


jinja_environment = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))


class MainPage(webapp2.RequestHandler):
	def get(self):
		template_values = { 'key_h1' : 'Please input a place keyword'}
		template = jinja_environment.get_template('index.html')
		self.response.out.write(template.render(template_values))
		
		
class PlaceParser(webapp2.RequestHandler):
	def post(self):
		content = self.request.get('url')
		template_values = { 'key_h1' : 'Input Target Url' }
		template = jinja_environment.get_template('input_content.html')
		self.response.out.write(template.render(template_values))
	
	def get_address(self, latlng_json):
#		params = "latlng={0},{1}&sensor={2}&language={3}".format(latlng_json["lat"], latlng_json["lng"], "false", "zh-TW")
		params = "latlng={0},{1}&sensor={2}".format(latlng_json["lat"], latlng_json["lng"], "false")
		url = "http://maps.googleapis.com/maps/api/geocode/json?{0}".format(params)
		resp = urllib2.urlopen(url)
		resp_jsonStr = resp.read()
		resp_json = json.loads(resp_jsonStr)
		
		address_str = ""
		try:			
			if "OK" == resp_json["status"] : 
				for afgt in resp_json["results"] :	
					logging.info(afgt["types"][0])
					if "street_address" == afgt["types"][0] :
						address_str = afgt["address"]
						break;
		except:
			logging.error("Unexpected error: {0}".format(sys.exc_info()[0]))
			
		return address_str			

	def get(self):
		resp_list = []	
		url = self.request.get('url')			
		
		pProfiler = PageProfiler()
		elem_list = pProfiler.profile(url)					
		for e in elem_list :
			if e.has_key("address") : self.response.write(e["address"] + "<br>")
			if e.has_key("phone_number") : self.response.write(e["phone_number"] + "<br>")		
		
		return
		
		'''		
		llParser = LatLngParser()
		latLngJsonStr = llParser.parse(url)				
		if 0 < len(latLngJsonStr) :
			latlng_list = json.loads(latLngJsonStr)
			for ll in latlng_list :
				address_str = self.get_address(ll)
				elem_dic = {}
				elem_dic["latlng"] = ll
				elem_dic["address"] = format(address_str)
				resp_list.append(elem_dic)
								
			self.response.write(json.dumps(resp_list))			
			return
		'''

#		xhtml = lxml.html.fromstring(html)		
#		content = xhtml.find(".//title").text
		xhtml = lxml.html.fromstring(html)
		readableTitle = Document(html).title()
		
		pp = PageParser();
		placeKeywords = pp.ContentParser(readableTitle)
		words = ', '.join(placeKeywords)
		self.response.write(u"{0}<br>".format(words))
		
		for key in placeKeywords:
			try:
				keyword = key
				params = u"query={1}&sensor={0}&key={2}".format(keyword, 'false', 'AIzaSyBL7_vxI2gqtNQnfo1OAl2ELvRAW1_k2CA')
#				url = "http://maps.googleapis.com/maps/api/geocode/json?%s" % params
				url = "https://maps.googleapis.com/maps/api/place/textsearch/json?{0}".format(params)
				logging.info('GeoCoding request: %s', url)
				response = urllib2.urlopen(url)
				resp_jsonStr = response.read()
				logging.info(resp_jsonStr)
				resp_json = json.loads(resp_jsonStr)
				resp_status = resp_json["status"]
				
				lat = 0
				lng = 0
				if resp_status == "OK":
					lat = resp_json["results"][0]["geometry"]["location"]["lat"]
					lng = resp_json["results"][0]["geometry"]["location"]["lng"]
													
	#			logging.info('GeoCoding response: %s', resp_jsonStr)
	#			logging.info('#(results): %s', len(resp_json["results"]))			
				jsonStr = json.dumps([{'lat' : lat, 'lng' : lng}])	
				self.response.write(jsonStr)
			except Exception as e:
				logging.error("Unexpected error: {0}".format(sys.exc_info()[0]))
				
class LatLngParser:
	def parse(self, url) :
		jsonStr = ""
		
		try:
			resp = urllib2.urlopen(url)
			page_html = resp.read()
			xhtml = lxml.html.fromstring(page_html)
#			logging.info(page_html)
			imageUrls = xhtml.xpath('//img[@src]/@src')
			for imgSrc in imageUrls :
				latLng = ""
				parsed = urlparse.urlparse(imgSrc)								
				#-- google map
				if parsed.netloc == 'maps.google.com' :
					params = urlparse.parse_qs(urlparse.urlparse(imgSrc).query)
					latLng = params.get('center')					

				#-- bing map		
				if parsed.netloc == 'dev.virtualearth.net' :					
					params = urlparse.parse_qs(urlparse.urlparse(imgSrc).query)					
					latLng = params.get('pp')
					
				if (0 < len(latLng)) :
					latLng_list = latLng[0].split(',')
					jsonStr = json.dumps([{'lat' : latLng_list[0], 'lng' : latLng_list[1]}])
					break
						
			if len(jsonStr) <= 0 :
				urls = re.findall(r"http://.*?\s+", page_html)
				for httpUrl in urls :
					jsonStr = self.bingMap(httpUrl)
					if (0 < len(jsonStr)) : break
				
		except IOError as e :
			logging.error("I/O error({0}): {1}".format(e.errno, e.strerror))		
		except Exception as e:
			logging.error("Unexpected error: {0}".format(sys.exc_info()[0]))
			
		logging.info("{0}: jsonStr={1}".format(self.__class__.__name__, jsonStr));
		return jsonStr
		
	def bingMap (self, url_str):
		latLnt_json = ""
		
		parsed = urlparse.urlparse(url_str)
		if parsed.netloc == 'dev.virtualearth.net' :
			params = urlparse.parse_qs(urlparse.urlparse(url_str).query)
			latLng = params.get('pp')			
			if (latLng is not None):
				latLng_list = latLng[0].split(',')
				latLnt_json = json.dumps([{'lat' : latLng_list[0], 'lng' : latLng_list[1]}])				
		return latLnt_json;

				
class ShowDic(webapp2.RequestHandler):
    def get(self):
		self.response.headers['Content-Type'] = 'text/plain'
		self.response.write('Hello, webapp2 World!')
		
		path_worddic = os.path.join(os.path.dirname(__file__), 'pymmseg', 'data', 'words.dic')
		f = open(path_worddic)
		for line in f:
			self.response.write(line)
		f.close()                


app = webapp2.WSGIApplication([('/placeparser', PlaceParser),
							   ('/showdic', ShowDic),							   
							   ('/', MainPage)							   
							  ],							   
                              debug=True)
  
							  
def main():
	# Set the logging level in the main function
	# See the section on Requests and App Caching for information on how
	# App Engine reuses your request handlers when you specify a main function
	logging.getLogger().setLevel(logging.DEBUG)
	webapp.util.run_wsgi_app(app)

if __name__ == '__main__':
    main()
