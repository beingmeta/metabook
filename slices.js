/* -*- Mode: Javascript; -*- */

var sbooks_summae_id="$Id$";
var sbooks_summae_version=parseInt("$Revision$".slice(10,-1));

/* Copyright (C) 2009-2010 beingmeta, inc.
   This file implements the search component of a 
    Javascript/DHTML UI for reading large structured documents (sBooks).

   For more information on sbooks, visit www.sbooks.net
   For more information on knodules, visit www.knodules.net
   For more information about beingmeta, visit www.beingmeta.com

   This library uses the FDJT (www.fdjt.org) toolkit.
   This file assumes that the sbooks.js file has already been loaded.

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

var sbook_eye_icon="EyeIcon25.png";
var sbook_small_eye_icon="EyeIcon13x10.png";
var sbook_details_icon="detailsicon16x16.png";
var sbook_outlink_icon="outlink16x16.png";
var sbook_small_remark_icon="remarkballoon16x13.png";
var sbook_delete_icon="redx16x16.png";

(function () {

    function renderNote(info,query,idprefix){
	var key=info.qid||info.oid||info.id;
	var target_id=(info.frag)||(info.id);
	var target=((target_id)&&(fdjtID(target_id)));
	var target_info=sbook.docinfo[target_id];
	var refiners=((query) && (query._refiners));
	var score=((query)&&(query[key]));
	var div=
	    fdjtDOM(((info.gloss) ? "div.sbooknote.gloss" : "div.sbooknote"),
		    makeTOCHead(target),
		    ((info.gloss)&&(showglossinfo(info))),
		    ((score)&&(showscore(score))),
		    ((info.note)&&(fdjtDOM("span.note",info.note))),
		    ((info.excerpt)&&(fdjtDOM("span.excerpt",info.excerpt))),
		    ((info.tags)&&(info.tags.length)&&(showtags(info.tags))),
		    ((info.xrefs)&&(showlinks(info.xrefs,"span.xrefs"))),
		    ((info.attachments)&&
		     (showlinks(info.attachments,"span.attachments"))));
	if (!(info.gloss))
	    div.title=
	    (sbook.getTitle(target)||fdjtDOM.textify(target)).
	    replace(/\n\n+/g,"\n");
	div.about="#"+target_id;
	// div.setAttribute('about',"#"+info.id);
	if (idprefix) div.id=idprefix+info.id;
	if (info.qid) div.qref=info.qid;
	return div;}
    sbook.renderNote=renderNote;
    
    function showtags(tags){
	var span=fdjtDOM("span.tags"," // ");
	var i=0; var lim=tags.length;
	// This might do some kind of more/less controls and sorted
	// or cloudy display
	while (i<tags.length) {
	    var tag=tags[i++];
	    fdjtDOM.append(span," ",Knodule.HTML(tag));}
	return span;}
    function showlinks(refs,spec){
	var span=fdjtDOM(spec);
	for (url in refs) {
	    var urlinfo=refs[url];
	    var title=urlinfo.title;
	    var icon=fdjtDOM.Image(sbicon("outlink16x8.png"));
	    var anchor
	    ((url===title)?(fdjtDOM.anchor(url,"a.raw",icon)):
	     (fdjtDOM.anchor(url,{title:url},title)));
	    anchor.target='_blank';
	    fdjtDOM(span,anchor,"\n");}
	return span;}
    function showscore(score){
	var scorespan=fdjtDOM("span.score");
	var score=query[key]; var k=0;
	while (k<score) {fdjtDOM(scorespan,"*"); k++;}
	return scorespan;}
    function showglossinfo(gloss) {
	return [];}
    function showglossinfo(info) {
	var user=info.user;
	var feed=info.feed||false;
	var userinfo=sbook.sourcekb.map[user];
	var feedinfo=sbook.sourcekb.map[feed];
	var age=fdjtDOM("span.age",fdjtTime.tick2date(info.tstamp));
	age.title=((user===sbook.user)?("edit this gloss"):
		   ("relay/reply to this gloss"));
	// temporary
	age.onclick=fdjtUI.cancel;
	
	return [age,
		((user===sbook.user)&&
		 (fdjtDOM.Image(sbicon(sbook_delete_icon),"img.delete","x",
				"delete this gloss"))),
		((info.pic)&&
		 (fdjtDOM.Image((info.pic),"glosspic",userinfo.name)))||
		((userinfo.pic)&&
		 (fdjtDOM.Image((userinfo.pic),"userpic",userinfo.name)))||
		(sourceIcon(feedinfo))||(sourceIcon(userinfo))];}

    function makelocbar(target_info){
	var locrule=fdjtDOM("HR");
	var locbar=fdjtDOM("DIV.locbar",locrule);
	var location_start=target_info.starts_at;
	var location_end=target_info.ends_at;
	var body_len=sbook.docinfo[document.body.id].ends_at;
	locbar.setAttribute("debug","ls="+location_start+"; le="+location_end+"; bl="+body_len);
	locrule.style.width=(((location_end-location_start)/body_len)*100)+"%";
	locrule.style.left=((location_start/body_len)*100)+"%";
	return locbar;}


    function sourceIcon(info){
	if (info) return info.pic;}
    
    function sbicon(name,suffix) {return sbook.graphics+name+(suffix||"");}

    // Displayings sets of notes organized into threads

    function sortbyloctime(x,y){
	if (x.starts_at<y.starts_at) return -1;
	else if (x.starts_at>y.starts_at) return 1;
	if ((x.tstamp)&&(y.tstamp)) {
	    if (x.tstamp<y.tstamp) return -1;
	    else if (x.tstamp>y.tstamp) return 1;
	    else return 0;}
	else if (x.tstamp) return 1;
	else if (y.tstamp) return -1;
	else return 0;}

    function showSlice(notes,div,query){
	var curdiv=false; var curthread=false; var curfrag=false;
	notes=[].concat(notes).sort(sortbyloctime);
	var i=0; var len=notes.length; while (i<len) {
	    var note=notes[i++];
	    var info=sbook.Info(note);
	    var frag=info.id||info.frag;
	    var target=fdjtID(frag);
	    var tinfo=sbook.docinfo[target.id];
	    var thread=info.relay||info.frag||info.id||frag;
	    if (thread!==curthread) {
		fdjtDOM(div,curdiv,"\n");
		curthread=thread; curdiv=fdjtDOM("div.sbookthread");
		curdiv.tocref=frag;
		curdiv.starts_at=tinfo.starts_at;}
	    fdjtDOM(curdiv,renderNote(info,query),"\n");}
	if (curdiv) fdjtDOM(div,curdiv,"\n");
	return div;}
    sbook.UI.showSlice=showSlice;

    function sumText(target){
	var title=(sbook.getTitle(target)||fdjtDOM.textify(target)).
	    replace(/\n\n+/g,"\n");
	if (title.length<40) return title;
	else return title.slice(0,40)+"\u22ef ";}

    function makeTOCHead(target,head){
	if (!(head)) head=sbook.getHead(target);
	var basespan=fdjtDOM("span");
	basespan.title='click to jump';
	var title=(sbook.getTitle(target)||fdjtDOM.textify(target)).
	    replace(/\n\n+/g,"\n");
	var info=sbook.docinfo[target.id];
	if (target!==head) {
	    var paratext=
		fdjtDOM.Anchor("javascript:sbook.JumpTo('"+target.id+"');",
			       "a.paratext",
			       fdjtDOM("span.spacer","\u00B6"),
			       sumText(target));
	    paratext.title='(click to jump) '+title;
	    fdjtDOM(basespan,paratext," ");}
	if (head) {
	    var headtext=
		fdjtDOM.Anchor("javascript:sbook.JumpTo('"+head.id+"');",
			       "a.headtext",
			       fdjtDOM("span.spacer","\u00A7"),
			       sumText(head));
	    var curspan=fdjtDOM("span.head",headtext);
	    fdjtDOM.append(basespan," ",curspan);
	    var heads=sbook.Info(head).heads;
	    if (heads) {
		var j=heads.length-1; while (j>=0) {
		    var hinfo=heads[j--]; var elt=fdjtID(hinfo.frag);
		    if ((!(elt))||(!(hinfo.title))||
			(elt===sbook.root)||(elt===document.body))
			continue;
		    var anchor=
			fdjtDOM.Anchor(
			    "javascript:sbook.JumpTo('"+hinfo.frag+"');",
			    "a.headtext",
			    fdjtDOM("span.spacer","\u00A7"),
			    hinfo.title);
		    var newspan=fdjtDOM("span.head"," ",anchor);
		    if (target===head) fdjtDOM(curspan,newspan);
		    else fdjtDOM(curspan," \u22ef ",newspan);
		    curspan=newspan;}}}

	var tochead=fdjtDOM("div.tochead",basespan,makelocbar(info));
	return tochead;}

    function addToSlice(note,summary_div,query){
	var threads=fdjtDOM.getChildren(summary_div,".sbookthread");
	var frag=(note.id||note.frag); var starts=note.starts_at;
	var insertion=false; var insdiff=0;
	var i=0; var lim=threads.length;
	while (i<lim) {
	    var thread=threads[i++];
	    var tocref=(thread.tocref)||(thread.getAttribute("tocref"));
	    if (!(thread.tocref)) thread.tocref=tocref;
	    if (tocref===frag) {
		fdjtDOM.append(thread,renderNote(note,query));
		return;}
	    else {
		var info=sbook.docinfo[tocref];
		if (starts<info.starts_at) {
		    if (insertion) {
			var diff=info.starts_at-starts;
			if (diff<insdiff) {
			    insertion=thread;
			    insidff=diff;}}
		    else {insertion=thread
			  insidff=info.starts_at-starts;}}}}
	var target=fdjtID(note.id||note.frag);
	var thread=fdjtDOM("div.sbookthread",renderNote(note,query));
	thread.tocref=frag;
	thread.starts_at=starts;
	if (insertion)
	    fdjtDOM.insertBefore(insertion,thread);
	else fdjtDOM.append(summary_div,thread);}
    sbook.UI.addToSlice=addToSlice;

    /* Selecting a subset of glosses to display */

    function selectSources(results_div,sources){
	if (!(sources)) {
	    fdjtDOM.dropClass(results_div,"sourced");
	    fdjtDOM.dropClass(fdjtDOM.$(".sourced",results_div),"sourced");
	    return;}
	fdjtDOM.addClass(results_div,"sourced");
	var threads=fdjtDOM.$(".sbookthread",results_div);
	var i=0; var lim=threads.length;
	while (i<threads.length) {
	    var thread=threads[i++];  var empty=true;
	    var notes=fdjtDOM.$(".sbooknote",thread);
	    var j=0; var jlim=notes.length;
	    while (j<jlim) {
		var note=notes[j++];
		var gloss=(note.qref)&&sbook.glosses.map[note.qref];
		if (!(gloss)) fdjtDOM.dropClass(note,"sourced");
		else if ((fdjtKB.contains(sources,gloss.user))||
			 (fdjtKB.contains(sources,gloss.feed))) {
		    fdjtDOM.addClass(note,"sourced");
		    empty=false;}
		else fdjtDOM.dropClass(note,"sourced");}
	    if (empty) fdjtDOM.dropClass(thread,"sourced");
	    else fdjtDOM.addClass(thread,"sourced");}
	if (sbook.target) sbook.UI.scrollGlosses(results_div,sbook.target);}
    sbook.UI.selectSources=selectSources;

    /* Scrolling slices */

    function scrollGlosses(elt,glosses)
    {
	var info=sbook.docinfo[elt.id];
	if ((info)&&(info.starts_at)) {
	    var targetloc=info.starts_at;
	    if (!(glosses)) glosses=fdjtID("SBOOKALLGLOSSES");
	    var threads=fdjtDOM.getChildren(glosses,".sbookthread");
	    var scrollto=false;
	    /* We do this linearly for now because it's fast enough and
	       simpler. */
	    var i=0; var len=threads.length; while (i<len) {
		var thread=threads[i++];
		if (!(thread.starts_at)) continue;
		else if (thread.starts_at>targetloc) break;
		else if(thread.starts_at===targetloc) {
		    scrollto=thread; break;}
		else scrollto=thread;}
	    fdjtLog("scrolling to %o in %o @%o to line up with %o at %o",
		    scrollto,glosses,i,elt,targetloc);
	    if (scrollto) scrollto.scrollIntoView();}
    }
    sbook.UI.scrollGlosses=scrollGlosses;

    /* Results handlers */

    function setupSummaryDiv(div){
	sbook.UI.addHandlers(div,'summary');}
    sbook.UI.setupSummaryDiv=setupSummaryDiv;
    
})();
/* Emacs local variables
;;;  Local variables: ***
;;;  compile-command: "cd ..; make" ***
;;;  End: ***
*/
