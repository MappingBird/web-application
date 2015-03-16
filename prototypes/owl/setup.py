from setuptools import setup

setup(name='owl',
      version='0.1',
      description='Hello Owl~',
      url='http://mappingbird.com',
      license='MIT',
      packages=['owl'],
      install_requires=[
          'solrpy',
      ],
      zip_safe=False)

