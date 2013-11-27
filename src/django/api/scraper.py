# Create your views here.
import json
import requests
from lxml import etree
from urlparse import urlparse, urljoin

from django.http import HttpResponse, Http404

KEYWORD_EXCLUDE = [
    'doubleclick.net',
    'imrworldwide.com',
    'bits.wikimedia.org',
    '.svg',
    'Cmbox_notice.png',
    'Magnify-clip.png',
]

SUFFIX_INCLUDE = [
    '.jpg',
    '.jpeg',
    '.png',
]

def scraper(request):
    url = request.GET.get('url')

    if not url:
        out = {
            'error': 'No URL was provided.',
            'title': '',
            'text': '',
            'images': '',
        }
        return HttpResponse(json.dumps(out), content_type='application/json')

    urlparsed = urlparse(url)

    page = requests.get(url)
    page.encoding = 'utf-8'
    html = etree.HTML(page.text)

    title = html.xpath('.//title/text()')[0]
    text = ''

    # pixnet
    if len(html.xpath('.//div[@class="article-content"]//text()')) > 0:
        text = ' '.join(html.xpath('.//div[@class="article-content"]//text()'))[:100]
    elif len(html.xpath('.//p')) > 0:
        text = ' '.join(html.xpath('.//p//text()'))[:100]

    if len(html.xpath('.//div[@class="post hentry"]')) > 0:
        # blogspot
        images = html.xpath('.//div[@class="post hentry"]//img/@src')
    elif len(html.xpath('.//div[@class="post"]')) > 0:
        # wordpress
        images = html.xpath('.//div[@class="post"]//img/@src')
    else:
        images = html.xpath('.//img/@src')

    output_images = []

    for image in images:
        exclude = False

        if 'http' in image[:4]:
            image_url = image
        elif '//' in image[:2]:
            image_url = u'%s%s' % (urlparsed.scheme, image)
        elif image[0] == '/':
            image_url = u'%s://%s/%s' % (urlparsed.scheme, urlparsed.hostname, image)
        else:
            image_url = urljoin(url, image)

        for keyword in KEYWORD_EXCLUDE:
            if keyword in image_url:
                exclude = True

        if exclude:
            continue

        for suffix in SUFFIX_INCLUDE:
            length = len(suffix)
            if image_url[-length:] == suffix and image_url not in output_images:
                output_images.append(image_url)


    out = {
        'title': title.strip(),
        'text': text.strip(),
        'images': output_images,
    }
    
    return HttpResponse(json.dumps(out), content_type='application/json')
