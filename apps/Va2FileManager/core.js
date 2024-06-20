if (!conf.fm) { conf.fm = {
	current_path: '',
	default_dir: '/home', // /srv/http/va2.reineimi
	icons: { // Google material icons
		folder: 'folder',
		file: 'draft',
		video: 'movie',
		webpage: 'pageview',
		image: 'image',
		audio: 'music_note',
	},
	thumbnail_enableCaching: 1,
	thumbnail_quality: 0.6,
	thumbnail_size: 240,
	thumbnail_msToDownload: 1000,
}}
instances.fm = { temp: {}, items: {}, copy: [], move: [] }
// Window components
instances.fm.core = function(w) { return {
	head:
	`<input id='va2windowPath${w}'
		type='text'
		placeholder='Search'
		spellcheck='false'
		autocapitalize='off'
		value=''>`,

	body:
	`<div id='gallery${w}' class='va2gallery'></div>
	<div id='fmPopupFrame${w}' class='fill f bgblur' style='display: none; background: #0001; z-index: 5'>
		<div class='fill' onclick='hide(this.root(1)); wipe("fmPopup${w}")'></div>
		<div id='fmPopup${w}' class='va2FMPopup center i' data-ind=${w}></div>
	</div>`,

	foot:
	`<p id='windowBack${w}'
		class='va2windowBackBtn'
		onclick='listdir(${w}, emi("va2windowPath${w}").value.replace(/(\\/[_~a-zA-Z0-9.-]+$)/gm, ""))'>
		<x>🡨</x>
	</p>
	<div id='windowPanel${w}' class='va2windowFootPanel center'>
		<p><anicon id='windowPanelIcon${w}'>B</anicon> <b>M E N U</b></p>
	</div>
	<div class='va2windowFootStats'><p id='windowStats${w}'></p></div>
	<div id='fmMenu${w}' class='va2FMMenu abs' data-ind=${w}></div>`,

	init: function() {
		listdir(w, conf.fm.default_dir);
		hide('fmMenu'+w);
		enter('va2windowPath'+w, (em)=>{
			listdir(w, em.value);
		});
		emi('windowPanel'+w).onclick = ()=>{
			setclass('windowPanelIcon'+w, 'va2colors');
			tshow(0, 'fmMenu'+w);
		}
		emi('window'+w+'Body').onclick = ()=>{
			rmclass('windowPanelIcon'+w, 'va2colors');
			hide('fmMenu'+w);
		}
	}
};}

// Templates for additional components
instances.fm.temp.dirmenu = `
	<div class='fh'>
		<x onclick='instances.fm.i_sel(this);'><gicon>select_check_box</gicon>Select</x>
		<x onclick='instances.fm.paste(this);'><gicon>content_paste</gicon>Paste</x>
		<x onclick='instances.fm.i_cp(this);'><gicon>content_copy</gicon>Copy</x>
		<x onclick='instances.fm.i_mv(this);'><gicon>move_item</gicon>Move</x>
		<x onclick='instances.fm.i_rm(this);'><gicon>delete</gicon>Delete</x>
	</div><hr>
	<p onclick='instances.fm.makefile(this);'>Create file</p>
`;
instances.fm.temp.filemenu = `
	<div class='fh'>
		<x onclick='instances.fm.cp(this);'><gicon>content_copy</gicon>Copy</x>
		<x onclick='instances.fm.mv(this);'><gicon>move_item</gicon>Move</x>
		<x onclick='instances.fm.rm(this);'><gicon>delete</gicon>Delete</x>
	</div>
`;
instances.fm.temp.createfile = `
	<h1 class='w'>Create a new file</h1>
	<input type='text' class='input' placeholder='File name/URL or Git URL'>
	<textarea class='input' placeholder='File data (leave empty if URL)'></textarea>
	<hr><div class='btn' onclick='instances.fm.savefile(this)'>Save</div>
`;

	// ACTIONS

// Selected item
instances.fm.sel = function(em, uid, _force) {
	setclass(uid, 'va2fmSel');
	if (!instances.fm.items[uid]) {
		instances.fm.items[uid] = em.dataset.path;
	} else {
		delete instances.fm.items[uid];
	}
}
// Select items
instances.fm.i_sel = function(em) {
	setclass(em, 'selecting');
	let w = em.root(2).dataset.ind;
	let path = conf.fm.current_path;
	parsePath(`db.em[${w}]`, path);
	let dir = parsedDir;
	em.id = 'va2fmSel'+w;

	dir.loop((i,v)=>{
		if ((i !== 'em') && (typeof(v) === 'object')) {
			if (getclass(em, 'selecting')) {
				v.em.onclick = ()=>{ instances.fm.sel(v.em, v.uid); };
				mk(v.em, `<x id='${v.uid}' class='va2fmUnsel fill'><anicon>a</anicon></x>`);
			} else {
				v.em.onclick = v.onclick;
				rm(v.uid);
			}
		}
	});

	if (getclass(em, 'selecting')) {
		em.innerHTML = "<giconx>select_check_box</giconx>Unselect";
	} else {
		em.innerHTML = '<gicon>select_check_box</gicon>Select';
		instances.fm.items = {};
	}

	init();
}
// Copy item
instances.fm.cp = function(em) {
	instances.fm.move = [];
	instances.fm.copy = [];
	instances.fm.copy.push(conf.fm.current_path);
	em.innerHTML = '<giconx>content_copy</giconx>Copied!</x>';
	setTimeout(()=>{ em.innerHTML = '<gicon>content_copy</gicon>Copy</x>'; }, 5000);
}
// Copy selected items
instances.fm.i_cp = function(em) {
	if (instances.fm.items.len() > 0) {
		let w = em.root(2).dataset.ind;
		instances.fm.move = [];
		instances.fm.copy = [];
		instances.fm.items.loop((i,v)=>{
			instances.fm.copy.push(v);
		});
		em.innerHTML = '<giconx>content_copy</giconx>Copied!</x>';
		if (emi('va2fmSel'+w)) {
			instances.fm.i_sel(emi('va2fmSel'+w));
		}
	} else {
		em.innerHTML = '<giconx>content_copy</giconx>No items!</x>';
	}
	setTimeout(()=>{ em.innerHTML = '<gicon>content_copy</gicon>Copy</x>'; }, 5000);
}
// Move item
instances.fm.mv = function(em) {
	let dir = conf.fm.current_path.replace(/(\/[_~a-zA-Z0-9.-]+$)/gm, '');
	instances.fm.moveFrom = dir;
	instances.fm.copy = [];
	instances.fm.move = [];
	instances.fm.move.push(conf.fm.current_path);
	em.innerHTML = '<giconx>move_item</giconx>Ready!</x>';
	setTimeout(()=>{ em.innerHTML = '<gicon>move_item</gicon>Move</x>'; }, 5000);
}
// Move selected items
instances.fm.i_mv = function(em) {
	if (instances.fm.items.len() > 0) {
		let dir = conf.fm.current_path;
		let w = em.root(2).dataset.ind;
		instances.fm.moveFrom = dir;
		instances.fm.copy = [];
		instances.fm.move = [];
		instances.fm.items.loop((i,v)=>{
			instances.fm.move.push(v);
		});
		em.innerHTML = '<giconx>move_item</giconx>Ready!</x>';
		if (emi('va2fmSel'+w)) {
			instances.fm.i_sel(emi('va2fmSel'+w));
		}
	} else {
		em.innerHTML = '<giconx>move_item</giconx>No items!</x>';
	}
	setTimeout(()=>{ em.innerHTML = '<gicon>move_item</gicon>Move</x>'; }, 5000);
}
// Paste selected items
instances.fm.paste = function(em) {
	let w = em.root(2).dataset.ind;
	let dir = conf.fm.current_path
	if (instances.fm.copy.length > 0) {
		instances.fm.copy.loop((_,path)=>{
			va2.env.req('cp', path, dir);
		});
	} else if (instances.fm.move.length > 0) {
		instances.fm.move.loop((_,path)=>{
			va2.env.req('mv', path, dir);
		});
	} else {
		em.innerHTML = '<giconx>content_paste</giconx>No items!</x>';
		setTimeout(()=>{ em.innerHTML = '<gicon>content_paste</gicon>Paste</x>'; }, 5000);
		return false;
	}
	ppReload(w, dir);
	try { ppReload(w, instances.fm.moveFrom, 1); } catch {}
}
// Delete item
instances.fm.rm = function(em) {
	let w = em.root(2).dataset.ind;
	let path = conf.fm.current_path;
	let dir = path.replace(/(\/[_~a-zA-Z0-9.-]+$)/gm, '');
	va2.env.req('rm', path);
	instances.fm.copy.rm(getfname(path));
	instances.fm.move.rm(getfname(path));
	ppReload(w, dir);
}
// Delete selected items
instances.fm.i_rm = function(em) {
	let w = em.root(2).dataset.ind;
	let dir = conf.fm.current_path;
	if (instances.fm.items.len() > 0) {
		instances.fm.items.loop((_,path)=>{
			if (path) {
				va2.env.req('rm', path);
				instances.fm.copy.rm(path);
				instances.fm.move.rm(path);
			}
		});
		ppReload(w, dir);
	} else {
		em.innerHTML = '<giconx>delete</giconx>No items!</x>';
	}
	setTimeout(()=>{ em.innerHTML = '<gicon>delete</gicon>Delete</x>'; }, 5000);
}
// Make and save a file
instances.fm.makefile = function(em) {
	let w = em.root(1).dataset.ind;
	let popup = emi('fmPopup'+w);
	wipe(popup);
	mk(popup, instances.fm.temp.createfile);
	show(1, popup.root(1));
	hide('fmMenu'+w);
	rmclass('windowPanelIcon'+w, 'va2colors');
}
instances.fm.savefile = async function(em) {
	let w = em.root(1).dataset.ind,
		popup = emi('fmPopup'+w),
		path = popup.item(1).value,
		data = popup.item(2).value,
		dir = conf.fm.current_path;

	if (path && (path !== '')) {
		if (path.match(/^http[s]?:\/\//gm)) {
			if (path.match(/[.]git$/gm)) {
				va2.env.req('sh', `git clone ${path} ${dir}/${getfname(path)}`);
			} else {
				va2.env.req('sh', `curl ${path} > ${dir}/${getfname(path, 1)}`);
			}
		} else {
			va2.env.req('newfile', `${dir}/${getfname(path, 1)}`, data);
		}

		wipe(popup);
		hide('fmPopupFrame'+w);
		ppReload(w, dir);
	}
}


// Convert PATH into object of <string> src object
let parsedDir;
function parsePath(src, path, _tree, _itemtree, _arr) {
	if ((path === _tree) && _arr) {
		parsedDir = _arr;
		return true;
	}
	let tree = _tree || '';
	let itemtree = _itemtree || '';
	let newroot = path.replaceAll(tree, '').match(/(\/[_~a-zA-Z0-9,.-]+)/gm)[0];
	let newtree = tree+newroot;
	let item = itemtree+newroot.replaceAll('/', '["')+'"]';
	let arr = eval(src+item);

	if (!arr) {
		arr = eval(src+item+'={}; '+src+item);
	}

	parsePath(src, path, newtree, item, arr);
}
// Reload parsed path
function ppReload(windowIndex, path, _dontList) {
	let w = windowIndex;
	parsePath(`db.em[${w}]`, path);
	parsedDir.loop((i,v)=>{
		if ((i !== 'em') && (typeof(v) === 'object')) {
			delete parsedDir[i];
			if (db.file[w]) {
				if (db.file[w][v.filepath]) {
					delete db.file[w][v.filepath];
				}
			}
		}
	});
	if (!_dontList) {
		setTimeout(()=>{ listdir(w, path); }, 500);
	}
}

// List a directory
async function listdir(windowIndex, _path) {
	let w = windowIndex;
	let path = (_path ? _path : emi(`va2windowPath${w}`).value);
	let dbPathFound;
	if (!db.em[w]) { db.em[w] = {}; }
	conf.fm.current_path = path;
	parsePath(`db.em[${w}]`, path);
	let dir = parsedDir;
	instances.fm.items = {};

	emi(`gallery${w}`).innerHTML = '';
	if (_path) { emi(`va2windowPath${w}`).value = _path; }

	// Search for items in db.em
	for (const [i, v] of Object.entries(dir)) {
		if ((i !== 'em') && (typeof(v) === 'object')) {
			try { emi(`gallery${w}`).appendChild(v.em); }
			catch { break; }
			v.em.onclick = v.onclick;
			rm(v.uid);
			dbPathFound = true;
		}
	};

	// Not found any items in db.em, make request
	if (!dbPathFound) {
		let res = await va2.env.req('dir', path);
		if (res.PCALL_ERR) {
			emi(`gallery${w}`).innerHTML =
			`<warn><x>Folder loading error:</x><br>${res.PCALL_ERR}</warn>`;
			res = {};
		}

		for (const [fname, dt] of Object.entries(res)) {
			let order = Number(dt.order);
			if ((typeof dt === 'object')) {
			setTimeout(()=>{
				let em = document.createElement('div');
				em.className = 'nosel';
				em.innerHTML = `<span class='material-symbols-outlined'>`+
				`${conf.fm.icons[dt.filetype]}</span><p>${fname}</p>`;
				em.onclick = ()=>{ showfile(w, dt.filepath); };

				if (dt.filetype === 'folder') {
					em.onclick = ()=>{ listdir(w, dt.filepath); };
				}

				if ((dt.filetype === 'image') && conf.fm.thumbnail_enableCaching) {
					let savepath = (conf.temp + dt.filepath),
						delta = conf.fm.thumbnail_msToDownload;
					if (dt.thumbnailsCached === '0') {
						let img = document.createElement('img'),
							ic = document.createElement('canvas'),
							ictx = ic.getContext('2d'),
							rel = document.createElement('a');
						img.onload = function() {
							// Resize image
							let maxsize = resize(img.height, img.width, conf.fm.thumbnail_size);
							ic.width = maxsize.w;
							ic.height = maxsize.h;
							ictx.drawImage(img, 0, 0, ic.width, ic.height);
							// Compress and save
							setTimeout(()=>{
								ic.toBlob((blob) => {
									mkfile(fname, blob);
								}, `${dt.filetype}/webp`, conf.fm.thumbnail_quality);
								setTimeout(()=>{
									va2.env.req('mv', conf.downloads+fname, conf.temp+dt.filepath);
									setTimeout(()=>{
										em.style.backgroundImage = `url("temp${dt.filepath}")`;
										em.innerHTML = '';
										ic.remove();  img.remove();
									}, delta + (delta/5) * order);
								}, (dt.thumbnailsCount*(delta/2)) + ((delta/5)*order));
							}, (dt.thumbnailsCount*delta) + (delta*order));
						}
						img.src = `data:${dt.filetype}/${dt.extension};base64, ${dt.filedata}`;
					} else {
						em.style.backgroundImage = `url("temp${dt.filepath}")`;
					}
					em.style.backgroundSize = 'cover';
					em.style.backgroundPosition = 'center';
					em.style.backgroundRepeat = 'no-repeat';
					em.innerHTML = '';
					//em.style.imageRendering = 'pixelated';
				}

				if (typeof noclick !== 'undefined') { noclick(em); }
				em.dataset.path = dt.filepath;
				dir[fname] = {
					extension: dt.extension || '',
					filetype: dt.filetype || '',
					filesize: dt.filesize || '',
					filedata: dt.filedata || '',
					filepath: dt.filepath || '',
					em: em,
					uid: uid('file.'),
					onclick: em.onclick
				};
				emi(`gallery${w}`).appendChild(em);
			}, 100 * (order*0.5));
			} else { dir[fname] = dt; }
		}
	}

	emi('windowStats'+w).innerHTML = `${dir.items} files<br>${dir.size} MB`;
	emi('gallery'+w).style.height = 'unset';
	emi('gallery'+w).style.display = 'flex';
	wipe('fmMenu'+w);
	mk('fmMenu'+w, instances.fm.temp.dirmenu);
	conf.fm.thumbnail_iteration = 0;
	init();
}

// Open a full file
function showfile(windowIndex, fpath) {
	let w = windowIndex;
	conf.fm.current_path = fpath;
	parsePath(`db.em[${w}]`, fpath);
	const f = parsedDir;
	const fname = fpath.match(/(?!\/)[_~a-zA-Z0-9,.-]+$/gm)[0];
	const fext = f.extension;
	const ftype = f.filetype;
	const fsize = f.filesize;
	const fdata = f.filedata;
	const root = emi(`gallery${w}`);
	let em;

	if (!db.file[w]) { db.file[w] = {}; }

	if (!db.file[w][fpath]) {

		if (ftype === 'file') {
			em = document.createElement('p');
			let text = atob(fdata);
			if (va2.mod.code) {
				text = va2.mod.code(fext, text);
				setclass(em, 'va2highlight');
			} else {
				text = text
				.replaceAll('\n', '<br>')
				.replaceAll('  ', '<tab></tab>')
				.replaceAll('	', '<tab></tab>');
			}
			em.innerHTML = text;
			setclass(em, 'file');
			em.style.minWidth = '100%';
		}
		else if (ftype === 'image') {
			em = document.createElement('img');
			em.style.maxHeight = '100%';
			em.src = `data:${ftype}/${fext};base64, ${fdata}`;
			em.alt = fname;

			em.dataset.state = false;
			em.onclick = function() {
				em.dataset.state ^= true;
				if (em.dataset.state == 1) {
					em.style.maxWidth = 'unset';
					em.style.maxHeight = 'unset';
					em.style.minHeight = '100%';
					em.parentNode.style.display = 'block';
					emi(`window${w}Body`).style.minHeight = '100%';
					hide(emi(`window${w}Head`), emi(`window${w}Foot`));
				} else {
					em.style.maxWidth = '100%';
					em.style.maxHeight = '100%';
					em.style.minHeight = 'unset';
					em.parentNode.style.display = 'flex';
					emi(`window${w}Body`).style.minHeight = null;
					show(0, emi(`window${w}Head`), emi(`window${w}Foot`));
				}
			}
		}
		else if (ftype === 'video') {
			em = document.createElement('video');
			em.style.maxHeight = '100%';
			em.controls = true;
			let src = document.createElement('source');
			src.src = `data:${ftype}/${fext};base64, ${fdata}`;
			src.type = `video/${fext}`;
			em.appendChild(src);
		}
		else if (ftype === 'webpage') {
			em = document.createElement('iframe');
			em.src = `data:text/${fext};base64, ${fdata}`;
			em.style.minWidth = '100%';
			em.style.minHeight = '100%';
		}

		em.style.width = 'unset';
		em.style.height = 'unset';
		em.style.maxWidth = '100%';
		em.style.border = 'none';
		em.style.borderRadius = '0px';
		em.style.margin = 'auto';

		db.file[w][fpath] = em;
	}
	else { em = db.file[w][fpath]; }

	em.id = 'fmFile'+w;
	root.innerHTML = '';
	root.appendChild(em);
	emi(`va2windowPath${w}`).value = fpath;
	emi(`windowStats${w}`).innerHTML = `1 file<br>${fsize} MB`;
	emi(`gallery${w}`).style.height = '100%';
	wipe('fmMenu'+w);
	mk('fmMenu'+w, instances.fm.temp.filemenu);
}

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
