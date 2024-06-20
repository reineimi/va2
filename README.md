> Please note that the Github Pages demo is not going to work as expected, as it requires a webserver
> for handshakes between the Operating System and the frontend of this web application.

## Content:
- [Introduction](https://github.com/reineimi/va2/tree/main?tab=readme-ov-file#introduction)
- [Installation](https://github.com/reineimi/va2/tree/main?tab=readme-ov-file#installation)
- [Screenshots](https://github.com/reineimi/va2/tree/main?tab=readme-ov-file#screenshots)
- [Configuration](https://github.com/reineimi/va2/tree/main?tab=readme-ov-file#configuration)
- [Module embedding](https://github.com/reineimi/va2/tree/main?tab=readme-ov-file#module-embedding)

# Introduction
V A 二ｌｌA (`Vanilla Project` or `Va2`) is a webserver-based (Apache2) Desktop Environment application.<br>
It is made to be flexible and cross-platform, however currently focused on Linux machines only.<br>
Being under development it does not have a lot of features; however, there is a lot of native features and
applications that have already been scheduled for development.

# Installation
The only requirement for this application is `Apache webserver`, which can be:
- [Downloaded for Windows](https://www.apachelounge.com/download/)
- [Compiled from source](https://httpd.apache.org/download.cgi)
- Or installed as a package, for example:
```
(Arch Linux)
sudo pacman -Syy apache

(Ubuntu Linux)
sudo apt install apache2

(Termux, Android)
pkg install apache2
```

# Screenshots
### Alpha ver. GUI: Light mode
![image](https://github.com/reineimi/va2/assets/109428665/a7c1f508-bdc8-493c-8939-9e518f3cfe84)
![image](https://github.com/reineimi/va2/assets/109428665/0151d130-a53e-497f-845e-d521105f1700)
![image](https://github.com/reineimi/va2/assets/109428665/3e3462cc-6459-4913-8beb-f35ac5e06433)
### Alpha ver. GUI: Dark mode
![image](https://github.com/reineimi/va2/assets/109428665/8c4cf699-c194-4ee9-8034-1fedf2a01a3a)
![image](https://github.com/reineimi/va2/assets/109428665/5370bd6f-5151-4ab4-8159-c08ed4a8b503)
![image](https://github.com/reineimi/va2/assets/109428665/c85af16e-10e6-4d29-9e72-ae69bf6de56b)

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

# Module embedding
To embed any library module, for example `va2.js` and `va2.css`, you only need to put the following in your `<head>` tag:
```html
<script src='https://reineimi.github.io/va2/lib/va2.js' async></script>
<link rel='stylesheet' href='https://reineimi.github.io/va2/lib/va2.css'>
```
