-- URL crawler by @reineimi [https://github.com/reineimi/va2/blob/main/lib/va2crawl.lua]
local crawl = { temp={}, sitemap={}, pages={} }

-- Crawl the page, check/generate SEO content
function crawl:loop(url, _args)
	local _args = _args or {}
	local domain = url:match('http[s]?://(.+)'):gsub('/.*', '')
	local html, ms = curl(url, _args.redir)
	local http = 'http://'
	if _args.ssl then http = 'https://' end
	local excludes = _args.exclude or {}
	local GMT = _args.gmt or '+00:00'
	local print, echo, echoF = print, echo, echoF
	if not _args.out then
		print = function() end
		echo = function() end
		echoF = function() end
	end

	-- Create page table
	if not crawl.pages[url] then
		crawl.pages[url] = { err={} }
	end
	local page = crawl.pages[url]
	page.query = {
		ind = self.total or 0,
		url = url,
		priority = _args.prio or 1.0,
		load = ms,
		len = tonumber(tostring(#html/1024):sub(1,6))
	}

	-- Query info
	local mspref = 'green'
	if ms > 1250 then mspref = 'yellow' end
	if ms > 2500 then mspref = 'red' end
	echo(string.format(
		'#purple;%s:; #blue;%s;  #lightgrey;(prio: #purple;%s;#lightgrey;, load: #%s;%s ms#lightgrey;, len: %s KiB);',
		self.total or 0, url, _args.prio or 1.0, mspref, ms, tostring(#html/1024):sub(1,6)))

	if not (html:match('<!DOCTYPE html>') or html:match('<!doctype html>')) then
		echo('#grey;Page is not of the HTML type, does not exist, or has been redirected;')
		print ''
		return 0
	end

	-- Initiate sitemap
	if #self.sitemap == 0 then
		self.total = 0
		self.urls = {}

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
	'<priority>'..(_args.prio or '1.0')..'</priority>'))

	-- Page Title
	local title = html:match('<title.->(.-)</title>')
	page.title = title
	if title then
		if title ~= '' then
			echoF({'Title:', 'b'}, {title:gsub('\n', ' '):gsub('&quot;', '"'):gsub('&nbsp;', ' '):gsub('&ndash;', '-'), 'green'})
			if utf8.len(title) > 62 then
				echo('#cyan;Title length is above 62 characters;')
			end
		else
			echo('#b;Title:; #yellow;(Empty);')
		end
	else
		echo('#red;<title> is missing or did not load initially;')
	end

	-- SEO: Meta Title
	local mtitle = html:match('<meta.-name[=]["\']title["\'].-content=["\'](.-)["\'].->')
	page.meta_title = mtitle
	if mtitle then
		if mtitle ~= '' then
			echoF({'Meta Title:', 'b'}, {mtitle:gsub('\n', ' '):gsub('&quot;', '"'):gsub('&nbsp;', ' '):gsub('&ndash;', '-'), 'green'})
			if utf8.len(mtitle) > 62 then
				echo('#cyan;Meta Title length is above 62 characters;')
			end
		else
			echo('#b;Meta Title:; #yellow;(Empty);')
		end
	else
		echo('#yellow;<meta name="title"> is missing or did not load initially;')
	end

	-- SEO: Meta Description
	local descr = html:match('<meta.-name[=]["\']description["\'].-content=["\'](.-)["\'].->')
	page.meta_descr = descr
	if descr then
		if descr ~= '' then
			echoF({'Meta Description:', 'b'}, {descr:gsub('&quot;', '"'):gsub('&nbsp;', ' '):gsub('&ndash;', '-'), 'green'})
			if utf8.len(descr) > 156 then
				echo('#cyan;Description length is above 156 characters;')
			end
		else
			echo('#b;Meta Description:; #yellow;(Empty);')
		end
	else
		echo('#red;<meta name="description"> is missing or did not load initially;')
	end

	-- SEO: Meta Keywords
	local kwds = html:match('<meta.-name[=]["\']keywords["\'].-content=["\'](.-)["\'].->')
	page.meta_keywords = kwds
	if kwds then
		if kwds ~= '' then
			echoF({'Meta Keywords:', 'b'}, {kwds, 'green'})
		else
			echo('#b;Meta Keywords:; #yellow;(Empty);')
		end
	else
		echo('#yellow;<meta name="keywords"> is missing or did not load initially;')
	end

	-- SEO: Heading Tags
	local h1 = '<h1.->(.-)</h1>'
	page.h1 = h1
	if html:match(h1) then
		for h in html:gmatch(h1) do
			echoF({'Heading (H1):', 'b'}, {h, 'green'})
		end
	else
		echo('#red;No main heading tags (<h1>) found;')
	end

	-- Check for missing alts in <img>
	for img in html:gmatch('<img .->') do
		local img = img:gsub('\n', ' ')
		if not img:match('[ ]?alt[= >]') then
			local err = 'Image missing alt attribute:'
			table.insert(page.err, err..' '..img)
			echoF({err, 'red'}, {img, 'lightgrey'})
		end
	end

	-- Find inner links > add them to sitemap > crawl them
	print ''
	for link in html:gmatch('href=[\'"](.-)[\'"].->') do
		local fdomain = domain:gsub('[-]', '[-]'):gsub('[+]', '[+]'):gsub('[.]', '[.]')
		local inner = link:gsub(http..fdomain, ''):gsub('^/', ''):gsub('/$', '')
		local included = true

		for _, excl in ipairs(excludes) do
			local excl = excl:gsub('^/', ''):gsub('[-]', '[-]'):gsub('[+]', '[+]'):gsub('[.]', '[.]')
			if inner:match(excl) then
				included = false
			end
		end

		if (inner:len() > 1) and included
		and not (inner:match('[?#!@$%^&*:;]') or inner:match('^[/]?[+]') or inner:match('www'))
		and not (inner:match('[/]?[.][%a%d]+$'))
		and not (link:match('wp[-]content/') or link:match('wp[-]json')) then
			local rel = '/'..inner
			local ref = http..domain..rel..'/'
			local __, prio = rel:gsub('/', '')
			local prio = 1.1 - (prio * 0.1)
			if prio < 0.1 then prio = 0.1 end
			_args.prio = prio
			_args.rel = rel

			-- Check if URL was already crawled -> crawl new URL
			if not self.urls[rel] then
				self.total = self.total + 1
				self.urls[rel] = 1
				crawl:loop(ref, _args)
			end
		end
	end

end

--[[ (USE THIS) Wrap and finish crawl:loop()
<int> _state (generated content):
	nil: Do nothing
	1: Print
	2: Write to file
[<tbl>] _args:
	<int> out: Print results?
	<str> gmt: sitemap.xml timezone
	<tbl> exclude: Inner links to exclude
--]]
function crawl:run(url, _state, _args)
	local _args = _args or {}
	local print, echo, echoF = print, echo, echoF
	if not _args.out then
		print = function() end
		echo = function() end
		echoF = function() end
	end
	if url:len() < 2 then
		echo('#red;Specified URL is too short;')
		return 0
	end
	if not url:match('http[s]?://') then
		url = 'https://'..url
		echo('#cyan;Reading specified URL in HTTPS mode;')
	end
	local SSL = nil
	if _args.gmt == '' then _args.gmt = nil end
	if url:match('https://') then SSL = 1 end
	if not url:match('/$') then url = url..'/' end
	_args.ssl = SSL
	self.sitemap = {}
	self.urls = {}
	self.total = 0
	crawl.pages[url] = { err={} }
	local html, ms = curl(url)
	local mainpage = crawl.pages[url]

	-- Check redirects
	if _args.redir then
		echo 'Redirects - #grey;Cannot check while following redirects;'
	else
		local redirs_on = 1
		local redir1 = curl(url..'/')
		local redir2 = curl(url..'index.html')

		if redir1:match('<html') and not ((redir1:match('301') or redir1:match('302')
		or redir1:match('404')) or (redir1 == html)) then
			redirs_on = nil
		elseif redir2:match('<html') and not ((redir1:match('301') or redir2:match('302')
		or redir2:match('404')) or (redir2 == html)) then
			redirs_on = nil
		end

		if redirs_on then
			echo 'Redirects - #green;Working;'
		else
			echo 'Redirects - #red;Unset or incomplete;'
		end
	end

	-- Look for current sitemap
	local current_sitemap = curl(url..'sitemap.xml', _args.redir)
	if current_sitemap:match('<urlset') then
		mainpage['sitemap.xml'] = true
		echo('sitemap.xml - #green;Found;')
	else
		mainpage['sitemap.xml'] = false
		echo('sitemap.xml - #red;Not found;')
	end

	-- Check robots.txt
	local robots = curl(url..'robots.txt', _args.redir)
	if robots:match('[Uu]ser[-][Aa]gent:') then
		mainpage['robots.txt'] = true
		echo('robots.txt - #green;Found;')
		if not robots:match('Host:') then
			echo('robots.txt: #red;No host(s) set;')
		end

		local bots = 0
		for bot in robots:gmatch('[Uu]ser[-][Aa]gent:[ ]?([%a%d%p]+)') do
			echo('robots.txt: #cyan;Agent found: '..bot..';')
			bots = bots + 1
		end

		if bots < 1 then
			echo('robots.txt: #red;No agents set;')
		elseif bots < 2 then
			echo('robots.txt: #yellow;Only one agent set;')
		end

		local sitemap_alt = robots:match('Sitemap: (.-)\n')
		if sitemap_alt then
			echo('robots.txt: #cyan;Checking alternative sitemap.xml at:; #blue;'..sitemap_alt..';')
			if curl(sitemap_alt):match('schemas/sitemap') then
				echo('sitemap.xml (Alt) - #green;Found;')
			else
				echo('sitemap.xml (Alt) - #red;Not found or format is not supported;')
			end
		end
	else
		mainpage['robots.txt'] = false
		echo('robots.txt - #red;Not found;')
	end

	-- Check schema.org
	if html:match('schema[.]org') then
		echo('Schema.org Structured Data - #green;Found;')
		local json, first = html:match('<script.-application/ld[+]json.->(.-)</script>'), {}
		if json then echoF({'Schema.org:'}, {'json-ld:', 'purple'}, {json, 'lightgrey'}) end
		for prop in html:gmatch('property[ ]?=[ ]?["\'].-["\'][ ]?content[ ]?=[ ]?["\'].-["\']') do
			echoF({'Schema.org:'}, {'rdfa:', 'purple'}, {prop, 'lightgrey'})
		end
		for itype in html:gmatch('itemtype[ ]?=[ ]?["\'].-["\']') do
			if first.itype ~= itype then
				echoF({'Schema.org:'}, {'micro:', 'purple'}, {itype, 'lightgrey'})
				first.itype = itype
			end
		end
		for iprop in html:gmatch('itemprop[ ]?=[ ]?["\'].-["\']') do
			if first.iprop ~= iprop then
				echoF({'Schema.org:'}, {'micro:', 'purple'}, {iprop, 'lightgrey'})
				first.iprop = iprop
			end
		end
	else
		echo('Schema.org structured data - #yellow;Not Found;')
	end

	-- Crawl and cleanup process
	print ''
	crawl:loop(url, _args)
	table.insert(self.sitemap, '</urlset>')
	local sitemap_content = table.concat(self.sitemap, '\n')
	self.sitemap = {}

	-- Generate sitemap.xml
	if _state == 2 then
		local sitemap_xml = io.open('sitemap.xml', 'w')
		sitemap_xml:write(sitemap_content)
		sitemap_xml:close()
	elseif _state == 1 then
		print('\n'..sitemap_content)
	end

	return crawl.pages
end

function crawl:run_in_shell()
	local meta = { out=1 }
	echo '#grey;#i;Va2:Crawl - @reineimi - https://github.com/reineimi/va2/blob/main/lib/va2crawl.lua;'
	echo '#grey;#i;(Tip: Something is missing? Try to re-crawl while following redirects);'
	echo '#grey;#i;(Note: Load speed is not very precise, it depends on your network speed and system performance);'
	print ''
	echo '#cyan;#i;Please specify the URL of the website to crawl:;'
	local addr = io.read()
	echo '#cyan;#i;...And your (GMT) timezone (default: +00:00):;'
	meta.gmt = io.read()
	echo '#cyan;#i;Follow redirects? (leave empty to decline);'
	if io.read() ~= '' then meta.redir = 1 end
	echo '#cyan;#i;You can also exclude URLs with specified matches (separated with whitespaces):;'
	local exclude = io.read()..' '
	meta.exclude = {}
	for rel in exclude:gmatch('(/.-)[ ]') do
		table.insert(meta.exclude, rel)
	end
	echo('-- String color rules --',
		'#green;#i;#b;Valid; - #i;No actions needed;',
		'#cyan;#i;#b;Info; - #i;Advised to check;',
		'#yellow;#i;#b;Warning; - #i;Advised to take action;',
		'#red;#i;#b;Error; - #i;Needs to be fixed;',
		'#grey;#i;#b;Ignored; - #i;Has been ignored for a specific reason;',
		'#lightgrey;#i;#b;Reference; - #i;Reference to object in context;',
		'#blue;#i;#b;Link; - #i;Link to resource;',
		'#purple;#i;#b;Query; - #i;Query entry (for example: #purple;<query>:; #blue;#i;<url>;);\n',
		'#grey;#i;Crawling in progress...;')
	local res = crawl:run(addr, 2, meta)
end

return crawl
