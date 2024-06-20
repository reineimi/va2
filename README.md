# Configuration
Change your host **username** and **paths** in the following files:

`httpd.conf`
```conf
Define _ROOT "/etc/httpd"
Define _DOCS "/srv/http"
Define _LOGS "/srv/http/logs"
...
# Server user for Linux
<IfModule unixd_module>
	User _USERNAME_
	...
</IfModule>
```

`response.lua`
```lua
USER = '_USERNAME_'
PATH = '/srv/http/va2.reineimi/'
...
WIN_HTTPD_PATH = 'C:\\Apache24\\bin'
```

`server.conf`
```json
{
	"server_path": "/srv/http/va2.reineimi/",
	"server_user": "_USERNAME_",
	"downloads": "/home/_USERNAME_/Downloads/"
}
```

Then put `httpd.conf` in, presumably, one of these locations: `C:/Apache24/conf/` or `/etc/httpd`.

