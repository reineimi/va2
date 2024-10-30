-- URL crawler by @reineimi [https://github.com/reineimi]
local crawl = { temp={}, sitemap={}, pages={} }

-- Get HTML document from URL
function curl(url)
	local p = io.popen('curl -s \''..url..'\'')
	local out = p:read('*a')
	p:close()
	return out
end

-- Styled bash stdout
-- ex: crawl.out({'Hello', 'grey'}, {'world!', 'green', 'bold'})
crawl.printf = {
	-- Style
	normal = 0,
	bold = 1, b = 1,
	dark = 2,
	italic = 3, i = 3,
	underline = 4, u = 4,
	blink = 5,
	blinkDark = 6,
	invert = 7,
	empty = 8,
	strike = 9, s = 9,

	-- Color
	black = 30,
	darkred = 31,
	darkgreen = 32,
	brown = 33,
	darkblue = 34,
	darkpurple = 35,
	darkcyan = 36,
	lightgrey = 37,

	grey = 90,
	red = 91,
	green = 92,
	yellow = 93,
	blue = 94,
	purple = 95,
	cyan = 96,
	white = 97,

	-- Background color
	blackBg = 40,
	darkredBg = 41,
	darkgreenBg = 42,
	brownBg = 43,
	darkblueBg = 44,
	darkpurpleBg = 45,
	darkcyanBg = 46,
	lightgreyBg = 47,

	greyBg = 100,
	redBg = 101,
	greenBg = 102,
	yellowBg = 103,
	blueBg = 104,
	purpleBg = 105,
	cyanBg = 106,
	whiteBg = 107
}
function crawl.out(...)
	local inputs, strings = {...}, {}

	for _, strdata in ipairs(inputs) do
		local str = tostring(strdata[1]):gsub('"', '\\"')
		local _formats = {}

		-- Find by key or value
		for i, v in pairs(crawl.printf) do
			for n = 2, 4 do
				local arg = strdata[n]
				if arg and ((arg == i) or (arg == v)) then
					table.insert(_formats, v)
				end
			end
		end

		table.insert(strings, string.format(
			'\\e[0;%sm%s\\e[0m',
			table.concat(_formats, ';'), str
		))
	end

	os.execute('echo -e "> '..table.concat(strings, ' ')..'"')
end
local out = crawl.out

-- Crawl the page, check/generate SEO content
function crawl:loop(url, args)
	local domain = url:match('http[s]?://(.+)'):gsub('/.*', '')
	local html = curl(url)
	local http = 'http://'
	if args.ssl then http = 'https://' end
	local GMT = args.gmt or '+00:00'
	local out, print = out, print
	if not args.out then
		out = function() end
		print = function() end
	end
	if not html:match('<!DOCTYPE html>') then
		out({'Page is not of the HTML type, does not exist, or has been redirected', 'grey'})
		print ''
		return 0
	end

	-- Create page table
	if not crawl.pages[url] then
		crawl.pages[url] = { err={} }
	end
	local page = crawl.pages[url]

	-- Initiate sitemap
	if #self.sitemap == 0 then
		self.total = 0
		self.urls = {}
		out({'0:', 'yellow'}, {url}, {' 1.0', 'cyan'})

		-- Add sitemap sources
		table.insert(self.sitemap,
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '..
		'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '..
		'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">')
	end

	-- Add page to sitemap (if exists)
	table.insert(self.sitemap, string.format(
	'<url>%s%s%s</url>',
	'<loc>'..url..'</loc>',
	'<lastmod>'..os.date('%Y-%m-%dT%H:%M:%S')..GMT..'</lastmod>',
	'<priority>'..(args.prio or '1.0')..'</priority>'))

	-- Check SEO metatags
	local title = html:match('<title.->(.-)</title>')
	page.title = title
	if title then
		if title ~= '' then
			out({'Title:', 'bold'}, {title:gsub('\n', ' '), 'green'})
		else
			out({'Title:', 'bold'}, {'(Empty)', 'yellow'})
		end
	else
		out({'Title tag is missing or did not load initially', 'red'})
	end

	local descr = html:match('<meta.-name[=]["\']description["\'].-content=["\'](.-)["\'].->')
	page.descr = descr
	if descr then
		if descr ~= '' then
			out({'Description:', 'bold'}, {descr, 'green'})
		else
			out({'Description:', 'bold'}, {'(Empty)', 'yellow'})
		end
	else
		out({'Description metatag is missing or did not load initially', 'red'})
	end

	-- Check for missing alts in <img>
	for img in html:gmatch('<img .->') do
		if not img:match('[ ]?alt=["\']') then
			local err = 'Image missing alt attribute:'
			table.insert(page.err, err..' '..img)
			out({err, 'red'}, {img, 'lightgrey'})
		end
	end

	-- Find inner links > add them to sitemap > crawl them
	print ''
	for link in html:gmatch('href=[\'"](.-)[\'"].->') do
		local fdomain = domain:gsub('[-]', '[-]'):gsub('[+]', '[+]'):gsub('[.]', '[.]')
		local inner = link:gsub(http..domain, ''):gsub('^/', ''):gsub('/$', '')

		if (inner:len() > 1)
		and not (inner:match('[?#!@$%^&*:;]') or inner:match('www'))
		and not (inner:match('[/]?[.][%a%d]+$'))
		and not (link:match('wp[-]content/') or link:match('wp[-]json')) then
			local rel = '/'..inner
			local ref = http..domain..rel..'/'
			local __, prio = rel:gsub('/', '')
			local prio = 1.1 - (prio * 0.1)
			if prio < 0.1 then prio = 0.1 end
			args.prio = prio

			-- Check if URL was already crawled -> crawl new URL
			if not self.urls[rel] then
				self.total = self.total + 1
				out({self.total..':', 'yellow'}, {rel}, {' '..prio, 'cyan'})
				self.urls[rel] = 1
				crawl:loop(ref, args)
			end
		end
	end

end

--[[ (USE THIS) Wrap and finish crawl:loop()
<str> State (generated content):
	nil: Do nothing
	1: Print
	2: Write to file
[<table>] Args:
	out: Print results?
	gmt: sitemap.xml timezone
--]]
function crawl:run(url, State, Args)
	local loop_args = {}
	local out, print = out, print
	if not Args.out then
		out = function() end
		print = function() end
	end
	if url:len() < 2 then
		out({'Specified URL is too short', 'red'})
		return 0
	end
	if not url:match('http[s]?://') then
		url = 'https://'..url
		out({'Reading specified URL in HTTPS mode', 'yellow'})
	end
	local SSL = nil
	local GMT = Args.gmt
	if GMT == '' then GMT = nil end
	if url:match('https://') then SSL = 1 end
	if not url:match('/$') then url = url..'/' end
	loop_args.out = Args.out
	loop_args.gmt = GMT
	loop_args.ssl = SSL
	self.sitemap = {}
	self.urls = {}
	self.total = 1
	crawl.pages[url] = { err={} }
	local mainpage = crawl.pages[url]

	-- Check redirects
	local redir = curl(url..'/') or ''
	if redir:match('<html') then
		out({'Redirects -'}, {'Unset or incomplete', 'red'})
	else
		out({'Redirects -'}, {'Working', 'green'})
	end

	-- Look for current sitemap
	local current_sitemap = curl(url..'/sitemap.xml')
	if current_sitemap:match('<urlset') then
		mainpage['sitemap.xml'] = true
		out({'sitemap.xml -'}, {'Found', 'cyan'})
	else
		mainpage['sitemap.xml'] = false
		out({'sitemap.xml -'}, {'Not found', 'red'})
	end

	-- Check robots.txt
	local robots = curl(url..'/robots.txt')
	if robots:match('Host:') then
		mainpage['robots.txt'] = true
		out({'robots.txt -'}, {'Found', 'green'})
		local bots = 0
		for bot in robots:gmatch('[Uu]ser[-][Aa]gent:[ ]?([%a%d%p]+)') do
			out({'robots.txt:'}, {'Agent found: '..bot, 'cyan'})
			bots = bots + 1
		end
		if bots < 1 then
			out({'robots.txt:'}, {'No agents set', 'yellow'})
		elseif bots < 2 then
			out({'robots.txt:'}, {'Only one agent set', 'yellow'})
		end
	else
		mainpage['robots.txt'] = false
		out({'robots.txt -'}, {'Not found', 'red'})
	end

	-- Crawl cleanup process
	print ''
	crawl:loop(url, loop_args)
	table.insert(self.sitemap, '</urlset>')
	local sitemap_content = table.concat(self.sitemap, '\n')
	self.sitemap = {}

	-- Generate sitemap.xml
	if State == 2 then
		local sitemap_xml = io.open('sitemap.xml', 'w')
		sitemap_xml:write(sitemap_content)
		sitemap_xml:close()
	elseif State == 1 then
		print('\n'..sitemap_content)
	end

	return crawl.pages
end

--[[ Uncomment this to use in the terminal
local meta = { out=1 }
out({'Please specify the URL of the website to crawl:', 'cyan', 'i'})
local addr = io.read()
out({'...And your (GMT) timezone (default: +00:00):', 'cyan', 'i'})
meta.gmt = io.read()
out({'Crawling in progress...', 'grey', 'b'})
local sitemap = crawl:run(addr, 2, meta)
--]]

return crawl
