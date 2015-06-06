# This document describes the method of ota firmware updating
More about firmware [esp8266](https://github.com/nqd/esp8266-dev) program. 

The server has two function:
- REST API to for application versions
- Upload new version

## Firmware version
### ESP host
When bootup, OTA client polls for latest informations of firmware of an application via REST calling:

    GET /api/:application/versions/:image?current_version=version
    HEADERS:
        api-key: "Api-key of your device or your user Api-key"

####By default: 
    `image` Parameter instead of `image1` or `image2`.
    `application` Parameter is application name

OTA server should return information of last version, which contain metadata of the latest, including parsed URL to get user1/user2.bin.

    {
    "application": "application",
    "last": {
            "version": "0.0.1",
            "created": "2015-06-04T10:15:33.917Z",
            "protocol": "https:",
            "host": "ubisen.com",
            "path": "/files/user1.bin"
        }
    }

Note: ESP host will refuse the response if it doesnot contain tuble {version, protocol, host, url}.

Get the raw image of an application at specific version

    Connect cdn-host
    GET /url HTTP/1.1

### To register new version
One when create new version of an application, need to register to fota server. The registration infomation provides dirrect url for the user1.bin and user2.bin, e.g. from Dropbox or Amazon.

    POST /firmware/:application
    HEADERS:
        api-key: "Api-key of user"

    BODY
    {
        version:"0.0.1",
        firmwares: [{
            name: image1,
            url: "https://dl.dropboxusercontent.com/s/jwnjhet4tngh3nh/user1.bin?dl=0"
        },
        {
            name: image2,
            url: "https://dl.dropboxusercontent.com/s/o996zg2vmyx3396/user2.bin?dl=0"
        }]
    }

Note: the url provided should be the dirrect link to download userx.bin, since esp http client is simple, cannot handle redirect HTTP links. Use ```curl -I url``` to check for return which should contain Content-Length:
```
HTTP/1.1 200 OK
accept-ranges: bytes
cache-control: max-age=0
Content-Length: 387808
```

## Upload firmware    
The firmware could be upload to third party storage service, or use this own server.

    POST /api/firmware
    HEADERS:
        api-key: "Api-key of user"
    BODY: 
        data: binary file
        description:"Your file description" // optional
        tags:"tag1,tag2" // optional

Example:
    
    curl -i -H "api-key:0f551a846d865ef167a496f8584ac75ce284d3de4562b81cfce4ccccfb3b5e66" -F name=data -F data=@swap1.bin http://ota.ubisen.com/api/firmware
    
return

    {  
        "url":"http://ota.ubisen.com/firmwares/5572b380130d0c000040bfee/download",
        "parseUrl":{  
            "protocol":"http:",
            "host":"localhost:3000",
            "path":"/firmwares/5572b380130d0c000040bfee/download"
        },
        "created":"2015-06-06T08:46:56.755Z"
    }

Then the returned ```url``` use to register new version.