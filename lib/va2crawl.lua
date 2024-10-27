-- URL crawler by @reineimi [https://github.com/reineimi]
local crawl = { sitemap={} }

-- Get HTML document from URL
function curl(url)
	local p = io.popen('curl -s \''..url..'\'')
	local out = p:read('*a')
	p:close()
	return out
end

	-- SITEMAP --

-- Generate sitemap content
function crawl.sitemap:loop(url, _has_ssl)
	local domain = url:match('://(.+)'):gsub('/.*', '')
	local html = curl(url)
	local http = 'http://'
	if _has_ssl then http = 'https://' end

	-- Redefine table variables
	if #self.temp == 0 then
		self.total = 0
		self.urls = {}

		-- Add sitemap sources
		table.insert(self.temp,
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '..
		'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '..
		'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">')

		-- Add root URL
		table.insert(self.temp, string.format(
		'<url>\n  %s\n  %s\n  %s\n  %s\n</url>',
		'<loc>'..url..'</loc>',
		'<lastmod>'..os.date('%Y-%m-%d')..'</lastmod>',
		'<changefreq>daily</changefreq>',
		'<priority>1.0</priority>'))
	end

	-- Add inner links to self.temp and run recursion
	for link in html:gmatch('href=[\'"](.-)[\'"].->') do
		if (link:match('^..+') and not link:match(http))
		or link:match(http..domain..'/.+') then
			local rel = link:gsub(http..domain, ''):gsub('//', '/'):gsub('/$', '')
			if not rel:match('^/') then
				rel = '/'..rel
			end
			local ref = http..domain..'/'..rel
			local __, prio = rel:gsub('/', '')
			local prio = 1.1 - (prio * 0.1)

			-- Check if URL was already crawled -> crawl new URL
			if not self.urls[rel] then
				local temp = string.format('<url>\n  %s\n  %s\n  %s\n  %s\n</url>',
				'<loc>'..ref:gsub('//', '/'):gsub('http[s]?:/', http)..'</loc>',
				'<lastmod>'..os.date('%Y-%m-%d')..'</lastmod>',
				'<changefreq>daily</changefreq>',
				'<priority>'..prio..'</priority>')
				table.insert(self.temp, temp)

				self.total = self.total + 1
				print(string.format('%s: %s  -  %s', self.total, rel, prio))
				self.urls[rel] = 1
				crawl.sitemap:loop(ref, _has_ssl)
			end
		end
	end
end

-- (USE THIS) Wrap and finish .sitemap:loop()
-- State: nil=none 1=print 2=write_to_file
function crawl.sitemap:run(url, _state)
	local ssl
	if url:match('https://') then ssl = 1 end
	self.temp = {}
	self.urls = {}
	self.total = 1

	-- Crawl and table cleanup
	crawl.sitemap:loop(url, ssl)
	table.insert(self.temp, '</urlset>')
	local sitemap_content = table.concat(self.temp, '\n')
	self.temp = {}

	-- Write or print sitemap.xml (if set)
	if _state == 2 then
		local sitemap_xml = io.open('sitemap.xml', 'w')
		sitemap_xml:write(sitemap_content)
		sitemap_xml:close()
	elseif _state == 1 then
		print('\n'..sitemap_content)
	end

	return sitemap_content
end

--[[ Sitemap preview
print 'Please specify the URL of the website to crawl:'
local addr = io.read()
local sitemap = crawl.sitemap:run(addr, 2)
--]]

return crawl
