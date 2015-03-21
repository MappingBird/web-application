import solr

#-- Solr client
class BarnOwl:
    s_ = None
    sUrl_ = "http://127.0.0.1:8983/solr/posts"
    #TODO... logging

    def __init__(self, serverUrl = None):
        if serverUrl:
            self.sUrl_ = serverUrl
        self.s_ = solr.SolrConnection(self.sUrl_)
        print self.sUrl_

    def getPointByUrl(self, qUrl):
        qUrl = "\"{0}\"".format(qUrl)
        q = "{0}:{1}".format("url", qUrl)
        print q

        resp = {}
        try:
            resp = self.s_.query(q)
        except Exception, e:
            print e
        
        for p in resp:
            if "id" in p: p.pop("id")
            if "url2point" in p: p.pop("url2point")
            if "content" in p: p.pop("content")
            if "review" in p: p.pop("review")

        return resp

    def escSpecialQueryStr(self, qStr):
        #-- escaping special characters
        #   i.e.+ - && || ! ( ) { } [ ] ^ " ~ * ? : \ /        
        qStr = qStr.replace('\\', "\\\\")
        qStr = qStr.replace('/', "\/")
        qStr = qStr.replace(':', "\:")
        qStr = qStr.replace('?', "\?")
        qStr = qStr.replace('*', "\*")
        qStr = qStr.replace('~', "\~")
        qStr = qStr.replace('"', "\"")
        qStr = qStr.replace('^', "\^")
        qStr = qStr.replace(']', "\]")
        qStr = qStr.replace('[', "\[")
        qStr = qStr.replace('}', "\}")
        qStr = qStr.replace('{', "\{")
        qStr = qStr.replace(')', "\)")
        qStr = qStr.replace('(', "\(")
        qStr = qStr.replace('!', "\!")
        qStr = qStr.replace('-', "\-")
        qStr = qStr.replace('+', "\+")

        return qStr 

if __name__ == "__main__":
    b = BarnOwl()
    resp = b.getPointByUrl("http://www.ipeen.com.tw/comment/652034")
    #resp = b.getPointByUrl("http://www.ipeen.com.tw/comment/943982")
    print len(resp)
    for p in resp:
        print p["avg_price"]
        #print p["article_name"]
        print p["latlng"].split(',')        
        #print p["address"]

