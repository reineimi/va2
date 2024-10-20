"use strict";
va2.mod.tables = { cols: 0, rows: 0 };

// Get system theme
va2.mod.tables.theme = function() {
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		rmclass(document.body, 'theme-light');
		addclass(document.body, 'theme-dark');
	} else {
		addclass(document.body, 'theme-light');
		rmclass(document.body, 'theme-dark');
	}
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => { va2.mod.tables.theme(); });
va2.mod.tables.theme();

// Load styles
extern.css(`
#va2tableWrap { display: flex; flex-wrap; font-size: 1.1rem; position: relative; width: 95%; height: calc(var(--dvh) * 0.9); margin: auto; padding-top: 6em; overflow: scroll; }
#va2tableWrap * { font-size: inherit; }

#va2tableWrap table { margin: 0px auto auto 0px; border: 1px solid #aaa3; background: #aaaaaa0b; border-spacing: unset; border-collapse: unset; box-shadow: 1em 1em 3em #0002; }
#va2tableWrap tr { display: flex; position: relative; margin: 0px; overflow: visible; }
#va2tableWrap th,
#va2tableWrap td { white-space: pre; text-align: left; position: relative; border: 1px solid #aaa3; padding: 0.6em 0.75em; color: inherit; width: 16em; min-height: 3em; }
#va2tableWrap th { font-weight: 700; }
#va2tableWrap textarea { all: unset; background: var(--windowBg); position: absolute; top: 0px; left: 0px; padding: 0.6em 0.75em; width: 100%; height: 100%; }

#va2tableCleanup { min-height: 100%; min-width: 3em; margin: 0px; }
#va2tableCleanup > div { cursor: pointer; text-align: center; font-size: 2em !important; padding: 0.15em; }
#va2tableCleanup > div:hover { background: var(--red); color: #fff; }

#va2tableEditor { display: table; position: absolute; top: 0px; left: 0px; white-space: nowrap; padding: 1em 2em; margin: 0px 0px 3em 0px; background: #9991; border: 1px solid #aaa3; border-radius: 2em; }
#va2tableEditor * { display: inline-block; margin-right: 0.75em; }
#va2tableEditor button { background: none; font: inherit; font-weight: 600; cursor: pointer; padding: 0.5em 0.75em; border: 2px solid #0000; border-radius: 1em; }
#va2tableEditor *:last-child { margin-right: 0px; }

#va2tableWrap .blue { color: var(--blue); border-color: var(--blue); }
#va2tableWrap .green { color: var(--green); border-color: var(--green); }
#va2tableWrap .yellow { color: var(--yellow); border-color: var(--yellow); }
#va2tableWrap .red { color: var(--red); border-color: var(--red); }
#va2tableWrap .pink { color: var(--pink); border-color: var(--pink); }
#va2tableWrap .purple { color: var(--purple); border-color: var(--purple); }

#va2tableWrap button.blue:hover { color: #fff !important; background: var(--blue) !important; }
#va2tableWrap button.green:hover { color: #fff !important; background: var(--green) !important; }
#va2tableWrap button.yellow:hover { color: #fff !important; background: var(--yellow) !important; }
#va2tableWrap button.red:hover { color: #fff !important; background: var(--red) !important; }
#va2tableWrap button.pink:hover { color: #fff !important; background: var(--pink) !important; }
#va2tableWrap button.purple:hover { color: #fff !important; background: var(--purple) !important; }
`, 'va2tables');

// Table wrapper
const va2tableWrap = create(0, {id: 'va2tableWrap'});

// Table editor
const va2tableEditor = create(0, {id: 'va2tableEditor'}, 'va2tableWrap');

// Table data cleanup buttons
const va2tableCleanup = create(0, {id: 'va2tableCleanup'}, 'va2tableWrap');
const va2tableDelCol = {
	className: 'red',
	innerHTML: '#',
	onclick: ()=>{
		loop(tags('va2table', 'tr'), (i,v)=>{
			rm(emitem(v, va2.mod.tables.cols-1));
		});
		if (va2.mod.tables.cols > 0) {
			va2.mod.tables.cols--;
		}
	}
}
create(0, va2tableDelCol, 'va2tableCleanup');

// > Add column
const va2tableAddCol = create('button', {
	id: 'va2tableAddCol',
	className: 'purple',
	innerHTML: '+ Col',
	onclick: ()=>{
		va2.mod.tables.cols++;
		loop(tags('va2table', 'tr'), (i,v)=>{
			if (i === 0) { create('th', 0, v); }
			else { create('td', 0, v); }
		});
	}
}, 'va2tableEditor');

// > Add row
const va2tableAddRow = create('button', {
	id: 'va2tableAddRow',
	className: 'blue',
	innerHTML: '+ Row',
	onclick: ()=>{
		va2.mod.tables.rows++;
		const row = create('tr', 0, 'va2table');
		loop(va2.mod.tables.cols, (n)=>{
			create('td', 0, row);
		});

		const btn = create(0, {
			className: 'red',
			innerHTML: '-',
			onclick: ()=>{ rm(row, btn); va2.mod.tables.rows--; }
		}, 'va2tableCleanup');
	}
}, 'va2tableEditor');

// > Edit
const va2tableEdit = create('button', {
	id: 'va2tableEdit',
	className: 'red',
	innerHTML: 'Edit',
	onclick: ()=>{
		toggle('va2table', (state)=>{
			if (state) {
				va2tableEdit.innerHTML = 'Save';
				loop(tags('va2table', 'th'), (i,v)=>{
					mk(v, `<textarea onfocusout='emroot(this, 1).textContent = this.value'>${v.innerHTML}</textarea>`);
				});
				loop(tags('va2table', 'td'), (i,v)=>{
					mk(v, `<textarea onfocusout='emroot(this, 1).textContent = this.value'>${v.innerHTML}</textarea>`);
				});
			} else {
				va2tableEdit.innerHTML = 'Edit';
				rm('va2tableNowEditing');
				loop(tags('va2table', 'textarea'), (i,v)=>{ rm(v); });
			}
		});
	}
}, 'va2tableEditor');

// > Load
const va2tableLoad = create('button', {
	id: 'va2tableLoad',
	className: 'yellow',
	innerHTML: 'Load',
	onclick: ()=>{
		extern.file('va2table', ()=>{
			loop(tags('va2table', 'tr'), (i,v)=>{
				if (i > 0) {
					va2.mod.tables.rows++;
					const btn = create(0, {
						className: 'red',
						innerHTML: '-',
						onclick: ()=>{ rm(v, btn); va2.mod.tables.rows--; }
					}, 'va2tableCleanup');
				}
			});
			loop(emitems(emitem(va2table)), (n)=>{
				va2.mod.tables.cols++;
			});
		});
	}
}, 'va2tableEditor');

// > Export
const va2tableExport = create('button', {
	id: 'va2tableExport',
	className: 'green',
	innerHTML: 'Export',
	onclick: ()=>{
		let fname = prompt('Save this table as (name):');
		mkfile(fname+'.html', va2table.outerHTML);
	}
}, 'va2tableEditor');

// Table itself
const va2table = create('table', {id: 'va2table'}, 'va2tableWrap');
const va2tableHead = create('tr', {id: 'va2tableHead'}, 'va2table');
