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
        token: token (device)

OTA server should return information of last version, which contain metadata of the latest, including URL to get user1/user2.bin.

    {
    "application": "application",
    "last": {
            "version": "0.0.1",
            "created": "2015-06-04T10:15:33.917Z",
            "protocol": "https:",
            "host": "domchristie.github.io",
            "path": "/to-markdown/"
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
        token: token (user)

    BODY
    {
        version: new version,
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

    POST /upload/:application/firmware?image=image1/image2&version=version
    HEADERS:
        token: token (user)
    BODY: binary file

return

    BODY
    {
        application: application
        image: image1/image2
        url: url
    }

Then the returned ```url``` use to register new version.