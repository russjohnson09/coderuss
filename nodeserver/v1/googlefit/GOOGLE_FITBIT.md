```
POST /fitness/v1/users/me/dataSources HTTP/1.1
Host: www.googleapis.com
Content-length: 612
Content-type: application/json
Authorization: Bearer ya29.GlsZBTwli76hvf2AeKBfs1VPYD7gTGvcvlCzH5J1EleAiGazyRgjMdjT-57g7VmCf4RGYyCMc4shzO2wsCiVWa7Gephh54wzFZXQ-cZ5GLRhZPv7CGHDdLUOPq9z
     {
    "name": "example-fit-heart-rate",
    "dataStreamId":
        "raw:digital-arbor-18810:com.example.fit.someapp:Example Fit:example-fit-hrm-1:123456",
    "dataType": {
        "field": [{
            "name": "bpm",
            "format": "floatPoint"
        }],
        "name": "digital-arbor-18810"
    },
    "application": {
        "packageName": "com.example.fit.someapp",
        "version": "1.0"
    },
    "device": {
        "model": "example-fit-hrm-1",
        "version": "1",
        "type": "watch",
        "uid": "123456",
        "manufacturer":"Example Fit"
    },
    "type": "raw"
}
HTTP/1.1 200 OK
Content-length: 534
X-xss-protection: 1; mode=block
X-content-type-options: nosniff
Transfer-encoding: chunked
Expires: Mon, 01 Jan 1990 00:00:00 GMT
Vary: Origin, X-Origin
Server: GSE
Etag: "PjnfXIH-V-kHaIrgA_pwLjqdIzM/cT-DKGFo8FIIr4ZrW6BWjCELWKE"
Pragma: no-cache
Cache-control: no-cache, no-store, max-age=0, must-revalidate
Date: Tue, 05 Dec 2017 12:58:37 GMT
X-frame-options: SAMEORIGIN
Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
Content-type: application/json; charset=UTF-8
-content-encoding: gzip
{
  "name": "example-fit-heart-rate", 
  "dataQualityStandard": [], 
  "dataType": {
    "field": [
      {
        "name": "bpm", 
        "format": "floatPoint"
      }
    ], 
    "name": "digital-arbor-18810"
  }, 
  "application": {
    "packageName": "com.example.fit.someapp", 
    "version": "1.0"
  }, 
  "device": {
    "model": "example-fit-hrm-1", 
    "version": "1", 
    "type": "watch", 
    "uid": "123456", 
    "manufacturer": "Example Fit"
  }, 
  "dataStreamId": "raw:digital-arbor-18810:com.example.fit.someapp:Example Fit:example-fit-hrm-1:123456", 
  "type": "raw"
}
```