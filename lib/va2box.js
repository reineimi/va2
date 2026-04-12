"use strict";
va2.mod.box = {
	tips: {},
	attrs: [
	/* val: ['friendlyName', 'info', {args}]
		args:
			hint: 'messageContent'
			suf: {'buttonText': 'suffix'}
			tags[] (only show for specific tags)
	*/
		['Classes', {hint:'If you know what to write in this field, you might not have to use the selectable options below.'}],
		['Id', {hint:'Unique name of the object. It must not be repeated or duplicated.'}],
		['Source', {tags:['img', 'picture', 'audio', 'source', 'track', 'script']}],
		['Content', {hint:'Text or HTML content inside the object.'}],
		['Hint (title)', {hint:'Display text under mouse cursor on hover.'}],
		['Alt. title', {hint:'Display text instead of media when it cannot be loaded.', tags:['img', 'picture', 'audio', 'source', 'track', 'script']}],
		['Image fit', {tags:['img', 'picture']}],
		['Image pos.', {tags:['img', 'picture']}],
		['Box type', {hint:'Alternatively, "display" attribute. Different types have different content arrangement methods.'}],
		['Text color', {suf: {G:'g', H:'hov', GH:'g-hov'}}],
		['Background color', {suf: {G:'g', H:'hov', GH:'g-hov'}}],
		['Corners'],
		['Border'],
		['Border color'],
		['Arrangement (flex)', {hint:'Content arrangement (positioning) method within the (flex) box.'}],
		['Width'],
		['Height', {suf: {M:'m', Mi:'mi'}}],
		['Padding (inner spacing)', {suf: {G:'g'}}],
		['Padding: X', {suf: {G:'g'}}],
		['Padding: Y', {suf: {G:'g'}}],
		['Padding: left', {suf: {G:'g'}}],
		['Padding: right', {suf: {G:'g'}}],
		['Padding: top', {suf: {G:'g'}}],
		['Padding: bottom', {suf: {G:'g'}}],
		['Margin (outer spacing)', {suf: {G:'g'}}],
		['Margin: X', {suf: {G:'g'}}],
		['Margin: Y', {suf: {G:'g'}}],
		['Margin: left', {suf: {G:'g'}}],
		['Margin: right', {suf: {G:'g'}}],
		['Margin: top', {suf: {G:'g'}}],
		['Margin: bottom', {suf: {G:'g'}}],
		//['Position'],
		//['Left pos.'],
		//['Right pos.'],
		//['Top pos.'],
		//['Bottom pos.'],
		['Overflow', {hint:'Show/hide/scroll content that overflows beyond the boundaries of this object.'}],
		['Gaps (flex)'],
		['Order (flex)'],
		['Filling (flex)', {hint:'Alternatively, "flex" parameter. Makes an object span the Flex container by specified amount.'}],
		['Layer', {suf: {H:'hov'}}],
		['Font'],
		['Text size'],
		['Text width'],
		['Text align', {suf: {G:'g'}}],
		['Text style', {suf: {G:'g', A:'a', B:'b', X:'x'}}],
		['Text line', {suf: {G:'g', A:'a', B:'b', X:'x'}}],
		['Text case', {suf: {G:'g', A:'a', B:'b', X:'x'}}],
		['Line break', {hint:'Alternatively, "white-space" parameter.'}],
		['Word break'],
		['Line height'],
		['Letter spacing'],
		['Box shadow'],
		['Background image'],
		['Background fit'],
		['Background pos.'],
		//['Transition'],
		//['Animation'],
	],
	classes: [
	/* Indexes are identical with the [attrs]
		styles: ['class', 'friendlyName', 'selfAssignedClass']
		inputs: ['attribute', {args}]
		^ args:
			a (is an attribute of style{})
			ph (placeholder)
			tag (e.g "textbox")
			type (HTML input type)
	*/
		['className'],
		['id'],
		['src', {ph:'path or URL'}],
		['innerHTML', {tag:'textarea'}],
		['title'],
		['alt'],
		[ // Images
			['imspan', 'Span'],
			['imfit', 'Fit'],
			['imfill', 'Fill'],
		],
		[
			['imc', 'Center'],
			['imt', 'Top'],
			['imb', 'Bottom'],
			['iml', 'Left'],
			['imlt', 'Left top'],
			['imlb', 'Left bot.'],
			['imr', 'Right'],
			['imrt', 'Right top'],
			['imrb', 'Right bot.'],
		],
		[ // Box
			['block', 'Block (Default)'],
			['f', 'Flex'],
			['center', 'Flex (center)'],
			['fh', 'Flex (horizontal)'],
			['fv', 'Flex (vertical)'],
			['fhr', 'Flex (hor., reverse)'],
			['fvr', 'Flex (vert., reverse)'],
			['grid', 'Grid'],
			['table', 'Table'],
			['inline', 'In-line'],
			['iblock', 'In-line block'],
			['iflex', 'In-line flex'],
		],
		[ // Colors
			['fc', 'Font color'],
			['fcx', 'Font color (alt)'],
			['c', 'Accent', 'c'],
			['cwhite', 'White'],
			['cblack', 'Black'],
			['ccrimson', 'Crimson', 'ccrimson'],
			['cred', 'Red', 'cred'],
			['corange', 'Orange', 'corange'],
			['cyellow', 'Yellow', 'cyellow'],
			['cgreen', 'Green', 'cgreen'],
			['cteal', 'Teal', 'cteal'],
			['ccyan', 'Cyan', 'ccyan'],
			['cskyblue', 'Sky blue', 'cskyblue'],
			['cblue', 'Blue', 'cblue'],
			['cpurple', 'Purple', 'cpurple'],
			['cpink', 'Pink', 'cpink'],
			['cbrown', 'Brown', 'cbrown'],
			['cmult', 'Different (children)'],
			['cdiff', 'Randomized (children)'],
		],
		[
			['bgc', 'Background color'],
			['fgc', 'Foreground color'],
			['bgic', 'Background color (item)'],
			['fgic', 'Foreground color (item)'],
			['bga', 'Accent', 'bga'],
			['white', 'White'],
			['black', 'Black'],
			['crimson', 'Crimson', 'crimson'],
			['red', 'Red', 'red'],
			['orange', 'Orange', 'orange'],
			['yellow', 'Yellow', 'yellow'],
			['green', 'Green', 'green'],
			['teal', 'Teal', 'teal'],
			['cyan', 'Cyan', 'cyan'],
			['skyblue', 'Sky blue', 'skyblue'],
			['blue', 'Blue', 'blue'],
			['purple', 'Purple', 'purple'],
			['pink', 'Pink', 'pink'],
			['brown', 'Brown', 'brown'],
			['mult', 'Different (children)'],
			['diff', 'Randomized (children)'],
		],
		[ // Borders
			['br0', 'None'],
			['brS', 'Small'],
			['br', 'Medium'],
			['brc', 'Circle'],
			['br01', '0.1 char'],
			['br05', '0.5 char'],
			['br1', '1 char'],
			['br2', '2 char'],
			['br3', '3 char'],
			['br4', '4 char'],
			['br5', '5 char'],
			['br6', '6 char'],
			['br7', '7 char'],
			['brL', 'Left'],
			['brR', 'Right'],
			['brT', 'Top'],
			['brB', 'Bottom'],
		],
		[
			['b0', 'None'],
			['border', 'Basic'],
			['borderFg', 'Basic (alt)'],
			['b1px', '1 pixel'],
			['b2px', '2 pixels'],
			['b01', '0.1 char'],
			['b02', '0.2 char'],
			['b03', '0.3 char'],
			['b04', '0.4 char'],
			['b05', '0.5 char'],
			['b06', '0.6 char'],
			['b07', '0.7 char'],
			['b08', '0.8 char'],
			['b09', '0.9 char'],
			['b1', '1 char'],
			['b11', '1.1 char'],
			['b12', '1.2 char'],
			['b13', '1.3 char'],
			['b14', '1.4 char'],
			['b15', '1.5 char'],
			['b16', '1.6 char'],
			['b17', '1.7 char'],
			['b18', '1.8 char'],
			['b19', '1.9 char'],
			['b2', '2 char'],
			['b3', '3 char'],
			['bL', 'Left'],
			['bR', 'Right'],
			['bT', 'Top'],
			['bB', 'Bottom'],
		],
		[
			['bbg', 'Background'],
			['bfg', 'Foreground'],
			['bbgi', 'Background (item)'],
			['bfgi', 'Foreground (item)'],
			['bwhite', 'White'],
			['bblack', 'Black'],
			['bcrimson', 'Crimson', 'crimson'],
			['bred', 'Red', 'red'],
			['borange', 'Orange', 'orange'],
			['byellow', 'Yellow', 'yellow'],
			['bgreen', 'Green', 'green'],
			['bteal', 'Teal', 'teal'],
			['bcyan', 'Cyan', 'cyan'],
			['bskyblue', 'Sky blue', 'skyblue'],
			['bblue', 'Blue', 'blue'],
			['bpurple', 'Purple', 'purple'],
			['bbrown', 'Brown', 'brown']
		],
		[ // Flex
			['jcs', 'Start'],
			['jcc', 'Center'],
			['jce', 'End'],
			['spread', 'Spread'],
		],
		[ // W
			['w', '100%'],
			['w1-2', '50%'],
			['w1-6-3', '50% (mob. 100%)'],
			['w1-3', '1/3'],
			['w1-3-2', '2/3'],
			['w1-4', '1/4'],
			['w1-5', '1/5'],
			['w1-5-2', '2/5'],
			['w1-5-3', '3/5'],
			['w1-5-4', '4/5'],
			['w1-6', '1/6'],
			['w1-6-2', '2/6'],
			['w1-6-3', '3/6'],
			['w1-6-4', '4/6'],
			['w1-6-5', '5/6'],
			['w1-8', '1/8'],
			['w1-8-2', '2/8'],
			['w1-8-3', '3/8'],
			['w1-8-4', '4/8'],
			['w1-8-5', '5/8'],
			['w1-8-6', '6/8'],
			['w1-8-7', '7/8'],
			['w1-10', '1/10'],
			['w1-10-2', '2/10'],
			['w1-10-3', '3/10'],
			['w1-10-4', '4/10'],
			['w1-10-5', '5/10'],
			['w1-10-6', '6/10'],
			['w1-10-7', '7/10'],
			['w1-10-8', '8/10'],
			['w1-10-9', '9/10'],
			['w1-12', '1/12'],
			['w1-14', '1/14'],
			['w1-16', '1/16'],
			['w1-18', '1/18'],
			['w1-20', '1/20'],
			['wr1', '1 char'],
			['wr2', '2 char'],
			['wr3', '3 char'],
			['wr4', '4 char'],
			['wr5', '5 char'],
			['wr6', '6 char'],
			['wr7', '7 char'],
			['wr8', '8 char'],
			['wr9', '9 char'],
			['wr10', '10 char'],
			['wr11', '11 char'],
			['wr12', '12 char'],
			['wr13', '13 char'],
			['wr14', '14 char'],
			['wr15', '15 char'],
			['wr16', '16 char'],
			['wr17', '17 char'],
			['wr18', '18 char'],
			['wr19', '19 char'],
			['wr20', '20 char'],
			['wv1', '1 vmin'],
			['wv2', '2 vmin'],
			['wv3', '3 vmin'],
			['wv4', '4 vmin'],
			['wv5', '5 vmin'],
			['wv6', '6 vmin'],
			['wv7', '7 vmin'],
			['wv8', '8 vmin'],
			['wv9', '9 vmin'],
			['wv10', '10 vmin'],
			['wv11', '11 vmin'],
			['wv12', '12 vmin'],
			['wv13', '13 vmin'],
			['wv14', '14 vmin'],
			['wv15', '15 vmin'],
			['wv16', '16 vmin'],
			['wv17', '17 vmin'],
			['wv18', '18 vmin'],
			['wv19', '19 vmin'],
			['wv20', '20 vmin'],
			['wv50', '50 vmin'],
			['wv60', '60 vmin'],
			['wv70', '70 vmin'],
			['wv75', '75 vmin'],
			['wv80', '80 vmin'],
			['wv85', '85 vmin'],
			['wv90', '90 vmin'],
			['wv95', '95 vmin'],
			['wv100', '100 vmin'],
			['wrv1', '1 char+vmin'],
			['wrv2', '2 char+vmin'],
			['wrv3', '3 char+vmin'],
			['wrv4', '4 char+vmin'],
			['wrv5', '5 char+vmin'],
			['wrv6', '6 char+vmin'],
			['wrv7', '7 char+vmin'],
			['wrv8', '8 char+vmin'],
			['wrv9', '9 char+vmin'],
			['wrv10', '10 char+vmin'],
			['wrv11', '11 char+vmin'],
			['wrv12', '12 char+vmin'],
			['wrv13', '13 char+vmin'],
			['wrv14', '14 char+vmin'],
			['wrv15', '15 char+vmin'],
			['wrv16', '16 char+vmin'],
			['wrv17', '17 char+vmin'],
			['wrv18', '18 char+vmin'],
			['wrv19', '19 char+vmin'],
			['wrv20', '20 char+vmin'],
		/* This is both W and H
			['ch1', '1 char'],
			['ch2', '2 char'],
			['ch3', '3 char'],
			['ch4', '4 char'],
			['ch5', '5 char'],
			['ch6', '6 char'],
			['ch7', '7 char'],
			['ch8', '8 char'],
			['ch9', '9 char'],
			['ch1-5', '1.5 char'],
			['ch2-5', '2.5 char'],
			['ch3-5', '3.5 char'],
			['ch4-5', '4.5 char'],
			['ch5-5', '5.5 char'],
			['ch6-5', '6.5 char'],
			['ch7-5', '7.5 char'],
			['ch8-5', '8.5 char'],
			['ch9-5', '9.5 char'],
			*/
		],
		[ // H
			['h', '100%'],
			['vh100', '100% (screen)'],
			['h95', '95%'],
			['h85', '85%'],
			['h75', '75%'],
			['h65', '65%'],
			['h50', '50%'],
			['h45', '45%'],
			['h35', '35%'],
			['h25', '25%'],
			['h15', '15%'],
			['h10', '10%'],
			['hr1', '1 char'],
			['hr2', '2 char'],
			['hr3', '3 char'],
			['hr4', '4 char'],
			['hr5', '5 char'],
			['hr10', '10 char'],
			['hr15', '15 char'],
			['hr20', '20 char'],
			['hr25', '25 char'],
			['hr30', '30 char'],
			['hr35', '35 char'],
			['hr40', '40 char'],
			['hr45', '45 char'],
			['hr50', '50 char'],
			['hr55', '55 char'],
			['hr60', '60 char'],
			['hr65', '65 char'],
			['hr70', '70 char'],
			['hr75', '75 char'],
			['hr80', '80 char'],
			['hr85', '85 char'],
			['hr90', '90 char'],
			['hr95', '95 char'],
			['hr100', '100 char'],
			['hv1', '1 vmin'],
			['hv2', '2 vmin'],
			['hv3', '3 vmin'],
			['hv4', '4 vmin'],
			['hv5', '5 vmin'],
			['hv10', '10 vmin'],
			['hv15', '15 vmin'],
			['hv20', '20 vmin'],
			['hv25', '25 vmin'],
			['hv30', '30 vmin'],
			['hv35', '35 vmin'],
			['hv40', '40 vmin'],
			['hv45', '45 vmin'],
			['hv50', '50 vmin'],
			['hv55', '55 vmin'],
			['hv60', '60 vmin'],
			['hv65', '65 vmin'],
			['hv70', '70 vmin'],
			['hv75', '75 vmin'],
			['hv80', '80 vmin'],
			['hv85', '85 vmin'],
			['hv90', '90 vmin'],
			['hv95', '95 vmin'],
			['hv100', '100 vmin'],
			['hrv1', '1 char+vmin'],
			['hrv2', '2 char+vmin'],
			['hrv3', '3 char+vmin'],
			['hrv4', '4 char+vmin'],
			['hrv5', '5 char+vmin'],
			['hrv10', '10 char+vmin'],
			['hrv15', '15 char+vmin'],
			['hrv20', '20 char+vmin'],
			['hrv25', '25 char+vmin'],
			['hrv30', '30 char+vmin'],
			['hrv35', '35 char+vmin'],
			['hrv40', '40 char+vmin'],
			['hrv45', '45 char+vmin'],
			['hrv50', '50 char+vmin'],
			['hrv55', '55 char+vmin'],
			['hrv60', '60 char+vmin'],
			['hrv65', '65 char+vmin'],
			['hrv70', '70 char+vmin'],
			['hrv75', '75 char+vmin'],
			['hrv80', '80 char+vmin'],
			['hrv85', '85 char+vmin'],
			['hrv90', '90 char+vmin'],
			['hrv95', '95 char+vmin'],
			['hrv100', '100 char+vmin'],
			['vh1', '1 vheight'],
			['vh2', '2 vheight'],
			['vh3', '3 vheight'],
			['vh4', '4 vheight'],
			['vh5', '5 vheight'],
			['vh10', '10 vheight'],
			['vh15', '15 vheight'],
			['vh20', '20 vheight'],
			['vh25', '25 vheight'],
			['vh30', '30 vheight'],
			['vh35', '35 vheight'],
			['vh40', '40 vheight'],
			['vh45', '45 vheight'],
			['vh50', '50 vheight'],
			['vh55', '55 vheight'],
			['vh60', '60 vheight'],
			['vh65', '65 vheight'],
			['vh70', '70 vheight'],
			['vh75', '75 vheight'],
			['vh80', '80 vheight'],
			['vh85', '85 vheight'],
			['vh90', '90 vheight'],
			['vh95', '95 vheight'],
			['vh100', '100 vheight'],
		],
		[ // P
			['p0', '0'],
			['p1', '1'],
			['p2', '2'],
			['p3', '3'],
			['p4', '4'],
			['p5', '5'],
			['p6', '6'],
			['p7', '7'],
			['p10', '10'],
			['p15', '15'],
			['p20', '20'],
		],
		[
			['px0', '0'],
			['px1', '1'],
			['px2', '2'],
			['px3', '3'],
			['px4', '4'],
			['px5', '5'],
			['px6', '6'],
			['px7', '7'],
			['px10', '10'],
			['px15', '15'],
			['px20', '20'],
		],
		[
			['py0', '0'],
			['py1', '1'],
			['py2', '2'],
			['py3', '3'],
			['py4', '4'],
			['py5', '5'],
			['py6', '6'],
			['py7', '7'],
			['py10', '10'],
			['py15', '15'],
			['py20', '20'],
		],
		[
			['pl0', '0'],
			['pl1', '1'],
			['pl2', '2'],
			['pl3', '3'],
			['pl4', '4'],
			['pl5', '5'],
			['pl6', '6'],
			['pl7', '7'],
			['pl10', '10'],
			['pl15', '15'],
			['pl20', '20'],
		],
		[
			['pr0', '0'],
			['pr1', '1'],
			['pr2', '2'],
			['pr3', '3'],
			['pr4', '4'],
			['pr5', '5'],
			['pr6', '6'],
			['pr7', '7'],
			['pr10', '10'],
			['pr15', '15'],
			['pr20', '20'],
		],
		[
			['pt0', '0'],
			['pt1', '1'],
			['pt2', '2'],
			['pt3', '3'],
			['pt4', '4'],
			['pt5', '5'],
			['pt6', '6'],
			['pt7', '7'],
			['pt10', '10'],
			['pt15', '15'],
			['pt20', '20'],
		],
		[
			['pb0', '0'],
			['pb1', '1'],
			['pb2', '2'],
			['pb3', '3'],
			['pb4', '4'],
			['pb5', '5'],
			['pb6', '6'],
			['pb7', '7'],
			['pb10', '10'],
			['pb15', '15'],
			['pb20', '20'],
		],
		[ // M
			['m', 'Auto'],
			['m0', '0'],
			['m1', '1'],
			['m2', '2'],
			['m3', '3'],
			['m4', '4'],
			['m5', '5'],
			['m6', '6'],
			['m7', '7'],
			['m10', '10'],
			['m15', '15'],
			['m20', '20'],
		],
		[
			['mx0', '0'],
			['mx1', '1'],
			['mx2', '2'],
			['mx3', '3'],
			['mx4', '4'],
			['mx5', '5'],
			['mx6', '6'],
			['mx7', '7'],
			['mx10', '10'],
			['mx15', '15'],
			['mx20', '20'],
		],
		[
			['my0', '0'],
			['my1', '1'],
			['my2', '2'],
			['my3', '3'],
			['my4', '4'],
			['my5', '5'],
			['my6', '6'],
			['my7', '7'],
			['my10', '10'],
			['my15', '15'],
			['my20', '20'],
		],
		[
			['ml0', '0'],
			['ml', 'Auto'],
			['ml1', '1'],
			['ml2', '2'],
			['ml3', '3'],
			['ml4', '4'],
			['ml5', '5'],
			['ml6', '6'],
			['ml7', '7'],
			['ml10', '10'],
			['ml15', '15'],
			['ml20', '20'],
		],
		[
			['mr0', '0'],
			['mr', 'Auto'],
			['mr1', '1'],
			['mr2', '2'],
			['mr3', '3'],
			['mr4', '4'],
			['mr5', '5'],
			['mr6', '6'],
			['mr7', '7'],
			['mr10', '10'],
			['mr15', '15'],
			['mr20', '20'],
		],
		[
			['mt0', '0'],
			['mt', 'Auto'],
			['mt1', '1'],
			['mt2', '2'],
			['mt3', '3'],
			['mt4', '4'],
			['mt5', '5'],
			['mt6', '6'],
			['mt7', '7'],
			['mt10', '10'],
			['mt15', '15'],
			['mt20', '20'],
		],
		[
			['mb0', '0'],
			['mb', 'Auto'],
			['mb1', '1'],
			['mb2', '2'],
			['mb3', '3'],
			['mb4', '4'],
			['mb5', '5'],
			['mb6', '6'],
			['mb7', '7'],
			['mb10', '10'],
			['mb15', '15'],
			['mb20', '20'],
		],
		[ // Overflow
			['bounded', 'Hidden'],
			['overflow', 'Visible'],
			['scroll', 'Scroll'],
			['scrollx', 'Scroll X'],
			['scrolly', 'Scroll Y'],
		],
		[ // Gaps
			['g0', '0'],
			['g1px', '1 px'],
			['g05', '0.5'],
			['g1', '1'],
			['g2', '2'],
			['g3', '3'],
			['g4', '4'],
			['g5', '5'],
			['g6', '6'],
		],
		[ // Order
			['i0', '0'],
			['i1', '1'],
			['i2', '2'],
			['i3', '3'],
			['i4', '4'],
			['i5', '5'],
			['i6', '6'],
			['i7', '7'],
			['i8', '8'],
			['i9', '9'],
			['i10', '10'],
			['i11', '11'],
			['i12', '12'],
			['i13', '13'],
			['i14', '14'],
			['i15', '15'],
			['i16', '16'],
			['i17', '17'],
			['i18', '18'],
			['i19', '19'],
		],
		[ // Flex filling
			['f01', '0.1'],
			['f02', '0.2'],
			['f03', '0.3'],
			['f04', '0.4'],
			['f05', '0.5'],
			['f06', '0.6'],
			['f07', '0.7'],
			['f08', '0.8'],
			['f09', '0.9'],
			['f1', '1'],
		],
		[ // Layer
			['zn1', '-1'],
			['z0', '0'],
			['z1', '1'],
			['z2', '2'],
			['z3', '3'],
			['z4', '4'],
			['z5', '5'],
			['z6', '6'],
			['z7', '7'],
			['z8', '8'],
			['z9', '9'],
			['z10', '10'],
			['z11', '11'],
			['z12', '12'],
			['z13', '13'],
			['z14', '14'],
			['z15', '15'],
			['z16', '16'],
			['z17', '17'],
			['z18', '18'],
			['z19', '19'],
		],
		[ // Font
			['font', 'Main'],
			['fontX', 'Main (alt)'],
			['fontCode', 'Code'],
			['fontBtn', 'Buttons'],
			['fontPrint', 'Articles'],
			['fontPrintX', 'Articles (alt)'],
			['fontPixel', 'Pixelated'],
			['fontFancy', 'Fancy'],
			['fontNovel', 'Novel'],
		],
		[
			['fs0-1', '0.1'],
			['fs0-2', '0.2'],
			['fs0-3', '0.3'],
			['fs0-4', '0.4'],
			['fs0-5', '0.5'],
			['fs0-6', '0.6'],
			['fs0-7', '0.7'],
			['fs0-8', '0.8'],
			['fs0-9', '0.9'],
			['fs1', '1'],
			['fs1-1', '1.1'],
			['fs1-2', '1.2'],
			['fs1-3', '1.3'],
			['fs1-4', '1.4'],
			['fs1-5', '1.5'],
			['fs1-6', '1.6'],
			['fs1-7', '1.7'],
			['fs1-8', '1.8'],
			['fs1-9', '1.9'],
			['fs2', '2'],
			['fs2-1', '2.1'],
			['fs2-2', '2.2'],
			['fs2-3', '2.3'],
			['fs2-4', '2.4'],
			['fs2-5', '2.5'],
			['fs2-6', '2.6'],
			['fs2-7', '2.7'],
			['fs2-8', '2.8'],
			['fs2-9', '2.9'],
			['fs3', '3'],
			['fs4', '4'],
			['fs5', '5'],
		],
		[
			['fw1', '1'],
			['fw2', '2'],
			['fw3', '3'],
			['fw4', '4'],
			['fw5', '5'],
			['fw6', '6'],
			['fw7', '7'],
			['fw8', '8'],
			['fw9', '9'],
		],
		[ // Text formatting
			['tc', 'Center'],
			['tl', 'Left'],
			['tr', 'Right'],
			['kana', 'Kana (beta)'],
		],
		[
			['bold', 'Bold'],
			['it', 'Italic'],
			['ob', 'Oblique'],
		],
		[
			['lt', 'Line-through'],
			['ul', 'Underline'],
		],
		[
			['uc', 'Uppercase'],
			['lc', 'Lowercase'],
			['cp', 'Capitalize'],
		],
		[
			['twrap', 'Break'],
			['tnowrap', 'No break'],
			['pre', 'Preserve'],
			['preln', 'Pre. line'],
			['prewr', 'Pre. wrap'],
		],
		[
			['wbbw', 'Break'],
			['wbba', 'Break all'],
			['wbka', 'Keep all'],
			['wbap', 'Auto'],
		],
		[
			['lh01', '0.1'],
			['lh02', '0.2'],
			['lh03', '0.3'],
			['lh04', '0.4'],
			['lh05', '0.5'],
			['lh06', '0.6'],
			['lh07', '0.7'],
			['lh08', '0.8'],
			['lh09', '0.9'],
			['lh1', '1'],
			['lh11', '1.1'],
			['lh12', '1.2'],
			['lh13', '1.3'],
			['lh14', '1.4'],
			['lh15', '1.5'],
			['lh16', '1.6'],
			['lh17', '1.7'],
			['lh18', '1.8'],
			['lh19', '1.9'],
			['lh2', '2'],
		],
		[
			['ls1', '1 px'],
			['ls2', '2 px'],
			['ls3', '3 px'],
			['ls4', '4 px'],
			['ls5', '5 px'],
			['ls6', '6 px'],
			['ls01', '0.1 char'],
			['ls02', '0.2 char'],
			['ls03', '0.3 char'],
			['ls04', '0.4 char'],
			['ls05', '0.5 char'],
			['ls06', '0.6 char'],
		],
		[ // Shadow
			['noshadow', 'Unset'],
			['shadow', 'Slight'],
			['shadowX', 'Darker'],
			['shadowS', 'Minimal'],
		],
		['backgroundImage', {a:1}],
		[
			['bgspan', 'Span'],
			['bgfit', 'Fit'],
		],
		[
			['bgc', 'Center'],
			['bgt', 'Top'],
			['bgb', 'Bottom'],
			['bgl', 'Left'],
			['bglt', 'Left top'],
			['bglb', 'Left bot.'],
			['bgr', 'Right'],
			['bgrt', 'Right top'],
			['bgrb', 'Right bot.'],
		],
		[
			['', ''],
		],
	],
	special: [ // Special classes displayed as switch buttons
	// [title, class or [class_true, class_false], hint]
		['Point', 'pt', 'Changes cursor on hover'],
		['No selection', 'nosel', 'Changes whether you can drag or select this object and its contents'],
		['Interactive', ['int', 'nil'], 'Changes whether you can interact with the object and its contents'],
		['Fill', ['fill', 'fillx'], "Fills the <x class='cgreen'>container</x> or <x class='cred'>screen</x>"],
		['Text', ['text', 'text-g'], "Removes text formatting, corrects line and word breaks. <x class='cred'>Red color</x> sets <b>Global</b> suffix"],
		['Icon (Google)', 'gicon', 'Makes this element an icon. You need to specify the icon ID in the <b>Content</b> field'],
		['Icon (Anicons)', 'anicon', 'Makes this element an icon. You need to specify the icon ID in the <b>Content</b> field'],
		//['', '', ''],
		//['', ['', ''], "<x class='cgreen'></x> <x class='cred'></x>"],
	],
};

// Templates
va2.mod.box.attrs.unshift(['Template', {info:'Pre-made templates with a set of classes.'}]);
va2.mod.box.classes.unshift([
	['Section', 'sect f'],
	['Section Block', 'm w th_windowFg round shadow p3 py2 f'],
	['Button', 'btn borderFg'],
	//['', ''],
]);

// Element selector
mk('va2ctxtMenu', "<hr><div id='va2box_ctxt' class='w center tc'></div>");
ctxt(qem('main')[0], ()=>{
	wipe('va2box_ctxt');
	mk('va2box_ctxt', '<div class="va2 w mb1">Object list (<c>Va2Box</c>):</div>');
	loop(inspect(), (_,em)=>{
		let em_uid = em.dataset.uid;
		if (!em.dataset.uid) { em_uid = uid('obj_'); em.dataset.uid = em_uid; }
		mk('va2box_ctxt', `<p class='va2' onclick="va2.mod.box.edit('${em_uid}'); hide(this.root(3))">${em.tagName}: <x class='fcx'>${em.id || em.className || ''}</x> <c>${em_uid}</c></p>`);
	});
	mk('va2box_ctxt', "<div class='va2 w m1 pt1 fcx fs08'>Note: This is a list of all the elements "+
		"found under the cursor, sorted from closest (top left) to farthest (bottom right).<br>Va2-specific objects are not included in the list.</div>");
});

// Edit selected element
va2.mod.box.edit = function(em_or_uid){
	let em = em_or_uid;
	if (type(em) === 'string') {
		em = qem(`[data-uid=${em_or_uid}]`)[0];
	}
	va2.mod.box.selected = em;
	const em_uid = em.dataset.uid;
	const win = windows.add(
		`${em.tagName}: <c>${em_uid}</c>`,
		"<p class='mb05 fcx fs08 tc'>Don't know what to do? Click on the <x class='gicon btn px05 i0 borderFg fc'>info_i</x> button in the window header!</p>",
		{info:va2.mod.box.tips.edit});
	addclass(win[1], 'pb1-g');
	let classField;

	{ // Add action buttons
	const block = create(0, {className: 'center mb1 bB mb1-g mx05-g'}, win[1]);
	create('p', {
		className: 'btn borderFg red cwhite',
		innerHTML: 'Remove',
		title: 'Delete this object (forever).',
		onclick: function(){
			rm(em, emroot(this, 4));
		}
	}, block);
	create('p', {
		className: 'btn borderFg skyblue cwhite',
		innerHTML: 'Change',
		title: 'Change object type (HTML tag name).',
		onclick: ()=>{
			stdin((str)=>{
				if(str && (str!=='')) {
					const em_new = retag(em, str);
					windows.close(win[0]);
					va2.mod.box.edit(em_new);
				}
			},
			'Specify a new type (tag name) for the object.');
		}
	}, block);
	create('p', {
		className: 'btn borderFg yellow cwhite',
		innerHTML: 'Relocate',
		title: 'Change container (parent) of this object.',
		onclick: ()=>{
			stdin(
				(str)=>{ if(str && (str!=='')) {
					if (emi(str)) {
						emchroot(em, emi(str));
					} else if (qem(`[data-uid=${str}]`)[0]) {
						emchroot(em, qem(`[data-uid=${str}]`)[0]);
					} else if (qem[str][0]) {
						emchroot(em, qem[str][0]);
					}
				}},
				'To change the container of the object, please specify one of the following:'+
				'<br><c>ID / UID / CSS query</c> of the container in question.'
			);
		}
	}, block);
	create('p', {
		className: 'btn borderFg green cwhite',
		innerHTML: 'Append',
		title: 'Create new object within this one.',
		onclick: ()=>{
			va2.mod.box.add(em);
		}
	}, block);
	}

	{// Add special class buttons
	const wrap = create(0, {
		className: 'w bB pb2 tc nosel',
		innerHTML: "<p class='bgc py2 pt c-hov fs1-8 fontFancy' "+
		"onclick='tshow(emitem(emroot(this),2))'>Special classes</p>"
	}, win[1]);

	// Foldable list
	const list = create(0, {
		className: 'f p2 mb3-g bgc hide ani ani-expandB',
		innerHTML: "<p class='w fs08 fcx px2'>(This section neither updates the Classes field, nor responds to it.)</p>",
	}, wrap);

	loop(va2.mod.box.special, (_,v)=>{
		const title = v[0];
		const arg = v[1];
		const hint = v[2];
		const div = create(0, {className:'m mt0 wr15 px1'}, list);

		// The button (this section probably needs optimization)
		const btn = create(0, {
			className: 'btn bfgi b1px',
			innerHTML: title
		}, div);
		if (type(arg)==='string') {
			btn.onclick = ()=>{
				setclass(em, arg);
				setclass(btn, 'green', 'cwhite');
			}
			// Change button state on window init
			if (getclass(em, arg)) {
				addclass(btn, 'green', 'cwhite');
			}
		} else {
			btn.onclick = ()=>{ // Switch didn't work here...
				if (getclass(em, arg[0])) { // RED
					rmclass(btn, 'green');
					rmclass(em, arg[0]);
					addclass(em, arg[1]);
					addclass(btn, 'red', 'cwhite');
				} else if (getclass(em, arg[1])) { // NULL
					rmclass(em, arg[0], arg[1]);
					rmclass(btn, 'red', 'cwhite');
				} else { // GREEN
					addclass(em, arg[0]);
					addclass(btn, 'green', 'cwhite');
				}
			}
			// Change button state on window init
			if (getclass(em, arg[0])) {
				addclass(btn, 'green', 'cwhite');
			} if (getclass(em, arg[1])) {
				addclass(btn, 'red', 'cwhite');
			}
		}

		// Button hint
		mk(div, `<p class='mt1 fs08 fcx'>${hint}.</p>`);
	});
	}

	// Create attribute list
	loop(va2.mod.box.attrs, (i,v)=>{
		const args = v[1] || {};
		const block = create(0, {
			className: 'f py05 bB bgc-hov',
			innerHTML: `<p class='m ml0 tl p1'>${v[0]}:</p>`,
		}, win[1]);
		if (type(va2.mod.box.classes[i][0]) !== 'array') {
			const arr = va2.mod.box.classes[i];
			const attr = arr[0];
			const props = arr[1] || {};
			// Enable property for specified tags only
			let enabled = (!args.tags) || false;
			loop(args.tags, (_,t)=>{
				if (em.tagName === t.toUpperCase()) {
					enabled = 1;
				}
			});
			if (enabled) {
				// Info button
				if (args.hint) {
					create('p', {
						className: 'gicon btn p1 borderFg m mr0',
						innerHTML: 'info_i',
						title: args.hint || '',
						onclick: ()=>{ popup("<p class='tc'>"+args.hint+'</p>', 'Property: <b>'+v[0]+'</b>'); }
					}, block);
				}
				// Input field
				const inp = create(props.tag || 'input', {
					className: 'input br0 w1-2 ml05 bgc',
					placeholder: props.ph || ''
				}, block);
				// Check if attribute belongs to style{}
				if (props.a) {
					inp.value = em.style[attr] || '';
					inp.onblur = function(){
						em.style[attr] = this.value;
					}
				} else {
					inp.value = em[attr] || '';
					inp.onblur = function(){
						em[attr] = this.value;
					}
				}
				if (props.type) { inp.type = props.type; }
				if (v[0] === 'Classes') { classField = inp; }
			} else { rm(block); }
		} else {
			// Option selector
			const div = create(0, {className: 'right f g1 end'}, block);
			const sel = create('select', {
				className: 'input tc th_itemBg borderFg py05 m',
				innerHTML: "<option value='' selected>---</option>",
				onchange: function (){
					loop(va2.mod.box.classes[i], (_,arr)=>{
						const cl = arr[0];
						if (cl === this.value) { addclass(em, cl); }
						else { rmclass(em, cl); }
					});
					if (classField) { classField.value = em.className; }
				}
			}, div);
			// Templates logic
			if (v[0] === 'Template') {
				sel.onchange = function (){
					loop(va2.mod.box.classes[i], (_,arr)=>{
						if (arr[1] === this.value) { em.className = arr[1]; }
					});
					if (classField) { classField.value = em.className; }
				}
			}
			// Options (param list)
			loop(va2.mod.box.classes[i], (_,arr)=>{
				let name = arr[1];
				let val = arr[0];
				if (v[0] === 'Template') {
					name = arr[0]; val = arr[1];
				}
				mk(sel, `<option class='${arr[2] || ''}' value='${val}'>${name}</option>`);
			});
			// Info button
			if (args.hint) {
				create('p', {
					className: 'gicon btn px1 py1 borderFg m',
					innerHTML: 'info_i',
					title: args.hint,
					onclick: ()=>{ popup("<p class='tc'>"+args.hint+'</p>', 'Property: <b>'+v[0]+'</b>'); }
				}, div);
			}
			// Suffix buttons
			if (args.suf) {
				loop(args.suf, (name,suf)=>{
					create('p', {
						innerHTML: name,
						className: 'btn px1 py05 borderFg br05 m',
						onclick: ()=>{
							loop(va2.mod.box.classes[i], (_,arr)=>{
								const cl = arr[0]+'-'+suf;
								if (arr[0] === sel.value) { addclass(em, cl); }
								else { rmclass(em, cl); }
							});
						}
					}, div);
				});
			}
			// Clear button
			if (v[0] !== 'Template') {
				create('p', {
					innerHTML: 'close',
					className: 'gicon btn px1 py1 borderFg m',
					onclick: ()=>{
						loop(va2.mod.box.classes[i], (_,arr)=>{
							rmclass(em, arr[0], arr[0]+'-g', arr[0]+'-hov', arr[0]+'-g-hov');
						});
					}
				}, div);
			}
		}
	});
}

// Create new element (within root element if specified)
va2.mod.box.add = function(_root){
	const em = emi(_root);
	const it = create(0, {className:'p2 bga'}, em);
	const _uid = uid('obj_');
	it.dataset.uid = _uid;
	va2.mod.box.edit(it);
	hide('va2ctxt');
}

// Tips, hints
{va2.mod.box.tips.edit = `<div class='m mt0 mb1-g tl a-c a-ul'>
<p class='fs1-6'>How to</p>
<p>What you see in the menu is the list of properties of the created/selected object (element). When you click
the <x class='btn borderFg green cwhite fs06'>Append</x> button, you create a new object within the current one.</p>
<p>Following the logic above, you can create <b>nested objects</b>. A common webpage is a set of a large amount of nested objects.
Therefore, you can start by designing the container object, and then arranging content within it.</p>

<hr class='mt2'><p class='fs1-6'>Tags (types)</p>
<p></p>

<hr class='mt2'><p class='fs1-6'>Classes</p>
<p><b>Classes</b> are a "shortcut" that can be applied to multiple objects. Each <b>class</b> is a set of properties, sometimes also containing <i>variables</i>.</p>
<p>Currently there is <x class='cred'>no documentation</x> for all of the classes available in the library. However, you can
<a href='https://github.com/reineimi/va2/blob/main/lib/va2.css' target='_blank'>view them here</a>. There are structured (more or less) comments (descriptions).</p>

<hr class='mt2'><p class='fs1-6'>Buttons</p>
	<p class='fs1-3 c'>Top buttons (coloured):</p>
	<p><x class='btn borderFg red cwhite fs06'>Remove</x> - Delete the object (cannot be undone).</p>
	<p><x class='btn borderFg skyblue cwhite fs06'>Change</x> - Change the type (tag) of the object. For example, use "input" tag to create text input.</p>
	<p><x class='btn borderFg yellow cwhite fs06'>Relocate</x> - Move the current object to the different (parent) container.</p>
	<p><x class='btn borderFg green cwhite fs06'>Append</x> - Append (create) a new object within the current one. A new window will open for the created object.</p>
	
	<p class='fs1-3 c'>Info, Clear:</p>
	<p>Button <x class='gicon btn p05 borderFg br05'>close</x> stands for "Clear" and removes all current classes associated with the parameter.</p>
	<p>Button <x class='gicon btn p05 borderFg br05'>info_i</x> stands for "Info" and displays information about the parameter on hover/click.</p>

	<p class='fs1-3 c'>Global, Hover:</p>
	<p>Button <x class='btn px1 py0 borderFg br05'>G</x> stands for "Global" and applies style for the children elements.</p>
	<p>Button <x class='btn px1 py0 borderFg br05'>H</x> stands for "Hover" and applies style when the cursor is hovering over the object.</p>
	<p>Button <x class='btn px1 py0 borderFg br05'>GH</x> works the same as <x class='btn px1 py0 borderFg br05'>H</x> for <x class='btn px1 py0 borderFg br05'>G</x>.</p>
	<p>Therefore, to apply styles for both the object and its children, first select the property and click <x class='btn px1 py0 borderFg br05'>G</x>, and then change the property for the container object.</p>

	<p class='fs1-3 c'>Maximum/Minimum:</p>
	<p>Button <x class='btn px1 py0 borderFg br05'>M</x> stands for "Maximum",
	<x class='btn px1 py0 borderFg br05'>Mi</x> for "Minimum". Both set the limit for the width/height, making width/height impossible to go beyond that limit.</p>
	<p>Same as with previous buttons, first set the Minimum, and then select either the static or Maximum width/height value.</p>

</div>`;}
