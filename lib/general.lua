-- General purpose script written by @reineimi - https://github.com/reineimi
_DEBUG = true
math.randomseed(os.time())
local threads = {}
lua_call = function(f, ...)
	local f = f
	if type(f)=='string' then
		f = load('local _F = function() '..f..' end; _F(); _F=nil')
	elseif type(f)~='function' then
		io.write('lua_call :: First argument provided is not a function or string\n')
		io.write('[TYPE] :: '..type(f)..'\n')
		return nil
	end
	local STATUS, ERR = pcall(f, ...)
	if (not STATUS) and (type(ERR)=='string') then
		io.write('> '..tostring(ERR)..'\n')
	end
	if STATUS then
		return ERR or true
	else return nil
	end
end
cin = function()
	local input = io.read()
	if log then log(1, input) end
	return input
end
cout = function(...)
	local data = {...}
	for _, v in ipairs(data) do
		io.write('> '..tostring(v)..'\n')
		if log then log(2, tostring(v)) end
	end
end
print = function(...)
	local data = {...}
	for _, v in ipairs(data) do
		io.write(tostring(v)..'\n')
		if log then log(2, tostring(v)) end
	end
end
printf = function(syntax, ...)
	local str = string.format(syntax, ...)
	print(str)
	return str
end
local temp = { log={} }
local cmd = {}
local info = {
	f = {}, -- Functions
	c = {}, -- Commands
	m = {}, -- Modules
}
local sessionStart = os.time()
local modules = { -- filename = "description"
	--test = 'For... testing',
	webapp2 = 'Web application constructor',
	--logger = 'Log file composition',
}
local app_init = {
	Windows = 'start ', -- 'start cmd.exe /c start '
	Unix = '',
	Android = ''
}
local apps = {
	Windows = {},
	Unix = {},
	Android = {}
}
local infoF = function(str)
	table.insert(info.f, str)
end
local infoC = function(str)
	table.insert(info.c, str)
end

-- Get current directory path
local _path = io.popen('cd')
PATH = _path:read('*a')
_path:close()

-- Get current script
if _DEBUG then
	THIS = 'general.debug.lua'
else
	THIS = 'general.lua'
end

-- Define the operating system
local OS = 'Windows'
if os.getenv('PATH') then
	if os.getenv('PATH'):match('C:\\') then
		OS = 'Windows'
	elseif os.getenv('PATH'):match('/usr/local/bin') then
		OS = 'Unix'
	elseif os.getenv('PATH'):match('/com.') then
		OS = 'Android'
	end
end

--- FUNCTIONS ---
infoF 'fmerge - Merge multiple functions into one'
function fmerge(...)
	local funcs = {...}
	-- New function args: Tables with args per each function
	return function(...)
		local funclist = funcs
		local args = {...}
		for i, f in ipairs(funclist) do
			f(table.unpack(args[i]))
		end
	end
end

--> Additions to vanilla functions:
-- Table
infoF 'table.concat - Same but with optional index range as 2 last args'
local table_concat = table.concat
function table.concat(t, sep, indStart, indEnd)
	local range = {}
	if not indStart then
		return table_concat(t, sep)
	else
		for i = indStart, (indEnd or #t) do
			table.insert(range, t[i])
		end
		return table_concat(range, sep)
	end
end

infoF 'table.push - Push value into index while offsetting it by 1'
function table.push(t, value, index)
	local index = index or 1
	if t[index] then
		if type(index)=='number' then
			for i = -#t, -index do
				local i = math.abs(i)
				t[i+1] = t[i]
			end
		end
		t[index] = value
	end
end

infoF 'table.add - Add pairs to table A from table B'
function table.add(t1, t2)
	for i, v in pairs(t2) do
		if not t1[i] then
			t1[i] = v
		else
			if type(v)=='string' then
				t1[i] = t1[i] .. v
			elseif type(v)=='number' then
				t1[i] = t1[i] + v
			elseif type(v)=='table' then
				if type(t1[i])=='table' then
					table.add(t1[i], v)
				else
					table.push(v, t1[i], 1)
					t1[i] = v
				end
			else
				t1[i] = v
			end
		end
	end
end

infoF 'table.merge - Merge indexes A with B while removing the latter'
function table.merge(t, i1, i2)
	if t[i1] and t[i2] then
		if type(t[i1])=='string' then
			t[i1] = t[i1] .. t[i2]
		elseif type(t[i1])=='number' then
			t[i1] = t[i1] + t[i2]
		elseif type(t[i1])=='table' then
			if type(t[i2])=='table' then
				table.add(t[i1], t[i2])
			else
				table.insert(t[i1], t[i2])
			end
		elseif type(t[i1])=='function' then
			if type(t[i2])=='function' then
				fmerge(t[i1], t[i2])
			else
				t[i1](t[i2])
			end
		else
			t[i1] = t[i2]
		end
		table.remove(t, i2)
	end
end

infoF 'table.put - The table.insert() with unlimited arguments'
function table.put(t, ...)
	local data = {...}
	for _, v in ipairs(data) do
		table.insert(t, v)
	end
end

infoF 'table.print - Print self recursively and return as string'
table.printDepth = 0
table.printData = {}
function table.print(t, name)
	local n = name or 'self'
	local indent = string.rep('  ', table.printDepth)

	if type(n)=='string' then
		table.insert(table.printData, string.format('%s%s = {', indent, n))
	elseif type(n)=='number' then
		table.insert(table.printData, string.format('%s[%s] = {', indent, n))
	end

	if type(t)=='table' then
		table.printDepth = table.printDepth + 1
		local indent = string.rep('  ', table.printDepth)

		for i, v in pairs(t) do
			local ind = i
			if type(i)=='number' then
				ind = '['..i..']'
			end

			if type(v)=='table' then
				table.print(v, i)
			elseif type(v)=='string' then
				table.insert(table.printData, string.format('%s%s = "%s",', indent, ind, v))
			else
				table.insert(table.printData, string.format('%s%s = %s,', indent, ind, v))
			end
		end

	end

	if table.printDepth > 0 then
		table.printDepth = table.printDepth - 1
	end

	table.insert(table.printData, string.rep('  ', table.printDepth)..'},')
	if table.printDepth == 0 then
		local data = table.concat(table.printData, '\n')
		table.printData = {}
		print(data:sub(0, #data-1))
		table.printDepth = 0
		table.printData = {}
		return data:sub(0, #data-1)
	end
end

infoF 'table.find - Search for a value and return {path, i, v} pairs'
table.findPath = ''
table.findData = {}
function table.find(t, value)
	if table.findPath == '' then
		table.findData = {}
	end
	for i, v in pairs(t) do
		if v == value then
			table.findPath = table.findPath..'.'..i
			table.findData = { path=table.findPath, i=i, v=v }
			table.findPath = ''
		elseif type(v) == 'table' then
			table.findPath = table.findPath..'.'..i
			table.find(v, value)
		else
			table.findPath = ''
			table.findData = {}
		end
	end
	return table.findData
end

-- String
infoF 'string:wrap - Format into columns and lines of limited range'
function string:wrap(col, ln)
	local str = {}
	local words = {}

	-- Find and cut words
	for word in self:gmatch('[ ]?([%a%d%p%z]+[\n]?)[ ]?') do
		if word:len() <= col then
			table.insert(words, word..' ')
		else
			for piece in word:gmatch(string.rep('.?', col)) do
				table.insert(words, piece)
			end
			words[#words] = words[#words]..' '
		end
	end

	-- Combine words and fit in columns
	for i, v in ipairs(words) do
		while true do
			if words[i+1] and (string.len(words[i]..words[i+1]) <= col) and not (words[i]:match('[\n]')) then
				table.merge(words, i, i+1)
			else break
			end
		end
	end

	-- Trim unwanted characters
	for i in ipairs(words) do
		words[i] = words[i]:gsub('^ ', ''):gsub('[\n]', ''):gsub(' $', '')
	end
	for i = 1, (ln or #words) do
		if words[i] then
			str[i] = words[i]
		end
	end

	return table.concat(str, '\n'), words
end

-- Math
infoF 'math.pol - Polarity (0, 1 or -1) of the number compared to other or 0'
function math.pol(val, num, range)
	local v = val or 0
	local n = num or 0
	local r = range or 0

	if v > (n+r) then
		v = 1
	elseif v < (n-r) then
		v = -1
	else
		v = 0
	end

	return v
end

--> New global functions:
infoF 'incr - Increment a number by 1 and optionally set a max limit'
function incr(int, limit)
	local int = (int or 0) + 1
	if limit and (int >= limit+1) then
		int = 1
	end
	return int
end

infoF 'concat - Concatenate and format any data to string'
function concat(separator, ...)
	local data = {...}
	local strings = {}
	local sep = '\n'
	if type(separator) == 'string' then
		sep = separator
	end
	for i, v in ipairs(data) do
		if type(v) == 'table' then
			for ind, val in pairs(v) do
				local index = ''
				if type(ind) ~= 'number' then
					index = ind..': '
				end
				table.insert(strings, index..concat(', ', val))
			end
		else
			strings[i] = tostring(v)
		end
	end
	return table.concat(strings, sep)
end

infoF 'uncamel - Replace camelCase string formatting'
function uncamel(str, separator)
	local sep = separator or '_'
	local out = str
	for case in out:gmatch('[A-Z]') do
		out = out:gsub('[A-Z]', sep..case:lower())
	end
	return out
end

infoF 'elapsed - Calculate time elapsed since program start'
function elapsed(separator)
	local t = (os.time() - sessionStart)
	local sep = separator or ''
	local s = math.floor(t % 60)
	local m = math.floor((t/60) % 60)
	local h = math.floor(((t/60) / 60) % 24)
	local d = math.floor(((t/60) / 60 / 24) % 24)
	return string.format('%dd%s%dh%s%dm%s%ds', d, sep, h, sep, m, sep, s)
end

infoF 'uid - Generate a random unique ID'
function uid(prefix, length)
	local _len = length or 12
	local _min = tonumber('0x1'..string.rep('0', _len-1))
	local _max = tonumber('0x'..string.rep('F', _len))
	local _pref = ''
	if prefix then _pref = prefix..'_' end
	return string.format('%s%0'.._len..'x', _pref, math.random(_min, _max))
end

infoF 'log - Simple logger, log("help") for more information'
function log(arg, ...)
	local arg = arg or 2
	local data = {...}
	local levels = {'USER', 'INFO', 'WARN', 'ERROR'}
	local ms = tostring(os.clock()):match('[.](%d+)')

	if (type(arg)=='number') and (arg <= #levels) then
		for _, v in ipairs(data) do
			table.insert(temp.log, string.format('[%s:%s][%s] > %s', os.date('%H:%M:%S'), ms, levels[arg], v))
		end
	end

	if arg=='save' then
		os.execute('cd && mkdir logs')
		local f = io.open('logs/log_'..os.date('%y-%m-%d_%H-%M-%S')..'.txt', 'w')
		f:write(table.concat(temp.log, '\n'))
		f:close()
	end

	if arg=='print' then
		print(table.concat(temp.log, '\n'))
	end

	if arg=='help' then
		print('Available levels:')
		for i, v in ipairs(levels) do
			cout(i..': '..v)
		end
		print('Available args:')
		cout('help', 'print', 'save')
	end

	if arg=='clear' then
		temp.log = {}
	end
end

infoF 'run - Run system console command'
function run(command)
	local cmd = io.popen(command)
	local out = cmd:read('*a')
	cmd:close()
	print(out)
	return out
end

infoF 'loaddir - Load modules from subdirectory'
function loaddir(dir)
	local l = '/'
	if OS=='Windows' then
		l = '\\'
	end

	local path
	local dir = dir
	if (not dir) or (dir=='') then
		path = ''
		dir = ''
	else
		dir = dir..'.'
		path = dir:gsub('[.]', l)..l
	end

	local modules = io.popen('cd && dir '..path..'*.lua')
	for _m in modules:read('*a'):gmatch(' ([A-Za-z1-9]+).lua') do
		print('==> '..dir.._m)
		lua_call(require, dir.._m)
	end
	modules:close()
end

infoF 'app - Function for "app" command: app.name()'
app = {}
for i, v in pairs(apps[OS]) do
	app[i] = function()
		if type(v)=='string' then
			os.execute(app_init[OS]..v)
		elseif type(v)=='table' then
			for _, ref in ipairs(v) do
				os.execute(app_init[OS]..ref)
			end
		end
	end
end

infoF 'xrgb - Convert hexadecimal to rgb'
function xrgb(str)
	local rgb = {}
	local dots = '.'
	local str = str
	if not str then
		cout 'xrgb:: <str> value is incorrect; changed to FFF'
		str = 'FFF'
	end

	if str:len() >= 6 then dots = '..' end
	for n in str:gmatch(dots) do
		local n = n
		if n:len()==1 then n = n..n end
		table.insert(rgb, tonumber(tostring(
			tonumber('0x'..n) --/ 255.0
		):sub(1, 4)) )
	end

	return rgb[1], rgb[2], rgb[3], rgb[4]
end

infoF 'LUA_PATH - Set default path for Lua in Windows (admin)'
function LUA_PATH(path)
	if OS=='Windows' then
		cout 'C:\\Windows\\System32\\rundll32.exe sysdm.cpl,EditEnvironmentVariables'
		cout('LUA_PATH    ;;'..path..'\\?.exe')
		os.execute('set LUA_PATH=;;'..path..'\\?.exe')
	end
end

--- MODULES ---
for i, v in pairs(modules) do
	lua_call(require, i)
	info.m[i] = v
end

--- COMMANDS ---
infoC 'clear - Clear the console'
function cmd.clear()
	if OS=='Windows' then
		os.execute('cls')
	else os.execute('clear')
	end
end

infoC 'R - Reopen this script in a new instance'
function cmd.R()
	if OS=='Windows' then
		os.execute('start '..THIS)
	elseif (OS=='Unix') or (OS=='Android') then
		os.execute('bash -c lua '..THIS)
	end
	os.exit()
end

infoC 'help - Clear the console and print this information'
function cmd.help()
	cmd:clear()
	print(string.format('%s, %s\nElapsed: %s\n\nAvailable functions:', OS, os.date(), elapsed(' ')))
	for i, v in ipairs(info.f) do cout(v) end
	print '\nAvailable commands:'
	for i, v in ipairs(info.c) do cout(v) end
	print '\nAvailable modules:'
	for i, v in pairs(info.m) do cout(i..' - '..v) end
	print ''
end

infoC 'calc - Just math, wrapped in lua_call and recurred'
function cmd.calc()
	local problem = cin()
	lua_call(load('cout('..problem..')'))
	if problem~='' then
		cmd.calc()
	else
		cout 'Calculation done'
	end
end

infoC 'perc - Calculate percentage(%) between two numbers'
function cmd.perc()
	cout 'What % is A:'
	local A = cin()
	cout 'Of number B:'
	local B = cin()
	cout(math.floor((100*A) / B)..'%')
end

infoC 'here - Open current directory (Windows / Linux on GNOME)'
function cmd.here()
	if OS=='Windows' then
		os.execute('explorer '..PATH)
	elseif OS=='Unix' then
		os.execute('gnome-open '..PATH)
	end
end

infoC 'app - Run an application defined in the script'
function cmd.app()
	print 'Select an application:'
	for i in pairs(apps[OS]) do cout(i) end
	io.write '(App:) '
	local name = cin()
	if app[name] then
		app[name]()
	end
end

infoC 'add - Import an external module (script)'
function cmd.add()
	cout 'Module name or directory:'
	local dir = cin()
	cout 'Module description:'
	local desc = cin()
	local m = '[^.]?[a-zA-Z0-9_]+$'
	_G[dir:match(m)] = lua_call(require, dir)
	if desc and (desc ~= '') then
		info.m[dir:match(m)] = desc
	else info.m[dir:match(m)] = nil
	end
end

infoC 'file - Create/edit a new file'
function cmd.file()
	cout 'File name and extension or full path:'
	local path = cin()
	local data = {}
	local tempdata = {}
	local inputs = {}

	cout('Reading file: ['..path..'] ...')
	local f = io.open(path, 'r')
	if f then
		for line in f:lines() do
			table.insert(data, line)
			table.insert(tempdata, line)
		end
		f:close()
	end
	for i, v in pairs(data) do
		print(string.format('  %d:  %s', i, v))
	end

	local f = io.open(path, 'w')
	cout('File opened. Available commands:',
	'::q - Quit without changes',
	'::s - Save (add new lines) and quit',
	'::m - Modify (rewrite) and quit',
	'::<line_number><white_space><text> - Rewrite a line')

	local function inFile()
		local input = cin()
		if input == '::q' then
			f:write(table.concat(data, '\n'))
			return false
		end
		if input == '::s' then
			f:write(table.concat(tempdata, '\n'))
			f:write('\n')
			f:write(table.concat(inputs, '\n'))
			return false
		end
		if input == '::m' then
			f:write(table.concat(inputs, '\n'))
			return false
		end
		if input:match('^::([0-9]+)') then
			tempdata[tonumber(input:match('^::([0-9]+)'))] = input:match('^::[0-9]+ (.*)')
		end
		if not input:match('^::') then
			table.insert(inputs, input)
		end
		inFile()
	end

	inFile()
	f:close()
end

infoC 'exit - Exit the program'
cmd.exit = function()
	io.write 'Save logs? (y/...): '
	local A = io.read()
	if A == 'y' then
		log('save')
	end
	os.exit()
end

-- Module: [webapp.lua]
if document then
	em = document.em

	infoC 'doc.i - Get [index.lua] formatting info'
	cmd['doc.i'] = function()
		print([[Table order:
  type > width,height > margin >  class/attributes > style > content > comment

Table formats:

A - Fully configurable:
  {  type='div',
    attr={id='', class='center'},
    style={width='', height=''},
    content={},
    comment=''
  }

B - Short with configurable style:
  { 'div', '8px 4px', 'auto 5px auto 10px', "id='' class='center'", {
    backgroundColor = '#000',
    color = '#fff'
    }, {
    },
    ''
  }

C - Short:
  {'div', '10px', 'auto', 'center', 'background: #000', {}, ''}

D - Minimal:
  {0, '10px', 'auto', 'center'}

(All values must be of type <string>)
]])
	end

	infoC 'doc.add - Add an element to HTML document'
	cmd['doc.add'] = function(root)
		local root = root or document.em

		cout 'Root table name/path, if required (path example: parent.child)'
		local rootPath = io.read()
		if rootPath and (rootPath ~= '') then
			root = load('return document.em.' .. rootPath .. '.content')() or document.em
		end

		cout 'Table name'
		local id = io.read()
		if id == '' then
			table.insert(root, {})
			root[#root] = {}
			cout('(Position: '..#root..')')
			root = root[#root]
		else
			root[id] = {}
			root = root[id]
		end

		cout 'Element type (leave empty if div):'
		root.type = io.read()
		if root.type == '' then
			root.type = 'div'
		end

		cout 'Element attributes (<attr_name> <args>)'
		local attr = {}
		document.add_attr = function(arr)
			local data = io.read()
			if data~='' then
				arr[data:match('^([a-zA-Z0-9]+) ')] = data:match('[a-zA-Z0-9]+ (.*)')
				document.add_attr(arr)
			end
		end
		document.add_attr(attr)
		root.attr = attr

		cout 'Element style (<attr_name> <args>)'
		local style = {}
		document.add_attr(style)
		root.style = style

		cout 'Element content (leave empty if none)'
		local cont = io.read()
		root.content = {}
		if cont and (cont ~= '') then
			cmd['doc.add'](root.content)
		end
	end

	infoC 'doc.save - Parse and save document into [index.html]'
	cmd['doc.save'] = function()
		document:write()
	end

	infoC 'doc.print - Print the elements table'
	cmd['doc.print'] = function()
		table.print(document.em, 'document.em')
	end

	infoC 'doc.run - Open generated [index.html]'
	cmd['doc.run'] = function()
		os.execute('cd && index.html')
	end
end

--- MAIN LOOP ---
local function program()
	local CIN = cin()
	-- Run command or execute raw Lua
	if cmd[CIN] then
		cmd[CIN]()
	elseif CIN and (CIN ~= '') then
		lua_call(CIN)
	end
	-- Display current CPU time on input
	if OS=='Windows' then
		os.execute('title Lua: '..elapsed(' '))
	else
		--os.execute('printf "(Lua: '..elapsed(' ')..') "')
	end
	-- Recursion loop
	program()
end

--cmd.clear()
io.write(string.format('\n%s, %s, %s\n> Type "help" to get more information\n', _VERSION, OS, os.date()))
--program()
