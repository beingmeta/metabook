/* -*- Mode: Javascript; Character-encoding: utf-8; -*- */

/* Copyright (C) 2009-2012 beingmeta, inc.
   This file implements a Javascript/DHTML UI for reading
   large structured documents (sBooks).

   For more information on sbooks, visit www.sbooks.net
   For more information on knodules, visit www.knodules.net
   For more information about beingmeta, visit www.beingmeta.com

   This library uses the FDJT (www.fdjt.org) toolkit.

   This program comes with absolutely NO WARRANTY, including implied
   warranties of merchantability or fitness for any particular
   purpose.

   Use and redistribution (especially embedding in other
   CC licensed content) is permitted under the terms of the
   Creative Commons "Attribution-NonCommercial" license:

   http://creativecommons.org/licenses/by-nc/3.0/ 

   Other uses may be allowed based on prior agreement with
   beingmeta, inc.  Inquiries can be addressed to:

   licensing@beingmeta.com

   Enjoy!

*/

var CodexSections=
    (function(){
	function is_section(node){
	    return (node.nodeType===1) &&
		((node.tagName==='SECTION')||
		 ((node.tagName==='DIV')&&
		  (fdjtDOM.hasClass(node,'sbooksection'))));}
	
	function getGeom(elt,root){
	    var top = elt.offsetTop;
	    var left = elt.offsetLeft;
	    var width=elt.offsetWidth;
	    var height=elt.offsetHeight;
	    var rootp=((root)&&(root.offsetParent));
	    
	    if (elt===root) 
		return {left: 0,top: 0,width:width,height: height,
			right: width,bottom: height};
	    elt=elt.offsetParent;
	    while (elt) {
		if ((root)&&((elt===root)||(elt===rootp))) break;
		top += elt.offsetTop;
		left += elt.offsetLeft;
		elt=elt.offsetParent;}
	    
	    return {left: left, top: top, width: width,height: height,
		    right:left+width,bottom:top+height};}

	var TOA=fdjtDOM.toArray;
	var getChildren=fdjtDOM.getChildren;
	var addClass=fdjtDOM.addClass;
	var dropClass=fdjtDOM.dropClass;
	var hasContent=fdjtDOM.hasContent;
	var hasText=fdjtDOM.hasText;
	var getStyle=fdjtDOM.getStyle;
	var emptyString=fdjtString.isEmpty;
	var atoi=parseInt;

	var forcebreakbefore=
	    fdjtDOM.sel(fdjtDOM.getMeta("forcebreakbefore",true));
	var fullpages=fdjtDOM.sel(fdjtDOM.getMeta("sbookfullpage",true));
	
	function addSections(node,docinfo){
	    var open=false;
	    var children=fdjtDOM.toArray(node.childNodes);
	    var tracelevel=Codex.Trace.layout;
	    var i=0; var lim=children.length;
	    if (tracelevel>1) fdjtLog("addSections %o",node);
	    while (i<lim) {
		var child=children[i++];
		if (child.nodeType!==1) {
		    if (!(open)) open=fdjtDOM("section.codexwrapper");
		    node.insertBefore(open,child);
		    open.appendChild(child);}
		else if (is_section(child)) {
		    addSections(child,docinfo);
		    open=false;}
		else if (((child.id)&&(docinfo[child.id])&&
			  (docinfo[child.id].toclevel))||
			 ((forcebreakbefore)&&
			  (forcebreakbefore.match(child)))) {
		    var info=((child.id)&&(docinfo[child.id]));
		    open=fdjtDOM("section.codexwrapper");
		    if (info) open.setAttribute(
			"data-sbookloc",info.starts_at);
		    node.insertBefore(open,child);
		    open.appendChild(child);}
		else if (open) open.appendChild(child);
		else {
		    open=fdjtDOM("section.codexwrapper");
		    node.insertBefore(open,child);
		    open.appendChild(child);}}}

	function removeSection(sect){
	    var parent=sect.parentNode;
	    var children=TOA(sect.childNodes);
	    var i=children.length-1;
	    while (i>=0) {
		parent.insertBefore(children[i--],sect);}
	    parent.removeChild(sect);}

	function removeSections(root){
	    var toremove=TOA(getChildren(root,"section.codexwrapper"));
	    var i=0; var lim=toremove.length;
	    while (i<lim) removeSection(toremove[i++]);}

	function getFirstID(node,docinfo){
	    if ((node.id)&&(docinfo[node.id])) return node.id;
	    else if (node.nodeType!==1) return false;
	    else {
		var children=node.childNodes;
		var i=0; var lim=children.length;
		while (i<lim) {
		    var child=children[i++];
		    if (child.nodeType===1) {
			var id=getFirstID(child,docinfo);
			if (id) return id;}}
		return false;}}

	function getLastID(node,docinfo){
	    if ((node.id)&&(docinfo[node.id])) return node.id;
	    else if (node.nodeType!==1) return false;
	    else {
		var children=node.childNodes;
		var i=children.length-1;
		while (i>=0) {
		    var child=children[i--];
		    if (child.nodeType===1) {
			var id=getLastID(child,docinfo);
			if (id) return id;}}
		return false;}}

	function no_preamble(node){
	    var children=node.childNodes;
	    var i=0, lim=children.length;
	    while (i<lim) {
		var child=children[i++];
		if ((child.nodeType===3)&&
		    (!(emptyString(child.nodeValue))))
		    return false;
		else if ((child.nodeType===1)&&(is_section(child)))
		    return true;
		else if (child.nodeType===1)
		    return false;
		else {}}
	    return false;}
	Codex.no_preamble=no_preamble;

	function gatherSections(root,sections,docinfo){
	    if (typeof sections === 'undefined') sections=[];
	    if ((root.nodeType===1)&&(root.childNodes.length)) {
		var children=root.childNodes;
		var remove=[];
		var i=0; var lim=children.length;
		while (i<lim) {
		    var child=children[i++];
		    if (child.nodeType!==1) continue;
		    else if (!(is_section(child))) {
			gatherSections(child,sections,docinfo);
			continue;}
		    else if (!(hasContent(child,true)))
			remove.push(child);
		    // If there's nothing between it and the next section,
		    // skip it.
		    else if (no_preamble(child)) {
			gatherSections(child,sections,docinfo);}
		    else {
			var startid=getFirstID(child,docinfo);
			var endid=getLastID(child,docinfo);
			var startinfo=((startid)&&(docinfo[startid]));
			var endinfo=((startid)&&(docinfo[startid]));
			sections.push(child);
			child.setAttribute("data-sectnum",sections.length);
			if (startinfo) {
			    child.setAttribute("data-sbookloc",startinfo.starts_at);
			    child.setAttribute("data-topid",startid);}
			if ((startinfo)&&(endinfo))
			    child.setAttribute(
				"data-sbooklen",endinfo.ends_at-startinfo.starts_at);
			gatherSections(child,sections,docinfo);}}
		var i=0; var lim=remove.length;
		while (i<lim) removeSection(remove[i++]);
		return sections;}}
	
	function CodexSections(content,docinfo,win){
	    if (Codex.paginated) {
		Codex.paginated.Revert();
		Codex.paginated=false;}
	    else if (Codex.paginating) {
		if (Codex.paginating.timer) {
		    clearTimeout(Codex.paginating.timer);
		    Codex.paginating.timer=false;}
		Codex.paginating.Revert();
		Codex.paginating=false;}
	    else {}
	    if (Codex.Trace.layout)
		fdjtLog("Adding layout sections to %o",content);
	    this.root=content;
	    addSections(content,docinfo);
	    this.sections=[];
	    this.pagebreaks=[];
	    this.pagetops=[];
	    var height=this.height=win.offsetHeight;
	    this.scaled=[];
	    if (Codex.Trace.layout)
		fdjtLog("Gathering sections from %o",content);
	    gatherSections(content,this.sections,docinfo);
	    if (Codex.Trace.layout)
		fdjtLog("Gathered %d sections from %o",
			this.sections.length,content);
	    var fullpages=fdjtDOM.getChildren(content,"sbookfullpage")||[];
	    if ((fullpages)&&(fullpages.length))
		fullpages=fullpages.concat(
		    (fdjtDOM.getChildren(content,fullpages))||[]);
	    if (Codex.Trace.layout)
		fdjtLog("Adjusting %d fullpages",fullpages.length);
	    var i=0, lim=fullpages.length;
	    while (i<lim) {
		var page=fullpages[i++];
		if ((page.offsetHeight>height)&&
		    (!(page.style[fdjtDOM.transform]))) {
		    scaled.push(push);
		    page.style[fdjtDOM.transform]=
			"scale("+(height/page.offsetHeight)+")";}}
	    if (Codex.Trace.layout)
		fdjtLog("Done with initial layout of %o",content);
	    return this;}
	    
	CodexSections.prototype.revert=function(){
	    removeWrappers(this.root);};
	
	var forwardElt=fdjtDOM.forwardElt;
	function getNextBlock(node){
	    while (node=forwardElt(node)) {
		if (node.codexui) continue;
		else if ((node.tagName==='P')||(node.tagName==='DIV')||
		    (node.tagName==='UL')||(node.tagName==='PRE')||
		    (node.tagName==='BLOCKQUOTE'))
		    return node;
		else {
		    var style=getStyle(node);
		    var display=style.display;
		    if ((display==='block')||(display==='table-row')||
			(display==='list-item')||(display==='preformatted'))
			return node;}}}
	
	function gatherFastBreaks(node,container,
				  pagelim,height,
				  breaks,tops,
				  opts){
	    var style=getStyle(node);
	    var display=style.display;
	    var fudge=((opts)&&(opts.fudge))||0.25;
	    if ((display==='block')||(display==='table-row')||
		(display==='list-item')||(display==='preformatted')) {
		var geom=getGeom(node,container);
		if (geom.bottom<pagelim) return pagelim;
		else if (geom.top>pagelim) {
		    breaks.push(geom.top);
		    tops.push(node);
		    return geom.top+height;}
		else if (style.pageBreakInside==='avoid') {
		    breaks.push(geom.top);
		    tops.push(node);
		    pagelim=geom.top+height;
		    while (pagelim<geom.bottom) {
			breaks.push(pagelim-20);
			tops.push(false);
			pagelim=(pagelim-20)+height;}
		    return pagelim;}
		else if ((pagelim-geom.top)<
			 ((fudge<1)?(fudge*height):(fudge))) {
		    breaks.push(geom.top);
		    tops.push(node);
		    pagelim=geom.top+height;
		    return gatherFastBreaks(node,container,pagelim,height,
					    breaks,tops,opts);}
		else {
		    var children=node.childNodes;
		    var i=0, lim=children.length;
		    while (i<lim)  {
			var child=children[i++];
			if (child.nodeType===1)
			    pagelim=gatherFastBreaks(
				child,container,
				pagelim,height,
				breaks,tops,
				opts);}
		    while (pagelim<geom.bottom) {
			breaks.push(pagelim-20);
			tops.push(false);
			pagelim=(pagelim-20)+height;}
		    return pagelim;}}
	    else return pagelim;}

	CodexSections.prototype.getPageBreaks=function(arg){
	    var section=((arg.nodeType)?(arg):(this.sections[arg]));
	    if (!(section)) return [];
	    var sectnum=((typeof arg === 'number')?(arg):
			 atoi(arg.getAttribute('data-sectnum')));
	    if (Codex.Trace.layout)
		fdjtLog("Computing %dpx-high pages for section %d (%o)",
			this.height,sectnum,section);
	    if (this.pagebreaks[sectnum-1])
		return this.pagebreaks[sectnum-1];
	    else if (section.offsetHeight===0) return false;
	    else {
		var breaks=[], tops=[];
		var placeholder=false;
		breaks.push(0); tops.push(section);
		var pagelim=gatherFastBreaks(
		    section,section,this.height,this.height,
		    breaks,tops,{});
		this.pagebreaks[sectnum-1]=breaks;
		this.pagetops[sectnum-1]=tops;
		if (pagelim<this.height) {}
		else if (section.offsetHeight<pagelim) {
		    section.style.marginBottom=
			(pagelim-section.offsetHeight)+"px";}
		else {}
		if (Codex.Trace.layout)
		    fdjtLog("Found %d %dpx-high pages for section %d",
			    breaks.length,this.height,sectnum,section);
		return breaks;}};

	CodexSections.prototype.breakupPages=function(height,callback){
	    if (typeof height === 'undefined') height=this.height;
	    if ((height===this.height)&&(this.pagelocs))
		return this.pagelocs;
	    else if (Codex.paginating) return;
	    else {
		var sectioned=this;
		var pagebreaks=this.pagebreaks;
		var pagetops=this.pagetops;
		var pagelocs=[]; var pagenums=[];
		Codex.paginating=this;
		fdjtLog("Computing page breaks across %d sections (height=%d)",
			this.sections.length,height);
		fdjtTime.slowmap(function(section){
		    var sectnum=parseInt(section.getAttribute("data-sectnum"));
		    var breaks=pagebreaks[sectnum-1];
		    var startpage=pagelocs.length;
		    if (!(breaks)) {
			var ostyle=section.style;
			// Move it out of the way of any actual content
			section.style.position="absolute";
			section.style.visibility="hidden";
			section.style.overflow="visible";
			section.style.display="block";
			section.style.zIndex=-500;
			Codex.content.appendChild(section);
			breaks=sectioned.getPageBreaks(section);
			// Put it back into the content stream
			section.style.position="";
			section.style.visibility="";
			section.style.overflow="";
			section.style.display="";
			section.style.zIndex="";}
		    var tops=pagetops[sectnum-1], pages=[];
		    var i=0; var lim=breaks.length;
		    while (i<lim) {
			pagelocs.push({section: section, off: breaks[i],
				       breaks: breaks, tops: tops,
				       sectnum: sectnum,pageoff: i,
				       pagenum: pagelocs.length+1});
			pages.push(pagelocs.length);
			i++;}
		    if (Codex.Trace.layout)
			if (breaks.length===1)
			    fdjtLog("Added one page (%d) for section %d (%o)",
				    pagelocs.length,sectnum,section);
		    else fdjtLog("Added %d pages (%d-%d) for section %d (%o)",
				 breaks.length,startpage+1,pagelocs.length,
				 sectnum,section);
		    pagenums[sectnum-1]=pages;},
				 this.sections,
				 false,
				 function(){
				     sectioned.height=height;
				     sectioned.pagelocs=pagelocs;
				     sectioned.pagenums=pagenums;
				     Codex.paginating=false;
				     fdjtLog("Added %d pages for %s sections",
					     sectioned.pagelocs.length,
					     sectioned.sections.length);
				     if (callback) callback(sectioned);},
				 100);}};
			 
	CodexSections.prototype.getPageNumber=function(section,offset){
	    if (typeof section==='undefined') section=Codex.section;
	    else if (typeof section === 'number')
		section=Codex.sections[section-1];
	    else if (section.nodeType===1) section=section;
	    else if (typeof offset === 'undefined') {
		var info=getSectionInfo(section);
		var pagenums=Codex.sectioned.pagenums[info.sectnum-1];
		return pagenums[info.pageoff];}
	    else section=getSection(section);
	    if (typeof offset === 'undefined') offset=Codex.window.scrollTop;
	    var sectnum=sectNum(section);
	    var breaks=Codex.sectioned.pagebreaks[sectnum-1];
	    var pagenums=Codex.sectioned.pagenums[sectnum-1];
	    var i=1, lim=breaks.length; while (i<lim) {
		if (offset<breaks[i]) return pagenums[i-1];
		else i++;}
	    return pagenums[i-1];}

	/* Movement by pages */
	
	var cursection=false;
	
	function sectLoc(section){
	    return parseInt(section.getAttribute("data-sbookloc"));}
	function sectNum(section){
	    return parseInt(section.getAttribute("data-sectnum"));}

	function getSectionInfo(spec,caller){
	    var sectioned=Codex.sectioned;
	    if (typeof spec === "number") {
		if (sectioned.pagebreaks[spec-1])
		    return {section: Codex.sections[spec-1], off: 0,
			    breaks: sectioned.pagebreaks[spec-1],
			    tops: sectioned.pagetops[spec-1],
			    pagenum: ((sectioned.pagenums)&&
				      (sectioned.pagenums[spec-1][0])),
			    pageoff: 0};
		else return {section: Codex.sections[spec-1], off: 0};}
	    if (typeof spec === "string") spec=fdjtID(spec);
	    if ((spec)&&(spec.section)&&(spec.section.nodeType)) {
		// Appears to be a section info object already
		if ((!(spec.breaks))&&(spec.section.offsetHeight)) {
		    // We have an opportunity to compute breaks
		    var breaks=sectioned.getPageBreaks(spec.section);
		    var sectnum=spec.sectnum||sectNum(spec.section);
		    spec.breaks=breaks; spec.sectnum=sectnum;
		    spec.tops=sectioned.pagetops[sectnum-1];
		    if ((spec.pageoff)&&(spec.pageoff<0))
			spec.off=breaks[breaks.length+spec.pageoff];
		    else if (sectioned.pagenums)
			spec.pagenum=sectioned.pagenums[
			    sectnum-1][spec.pageoff||0];
		    else {}
		    return spec;}
		else return spec;}
	    else if ((spec)&&(spec.nodeType)) {
		if (spec.tagName==='SECTION') {
		    var sectnum=sectNum(spec), location=sectLoc(spec);
		    return {section: spec, off: 0,target: spec,
			    sectnum: sectnum, location: location,
			    pagenum: ((sectioned.pagelocs)&&
				      (sectioned.pagelocs[sectnum-1][0])),
			    pageoff: 0};}
		else {
		    var scan=spec, box=false;
		    while (scan) {
			if ((box===false)&&(typeof scan.offsetTop === 'number'))
			    box=scan;
			if (scan.tagName==='SECTION') {
			    var info=((Codex.docinfo)&&
				      ((Codex.docinfo[spec.id])||
				       ((box)&&(Codex.docinfo[box.id]))));
			    var sectnum=sectNum(scan);
			    if ((box)&&(box.offsetHeight)) {
				var breaks=sectioned.pagebreaks[sectnum-1]||
				    sectioned.getPageBreaks(scan);
				var off=getGeom(spec,Codex.content).top;
				var location=((info)&&(info.starts_at))||
				    sectLoc(scan);
				var tops=sectioned.pagetops[sectnum-1];
				var i=1, lim=breaks.length;
				while (i<lim) {
				    if ((off>=breaks[i-1])&& (off<breaks[i]))
					break;
				    else i++;}
				return {section: scan,
					box: box,target: spec,
					breaks: breaks, tops: tops,
					pageoff:i-1, off: breaks[i-1],
					pagenum:
					((sectioned.pagenums)&&
					 (sectioned.pagenums[sectnum-1][i-1])),
					location: location};}
			    else if (box) 
				return {section: scan,
					box: box,target: spec,
					location: info.location};
			    else return {section: scan, target: spec,
					 off: 0,location:sectLoc(scan)};}
			else scan=scan.parentNode;}
		    return false;}}
	    else return false;}
	Codex.getSectionInfo=getSectionInfo;
	function getSection(){
	    var info=getSectionInfo(spec);
	    return ((info)&&(info.section));}
	Codex.getSection=getSection;
	
	function displaySection(sect,visible){
	    if (visible) {
		var show=sect;
		addClass(show,"codexvisible");
		show=show.parentNode;
		while (show) {
		    addClass(show,"codexlive");
		    show=show.parentNode;}}
	    else {
		var hide=sect;
		dropClass(hide,"codexvisible");
		hide=hide.parentNode;
		while (hide) {
		    dropClass(hide,"codexlive");
		    hide=hide.parentNode;}}}
	Codex.displaySection=displaySection;
	
	function GoToSection(spec,caller,pushstate){
	    if (typeof pushstate === 'undefined') pushstate=false;
	    var info=getSectionInfo(spec)||getSectionInfo(1);
	    if (!(info)) {
		fdjtLog("Warning: GoToSection couldn't map %o to section for %s",
			spec,caller);
		return;}
	    var section=info.section;
	    var sectnum=parseInt(section.getAttribute("data-sectnum"));
	    if (Codex.Trace.flips)
		fdjtLog("GoToSection/%s Flipping to %o (%d) for %o",
			caller,section,sectnum,spec);
	    if (cursection) displaySection(cursection,false);
	    displaySection(section,true);
	    // Now that the section is visible, we can get more information,
	    //  so we call getSectionInfo again.  A little kludgy but
	    //  better than the alternatives given that we're hiding sections.
	    info=getSectionInfo(spec);
	    if (info.location) Codex.setLocation(location);
	    cursection=section; Codex.section=section; Codex.cursect=sectnum;
	    if (info.pagenum) Codex.curpage=info.pagenum;
	    var win=Codex.window; var pageoff=info.pageoff;
	    var breaks=info.breaks; var tops=info.tops;
	    win.scrollTop=info.off;
	    if ((tops)&&(tops[pageoff+1])) {
		Codex.winmask.style.opacity=1.0;
		Codex.winmask.style.backgroundColor=
		    Codex.backgroundColor||'white';}
	    else {
		Codex.winmask.style.opacity='';
		Codex.winmask.style.backgroundColor='';}
	    if ((breaks)&&(pageoff<(breaks.length-1))) {
		Codex.winmask.style.top=breaks[pageoff+1]+"px";
		Codex.winmask.style.height=
		    ((breaks[pageoff]+win.offsetHeight)-
		     breaks[pageoff+1])+
		    "px";}
	    else Codex.winmask.style.height='0px';
	    if ((info.pagenum)&&(Codex.sectioned.pagelocs)) 
		Codex.updatePageDisplay(info.pagenum,info.location);
	    if ((pushstate)&&(section)) {
		Codex.setState(
		    {location: atoi(section.getAttribute("data-sbookloc")),
		     target: section.getAttribute("data-topid")});}
	    var glossed=fdjtDOM.$(".glossed",section);
	    if (glossed) {
		var addGlossmark=Codex.UI.addGlossmark;
		var i=0; var lim=glossed.length;
		while (i<lim) addGlossmark(glossed[i++]);}}
	Codex.GoToSection=GoToSection;
	
	var previewing=false;
	var saved_scrolltop=false;
	function startPreview(spec,caller){
	    var info=getSectionInfo(spec);
	    var section=info.section;
	    var target=((spec.nodeType)?(spec):
			(typeof spec === 'string')?(fdjtID(spec)):
			(false));
	    if (!(section)) return;
	    var sectnum=parseInt(section.getAttribute("data-sectnum"));;
	    if (previewing===section) return;
	    if (Codex.Trace.flips)
		fdjtLog("startSectionPreview/%s to %o (%d) for %o",
			caller||"nocaller",section,sectnum,spec);
	    if (previewing) displaySection(previewing,false);
	    else {
		displaySection(cursection,false);
		addClass(document.body,"cxPREVIEW");
		saved_scrolltop=Codex.window.scrollTop;}
	    Codex.previewing=previewing=section;
	    displaySection(section,true);
	    // Recompute info now that it's displayed
	    info=getSectionInfo(spec);
	    Codex.window.scrollTop=(info.off)||0;
	    addClass(document.body,"cxPREVIEW");
	    if (info.pagenum)
		Codex.updatePageDisplay(info.pagenum,info.location);
	    return;}
	Codex.startSectionPreview=startPreview;

	function stopPreview(caller){
	    var sectnum=parseInt(cursection.getAttribute("data-sectnum"));
	    if (Codex.Trace.flips)
		fdjtLog("stopSectionPreview/%s from %o to %o (%d)",
			caller||"nocaller",previewing,cursection,pagenum);
	    if (!(previewing)) return;
	    displaySection(previewing,false);
	    displaySection(cursection,true);
	    if (saved_scrolltop) {
		Codex.window.scrollTop=saved_scrolltop;
		saved_scrolltop=false;}
	    dropClass(document.body,"cxPREVIEW");
	    if (Codex.previewtarget) {
		dropClass(Codex.previewtarget,"codexpreviewtarget");
		fdjtUI.Highlight.clear(Codex.previewtarget,"highlightexcerpt");
		fdjtUI.Highlight.clear(Codex.previewtarget,"highlightsearch");
		Codex.previewtarget=false;}
	    Codex.previewing=previewing=false;
	    if (Codex.curpage)
		Codex.updatePageDisplay(Codex.curpage,Codex.location);
	    return;}
	Codex.stopSectionPreview=stopPreview;

	return CodexSections;})();
	    
var CodexPaginate=
    (function(){

	var getGeometry=fdjtDOM.getGeometry;
	var hasClass=fdjtDOM.hasClass;
	var addClass=fdjtDOM.addClass;
	var dropClass=fdjtDOM.dropClass;
	var TOA=fdjtDOM.toArray;
	var isEmpty=fdjtString.isEmpty;
	var secs2short=fdjtTime.secs2short;
	var rootloop_skip=50;
	
	var atoi=parseInt;

	function Paginate(why,init){
	    
	    if (Codex.paginating) return;
	    if (!(why)) why="because";
	    if (Codex.sectioned) {
		Codex.sectioned.revert();
		Codex.sectioned=false;}
	    addClass(document.body,"pagelayout");
	    var height=getGeometry(fdjtID("CODEXPAGE")).height;
	    var width=getGeometry(fdjtID("CODEXPAGE")).width;
	    var bodysize=Codex.bodysize||"normal";
	    var bodyfamily=Codex.bodyfamily||"serif";
	    if (Codex.paginated) {
		var current=Codex.paginated;
		if ((!(init.forced))&&
		    (width===current.page_width)&&
		    (height===current.page_height)&&
		    (bodysize===current.bodysize)&&
		    (bodyfamily===current.bodyfamily)) {
		    fdjtLog("Skipping redundant pagination %j",current);
		    return;}
		// Repaginating, start with reversion
		Codex.paginated.revert();
		Codex.paginated=false;}

	    // Create a new layout
	    var layout=new CodexLayout(getLayoutArgs());
	    layout.bodysize=bodysize; layout.bodyfamily=bodyfamily;
	    Codex.paginating=layout;
	    
	    // Prepare to do the layout
	    dropClass(document.body,"cxSCROLL");
	    dropClass(document.body,"cxBYSECT");
	    addClass(document.body,"cxBYPAGE");
	    fdjtID("CODEXPAGE").style.visibility='hidden';
	    fdjtID("CODEXCONTENT").style.visibility='hidden';
	    
	    // Now walk the content
	    var content=Codex.content;
	    var nodes=TOA(content.childNodes);
	    fdjtLog("Laying out %d root nodes into %dx%d pages (%s)",
		    nodes.length,layout.width,layout.height,
		    (why||""));

	    /* Lay out the coverpage */
	    var coverpage=fdjtID("CODEXCOVERPAGE")||
		fdjtID("SBOOKCOVERPAGE")||
		fdjtID("COVERPAGE");
	    if (coverpage) {
		Codex.coverpage=coverpage;
		layout.addContent(coverpage);}
	    else {
		var coverimage=fdjtDOM.getLink("sbook.coverpage",false,false)||
		    fdjtDOM.getLink("coverpage",false,false);
		if (coverimage) {
		    var img=fdjtDOM.Image(
			coverimage,"img.codexcoverpage.sbookpage");
		    fdjtDOM.prepend(Codex.content,img);
		    Codex.coverpage=img;
		    layout.addContent(img);}}

	    var i=0; var lim=nodes.length;
	    function rootloop(){
		if (i>=lim) {
		    layout.Finish();
		    layout_progress(layout);
		    fdjtID("CODEXPAGE").style.visibility='';
		    fdjtID("CODEXCONTENT").style.visibility='';
		    dropClass(document.body,"pagelayout");
		    Codex.paginated=layout;
		    Codex.pagecount=layout.pages.length;
		    if (Codex.pagewait) {
			var fn=Codex.pagewait;
			Codex.pagewait=false;
			fn();}
		    Codex.GoTo(
			Codex.location||Codex.target||
			    Codex.coverpage||Codex.titlepage||
			    fdjtID("CODEXPAGE1"),
			"endLayout",false,false);
		    Codex.paginating=false;}
		else {
		    var root=nodes[i++];
		    var timeslice=layout.timeslice||CodexLayout.timeslice||200;
		    var timeskip=layout.timeskip||CodexLayout.timeskip||50;
		    if (((root.nodeType===3)&&(!(isEmpty(root.nodeValue))))||
			((root.nodeType===1)&&
			 (root.tagName!=='LINK')&&(root.tagName!=='META')&&
			 (root.tagName!=='SCRIPT'))) 
			layout.addContent(root,timeslice,timeskip,
					  layout.tracelevel,
					  layout_progress,rootloop);
		    else rootloop();}}

	    	/* Reporting progress, debugging */
	
	    function layout_progress(info){
		var tracelevel=info.tracelevel;
		var started=info.started;
		var pagenum=info.pagenum;
		var now=fdjtTime();
		if (!(pagenum)) return;
		if (info.done) {
		    LayoutMessage(fdjtString(
			"Finished laying out %d pages in %s",
			pagenum,secs2short((info.done-info.started)/1000)));
		    if (tracelevel)
			fdjtLog("Finished laying out %d pages in %s",
				pagenum,secs2short((info.done-info.started)/1000));}
		else {
		    if ((info.lastid)&&(Codex.docinfo)&&
			((Codex.docinfo[info.lastid]))) {
			var docinfo=Codex.docinfo;
			var maxloc=docinfo._maxloc;
			var lastloc=docinfo[info.lastid].starts_at;
			var pct=(100*lastloc)/maxloc;
			fdjtUI.ProgressBar.setProgress("CODEXLAYOUTMESSAGE",pct);
			LayoutMessage(fdjtString(
			    "Laid out %d pages (%d%%) in %s",
			    pagenum,Math.floor(pct),
			    secs2short((now-started)/1000)));
			if (tracelevel)
			    fdjtLog("Laid out %d pages (%d%%) in %s",
				    pagenum,Math.floor(pct),
				    secs2short((now-started)/1000));}
		    else {
			LayoutMessage(fdjtString(
			    "Laid out %d pages in %s",
			    info.pagenum,secs2short((now-started)/1000)));
			if (tracelevel)
			    fdjtLog("Laid out %d pages in %s",
				    info.pagenum,secs2short((now-started)/1000));}}}
	
	    function LayoutMessage(msg){
		fdjtUI.ProgressBar.setMessage("CODEXLAYOUTMESSAGE",msg);}
	    
	    rootloop();}
	Codex.Paginate=Paginate;

	CodexLayout.onresize=function(evt){
	    var content=Codex.content; var page=Codex.page;
	    var page_width=fdjtDOM.getGeometry(page).width;
	    var content_width=fdjtDOM.getGeometry(content).width;
	    var view_width=fdjtDOM.viewWidth();
	    var page_margin=(view_width-page_width)/2;
	    var content_margin=(view_width-content_width)/2;
	    if (page_margin>=50) {
		page.style.left=page_margin+'px';
		page.style.right=page_margin+'px';}
	    else page.style.left=page.style.right='';
	    if (content_margin>=50) {
		content.style.left=content_margin+'px';
		content.style.right=content_margin+'px';}
	    else content.style.left=content.style.right='';
	    if (Codex.bypage) Codex.Paginate("resize");};
	
	Codex.addConfig(
	    "layout",
	    function(name,val){
		Codex.layout=val;
		if (val==='bypage') {
		    if (!(Codex.docinfo)) {
			// If there isn't any docinfo (during startup, for
			// instance), don't bother actually paginating.
			Codex.bypage=true;}
		    else if (!(Codex.bypage)) {
			// set this
			Codex.bypage=true;
			if (Codex.postconfig)
			    // If we're in the middle of config,
			    // push off the work of paginating
			    Codex.postconfig.push(Paginate);
			// Otherwise, paginate away
			else Codex.Paginate("config");}}
		else {
		    // If you've already paginated, revert
		    if (Codex.paginated) {
			Codex.paginated.Revert();
			Codex.paginated=false;}
		    else if (Codex.paginating) {
			if (Codex.paginating.timer) {
			    clearTimeout(Codex.paginating.timer);
			    Codex.paginating.timer=false;}
			Codex.paginating.Revert();
			Codex.paginating=false;}
		    else {}
		    if (val==='bysect') {
			dropClass(document.body,"cxBYPAGE");
			dropClass(document.body,"cxSCROLL");
			addClass(document.body,"cxBYSECT");
			if (Codex.docinfo) {
			    Codex.sectioned=new CodexSections(
				Codex.content,Codex.docinfo);
			    Codex.sections=Codex.sectioned.sections;}
			Codex.bypage=false;
			Codex.bysect=true;}
		    else {
			Codex.bypage=false;
			Codex.bysect=false;
			if (Codex.sectioned) {
			    Codex.sectioned.revert();
			    Codex.sectioned=false;}
			dropClass(document.body,"cxBYPAGE");
			dropClass(document.body,"cxBYSECT");
			addClass(document.body,"cxSCROLL");}}});

	function updateLayoutProperty(name,val){
	    // This updates layout properties
	    fdjtDOM.swapClass(
		Codex.page,new RegExp("codex"+name+"\w*"),"codex"+name+val);
	    Codex[name]=val;
	    if (Codex.paginated) {
		// If you're already paginated, repaginate.  Either
		// when done with the config or immediately.
		if (Codex.postconfig) {
		    Codex.postconfig.push(function(){
			CodexMode(true);
			Codex.Paginate(name);});}
		else {
		    CodexMode(true);
		    Codex.Paginate(name);}}}
	Codex.addConfig("bodysize",updateLayoutProperty);
	Codex.addConfig("bodyfamily",updateLayoutProperty);
	
	function getLayoutArgs(){
	    var height=getGeometry(fdjtID("CODEXPAGE")).height;
	    var width=getGeometry(fdjtID("CODEXPAGE")).width;
	    var container=fdjtDOM("div.codexpages#CODEXPAGES");
	    var pagerule=fdjtDOM.addCSSRule(
		"div.codexpage",
		"width: "+width+"px; "+"height: "+height+"px;");
	    var args={page_height: height,page_width: width,
		      container: container,pagerule: pagerule,
		      tracelevel: Codex.Trace.layout,
		      logfn: fdjtLog};
	    fdjtDOM.replace("CODEXPAGES",container);
	    
	    var avoidbreakinside=
		fdjtDOM.sel(fdjtDOM.getMeta("avoidbreakinside",true));
	    if (avoidbreakinside) args.avoidbreakinside=avoidbreakinside;

	    var forcebreakbefore=
		fdjtDOM.sel(fdjtDOM.getMeta("forcebreakbefore",true));
	    if (forcebreakbefore) args.forcebreakbefore=forcebreakbefore;

	    var forcebreakafter=
		fdjtDOM.sel(fdjtDOM.getMeta("forcebreakafter",true));
	    if (forcebreakafter) args.forcebreakafter=forcebreakafter;

	    var avoidbreakafter=
		fdjtDOM.sel(fdjtDOM.getMeta("avoidbreakafter",true));
	    if (avoidbreakafter) args.avoidbreakafter=avoidbreakafter;

	    var avoidbreakbefore=
		fdjtDOM.sel(fdjtDOM.getMeta("avoidbreakbefore",true));
	    if (avoidbreakbefore) args.avoidbreakbefore=avoidbreakbefore;
	    
	    var fullpages=fdjtDOM.sel(fdjtDOM.getMeta("sbookfullpage",true));
	    if (fullpages) args.fullpages=fullpages;
	    
	    var floatpages=fdjtDOM.sel(fdjtDOM.getMeta("sbookfloatpage",true));
	    if (floatpages) args.floatpages=floatpages;

	    return args;}
	CodexLayout.getLayoutArgs=getLayoutArgs;

	/* Updating the page display */

	function updatePageDisplay(pagenum,location) {
	    var npages=Codex.pagecount;
	    var pbar=fdjtDOM("div.progressbar#CODEXPROGRESSBAR");
	    var book_len=Codex.ends_at;
	    
	    pbar.style.left=(100*((pagenum-1)/npages))+"%";
	    pbar.style.width=(100/npages)+"%";
	    var locoff=
		((typeof location==='number')?
		 (fdjtDOM(
		     "span.locoff#CODEXLOCOFF","L"+Math.floor(location/128))):
		 (fdjtDOM("span.locoff#CODEXLOCOFF")));
	    var pageno_text=fdjtDOM(
		"span#CODEXPAGENOTEXT.pageno",pagenum,"/",npages);
	    var pageno=fdjtDOM("div#CODEXPAGENO",locoff,pageno_text);
	    fdjtDOM.replace("CODEXPAGENO",pageno);
	    fdjtDOM.replace("CODEXPROGRESSBAR",pbar);
	    locoff.title="click to jump to a particular location";
	    fdjtDOM.addListeners(
		locoff,Codex.UI.handlers[Codex.ui]["#CODEXLOCOFF"]);
	    pageno_text.title="click to jump to a particular page";
	    fdjtDOM.addListeners(
		pageno_text,Codex.UI.handlers[Codex.ui]["#CODEXPAGENOTEXT"]);}

	
	/* Movement by pages */
	
	var curpage=false;
	
	function GoToPage(spec,caller,pushstate){
	    if (typeof pushstate === 'undefined') pushstate=false;
	    if (Codex.paginated) {
		var page=Codex.paginated.getPage(spec)||
		    Codex.paginated.getPage(1);
		var pagenum=parseInt(page.getAttribute("data-pagenum"));
		if (Codex.Trace.flips)
		    fdjtLog("GoToPage/%s Flipping to %o (%d) for %o",
			    caller,page,pagenum,spec);
		if (curpage) dropClass(curpage,"curpage");
		addClass(page,"curpage");
		if (typeof spec === 'number') {
		    var location=parseInt(page.getAttribute("data-sbookloc"));
		    Codex.setLocation(location);}
		updatePageDisplay(pagenum,Codex.location);
		curpage=page; Codex.curpage=pagenum;
		if (pushstate) {
		    var curnode=fdjtID(page.getAttribute("data-topid"));
		    if (curnode) Codex.setHead(curnode);}
		if ((pushstate)&&(page)) {
		    Codex.setState(
			{location: atoi(page.getAttribute("data-sbookloc")),
			 page: atoi(page.getAttribute("data-pagenum")),
			 target: Codex.target.id});}
		var glossed=fdjtDOM.$(".glossed",page);
		if (glossed) {
		    var addGlossmark=Codex.UI.addGlossmark;
		    var i=0; var lim=glossed.length;
		    while (i<lim) addGlossmark(glossed[i++]);}}
	    else if ((Codex.sectioned)&&
		     (Codex.sectioned.pagelocs)) {
		Codex.GoToSection(Codex.sectioned.pagelocs[spec-1]);}}
	Codex.GoToPage=GoToPage;
	
	/** Previewing **/

	var previewing=false;
	function startPreview(spec,caller){
	    if ((!(Codex.paginated))&&(Codex.sectioned)&&
		(Codex.sectioned.pagelocs)) {
		if (typeof spec === 'number') 
		    Codex.startSectionPreview(
			Codex.sectioned.pagelocs[spec-1],caller);
		else Codex.startSectionPreview(spec,caller);
		return;}
	    var page=Codex.paginated.getPage(spec)||Codex.paginated.getPage(1);
	    var pagenum=parseInt(page.getAttribute("data-pagenum"));
	    if (previewing===page) return;
	    if (previewing) dropClass(previewing,"curpage");
	    if (Codex.Trace.flips)
		fdjtLog("startPagePreview/%s to %o (%d) for %o",
			caller||"nocaller",page,pagenum,spec);
	    if (curpage) dropClass(curpage,"curpage");
	    addClass(page,"curpage");
	    Codex.previewing=previewing=page;
	    addClass(document.body,"cxPREVIEW");
	    updatePageDisplay(pagenum,Codex.location);}
	function stopPreview(caller){
	    if ((!(Codex.paginated))&&(Codex.sectioned)&&
		(Codex.sectioned.pagelocs)) {
		Codex.stopSectionPreview(caller);
		return;}
	    var pagenum=parseInt(curpage.getAttribute("data-pagenum"));
	    if (Codex.Trace.flips)
		fdjtLog("stopPagePreview/%s from %o to %o (%d)",
			caller||"nocaller",previewing,curpage,pagenum);
	    if (!(previewing)) return;
	    dropClass(previewing,"curpage");
	    addClass(curpage,"curpage");
	    Codex.previewing=previewing=false;
	    dropClass(document.body,"cxPREVIEW");
	    updatePageDisplay(pagenum,Codex.location);}
	Codex.startPagePreview=startPreview;
	Codex.stopPagePreview=stopPreview;

	Codex.updatePageDisplay=updatePageDisplay;

	function getPage(arg){
	    if ((Codex.bysect)&&(Codex.sectioned.pagelocs)) 
		return Codex.sectioned.getPageNumber(arg);
	    else if (!(Codex.paginated)) return -1;
	    var page=Codex.paginated.getPage(arg)||Codex.paginated.getPage(1);
	    return parseInt(page.getAttribute("data-pagenum"));}
	Codex.getPage=getPage;
	
	function displaySync(){
	    if ((Codex.pagecount)&&(Codex.curpage))
		Codex.GoToPage(Codex.curpage,"displaySync");}
	Codex.displaySync=displaySync;

	return Paginate;})();

/* Emacs local variables
   ;;;  Local variables: ***
   ;;;  compile-command: "cd ..; make" ***
   ;;;  End: ***
*/
