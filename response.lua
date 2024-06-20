require 'string'
require 'apache2'

USER = '_USERNAME_'
PATH = '/srv/http/va2.reineimi/'
TEMP = PATH..'temp'
WIN_HTTPD_PATH = 'C:\\Apache24\\bin'
POST = {}
JSON = {}

-- Check device OS
if os.getenv('PATH') then
	if os.getenv('PATH'):match('C:\\') then
		OS = 'Windows'
	elseif os.getenv('PATH'):match('/usr/local/bin') then
		OS = 'Unix'
	elseif os.getenv('PATH'):match('/com.') then
		OS = 'Android'
	end
end

-- main()
function handle(r)
	r.content_type = 'text/plain'

	for i, v in pairs(r:parsebody()) do
		POST[i] = v
	end

	local STATUS, ERR = pcall(resolve, r)
	if type(ERR) == 'string' then
		JSON.PCALL_ERR = ERR:match('(response.*)')
	end

	JSON.MEM_TOTAL = math.ceil(collectgarbage("count"))..' KB'
	r:puts(toJson(JSON))
	collectgarbage 'collect'
	return apache2.OK
end

-- Handshake exchange with JS
function resolve(r)
	local actions, res = {}, {}

	-- Execute a shell command
	actions.sh = function(cmd)
		local shell = cmd
		if OS ~= 'Windows' then
			shell = string.format('sudo -u %s %s', USER, cmd)
		end
		res.STDOUT = pipe(shell)
		return res.STDOUT
	end

	-- Copy a file
	actions.cp = function(from_path, to_path, _mkdir)
		local cmd
		if OS == 'Windows' then
			if _mkdir then actions.sh('mkdir '..to_path) end
			cmd = string.format('copy /y %s %s', from_path, to_path)
		else
			if _mkdir then actions.sh('mkdir -p '..to_path) end
			cmd = string.format('cp -v -n -p -r %s %s', from_path, to_path)
		end
		actions.sh(cmd)
	end

	-- Move a file
	actions.mv = function(from_path, to_path, _mkdir)
		local cmd
		if OS == 'Windows' then
			if _mkdir then actions.sh('mkdir '..to_path) end
			cmd = string.format('move /y %s %s', from_path, to_path)
		else
			if _mkdir then actions.sh('mkdir -p '..to_path) end
			cmd = string.format('mv -fv %s %s', from_path, to_path)
		end
		actions.sh(cmd)
	end

	-- Delete a file
	actions.rm = function(path)
		if OS == 'Windows' then
			os.execute('del '..path)
		else
			res.STDOUT = pipe('rm -rfv '..path)
		end
	end

	-- Check if file exists (binary bool)
	actions.seek = function(path)
		local f, _res = nil, 0
		if OS == 'Windows' then
			f = io.popen('if exist '..path..' echo 1')
		else
			f = io.popen('test -f '..path..' && echo 1')
		end
		if f:read('*a'):match('1') then
			_res = 1
		end
		res.res = _res
		res.path = path
		f:close()
		return _res
	end

	-- Create/rewrite a file
	actions.newfile = function(path, newdata, isBase64)
		local req = io.open(path, 'w')
		local fdata = newdata
		if isBase64 then
			fdata = r:base64_decode(newdata)
		end
		req:write(newdata)
		req:close()
		res.newfile_path = path
	end

	-- Read a file, return with Base64 encoding
	actions.file = function(path)
		local _res, req = {}, io.open(path, 'r')
		if req then
			for line in req:lines() do
				table.insert(_res, line)
			end
		else
			error 'filepath contains unexpected symbols'
		end
		req:close()
		res[1] = r:base64_encode(table.concat(_res, '\n'))
		return res[1]
	end

	-- List a directory with raw filedata
	-- TODO: add audio
	actions.dir = function(path)
		local list, files, itemsTotal, tempList, thDel =
		actions.sh('dir '..path), { size=0, items=0 }, 0, actions.sh('dir '..TEMP..path), 0

		-- First check to include in thumbnail caching
		for fname in list:gmatch('([%a%d%p]+)[ ]?') do
			if isImage(fname) then
				itemsTotal = itemsTotal + 1
			end
		end

		-- Delete thumbnail from TEMP if it doesn't exist in the path
		for fname in tempList:gmatch('([%a%d%p]+)[ ]?') do
			local existsInPath = actions.seek(path..'/'..fname)
			if (existsInPath == 0) and isImage(fname) then
				thDel = thDel + 1
				actions.sh('rm -f '..TEMP..path..'/'..fname)
			end
		end

		for fname in list:gmatch('([%a%d%p]+)[ ]?') do
			files.items = files.items + 1
			files[fname] = { order = files.items }

			if fname:match('.html$') then
				files[fname].filetype = 'webpage'
				files[fname].filedata = actions.file(path..'/'..fname)

			elseif isImage(fname) then
				files[fname].filetype = 'image'
				files[fname].filedata = actions.file(path..'/'..fname)
				files[fname].thumbnailsCached = actions.seek(TEMP..path..'/'..fname)
				files[fname].thumbnailsCount = itemsTotal

			elseif fname:match('.mp4$') or fname:match('.avi$') or fname:match('.mkv$')
			or fname:match('.webm$') or fname:match('.ogg$') or fname:match('.wmv$') then
				files[fname].filetype = 'video'
				files[fname].filedata = actions.file(path..'/'..fname)

			elseif fname:match('[%a%d%p]+[.][%l%d]+')
			and (fname:match('[.][%l%d]+$'):len() < 7) then
				files[fname].filetype = 'file'
				files[fname].filedata = actions.file(path..'/'..fname)

			else
				files[fname].filetype = 'folder'
			end

			if fname:match('[.][%l%d]+$') and (fname:match('[.][%l%d]+$'):len() < 7) then
				files[fname].extension = fname:match('[.]([%l%d]+)$')
			end

			files[fname].filepath = path..'/'..fname
			local fsize = (files[fname].filedata or ''):len()
			files[fname].filesize = tostring(fsize / 1000000):sub(1, 5)
			files.size = files.size + fsize
		end

		files.size = tostring(files.size / 1000000):sub(1, 5):gsub('[%a-]', '')
		files.thumbnailsDeleted = thDel
		res = files
		actions.sh(string.format('mkdir -p %stemp/%s', PATH, path))
		return files
	end

	-- Ping a server, return some data
	actions.ping = function(testdata)
		local ram = getram()
		res.OS = OS
		res.RAM_USED = ram[1]
		res.RAM_FREE = ram[2]
		res.CPU_USED = getcpu()
		if testdata ~= 'undefined' then
			res.STDOUT = testdata
		end
	end

	-- Restart the server
	actions.restart = function(custom_win_path)
		local path = custom_win_path or WIN_HTTPD_PATH
		if OS=='Windows' then
			os.execute('start cmd.exe /k "cd '..path..' && httpd -k restart"')
		elseif OS=='Unix' then
			os.execute('systemctl restart httpd')
		elseif OS=='Android' then
			os.execute('apachectl -k restart')
		end
	end

	-- Test JSON types
	actions.test = function(table_type, smth)
		local types = {
			arr = {
				"type", "array",
				{'some', 'data'}, smth
			},
			arr2 = {
				"type", "array",
				{some = 'data'}, smth
			},
			obj = {
				type = 'object', smth = smth,
				data = { 'some', 'stuff' }
			},
			obj2 = {
				type = 'object', smth = smth,
				data = { some = 'stuff' },
			}
		}
		res = types[table_type]
	end

	if POST.action and actions[POST.action] then
		local arg = {}
		for i = 1, 3 do
			if POST['arg'..i] ~= 'undefined' then
				arg[i] = POST['arg'..i]
			else
				arg[i] = nil
			end
		end
		actions[POST.action](arg[1], arg[2], arg[3])
	end

	res.REQUEST = POST.action or 'ping'
	JSON = res
end


-- Shortcut to io.popen
function pipe(cmd)
	local p = io.popen(cmd)
	str = p:read('*a')
	p:close()
	return str
end

-- Write log to default path / logpath
function log(str, logpath)
	local path = logpath or PATH..'server.log'
	local f = io.open(path, 'w')
	f:write(str)
	f:close()
end

-- Convert table to JSON
function toJson(t)
	local rawJson, isArray = {}, false

	for i, v in pairs(t) do

		if type(v) ~= 'table' then
			if #t > 0 then --isArray
				table.insert(rawJson, string.format('"%s"', tostring(v)))
				isArray = true
			else --isObject
				table.insert(rawJson, string.format('"%s":"%s"', i, tostring(v)))
			end

		else
			local json_t, isSubArray = {}, false
			if #v > 0 then --isSubArray
				isSubArray = true
				for i2, v2 in pairs(v) do
					table.insert(json_t, string.format('"%s"', tostring(v2)))
				end
			else --isSubObject
				isSubArray = false
				for i2, v2 in pairs(v) do
					table.insert(json_t, string.format('"%s":"%s"', i2, tostring(v2)))
				end
			end

			if #t > 0 then --isArray
				if isSubArray then
					table.insert(rawJson, string.format('[%s]', table.concat(json_t, ',')))
				else table.insert(rawJson, string.format('{%s}', table.concat(json_t, ',')))
				end
			else --isObject
				if isSubArray then
					table.insert(rawJson, string.format('"%s": [%s]', i, table.concat(json_t, ',')))
				else table.insert(rawJson, string.format('"%s": {%s}', i, table.concat(json_t, ',')))
				end
			end
		end

	end

	if isArray then
		return '['..table.concat(rawJson, ','):gsub('\n', '')..']'
	else return '{'..table.concat(rawJson, ','):gsub('\n', '')..'}'
	end
end

-- Return {used,free} RAM space in KB (number)
function getram()
	local used, free
	if OS == 'Windows' then
		local p = io.popen('systeminfo | findstr /C:"Total Physical Memory"')
		local str = p:read('*a')
		p:close()
		used = str:match('Total Physical Memory:[ ]+([%d%p]+) MB'):gsub(',', '')
		free = str:match('Available Physical Memory:[ ]+([%d%p]+) MB'):gsub(',', '')
	else
		local p = io.popen('free -m')
		local str = p:read('*a')
		p:close()
		used = str:match('[:][ ]+%d+[ ]+(%d+)')
		free = str:match('[:][ ]+%d+[ ]+%d+[ ]+(%d+)')
	end
	return {tonumber(used), tonumber(free)}
end

-- Return current CPU load
function getcpu()
	local p, str
	if OS == 'Windows' then
		p = io.popen('wmic cpu get loadpercentage')
		str = p:read('*a')
		p:close()
		return str:match('^[%d]+')..'%'
	else
		p = io.popen([[echo ""$[100-$(vmstat 1 2|tail -1|awk '{print $15}')]"%"]])
		str = p:read('*a')
		p:close()
		return str:match('^[%d]+')..'%'
	end
end

-- Check if filename is image (too long IF, therefore a function)
function isImage(fname)
	if fname:match('.png$') or fname:match('.jpg$') or fname:match('.webp$')
	or fname:match('.apng$') or fname:match('.jpeg$') or fname:match('.gif$')
	or fname:match('.exif$') or fname:match('.tiff$') or fname:match('.svg$')
	or fname:match('.ico$') or fname:match('.bmp$') or fname:match('.jfif$') then
		return true
	else
		return false
	end
end

--	: Code above is licensed under VPCDP  :
--	: by Eimi Rein (霊音 永旻) - @reineimi  :
--	:. https://github.com/reineimi/VPCDP .:
