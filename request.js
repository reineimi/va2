"use strict";
let SYSTEM_OS = '';
va2.set = {};
const conf = {
	server_user: 0,
	server_path: 0,
	server_restart: 0,
	server_storage: 0,
	write_interval_min: 2.5,
	write_data_now: 0,
	users: [],
	user: {
		username: 0,
		add_user: 0,
		dl_userdata: 0,
		logout: 0
	},
	desktop: {
		
	},
	sys: {
		ping_interval_min: 1,
		consoleLog: 0,
		packetInfo: 0
	},
	look: {
		switch_theme: 0,
		bg_opacity: 0.5,
		bg_image_light: 'url("../res/bg-light.jpg")',
		bg_image_dark: 'url("../res/bg-dark.jpg")',
		app_icon_size: 128
	},
	notif: {
		priority1: 0,
		priority2: 0,
		priority3: 0,
		priority4: 0
	},
	lib: {
		lua: {},
		js: {
			va2code: 1,
			va2noclick: 0,
			va2swipe: 0
		},
		hold_s: 0.4
	},
	windowsTotal: 0,
	windows: []
}
// Stuff usually taken from user storage or files
const userdata = {
	desktop: {},
	taskbar: {},
	shortcuts: {
		Console: {
			name: 'Console',
			func: `let i = conf.windows.seek('console');
				if (i) { tshow(0, 'window'+i[0]); }
				else { va2.env.window('console'); }`,
			symbol: 'terminal',
			new_bg: 'linear-gradient(135deg, #222 50%, #345 50%)'
		},
		Files: {
			name: 'Files',
			func: `let i = conf.windows.seek('fm');
				if (i) { tshow(0, 'window'+i[0]); }
				else { va2.env.window('fm'); }`,
			symbol: 'folder',
			new_bg: 'linear-gradient(135deg, #a74 50%, #c94 50%)'
		},
		Settings: {
			name: 'Settings',
			func: `va2.set.settings()`,
			symbol: 'settings',
			new_bg: 'linear-gradient(135deg, #446 50%, #669 50%)'
		}
	}
};
// Build objects and templates for modules
const instances = {};
// Virtual database
const db = {
	em: {},	// .file.path: metadata & <ems>
	file: {}, // /file/path: <file_em>
}

// Load library
conf.lib.js.loop((i,v)=>{
	if (v) { extern.js(`lib/${i}.js`, i); }
});

// Load modules
conf.modules = {
	_fm: 1,
	_ws: 0,
}
va2.e.modules = {
	_fm: 'Va2FileManager',
	_ws: 'Va2WebStudio',
}
va2.e.modules.loop((i,v)=>{
	if (conf.modules[i]) {
		extern.js(`apps/${v}/core.js`, i);
		extern.css(`apps/${v}/style.css`, i);
	}
});

// Make a request-response handshake with the server
va2.env.req = async function(action, arg1, arg2, arg3, _logging) {
	let logging = _logging || conf.sys.consoleLog;
	show(1, 'loading');
	const newform = new FormData();
	newform.append('action', action);
	newform.append('arg1', arg1);
	newform.append('arg2', arg2);
	newform.append('arg3', arg3);
	let res;
	try {
		res = await fetch ('response.lua', {method: 'POST', body: newform})
		.then(handshake => handshake.json())
		.then(data => {
			if (logging) {
				console.log('DATA_RECEIVED: ', data);
			}
			if (conf.sys.packetInfo) {
				log(1, `Packet.Request: ${data.REQUEST} >> ${data.STDOUT || 0}`);
			}
			hide('loading');
			return data;
		});
	} catch (error) {
		console.log(error);
		hide('loading');
	}
	return res;
}

// Load userdata and configs
va2.env.load = async function() {
	if (conf.server_storage === 'Filesystem') {
		let user = conf.user.username,
			_conf = await extern.file(`usr/${user}/${user}.conf`, 0, 1),
			_udata = await extern.file(`usr/${user}/${user}.userdata`, 0, 1);
		if (_conf) { _conf.clone(conf); }
		if (_udata) { _udata.clone(userdata); }
	} else if (conf.server_storage === 'Local') {
		oclone(storage.loc.get('conf'), conf);
		oclone(storage.loc.get('userdata'), userdata);
	} else if (conf.server_storage === 'Session') {
		oclone(storage.sess.get('conf'), conf);
		oclone(storage.sess.get('userdata'), userdata);
	}
}

// Save userdata and configs
va2.env.save = async function(_interval) {
	if (conf.server_storage === 'Filesystem') {
		let user = conf.user.username;
		let _t = _interval || 3;
		mkfile(`users.json`, conf.users);
		mkfile(`${user}.conf`, conf);
		mkfile(`${user}.userdata`, userdata);
		timeout.set('env_save', async ()=>{
			await va2.env.req('mv', conf.downloads+`users.json`, `${conf.server_path}usr/`, 1);
			await va2.env.req('mv', conf.downloads+`${user}.conf`, `${conf.server_path}usr/${user}/`, 1);
			await va2.env.req('mv', conf.downloads+`${user}.userdata`, `${conf.server_path}usr/${user}/`, 1);
			timeout.rm('env_save');
		}, _t);
	} else if (conf.server_storage === 'Local') {
		storage.loc.set('conf', conf);
		storage.loc.set('userdata', userdata);
	} else if (conf.server_storage === 'Session') {
		storage.sess.set('conf', conf);
		storage.sess.set('userdata', userdata);
	}
}

	// SERVER INIT

va2.set.user = async function(name, em) {
	conf.user.username = name;
	hide(em.root(4));
	await va2.env.load();

	// Load shortcuts
	userdata.shortcuts.sort();
	userdata.shortcuts.loop((i,v,n)=>{
		let em = va2.set.shortcutEm(v);
		em.style.order = n;
		va2.env.shortcuts[i] = em;
		mk('va2applist', em);
		if (userdata.taskbar[i]) {
			em.chroot('va2taskbar');
		}
	});

	conf.windowsTotal = 0;
	conf.windows = [];
	init();
}

va2.env.srvinit = async function() {
	let default_conf = await extern.file('server.conf', 0, 1);
	if (default_conf) {
		conf.merge(default_conf);
		if (conf.server_storage === 'Filesystem') {
			conf.temp = conf.server_path+'temp';
			const _users = await extern.file('usr/users.json', 0, 1);
			if (_users) { conf.users = _users; }
		} else {
			default_conf = null;
		}
	}

	// Ignore request.lua if storage is not set to Filesystem
	// and set Local as default storage type if not set
	if (!default_conf) {
		va2.env.req = ()=>{ return 0; }
		conf.server_storage = 'Local';
	}

	// If set, load local/session storage data
	if (conf.server_storage === 'Local') {
		oclone(storage.loc.get('conf'), conf);
	} else if (conf.server_storage === 'Session') {
		oclone(storage.sess.get('conf'), conf);
	}

	// Add user to menu
	if (!conf.users[0]) {
		stdin('Please specify your username.', async (str)=>{
			conf.user.username = str;
			notify(`User <c>${str}</c> has been created.<br>`+
				`Your data will be stored under: <c>${conf.server_path}usr/${str}/</c>`);
			conf.users.push(str);
			await va2.env.save(2);

			let em = create('div', {
				innerHTML: `<p>${str}</p>`,
				onclick: ()=>{ va2.set.user(str, em); }
			}, 'va2userSelect');
		});
	} else {
		conf.users.loop((_,v)=>{
			let em = create('div', {
				innerHTML: `<p>${v}</p>`,
				onclick: ()=>{ va2.set.user(v, em); }
			}, 'va2userSelect');
		});
	}
}
va2.env.srvinit();

va2.env.ping = async function() {
	let r = await va2.env.req('ping');
	SYSTEM_OS = r.OS;
	emi('ram').innerHTML = `RAM free <gicon>memory</gicon>${r.RAM_FREE}`;
	emi('cpu').innerHTML = `CPU usage <gicon>developer_board</gicon>${r.CPU_USED}`;
	//emi('operating_system').innerHTML = `<x>System</x>: ${r.OS}`;
}
va2.env.ping();

va2.env.init[1] = function() {
	loop(4, (i)=>{
		if (conf.notif['priority'+i]) {
			css('notifColor'+i, conf.notif['priority'+i]);
		}
	});

	if (!interval.get('ping')) {
		interval.set('ping', va2.env.ping, conf.sys.ping_interval_min*60);
	} else {
		interval.reset('ping', null, conf.sys.ping_interval_min*60);
	}

	if (!interval.get('session_data')) {
		interval.set('session_data', va2.env.save, conf.write_interval_min*60);
	} else {
		interval.reset('session_data', null, conf.write_interval_min*60);
	}

	if (conf.look.bg_image_light) {
		css('bgImageLight', conf.look.bg_image_light);
	}
	if (conf.look.bg_image_dark) {
		css('bgImageDark', conf.look.bg_image_dark);
	}

	css('pageBgOp', conf.look.bg_opacity);
	if (va2.mod.noclick) {
		va2.mod.noclick.speed = conf.lib.hold_s;
		va2.mod.noclick.init();
	}
}

	// ACTIONS

// Settings window datatypes and info:
// Types - text, info, switch, range, list, button
// Param: [ 0:title, 1:type, 2:options, 3:info, 4:func, 5:range_pts ]
// Category: [ 0:title, 1:icon, 2:info ]
va2.env.confMenu = {
	// Options
	server_storage: ['Storage', 'list', ['Filesystem', 'Local', 'Session'],
		'Where to store user data and server configs:<br>'+
		'<c class="it bold">Filesystem</c> - User directory ("./usr/(username)/");<br>'+
		'<c class="it bold">Local</c> - Browser local storage. Limited to ~10mb;<br>'+
		'<c class="it bold">Session</c> - Browser session storage. Will be cleared after exit.'],
	server_restart: ['Server reboot', 'button', 0,
		'Server reboot is recommended once in a while to free the RAM.',
		()=>{ va2.env.req('restart'); location.reload(); }],
	write_interval_min: ['Write interval', 'range', [0.5, 10],
		'Session progress (configs, userdata, appdata) saving interval per minute.',
		()=>{ interval.reset('session_data', null, conf.write_interval_min*60) }, 'min'],
	write_data_now: ['Save data now', 'button', 0,
		'Immediately save session data.', ()=>{ va2.env.save(); }],
	
	// Params
	user: ['User', 'manage_accounts'],
	username: ['Username', 'info', 0,
		'Local user name, used to store data under "./usr/(username)/" directory.'],
	add_user: ['Add user', 'button', 0,0, ()=>{
		stdin('Name for the new user:', (name)=>{
			conf.users.push(name); va2.env.save(); });
	}],
	dl_userdata: ['Download data', 'button', 0,0, async function() {
		const user = conf.user.username;
		mkfile(`${user}.conf`, conf);
		mkfile(`${user}.userdata`, userdata);
	}],
	logout: ['Log out', 'button', 0,0, ()=>{ location.reload(); }],
	
	// Categories
	sys: ['System', 'tune'],
	consoleLog: ['Logging', 'switch', 0,
		'In-browser console logs and packet exchange info.'],
	packetInfo: ['Packet info', 'switch', 0,
		'Packet request info for the local console.'],
	ping_interval_min: ['Ping interval', 'range', [0.1, 5],
		'Ping request interval per minute. It returns system '+
		'and performance information, including RAM/CPU usage.',
		()=>{ interval.reset('ping', null, conf.sys.ping_interval_min*60) }, 'min'],

	look: ['Appearance', 'palette'],
	switch_theme: ['Switch theme', 'button', 0,
		'Switch between light/dark color scheme.',
		()=>{ va2.set.theme(); }],
	bg_opacity: ['Background opacity', 'range', [0.1, 1],
		'Background image transparency. Becomes lighter/darker depending on theme.',
		()=>{ css('pageBgOp', conf.look.bg_opacity); }],
	bg_image_light: ['Background image light', 0,0,
		'Background image path/URL, for Light theme.',
		()=>{ css('bgImageLight', conf.look.bg_image_light); }],
	bg_image_dark: ['Background image dark', 0,0,
		'Background image path/URL, for Dark theme.',
		()=>{ css('bgImageDark', conf.look.bg_image_dark); }],
	app_icon_size: ['Shortcut size', 0,0,
		'Icon size for the Applications list shortcut, in pixels.'],

	fm: ['File manager', 'folder'],
	default_dir: ['Default directory', 0,0,
		'A directory opened at the start of every new file manager instance.'],
	thumbnail_enableCaching: ['Thumbnail caching', 'switch', 0,
		'Download small file previews to "./temp" directory.'],
	thumbnail_quality: ['Thumbnail quality', 'range', [0.1, 1], 0,0,'00'],
	thumbnail_size: ['Thumbnail size', 'range', [50, 1500], 0,0, 'px'],
	thumbnail_msToDownload: ['Thumbnail delay', 'range', [100, 5000],
		'A delay between every thumbnail download, in miliseconds.', 0, 'ms'],

	modules: ['Modules & Apps', 'extension', /*
		'Modules are extensions and/or applications that adds new '+
		'functionality to the program, or extends the current one.' //*/
	],
	_fm: ['File manager', 'switch', 0,
		'A module used for working with files and directories.',
		(on)=>{ if (on) {
			show(1, 'param::fm');
			conf.fm = va2.env.conf;
		} else {
			hide('param::fm');
			delete conf.fm;
		} }],
	_ws: ['Web studio', 'switch', 0,
		'Va2.box - A web development environment application.'],
	
	notif: ['Notifications', 'notifications'],
	priority1: ['Top priority color', 0,0,
		'Color must be in CSS/HTML color format. (Examples: #fff / rgb(255,255,255) / white)',
		()=>{ css('notifPriority1', conf.notif.priority1); }],
	priority2: ['High priority color', 0,0,0,
		()=>{ css('notifPriority2', conf.notif.priority2); }],
	priority3: ['Normal priority color', 0,0,0,
		()=>{ css('notifPriority3', conf.notif.priority3); }],
	priority4: ['Low priority color', 0,0,0,
		()=>{ css('notifPriority4', conf.notif.priority4); }],
	
	lib: ['Library', 'stacks',
		//'Additional scripts (/"extensions") for the server.'
	],
	va2code: ['Code highlighting', 'switch'],
	va2noclick: ['"No Click"', 'switch', 0,
		'Triggers click action (for example, a button) on hover.'],
	va2swipe: ['Swipe widget', 'switch', 0,
		'Creates swipeable widgets, like galleries and tile maps.'],
	hold_s: ['Holding speed', 'range', [0.1, 3],
		'Mouse holding speed in seconds, for various libraries, '+
		'especially "No Click".',
		0, 'sec'],
	
}
va2.temp.history[0] = [];

// Create Settings window and param list
va2.set.addparam = function(param, data, root) {
if (va2.env.confMenu[param]) {
	let title = emi('conf_title'),
		back = emi('conf_back'),
		ico = create('gicon', { innerHTML: 'info' }),
		self = create('div', { id: 'param::'+param }, root),
		info = create('info', { className: 'w' }),
		item = va2.env.confMenu[param],
		name = create('p', { innerHTML: item[0] }),
		input, page;

	// Create new element
	if (typeof data !== 'object') {
		// Type: parameter
		self.className = 'param center';
	} else {
		// Create new page
		const newroot = root.root(1);
		page = create('div', {
			id: 'page::'+param,
			className: 'page',
		}, newroot);
		page.dataset.title = param;

		// Type: category
		self.className = 'category pt center';
		self.onclick = ()=>{
			show(0, page);
			hide(root);
			title.innerHTML = param;
			va2.temp.history[0].push(param);
		}

		// Fill the page
		loop(data, (i,v)=>{
			va2.set.addparam(i, v, page);
		});
	}

	// Param structure
	if (typeof data !== 'object') {
		info.innerHTML = tostring(item[3]);

		if (!item[1] || (item[1] === 'text')) {
			input = create('input', {
				id: 'input::'+param,
				type: 'text',
				value: data,
			});
			enter(input, (em)=>{
				conf.rep(param, em.value);
				if (item[4]) { item[4](em.value); }
			});

		} else if (item[1] === 'switch') {
			input = create('div', {
				className: 'switch pt',
				innerHTML: 'Disabled'
			});
			input.onclick = ()=>{
				input.toggle((ON)=>{
					conf.rep(param, ON);
					if (ON) {
						input.innerHTML = 'Enabled';
						addclass(input, 'enabled');
					} else {
						input.innerHTML = 'Disabled';
						rmclass(input, 'enabled');
					}
					if (item[4]) { item[4](ON); }
				});
			}
			root.addEventListener('mouseenter', (e)=>{
				if (typeof input.dataset.condition === 'undefined') {
					if ((conf.seek(param) && (conf.seek(param)[1] !== 0)) || conf.modules[param]) {
						input.innerHTML = 'Enabled';
						addclass(input, 'enabled');
						input.toggle();
					}
				}
			});

		} else if (item[1] === 'range') {
			name.innerHTML = item[0]+` (${data}${item[5]||''})`;
			input = create('input', {
				type: 'range',
				min: item[2][0],
				max: item[2][1],
				step: item[2][0]/20,
				onmouseup: ()=>{
					let n = input.value.cut(0, 4);
					name.innerHTML = item[0]+` (${n}${item[5]||''})`;
					conf.rep(param, n);
					if (item[4]) { item[4](); }
					init();
				}
			});
			input.value = input.max/2;

		} else if (item[1] === 'list') {
			input = create('select', {
				id: 'input::'+param,
				onchange: ()=>{
					conf.rep(param, input.value);
					if (item[4]) { item[4](input.value); }
				}
			});
			item[2].loop((_,v)=>{
				let __item = create('option', {
					value: v,
					innerHTML: v
				}, input);
				if (oseek(conf, v)) { __item.selected = '1' }
			});
		} else if (item[1] === 'button') {
			input = create('div', {
				className: 'button',
				innerHTML: 'Run'
			});
			input.onclick = ()=>{
				if (item[4]) { item[4](); }
			}
		} else if (item[1] === 'info') {
			input = create('h4', {
				innerHTML: conf.seek(param)[1]
			});
		}

		if (!item[3]) {
			info.remove();
			ico.remove();
			info = ''; ico = '<space></space>';
		}
		mk(self, name, input, ico, info);
	}

	// Category structure
	else {
		const icon = create('gicon', { innerHTML: item[1] }, self);
		info.innerHTML = tostring(item[2]);
		page.dataset.title = item[0];
		if (!item[2]) {
			info.remove();
			ico.remove();
			info = ''; ico = '<space></space>';
		}
		mk(self, icon, name, ico, info);
		self.onclick = ()=>{
			show(0, page);
			hide(root);
			title.innerHTML = item[0];
			va2.temp.history[0].push(param);
		}
	}

	// History rewind
	const h_rewind = ()=>{
		let hist = va2.temp.history[0];
		if (hist.length > 0) {
			hide('page::'+hist.last());
			hist.pop();
			if (hist.length > 0) {
				show(0, 'page::'+hist.last());
				title.innerHTML = emi('page::'+hist.last()).dataset.title;
			} else {
				title.innerHTML = 'Settings';
				show(0, 'page1');
			}
		} else {
			title.innerHTML = 'Settings';
			hide('va2settingsFrame');
		}
	};

	if (typeof noclick !== 'undefined') {
		noclick(back, null, { click: h_rewind });
	} else {
		back.onclick = h_rewind;
	}
}}

va2.set.settings = function() {
	let em = emi('page1');
	tshow(0, emi('va2settingsFrame'));
	if (em.innerHTML === '') {
		conf.loop((i,v)=>{
			va2.set.addparam(i, v, em);
		});
		va2.env.conf = {};
		conf.clone(va2.env.conf);
	}
	init();
}

// Switch light/dark theme
va2.set.theme = function(_isDark, _theme) {
	if (_isDark === 1) {
		rmclass('body', 'theme-light');
		addclass('body', 'theme-dark');
		addclass('btn_theme', 'enabled');
		rmclass('va2pageBackground', 'bgImgLight');
		addclass('va2pageBackground', 'bgImgDark');
	} else if (_isDark === 0) {
		addclass('body', 'theme-light');
		rmclass('body', 'theme-dark');
		rmclass('btn_theme', 'enabled');
		addclass('va2pageBackground', 'bgImgLight');
		rmclass('va2pageBackground', 'bgImgDark');
	} else { // Toggle
		setclass('body', 'theme-light');
		setclass('body', 'theme-dark');
		setclass('btn_theme', 'enabled');
		setclass('va2pageBackground', 'bgImgLight');
		setclass('va2pageBackground', 'bgImgDark');
	}
	if (_theme) { setclass('body', theme); }
}

// Add a shortcut to the Applications list
// { name, func, symbol, icon_url, new_bg, new_order }
va2.set.shortcutEm = function(data) {
	const _div = create('div', {
		id: 'shcut::'+data.name,
		className: 'shortcut'
	});

	if (data.new_order) {
		_div.style.order = data.new_order;
	}

	const _p = create('p', {}, _div);
	_p.innerHTML = data.name;

	const _mask = create('mask', {
		onclick: ()=> {
			let em = _div;
			eval(data.func);
		}
	}, _div);
	_mask.innerHTML = `<gicon>${data.symbol}</gicon>`;

	if (data.icon_url) {
		_mask.className = 'bgfill';
		_mask.style.backgroundImage = `url("${data.icon_url}")`;
	}

	if (data.new_bg) {
		_mask.style.background = data.new_bg;
	}

	ctxt(_div, (em)=>{ va2.set.ctxtmenu(em); });

	return _div;
}

va2.env.shortcuts = {};
va2.set.shortcut = function(inputs_container, starting_order) {
	const ind = starting_order,
		em = inputs_container,
		name = em.item(ind).value;
	if (!name || (name === '')) { return 0; }
	let data = em.item(ind+1).value || '',
		symbol = em.item(ind+2).value || '',
		icon = null,
		func = null,
		icon_url = '';

	if (symbol !== '') {
		symbol = `<gicon>${symbol}</gicon>`;
	}

	// Grab website icon from Google database
	if (data.match(/^http[s]?\:\/\//g)) {
		let size = conf.look.app_icon_size || 64;
		icon_url = `https://s2.googleusercontent.com/s2/favicons?domain_url=${data}&sz=${size}`;
		func = `href("${data}", 1)`;
	} else {
		// (New shell instances below are temporary removed)
		let cmd;
		if (SYSTEM_OS === 'Unix') {
			cmd = `gnome-terminal -e ${data};`+
			`xterm -e ${data};`+
			`konsole -e ${data};`;
		} else if (SYSTEM_OS === 'Windows') {
			cmd = `start cmd.exe /k "${data}"`;
		}
		// Default symbol, if not found
		if (symbol === '') {
			symbol = `<gicon>link</gicon>`;
		}
		func = `va2.env.req('sh', "${data}")`;
	}

	userdata.shortcuts[name] = {
		name: name,
		func: func,
		symbol: symbol,
		icon_url: icon_url
	};

	// Update shortcuts in name sorting order
	va2.env.shortcuts.loop((_,v)=>{ rm(v); });

	const temp = va2.set.shortcutEm({
		name: name,
		func: func,
		symbol: symbol,
		icon_url: icon_url
	});
	va2.env.shortcuts[name] = temp;

	const indexes = va2.env.shortcuts.sort();
	indexes.loop((i,i2)=>{
		va2.env.shortcuts[i2].style.order = i+1;
	});

	va2.env.shortcuts.loop((_,v)=>{
		mk('va2applist', v);
	});

	loop(3, (i)=>{ em.item(ind+i).value = ''; });
}

	// CONSOLE WINDOW
instances.console = {};
instances.console.core = function(w) { return {
	head:
	`<h2>Console</h2>`,

	body:
	`<div id='consoleBody${w}' class='fill va2consoleBody'></div>`,
	// <div id='consoleColorMask${w}' class='va2highlight'></div>

	foot:
	`<input type='text'
		id='consoleInput${w}'
		class='fill consoleInput'
		placeholder='> (shell input)'>`,

	init: function() {
		emi('console').chroot('consoleBody'+w);
		enter('consoleInput'+w, async function(em) {
			const r = await va2.env.req('sh', em.value);
			log(0, r.STDOUT);
			em.value = '';
		});
	}
};}

	// 	MAIN LOGIC

// Context (/"Right click") menu
va2.set.ctxtMenuBtn = function(text) {
	const root = emi('va2ctxt');
	return create('div', {
		innerHTML: text,
		display: 'none'
	}, root);
}
va2.env.ctxtEntries = {
	shortcut: {
		pin: va2.set.ctxtMenuBtn('Pin / Unpin'),
		del: va2.set.ctxtMenuBtn('Delete')
	}
};
va2.set.ctxtmenu = function(id_or_em) {
	const menu = emi('va2ctxt');
	const em = emi(id_or_em);
	let name = '',
		btn = 0;

	// Close context menu and hide all buttons
	if (!em) {
		menu.items((_,v)=>{ hide(v); });
		hide(menu);
		return 0;
	}

	show(0, menu);

	// Show related buttons
	va2.env.ctxtEntries.loop((i,v)=>{
		if (em.className.match(i)) {
			name = i;
			btn = v;
			v.loop((_,item)=>{ show(0, item); });
		}
	});

	// Set new functions for buttons
	if (name == 'shortcut') {
		let ind = em.item(0).innerHTML;
		btn.pin.onclick = ()=>{
			em.chroot('va2taskbar', 1);
			if (em.root(1).id === 'va2taskbar') {
				userdata.taskbar[ind] = 1;
			} else {
				delete userdata.taskbar[ind];
			}
		};
		btn.del.onclick = ()=>{
			rm(em);
			delete userdata.taskbar[ind];
		};
	}
}

// Hide context menu on click
document.documentElement.onclick = ()=>{
	hide(emi('va2ctxt'));
}
ctxt(document.documentElement, ()=>{
	const em = emi('va2ctxt');
	const box = em.box();
	em.style.left = (va2.cur.x - (box.w/2)) + 'px';
	em.style.top = (va2.cur.y + (box.h*1.6)) + 'px';
});

// Trigger desktop workspace state
va2.set.workspace = function(state) {
	const area = emi('va2expandWorkspace'),
		desk = emi('va2desktop'),
		ws = emi('va2workspace');

	if (!state) { timeout.rm('va2workspace'); }

	else if (state==='close') {
		timeout.rm('va2workspace');
		show(0, area);
		hide(ws);
		rmclass(desk, 'unfocused');
		emi('timedate').chroot();
	}

	else if (state==='open') {
		timeout.set('va2workspace', ()=>{
			hide(area);
			show(1, ws);
			addclass(desk, 'unfocused');
			emi('timedate').chroot('va2statusFrame');
			// Desktop click
			desk.onclick = ()=>{
				if (va2.cur.type === 'mouse') {
					va2.set.workspace('close');
					desk.onmouseover = undefined;
					desk.onmouseout = undefined;
				}
			}
			// Desktop hover
			wait(0.3, 0, ()=>{
				desk.onmouseover = ()=>{
					timeout.set('va2desktopFocus', ()=>{
						va2.set.workspace('close');
						desk.onmouseover = undefined;
						desk.onmouseout = undefined;
					}, conf.lib.hold_s + 0.2);
				}
				desk.onmouseout = ()=>{
					timeout.rm('va2desktopFocus');
				}
			});
		}, conf.lib.hold_s);
	}
}

// Create new window
va2.env.window = function(modname) {
	let w = conf.windowsTotal;
	conf.windowsTotal++;
	conf.windows.push(modname);
	let inst = {};
	if (modname) { inst = instances[modname].core(w); }
	let html_temp = `
	<div id='window${w}' class='va2window'>
		<div id='window${w}Head' class='va2windowHead nosel'>
			${inst.head || ''}
			<p id='windowClose${w}' class='va2windowCloseBtn'
				onclick="if (emi('console')) { emi('console').chroot(); }; rm('window${w}'); conf.windowsTotal--; conf.windows.pop();"
			><x>×</x></p>
			<p class='va2windowMinBtn' onclick='hide("window${w}")'><x>ー</x></p>
			<p class='va2windowMaxBtn' onclick='va2.env.maximizeWindow("${w}")'><x>◻︎︎</x></p>
		</div>
		<div id='window${w}Body' class='va2windowBody'>
			${inst.body || ''}
		</div>
		<div id='window${w}Foot' class='va2windowFoot nosel'>
			${inst.foot || ''}
		</div>
	</div>`;

	mk('va2windowsFrame', html_temp);
	if (inst.init) { inst.init(); }
	if (!inst.foot) {
		emi('window'+w+'Body').style.height = 'calc(100% - 2.5rem)';
	}
	init();
}
va2.env.maximizeWindow = function(windowIndex) {
	let w = windowIndex;
	const em = emi('window'+w);
	if (typeof em.dataset.max === 'undefined') {
		em.dataset.max = 0;
	}
	em.dataset.max ^= true;
	if (em.dataset.max == 1) {
		em.style.margin = '0px';
		em.style.padding = '0px';
		em.style.height = 'var(--dvh)';
		em.style.width = '100vw';
		em.style.border = 'none';
		em.style.borderRadius = '0px';
		emi(`window${w}Body`).style.borderRadius = '0px';
		emi('windowClose'+w).style.borderRadius = '0px';
		if (emi('windowBack'+w)) {
			emi('windowBack'+w).style.borderRadius = '0px';
		}
	} else {
		em.style.margin = 'auto 0.5rem';
		em.style.padding = '0px 2px';
		em.style.height = 'calc(var(--dvh) * 0.92)';
		em.style.width = 'calc(100vmin - 0.5rem)';
		em.style.border = '1px solid var(--windowBg)';
		em.style.borderRadius = 'var(--corners)';
		emi(`window${w}Body`).style.borderRadius = 'var(--corners)';
		emi('windowClose'+w).style.borderRadius = '0 0 var(--cornersS) 0';
		if (emi('windowBack'+w)) {
			emi('windowBack'+w).style.borderRadius = 'var(--cornersS) 0 0 0';
		}
	}
}

// Check for light/dark theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
	let theme = event.matches ? 'dark' : 'light';
	if (theme === 'dark') {
		va2.set.theme(1);
	} else {
		va2.set.theme(0);
	}
	log(0,`theme: ${theme}`);
});
// ... init theme
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
	va2.set.theme(1);
	log(0,'theme: dark');
} else {
	va2.set.theme(0);
	log(0,'theme: light');
}

// Time/date per sec
setInterval(()=>{
	emi('time').innerHTML = time();
	emi('date').innerHTML = date();
	//emi('elapsed').innerHTML = '<x>Session time:</x> '+elapsed();
}, 1000);

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
