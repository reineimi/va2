"use strict";
{ // Local logic
let selected;
const e_menu = emi('editor_menu');
const e_src = emi('editor_sources');
const e_srcName = emi('editor_srcName');
const e_srcBody = emi('editor_srcBody');
const workarea = emi('workarea');
const ct = emi('va2context');
const ct_m = emi('va2contextMenu');
const ct_btn = "border br05 th_hov pt";
const excludes = {
	workarea: enumerate([
		'workarea',
		'workareaWrap',
		'va2context',
		'va2contextClose',
		'va2contextMenu'
	]),
}
const fields = {
	workarea: {
		Tag: {
			attr: 'tagName',
			opt: [
				'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form', 'table' 
			],
		},
		ID: { attr: 'id' },
		Classes: {
			attr: 'className',
		},
		Content: {
			attr: 'innerHTML',
			t: 'textarea'
		},
	},
}

function generateFields(fieldsId, _em) {
	const emData = {};
	loop(fieldsId, (i,v)=>{
		if (!(_em && (v.attr === 'tagName'))) {
			const div = create(0, {className: 'center tl'}, e_srcBody);
			const innerDiv = create(0, {className: 'center ml0 mt0 tl w1-5-2'}, div);
			mk(innerDiv, `<p class='ml0'>${i}</p>`);
			if (v.opt) {
				const sel = create('select', {
					className: 'input mr1',
					onchange: function(){ emData[v.attr] = this.value; }
				}, innerDiv);
				loop(v.opt, (_,name)=>{
					const opt = create('option', {
						value: name,
						innerHTML: name
					}, sel);
				});
			}
			const inp = create((v.t || 'input'), {
				className: 'input w1-5-3',
				oninput: function(){ emData[v.attr] = this.value; }
			}, div);
			if (_em) { inp.value = _em[v.attr]; }
		}
	});

	// "Save" button
	create('p', {
		className: 'btn bot-l green cwhite fcx-hov th_hov mt3',
		innerHTML: 'Save changes',
		onclick: ()=>{
			const _tag = emData.tagName;
			delete emData.tagName;
			if (_em) {
				loop(emData, (i,v)=>{ _em[i] = v; });
			} else {
				create(_tag, emData, workarea);
			}
			wipe(e_srcBody); hide(e_src.root());
			e_srcName.innerHTML = e_srcName.dataset.empty;
		}
	}, e_srcBody);

	return emData;
}

function emCreationDialogue() {
	hide(ct); wipe(e_srcBody); show(e_src.root());
	e_srcName.innerHTML = 'Element creation dialogue';
	generateFields(fields.workarea);
}

const buttons = {
	workarea: [
		['Create new element', emCreationDialogue],
	],
}

// Show #workarea context menu
ctxt(workarea, (em)=>{
	show(ct); wipe(ct_m);

	// Top section
	loop(buttons.workarea, (_,btn)=>{
		create('p', { className: ct_btn, innerHTML: btn[0], onclick: btn[1] }, ct_m);
	});

	// List items
	mk(ct_m, "<p class='m0'>List of elements under cursor:</p>");
	loop(inspect(), (ind, elem)=>{
		if ((elem.tagName !== 'MAIN') && !excludes.workarea[elem.id]) {
			const box = create(0, {className: 'p0 m0 center py1-g px2-g mb1-g tl pt-g th_hov-g'}, ct_m);

			// Element menu entry
			const entry = create('p', {
				className: 'border br05 f1',
				innerHTML: `${elem.tagName}:<c class='cgreen'>${ind-1}</c>${" <c class='cpurple'>" + elem.id + '</c>' || ''} (${elem.className})`
			}, box);

			// Element selection logic
			entry.onclick = ()=>{
				selected = elem;
				hide(ct); show(e_src.root()); wipe(e_srcBody);
				e_srcName.innerHTML = entry.innerHTML;
				generateFields(fields.workarea, elem);
			}

			// "Delete" button
			create('p', {
				className: 'btn border br05 ml1',
				innerHTML: "<gicon class='scale15 cred'>delete</gicon>",
				onclick: ()=>{
					rm(elem); hide(ct); wipe(e_srcBody);
					e_srcName.innerHTML = e_srcName.dataset.empty;
				}
			}, box);
		}
	});
});

}
