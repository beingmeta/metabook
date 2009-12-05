/* -*- Mode: Javascript; -*- */

var sbooks_id="$Id$";
var sbooks_version=parseInt("$Revision$".slice(10,-1));

/* Copyright (C) 2009 beingmeta, inc.
   This file implements a Javascript/DHTML UI for reading
    large structured documents (sBooks).

   For more information on sbooks, visit www.sbooks.net
   For more information on knowlets, visit www.knowlets.net
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

// When defined, this is a precomputed TOC for this file (NYI)
var sbook_local_toc=false;
// This is the TOC in which this document is embedded (NYI)
var sbook_context_toc={};
// Where to go for your webechoes
var sbook_webechoes_root="http://sbooks.net/echoes/";
// This is the sbook user, which we're careful not to overrid
var sbook_user=((typeof sbook_user === "undefined")?(false):(sbook_user));
// Whether the user has enabled feed posting
var sbook_user_canpost=
  ((typeof sbook_user_canpost === "undefined")?(false):(sbook_user_canpost));
// This is the picture to use for the user
var sbook_user_img=
  ((typeof sbook_user_img === "undefined")?(false):(sbook_user_img));
// These are the friends of the user
var sbook_friends=
  ((typeof sbook_friends === "undefined")?[]:(sbook_friends));
// These are the 'tribes' (associated groups) of the user
var sbook_tribes=
  ((typeof sbook_tribes === "undefined")?[]:(sbook_tribes));
// These are a set of common group/user tags for this particular user.
var sbook_user_dist=
  ((typeof sbook_user_dist === "undefined")?[]:(sbook_user_dist));
// Whether to embed qricons with podspots
var sbook_podspot_qricons=false;
// Whether to tag headings with qricons
var sbook_heading_qricons=false;
// Imported social info
var sbook_social_info=
  ((typeof sbook_social_info === 'undefined')?(false):(sbook_social_info));
// Imported echo information
var sbook_echoes_data=
  ((typeof sbook_echoes_data === 'undefined')?(false):(sbook_echoes_data));

// This is the base URI for this document, also known as the REFURI
// All stored references to this document use this REFURI, even if the
//  document is split across several files
var sbook_refuri=false;
// This is the 'source' URI for this document.  When a document is
//  split into multiple files/URIs, this is the URI where it is read
//  from.
var sbook_src=false;
// This is the base ID for fragment/element identifiers in this
// document.
var sbook_baseid=false;
// This is the AJAX sbook ping uri
var sbook_ping_uri="/echoes/ajaxping.fdcgi";
// This is the JSONP sbook ping uri
var sbook_jsonping_uri="http://echoes.sbooks.net/echoes/jsonping.fdcgi";
/* var sbook_ping_uri=false; */
// This is the deepest TOC level to show for navigation
var sbook_tocmax=false;
// This is the hostname for the sbookserver.
var sbook_server=false;
// This is an array for looking up sbook servers.
var sbook_servers=[[/.sbooks.net$/g,"echoes.sbooks.net"]];
//var sbook_servers=[];
// This is the default server
var sbook_default_server="echoes.sbooks.net";
// This (when needed) is the iframe bridge for sBooks requests
var sbook_ibridge=false;

// This is the content root
var sbook_root=false;
// This is the current head element
var sbook_head=false;
// This is the 'focus element' approximately under the mouse.
var sbook_focus=false;
// This is the last explicit target of a jump or ping.
var sbook_target=false;
// This is the target for which the current PING form has been setup
var sbook_ping_target=false;
// This is the rule for determining the sbook focus
var sbook_focus_rules=false;
// This is the current query
var sbook_query=false;
// Which sources to search.  False to exclude echoes, true to include
//  all echoes, and an array to include selected echoes
var sbook_sources=true;

// Whether the HUD is up
var sbook_mode=false;
// Whether preview mode is engaged
var sbook_preview=false; 
// Whether to do progress flashes
var sbook_flash_progress=true;
// Whether to do progress flashes
var sbook_body_tooltips=true;
// Whether to startup with the help screen
var sbook_help_on_startup=false;

// This is a list of all the terminal content nodes
var sbook_nodes=[];
// This is a list of the identified heads
var sbook_heads=[];
// This table maps IDs or NAMEs to elements.  This is different
//  from just their XML ids, because elements that have no ID by
//  a nearby named anchor will appear in this table.
var sbook_hashmap={};

// This is a table mapping tags (dterms) to elements (or IDs)
//  Note that this includes the genls of actual tags; the index
//   sbook_dindex is reserved for actual tags.
var sbook_index={_all: []};
// This is a table mapping prime (focal) tags (dterms) to elements (or IDs)
var sbook_prime_index={_all: []};
// This is the 'direct index' of dterms which are explicitly referenced
var sbook_direct_index={_all: []};
// This is the index of dterms/tags to items that don't include genls
var sbook_dterm_index={_all: []};
// This is a straight 'keyword' index mapping keywords to elements (or IDs)
// This is actually just a cache of searches which are done on demand
var sbook_word_index={};
// This is an array of all tags
var sbook_all_tags=[];
// Whether the index is a hybrid of strings and DOM nodes
var sbook_hybrid_index=false;

// Rules for building the TOC.  These can be extended.
var sbook_headlevels=
  {"H1": 1,"H2": 2,"H3": 3,"H4": 4,"H5": 5, "H6": 6, "H7": 7};
// Whether to build the index
var sbook_build_index=true;
// This is a count of all tagged elements
var sbook_tagged_count=0;
// An array of element selectors which contain tags
var sbook_tag_tags=[];
// An array of element selectors which shouldn't be tagged/taggable
var sbook_notags=[];

// Use spanbars in the HUD
var sbook_use_spanbars=true;
// Show subsections too
var sbook_list_subsections=true;
// Electro highlights
var sbook_electric_spanbars=false;

// Nonbreakable space, all handy
var sbook_nbsp="\u00A0";

// Whether to debug generally
var sbook_debug=false;
// Whether to debug the HUD
var sbook_trace_hud=false;
// Whether to debug the NAV/TOC HUD
var sbook_trace_nav_hud=true;
// Whether to debug search
var sbook_trace_search=0;
// Whether to debug clouds
var sbook_trace_clouds=0;
// Whether to trace focus
var sbook_trace_focus=false;
// Whether to trace selection
var sbook_trace_selection=false;
// Whether we're debugging locations
var sbook_trace_locations=false;
// Whether we're debugging server interaction
var sbook_trace_network=0;
// Whether to debug startup
var sbook_trace_startup=0;

// Flavors of tags
//  prime: humanly indicated as important to an item
//  manual: humanly indicated
//  auto: automatically generated
//  direct: assigned to a particular item
//  contextual: inherited through the TOC hierarchy
//  inferred: implies through Knowlet rules (typically genls)
// The core search algorithm computes a simple intersection
//  of the tagged items, but the information above is used in
//  scoring the results.

// Whether the page has been scrolled
var sbook_scrolled=false;
// Whether to switch headings on all mouseovers
var sbook_close_tracking=true;
// If a search has fewer than this many results,
//  it just displays them
var sbook_search_gotlucky=5;
//  Whether the the search input has the focus
var sbook_search_focus=false;
// Whether to display verbose tool tips
var sbook_noisy_tooltips=false;

function sbook_trace_handler(handler,evt)
{
  fdjtLog
    ("[%f] %s %o: hudup=%o, preview=%o, head=%o, focus=%o",
     fdjtElapsedTime(),handler,evt,
     sbook_mode,sbook_preview,sbook_head,sbook_focus);
}

function sbook_trace_focus(handler,target,evt)
{
  fdjtLog("%s %o [@%o] on %o: mode=%o, preview=%o, head=%o, focus=%o, target=%o",
	  handler,target,target.sbookloc,evt,
	  sbook_mode,sbook_preview,sbook_head,sbook_focus,sbook_target);
}

/* Basic SBOOK functions */

// Array of sbook info, mapping from _fdjtid to objects
var sbook_info=[];

function sbookHeadLevel(elt)
{
  if (elt.getAttribute("toclevel")) {
    var tl=elt.getAttribute("toclevel");
    if (typeof tl === "number") return tl;
    else if ((tl==="no") || (tl==="none"))
      return false;
    else if (typeof tl === "string")
      tl=parseInt(tl);
    else return false;
    if ((typeof tl === "number") && (tl>=0))
      return tl;
    else return false;}
  else {
    var tl=fdjtLookupElement(sbook_headlevels,elt);
    if (typeof tl === "number") return tl;
    else if (typeof tl === "function") return tl(elt);
    else return false;}
}

function sbook_getinfo(elt)
{
  if (!(elt)) return elt;
  else if (typeof elt === "string") {
    var real_elt=$(elt);
    if (real_elt) return sbook_getinfo(real_elt);
    else return false;}
  else if (elt._sbookid)
    return sbook_info[(elt._sbookid)]||false;
  else return false;
}

function sbook_needinfo(elt)
{
  if (!(elt)) return elt;
  else if (typeof elt === "string") {
    var real_elt=$(elt);
    if (real_elt) return sbook_needinfo(real_elt);
    else return false;}
  else if (elt._sbookid)
    return sbook_info[elt._sbookid];
  else {
    var id=elt._fdjtid||fdjtObjID(elt);
    elt._sbookid=id;
    var info=sbook_info[id];
    if (info) return info;
    info={}; info._sbookid=id;
    sbook_info[id]=info;
    return info;}
}

function sbook_get_head(target)
{
  while (target)
    if (target.sbook_headid) 
      return document.getElementById(target.sbook_headid);
    else target=target.parentNode;
  return false;
}

function sbook_get_focus(target)
{
  while (target)
    if (target.id) 
      return target;
    else target=target.parentNode;
  return false;
}

function sbook_get_reftarget(target)
{
  while (target)
    if (target.sbook_ref) break;
    else target=target.parentNode;
  return target;
}


/* Building the TOC */

var debug_toc_build=false;
var trace_toc_build=false;
var _sbook_toc_built=false;

var _total_tagged_count=0; var _total_tag_count=0;

function sbookGatherMetadata()
{
  var start=new Date();
  if (_sbook_toc_built) return;
  if (sbook_trace_startup>0)
    fdjtLog("[%fs] Starting to gather metadata from DOM",fdjtET());
  var root=((sbook_root)||document.getElementById("SBOOKROOT"));
  if (!(root)) root=document.body;
  sbook_root=root;
  var children=root.childNodes, level=false;
  var rootinfo=sbook_needinfo(root);
  var tocstate={curlevel: 0,idserial:0,location: 0,tagstack: []};
  tocstate.curhead=root; tocstate.curinfo=rootinfo;
  tocstate.knowlet=knowlet;
  // Location is an indication of distance into the document
  var location=0;
  rootinfo.title=root.title||document.title;
  rootinfo.starts_at=0;
  rootinfo.level=0; rootinfo.sub=new Array();
  rootinfo.sbook_head=false; rootinfo.sbook_heads=new Array();
  if (!(root.id)) root.id="SBOOKROOT";
  rootinfo.id=root.id;
  /* Build the metadata */
  var i=0; while (i<children.length) {
    var child=children[i++];
    sbook_toc_builder(child,tocstate);} 
  var scaninfo=tocstate.curinfo;
  /* Close off all of the open spans in the TOC */
  while (scaninfo) {
    scaninfo.ends_at=tocstate.location;
    scaninfo=scaninfo.sbook_head;}
  /* Sort the nodes by their offset in the document */
  sbook_nodes.sort(function(x,y) {
      if (!(x.Xoff)) {
	fdjtWarn("Bad sbook node %o",x);
	return 0;}
      else if (!(y.Xoff)) {
	fdjtWarn("Bad sbook node %o",y);
	return 0;}
      else if (x.Yoff<y.Yoff) return -1;
      else if (x.Yoff===y.Yoff)
	if (x.Xoff<y.Xoff) return -1;
	else if (x.Xoff===y.Xoff) return 0;
	else return 1;
      else return 1;});
  var done=new Date();
  if (sbook_trace_startup>0)
    fdjtLog('Finished gathering metadata in %f secs over %d/%d heads/nodes',
	    (done.getTime()-start.getTime())/1000,
	    sbook_heads.length,sbook_nodes.length);
  fdjtLog("[%fs] Found %d tags over %d elements: %s now has %d dterms",
	  fdjtET(),_total_tag_count,_total_tagged_count,
	  knowlet.name,knowlet.alldterms.length);
  _sbook_toc_build=true;
}

function _sbook_transplant_content(content)
{
  var transplanted=[];
  var i=0; var j=0;
  while (i<content.length) {
    var transplant=fdjtTransplant(content[i++]);
    if (transplant) transplanted[j++]=transplant;}
  return transplanted;
}
function _sbook_get_title(head)
{
  var title=
    (head.toctitle)||(head.getAttribute('toctitle'))||(head.title);
  if (!(title))
    return fdjtTextify(head,true);
  else if (typeof title === "string") {
    var std=fdjtStdSpace(title);
    if (std==="") return false;
    else return std;}
  else return fdjtTextify(title,true);
}

function _sbook_process_head(head,tocstate,level,curhead,curinfo,curlevel)
{
  var headinfo=sbook_needinfo(head);
  var headid=fdjtGuessAnchor(head);
  /* Update global tables, arrays */
  fdjtComputeOffsets(head);
  sbook_nodes.push(head);
  sbook_heads.push(head);
  head.sbookloc=tocstate.location;
  head.sbooklevel=level;
  if (headid) sbook_hashmap[headid]=head;
  else headid=(head.id)||fdjtForceId(head);
  if (debug_toc_build)
    fdjtLog("Found head item %o under %o at level %d w/id=#%s ",
	    head,curhead,level,headid);
  /* Iniitalize the headinfo */
  headinfo.starts_at=tocstate.location;
  headinfo.elt=head; headinfo.level=level;
  headinfo.sub=new Array(); headinfo.id=headid;
  headinfo.title=_sbook_get_title(head);
  headinfo.toctitle=head.getAttribute('toctitle');
  headinfo.next=false; headinfo.prev=false;
  if (level>curlevel) {
    /* This is the simple case where we are a subhead
       of the current head. */
    headinfo.sbook_head=curinfo;
    if (!(curinfo.intro_ends_at))
      curinfo.intro_ends_at=tocstate.location;
    curinfo.sub.push(headinfo);}
  else {
    /* We're not a subhead, so we're popping up at least one level. */
    var scan=curhead;
    var scaninfo=curinfo;
    var scanlevel=curinfo.level;
    /* Climb the stack of headers, closing off entries and setting up
       prev/next pointers where needed. */
    while (scaninfo) {
      if (debug_toc_build) /* debug_toc_build */
	fdjtLog("Finding head: scan=%o, info=%o, sbook_head=%o, cmp=%o",
		scan,scaninfo,scanlevel,scaninfo.sbook_head,
		(scanlevel<level));
      if (scanlevel<level) break;
      if (level===scanlevel) {
	headinfo.prev=scan;
	scaninfo.next=headinfo;}
      scaninfo.ends_at=tocstate.location;
      tocstate.tagstack.pop();
      var nextinfo=scaninfo.sbook_head;
      if (nextinfo) {
	scaninfo=nextinfo; scanlevel=nextinfo.level;}
      else {
	scaninfo=sbook_getinfo(root);
	scanlevel=0;
	break;}}
    if (debug_toc_build)
      fdjtLog("Found parent: up=%o, upinfo=%o, atlevel=%d, sbook_head=%o",
	      scan,scaninfo,scaninfo.level,scaninfo.sbook_head);
    /* We've found the head for this item. */
    headinfo.sbook_head=scaninfo;
    scaninfo.sub.push(headinfo);} /* handled below */
  /* Add yourself to your children's subsections */
  var supinfo=headinfo.sbook_head;
  var newheads=new Array();
  newheads=newheads.concat(supinfo.sbook_heads); newheads.push(supinfo);
  headinfo.sbook_heads=newheads;
  if ((trace_toc_build) || (debug_toc_build))
    fdjtLog("@%d: Found head=%o, headinfo=%o, sbook_head=%o",
	    tocstate.location,head,headinfo,headinfo.sbook_head);
  /* Update the toc state */
  tocstate.curhead=head;
  tocstate.curinfo=headinfo;
  tocstate.curlevel=level;
  if (headinfo)
    headinfo.head_ends_at=tocstate.location+fdjtFlatWidth(head);
  tocstate.location=tocstate.location+fdjtFlatWidth(head);  
}

function sbook_toc_builder(child,tocstate)
{
  // fdjtTrace("toc_builder %o %o",tocstate,child);
  var location=tocstate.location;
  var curhead=tocstate.curhead;
  var curinfo=tocstate.curinfo;
  var curlevel=tocstate.curlevel;
  var level=0;
  // Location tracking and TOC building
  if (child.nodeType===3) {
    var width=child.nodeValue.length;
    // Don't bother doing this (doesn't work in IE anyway)
    // child.sbookloc=tocstate.location+width/2;
    if (!(fdjtIsEmptyString(child.nodeValue)))
      tocstate.location=tocstate.location+width;}
  else if (child.nodeType!==1)
    child.sbook_head=curhead;
  else if (level=sbookHeadLevel(child)) 
    _sbook_process_head(child,tocstate,level,curhead,curinfo,curlevel);
  else {
    var width=fdjtFlatWidth(child);
    var loc=tocstate.location;
    tocstate.location=tocstate.location+width;
    fdjtComputeOffsets(child);
    child.sbookloc=loc;
    child.sbook_headid=curhead.id;
    if (child.childNodes) {
      var children=child.childNodes;
      var i=0; while (i<children.length)
		 sbook_toc_builder(children[i++],tocstate);}}
  var info=sbook_getinfo(child);
  // Tagging
  var headtag=((info.title) && ("\u00A7"+info.title));
  if (headtag)
    sbookAddTag(child,headtag,true,false,true,tocstate.knowlet);
  if (sbook_build_index) 
    if ((child.id) && (child.getAttribute) && (child.getAttribute("TAGS"))) {
      var tagstring=child.getAttribute("TAGS");
      var tags=fdjtSemiSplit(fdjtUnEntify(tagstring));
      var knowdes=[]; var prime_knowdes=[];
      if (headtag) {
	knowdes.push(headtag); prime_knowdes.push(headtag);}
      var i=0; while (i<tags.length) {
	var tag=tags[i++]; var knowde=false;
	var prime=(tag[0]==="*");
	if (tag.length===0) continue;
	_total_tag_count++;
	if ((knowlet) && (tag.indexOf('|')>=0))
	  knowde=knowlet.handleSubjectEntry
	    (((prime) || (tag[0]==="~")) ? (tag.slice(1)) : (tag));
	else knowde=(((prime) || (tag[0]==="~")) ? (tag.slice(1)) : (tag));
	if (knowde) {
	  knowdes.push(knowde);
	  if ((prime) && (level>0)) prime_knowdes.push(knowde);
	  sbookAddTag(child,knowde,prime,false,true,tocstate.knowlet);}}
      var tagstack=tocstate.tagstack;
      i=0; while (i<tagstack.length) {
	var ctags=tagstack[i++];
	var j=0; while (j<ctags.length)  {
	  sbookAddTag(child,ctags[j++],false,true,true,tocstate.knowlet);}}
      if (level>0) {
	tocstate.tagstack.push(prime_knowdes);}
      _total_tagged_count++;}
    else if ((level) && (level>0)) {
      if (headtag) tocstate.tagstack.push(new Array(headtag));
      else tocstate.tagstack.push([]);}
    else {}
  // Setting this attribute can help with debugging
  if ((sbook_trace_locations) && (child.sbookloc) && (child.setAttribute))
    child.setAttribute("sbookloc",child.sbookloc);
}

/* Processing tags */

/* Getting the 'next' node */

function sbookNext(elt)
{
  var info=sbook_getinfo(elt);
  if ((info.sub) && (info.sub.length>0))
    return info.sub[0];
  else if (info.next) return info.next;
  else return sbookNextUp(elt);
}

function sbookNextUp(elt)
{
  var info=sbook_getinfo(elt).sbook_head;
  while (info) {
    if (info.next) return info.next;
    info=info.sbook_head;}
  return head;
}

function sbookPrev(elt)
{
  var info=sbook_getinfo(elt);
  if (!(info)) return false;
  else if (info.prev) {
    info=info.prev;
    if ((info.sub) && (info.sub.length>0))
      return info.sub[info.sub.length-1];
    else return document.getElementById(info.id);}
  else if (info.sbook_head)
    return document.getElementById(info.sbook_head.id);
  else return false;
}

function sbookUp(elt)
{
  var info=sbook_getinfo(elt);
  if ((info) && (info.sbook_head))
    return document.getElementById(info.sbook_head.id);
  else return false;
}

/* Section/page navigation */

function sbookNextSection(evt)
{
  var prev=((evt.ctrlKey) ? (sbookUp(sbook_head)) :
	    (sbookPrev(sbook_head)));
  if (prev) sbookScrollTo(prev);
}

function sbookPrevSection(evt)
{
    var next=((evt.ctrlKey) ? (sbookNextUp(sbook_head)) :
	      (sbookNext(sbook_head)));
    if (next) sbookScrollTo(next);
}

function sbookNextPage(evt)
{
  evt=evt||event||null;
  window.scrollBy(0,window.innerHeight);
  setTimeout("sbookSetFocus(sbookGetXYFocus())",100);
  if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;
  evt.cancelBubble=true;
}

function sbookPrevPage(evt)
{
  evt=evt||event||null;
  window.scrollBy(0,-window.innerHeight);
  setTimeout("sbookSetFocus(sbookGetXYFocus())",100);
  if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;
  evt.cancelBubble=true;
}


/* Global query information */

function sbookSetQuery(query,scored)
{
  if ((sbook_query) &&
      ((sbook_query._query)===query) &&
      ((scored||false)===(sbook_query._scored)))
    return sbook_query;
  var result=sbookQuery(query);
  if (result._qstring!==sbookQueryBase($("SBOOKSEARCHTEXT").value)) {
    $("SBOOKSEARCHTEXT").value=result._qstring;
    $("SBOOKSEARCHTEXT").removeAttribute('isempty');}
  sbook_query=result; query=result._query;
  // sbookSetEchoes(sbook_search_echoes(query));
  if (sbook_trace_search>1)
    fdjtLog("Current query is now %o: %o/%o",
	    result._query,result,result._refiners);
  else if (sbook_trace_search)
    fdjtLog("Current query is now %o: %d results/%d refiners",
	    result._query,result._results.length,
	    result._refiners._results.length);
  if (result._refiners) {
    var completions=sbookQueryCloud(result);
    if (sbook_trace_search>1)
      fdjtLog("Setting completions to %o",completions);
    fdjtSetCompletions("SBOOKSEARCHCOMPLETIONS",completions);
    var ncompletions=fdjtComplete($("SBOOKSEARCHTEXT")).length;}
  sbookSetSources($("SBOOKECHOES"),result._sources||[]);
  return result;
}

function sbookUpdateQuery(input_elt)
{
  var q=sbookStringToQuery(input_elt.value);
  if ((q)!==(sbook_query._query))
    sbookSetQuery(q,false);
}

/* Accessing the TOC */

function sbookTOCDisplay(head)
{
  if (sbook_head===head) return;
  else if (sbook_head) {
    // Hide the current head
    var tohide=[];
    var info=sbook_getinfo(sbook_head);
    var base_elt=document.getElementById(info.tocid);
    while (info) {
      var tocelt=document.getElementById(info.tocid);
      tohide.push(tocelt);
      info=info.sbook_head;
      tocelt=document.getElementById(info.tocid);}
    var n=tohide.length-1;
    // Go backwards (up) to potentially accomodate some redisplayers
    while (n>=0) fdjtDropClass(tohide[n--],"live");
    fdjtDropClass(base_elt,"cur");
    sbook_head=false;}
  if (!(head)) return;
  var info=sbook_getinfo(head);
  var base_elt=document.getElementById(info.tocid);
  var toshow=[];
  while (info) {
    var tocelt=document.getElementById(info.tocid);
    toshow.push(tocelt);
    info=info.sbook_head;}
  var n=toshow.length-1;
  // Go backwards to accomodate some redisplayers
  while (n>=0) fdjtAddClass(toshow[n--],"live");
  fdjtAddClass(base_elt,"cur");
}

function sbook_title_path(head)
{
  var info=sbook_getinfo(head);
  if (info.title) {
    var scan=sbook_getinfo(info.elt.sbook_ref);
    while (scan) {
      if (scan.title) title=title+" // "+scan.title;
      scan=sbook_getinfo(scan.elt.sbook_head);}
    return title;}
  else return null;
}

function sbookSetHead(head)
{
  if (head===null) head=sbook_root;
  else if (typeof head === "string") {
    var probe=$(head);
    if (!(probe)) probe=sbook_hashmap[head];
    if (!(probe)) return;
    else head=probe;}
  if (head===sbook_head) {
    if (sbook_debug) fdjtLog("Redundant SetHead");
    return;}
  else {
    var headinfo=sbook_getinfo(head);
    if (sbook_trace_focus) sbook_trace_focus("sbookSetHead",head);
    sbookTOCDisplay(head,sbook_location);
    window.title=headinfo.title+" ("+document.title+")";
    if (sbook_head) fdjtDropClass(sbook_head,"sbookhead");
    fdjtAddClass(head,"sbookhead");
    sbookSetLocation(sbook_location);
    sbook_head=head;}
  // if (sbookHUDechoes) sbookSetEchoes(sbookGetEchoesUnder(sbook_head.id));
}

var sbook_location=false;

function sbookSetLocation(location,force)
{
  if ((!(force)) && (sbook_location===location)) return;
  if (sbook_trace_locations)
    fdjtLog("Setting location to %o",location);
  var info=sbook_getinfo(sbook_head);
  while (info) {
    var tocelt=document.getElementById(info.tocid);
    var start=tocelt.sbook_start; var end=tocelt.sbook_end;
    var progress=((location-start)*80)/(end-start);
    var bar=fdjtGetFirstChild(tocelt,".progressbar");
    if (sbook_trace_locations)
      fdjtLog("For tocbar %o loc=%o start=%o end=%o progress=%o",
	      bar,location,start,end,progress);
    if ((bar)&& (progress>0) && (progress<100))
      bar.style.width=((progress)+10)+"%";
    info=info.sbook_head;}
  var spanbars=$$(".spanbar",$("SBOOKHUD"));
  var i=0; while (i<spanbars.length) {
    var spanbar=spanbars[i++];
    var width=spanbar.ends-spanbar.starts;
    var ratio=(location-spanbar.starts)/width;
    if (sbook_trace_locations)
      fdjtLog("ratio for spanbar %o[%d] is %o [%o,%o,%o]",
	      spanbar,spanbar.childNodes[0].childNodes.length,
	      ratio,spanbar.starts,location,spanbar.ends);
    if ((ratio>=0) && (ratio<=1)) {
      var progressbox=$$(".progressbox",spanbar);
      if (progressbox.length>0) {
	progressbox[0].style.left=((Math.round(ratio*10000))/100)+"%";}}}
  sbook_location=location;
}

/* Tracking position within the document. */

var sbook_focus_tags=false;
var sbook_last_x=false;
var sbook_last_y=false;
var sbook_focus_delay=100;
var sbook_fickle_head=true;

var sbook_track_window=25;

function sbookSetFocus(target,force)
{
  if (!(target)) return null;
  // Can't set the focus to something without an ID.
  if (sbook_trace_focus) sbook_trace_focus("sbookSetFocus",target);
  var headid=target.sbook_headid;
  while (target) 
    if (target.sbook_headid!==headid) {
      target=head; break;}
    else if ((sbook_notags)&&(fdjtElementMatches(target,sbook_notags)))
      target=target.parentNode;
    else if (target.id) break;
    else target=target.parentNode;
  if (!(target)) return;
  else if (!(fdjtIsVisible(target,true))) return;
  // And don't tag the HUD either
  if (fdjtHasParent(target,sbookHUD)) return;
  // And don't change the focus if you're pinging
  if (sbook_mode==="ping") return;
  // If the target has changed, update the location
  if (target!==sbook_focus) {
    var taghud=$("SBOOKSEARCH");
    var tags=target.tags;
    var tagdiv=fdjtDiv(".tags.cues");
    tagdiv.onclick=function(evt) {
      var target=$T(evt);
      var term=((target.sectname)||
		((target.getAttribute) && (target.getAttribute("dterm"))));
      var textinput=$("SBOOKSEARCHTEXT");
      var qval=((textinput.getAttribute("isempty"))? ("") : (textinput.value||""));
      var qlength=qval.length;
      if (qlength===0)
	sbookSetQuery(term+';',false);
      else if (qval[qlength-1]===';')
	sbookSetQuery(qval+term+';',false);
      else sbookSetQuery(term+';'+qval,false);
      sbookHUDMode("searching");};
    if (tags) {
      var i=0; while (i<tags.length) {
	var tag=tags[i++];
	if ((typeof tag === "string") && (tag[0]==="\u00A7")) {}
	else fdjtAppend(tagdiv,knoSpan(tag)," ");}}
    fdjtReplace("SBOOKSEARCHCUES",tagdiv);
    // var otitle=target.title;
    if ((sbook_flash_progress)&&(!(sbook_mode))) {
      taghud.style.opacity=0.8;
      setTimeout(function() {taghud.style.opacity=null;},2500);}}
  // Using [force] will do recomputation even if the focus hasn't changed
  if ((force)||(target!==sbook_focus)) {
    var head=((target) && ((target.sbooklevel) ? (target) : (sbook_get_head(target))));
    if (sbook_trace_focus) sbook_trace_focus("sbookSetFocus",target);
    /* Only set the head if the old head isn't visible anymore.  */
    if ((head) && (sbook_head!=head))
      if ((force) || (sbook_fickle_head) || (!(fdjtIsVisible(sbook_head))))
	sbookSetHead(head);
    var old_focus=sbook_focus;
    sbook_focus=target;
    fdjtAddClass(target,"sbookfocus");
    if ((old_focus)&&(old_focus!==target))
      fdjtDropClass(old_focus,"sbookfocus");
    if (target.sbookloc)
      if (!((old_focus) && (fdjtHasParent(old_focus,target)))) 
	sbookSetLocation(target.sbookloc,true);
  }
}

function sbookSetTarget(target)
{
  if (sbook_trace_focus) sbook_trace_focus("sbookSetTarget",target);
  if (sbook_target) {
    fdjtDropClass(sbook_target,"sbooktarget");
    sbook_target=false;}
  if (target) {
    fdjtAddClass(target,"sbooktarget");
    sbook_target=target;}
}


function sbookCheckTarget()
{
  if ((sbook_target) && (!(fdjtIsVisible(sbook_target)))) {
    fdjtDropClass(sbook_target,"sbooktarget");
    sbook_target=false;}
}

function sbookGetXYFocus(xoff,yoff)
{
  var scrollx=window.scrollX||document.body.scrollLeft;
  var scrolly=window.scrollY||document.body.scrollLeft;
  if (!(xoff)) {
    xoff=sbook_last_x+scrollx;
    yoff=sbook_last_y+scrolly;}
  var nodes=sbook_nodes;
  var bot=0; var top=nodes.length-1; var mid=Math.floor(top/2);
  var node=nodes[mid]; var next=nodes[mid+1]; var target=false;
  while ((node) && (next) &&
	 ((!(((node.Yoff)<yoff) && ((next.Yoff)>yoff))))) {
    if (node.Yoff===yoff) break;
    if (yoff<node.Yoff) top=mid-1;
    else if (yoff>node.Yoff) bot=mid+1;
    else {}
    mid=bot+Math.floor((top-bot)/2);
    node=nodes[mid]; next=nodes[mid+1];}
  return node;
}

/* Keyboard handlers */

function sbook_onkeydown(evt)
{
  evt=evt||event||null;
  if (evt.keyCode===27) { /* Escape works anywhere */
    if (sbook_mode) {
      sbookHUDMode(false);
      fdjtDropClass(sbookHUD,"hudup");
      sbookStopPreview();
      $("SBOOKSEARCHTEXT").blur();}
    else {
      fdjtAddClass(sbookHUD,"hudup");
      sbook_mode=true;}
    return;}
  if ((evt.altKey)||(evt.ctrlKey)||(evt.metaKey)) return true;
  else if (fdjtIsTextInput($T(evt))) return true;
  else if (evt.keyCode===16) {
    if (sbook_mode)
      fdjtDropClass(sbookHUD,sbook_mode);
    else fdjtAddClass(sbookHUD,"hudup");}
  else if (evt.keyCode===32) /* Space char */
    sbookNextPage(evt);
  /* Backspace or Delete */
  else if ((evt.keyCode===8) || (evt.keyCode===45))
    sbookPrevPage(evt);
  else if (evt.keyCode===36) { /* Home */
    sbookScrollTo(sbook_head);}
  else if (evt.keyCode===37) /* LEFT arrow */
    sbookNextSection(evt);
  else if (evt.keyCode===38) { /* UP arrow */
    var up=sbookUp(sbook_head);
    if (up) sbookScrollTo(up);}
  else if (evt.keyCode===39)  /* RIGHT arrow */
    sbookPrevSection(evt);
  else return;
}

function sbook_onkeyup(evt)
{
  evt=evt||event||null;
  if (fdjtIsTextInput($T(evt))) return true;
  else if ((evt.altKey)||(evt.ctrlKey)||(evt.metaKey)) return true;
  else if (evt.keyCode===16) {
    fdjtDropClass(sbookHUD,"hudup");
    if (sbook_mode) fdjtAddClass(sbookHUD,sbook_mode);
    evt.cancelBubble=true;
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
}

function sbook_onkeypress(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onkeypress",evt);
  if (fdjtIsTextInput($T(evt))) return true;
  else if ((evt.altKey)||(evt.ctrlKey)||(evt.metaKey)) return true;
  else if (evt.charCode===43) { /* + sign */
    sbookPingHUDSetup(false);
    sbookHUDMode("ping");
    $("SBOOKPINGINPUT").focus();
    $T(evt).blur();
    evt.cancelBubble=true;
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
  /* ?, F, f, S or s */
  else if ((evt.charCode===63) ||
	   (evt.charCode===115) || (evt.charCode===83) ||
	   (evt.charCode===102) || (evt.charCode===70)) {
    if (sbook_mode==="searching") sbookHUDMode(false);
    else {
      sbookHUDMode("searching"); $("SBOOKSEARCHTEXT").focus();}
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
  /* T or t or N or n */
  else if ((evt.charCode===78) || (evt.charCode===84) ||
	   (evt.charCode===110) || (evt.charCode===116)) { 
    if (sbook_mode==="toc") sbookHUDMode(false);
    else {
      sbookHUDMode("toc"); $("SBOOKSEARCHTEXT").blur();}
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
  /* H or h */
  else if ((evt.charCode===104) || (evt.charCode===72)) { 
    if (sbook_mode==="help") sbookHUDMode(false);
    else {
      sbookHUDMode("help"); $("SBOOKSEARCHTEXT").blur();}
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
  else {
    evt.cancelBubble=true;
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;}
}

/* Mouse handlers */

var sbook_start_select=false;

function sbook_clear_select()
{
  sbook_start_select=false;
}

function sbook_onmouseover(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onmouseover",evt);
  /* If you're previewing, ignore mouse action */
  if (sbook_preview) return;
  if (fdjtHasClass(sbookHUD,"hudup")) return;
  if (sbook_target) sbookCheckTarget();
  /* Get the target */
  var target=$T(evt);
  /* If you have a saved scroll location, just restore it. */
  // This shouldn't be neccessary if the HUD mouseout handlers do their thing
  // if (fdjtScrollRestore()) return;
  /* Now, we try to find a top level element */
  if (fdjtHasParent(target,sbookHUD)) return;
  while (target)
    if (target.id) break;
    else if (target.sbook_headid) break;
    else if (target.parentNode===sbook_root) break;
    else target=target.parentNode;
  var scrollx=window.scrollX||document.body.scrollLeft;
  var scrolly=window.scrollY||document.body.scrollLeft;
  /* These are top level elements which aren't much use as heads or foci */
  if ((target===null) || (target===sbook_root) ||
      (!((target) && ((target.Xoff) || (target.Yoff))))) 
    target=sbookGetXYFocus(scrollx+evt.clientX,scrolly+evt.clientY);
  fdjtDelayHandler
    (sbook_focus_delay,sbookSetFocus,target,document.body,"setfocus");
}


function sbook_onmousemove(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onmousemove",evt);
  if (sbook_start_select) return;
  if (sbook_target) sbookCheckTarget();
  var target=$T(evt);
  /* If you're previewing, ignore mouse action */
  if ((sbook_preview) || (sbook_mode) || (sbook_mode)) return;
  if (fdjtHasClass(sbookHUD,"hudup")) return;
  /* Save mouse positions */
  sbook_last_x=evt.clientX; sbook_last_y=evt.clientY;
  /* Now, we try to find a top level element to sort out whether
     we need to update the location or section head. */
  while (target)
    if (target.sbook_head) break;
    else if (target.sbookinfo) break;
    else if (target.parentNode===document.body) break;
    else target=target.parentNode;
  /* These are all cases which onmouseover will handle */
  if ((target) && ((target.Xoff) || (target.Yoff))) return;
  var scrollx=window.scrollX||document.body.scrollLeft;
  var scrolly=window.scrollY||document.body.scrollLeft;
  target=sbookGetXYFocus(scrollx+evt.clientX,scrolly+evt.clientY);
  fdjtDelayHandler
    (sbook_focus_delay,sbookSetFocus,target,document.body,"setfocus");
}

function sbook_onscroll(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onscroll",evt);
  /* If you're previewing, ignore mouse action */
  if ((sbook_preview) || (sbook_mode)) return;
  if (fdjtHasClass(sbookHUD,"hudup")) return;
  if (sbook_target) sbookCheckTarget();
  var scrollx=window.scrollX||document.body.scrollLeft;
  var scrolly=window.scrollY||document.body.scrollLeft;
  var xoff=scrollx+sbook_last_x;
  var yoff=scrolly+sbook_last_y;
  var target=sbookGetXYFocus(xoff,yoff);
  fdjtDelayHandler
    (sbook_focus_delay,sbookSetFocus,target,document.body,"setfocus");
}

function sbook_onmousedown(evt)
{
  evt=evt||event||null;
  if ((evt.button>1)&&(evt.ctrlKey)) return;
  // sbook_trace_handler("sbook_onmousedown",evt);
  sbook_start_select=sbook_get_focus($T(evt));
  if (sbook_trace_selection)
    fdjtLog("[%fs] Set sbook_start_select to %o from %o on %o",
	    fdjtET(),sbook_start_select,$T(evt),evt);
}

function sbook_onmouseup(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onmouseup",evt);
  if (evt.button>1) {
    sbook_start_select=false;
    return;}
  if (sbook_start_select) {
    var target=sbook_get_focus($T(evt));
    var text=fdjtSelectedText();
    if (sbook_trace_selection)
      fdjtLog("[%fs] Mouseup %o at %o, started from %o, text=%o",
	      fdjtET(),evt,target,sbook_start_select,text);
    if (!(text)) {
      sbook_start_select=false;
      return;}
    if (sbook_mode==='ping') {
      sbookSetPingExcerpt(text);
      sbook_start_select=false;
      return;}
    else if (text) {
      sbookSetPingExcerpt(text);
      if (target===sbook_start_select) {}
      else {
	var scan=target;
	while (scan)
	  if (!(scan.id)) scan=scan.parentNode;
	  else if (fdjtHasParent(sbook_start_select,scan)) {
	    target=scan; break;}
	  else scan=scan.parentNode;}}
    else target=false;
    fdjtTrace("onmouseup, target is %o",target);
    if (target) {
      evt.cancelBubble=true;
      if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;
      sbook_ping(target);}}
  if (sbook_start_select)
    // We delay so that sbook_onclick doesn't do anything rash
    fdjtDelayHandler(100,sbook_clear_select,sbook_root);
}

function sbook_onclick(evt)
{
  evt=evt||event||null;
  // sbook_trace_handler("sbook_onclick",evt);
  var target=$T(evt); var scan=target;
  if (evt.button>1) return;
  while (scan)
    if ((scan==sbook_root)||(scan===window)) break;
    else if ((scan.onclick) || 
	     (scan.tagName==='A') ||  (scan.tagName==='INPUT') ||
	     (scan.tagName==='TEXTAREA') ||
	     ((scan.getAttribute) && (scan.getAttribute("ONCLICK"))))
      return;
    else scan=scan.parentNode;
  if (sbook_start_select) return;
  else if (sbook_mode) {
    sbookHUDMode(false);
    if (evt.preventDefault) evt.preventDefault(); else evt.returnValue=false;
    return;}
  else if ((target===sbook_ping_target) ||
	   (fdjtHasParent(target,sbook_ping_target))) {
    sbook_ping(sbook_ping_target);
    return;}
  else if ((evt.ctrlKey)&&(target)&&(target.id))
    sbook_ping(target);
}

function sbook_ondblclick(evt)
{
  evt=evt||event||null;
  sbook_onclick(evt);
  sbookHUDMode("ping");
}

/* Default keystrokes */

function getsbookrefuri()
{
  var base=fdjtGetMeta("SBOOKBASE",true);
  if (base) return base;
  base=fdjtGetMeta("REFURI",true);
  if (base) return base;
  base=fdjtGetLink("canonical",true);
  if (base) return base;
  var base_elts=fdjtGetChildrenByTagName("BASE");
  if ((base_elts) && (base_elts.length>0))
    return base_elt[0].href;
  var uri=document.location.href;
  var hashpos=uri.indexOf("#");
  if (hashpos>0) {
    if (!(sbook_baseid)) sbook_baseid=uri.slice(hashpos+1);
    return uri.slice(0,hashpos);}
  else return uri;
}

function getsbookbaseid()
{
  var baseid=fdjtGetMeta("SBOOKID",true);
  if ((!(baseid))||(typeof baseid !== 'string')||
      (baseid.length===0) || (baseid[0]===':'))
    return false;
  else return baseid;
}

function getsbooksrc()
{
  return fdjtGetMeta("SBOOKSRC",true)||getsbookrefuri();
}

function sbook_geturi(target,base)
{
  var id=target.id;
  if (!(base)) {
    var scan=target;
    while (scan)
      if ((scan.getAttribute) &&
	  (scan.getAttribute("REFURI"))) {
	base=scan.getAttribute("REFURI"); break;}
      else scan=scan.parentNode;}
  if (!(base)) base=sbook_refuri;
  if ((id)&&(base)) {
    var hashpos=base.indexOf('#');
    if (hashpos<0) return base+"#"+id;
    else return base.slice(0,hashpos)+"#"+id;}
  else return false;
}

function sbook_getsrc(elt)
{
  var id=false; var src=sbook_src;
  if (typeof elt !== "string") elt=$(elt);
  if (!(elt)) return null;
  while (elt)
    if ((elt.getAttribute) && (elt.getAttribute("SBOOKSRC"))) {
      src=elt.getAttribute("SBOOKSRC"); break;}
    else if ((!(id)) && (elt.id)) {
      id=elt.id; elt=elt.parentNode;}
    else if (elt===document.body) break;
    else elt=elt.parentNode;
  if (id) return src+"#"+id;
  else return src;
}

function sbook_get_titlepath(info,embedded)
{
  if (!(info))
    if (document.title)
      if (embedded)
	return " // "+document.title;
      else return "";
    else return "";
  else {
    var next=((info.sbook_head) && ((info.sbook_head.sbookinfo)||false));
    if (info.title)
      return ((embedded) ? (" // ") : (""))+info.title+
	sbook_get_titlepath(next,true);
    else return sbook_get_titlepath(next,embedded);}
}

/* Getting metadata */

function sbookGetSettings()
{
  var h1=fdjtGetMeta("SBOOKHEAD1",true);
  if (h1) {
    var rules=fdjtSemiSplit(h1);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=1;}}
  var h2=fdjtGetMeta("SBOOKHEAD2",true);
  if (h2) {
    var rules=fdjtSemiSplit(h2);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=2;}}
  var h3=fdjtGetMeta("SBOOKHEAD3",true);
  if (h3) {
    var rules=fdjtSemiSplit(h3);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=3;}}
  var h4=fdjtGetMeta("SBOOKHEAD4",true);
  if (h4) {
    var rules=fdjtSemiSplit(h4);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=4;}}
  var h5=fdjtGetMeta("SBOOKHEAD5",true);
  if (h5) {
    var rules=fdjtSemiSplit(h5);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=5;}}
  var h6=fdjtGetMeta("SBOOKHEAD6",true);
  if (h6) {
    var rules=fdjtSemiSplit(h6);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=6;}}
  var h7=fdjtGetMeta("SBOOKHEAD7",true);
  if (h7) {
    var rules=fdjtSemiSplit(h7);
    var i=0; while (i<rules.length) {
      sbook_headlevels[rules[i++]]=7;}}
  var tocmax=fdjtGetMeta("SBOOKTOCMAX",true);
  if (tocmax) sbook_tocmax=parseInt(tocmax);
  if ((fdjtGetCookie("SBOOKNOFLASH"))||
      ((fdjtGetMeta("SBOOKNOFLASH",true))))
    sbook_flash_progress=false;
  var notag=fdjtGetMeta("SBOOKNOTAG",true);
  if (notag) {
    var rules=fdjtSemiSplit(notag);
    var i=0; while (i<rules.length) {
      sbook_notags.push(rules[i++]);}}
  var sbookhelp=fdjtGetMeta("SBOOKHELP",true);
  if (sbookhelp) sbook_help_on_startup=true;
  var sbooksrv=fdjtGetMeta("SBOOKSERVER",true);
  if (sbooksrv) sbook_server=sbooksrv;
  else if (fdjtGetCookie["SBOOKSERVER"])
    sbook_server=fdjtGetCookie["SBOOKSERVER"];
  else sbook_server=sbookLookupServer(document.domain);
  if (!(sbook_server)) sbook_server=sbook_default_server;
  sbook_baseid=getsbookbaseid();
  sbook_refuri=getsbookrefuri();
  sbook_src=getsbooksrc();
}

function sbookLookupServer(string)
{
  var i=0;
  while (i<sbook_servers.length) 
    if (sbook_servers[i][0]===string)
      return sbook_servers[i][1];
    else if (string.search(sbook_servers[i][0])>=0)
      return sbook_servers[i][1];
    else if ((sbook_servers[i][0].call) &&
	     (sbook_servers[i][0].call(string)))
      return sbook_servers[i][1];
    else i++;
  return false;
}

function sbookSetupEchoServer()
{
  var domain=document.domain;
  if ((sbook_server) && (domain===sbook_server))
    return;
  else if (sbook_server) {
    var common_suffix=fdjtCommonSuffix(sbook_server,domain,'.');
    if (common_suffix) {
      if (common_suffix.indexOf('.')>0) {
	if (sbook_trace_network)
	  fdjtLog("[%fs] Setting up access to gloss server %o from %o through %o",
		  fdjtET(),sbook_server,domain,common_suffix);
	var iframe=fdjtNewElement("iframe");
	iframe.style.display='none';
	iframe.id="SBOOKIBRIDGE";
	iframe.onload=function() {
	  document.domain=common_suffix;
	  sbookSetIBridge(iframe.contentWindow);};
      	iframe.src=
	  // 'http://'+sbook_server+'/echoes/ibridge.html';
	  'http://'+sbook_server+'/echoes/ibridge.fdcgi?DOMAIN='+common_suffix;
	document.body.appendChild(iframe);}}}
}

function sbookSetIBridge(window)
{
  sbook_ibridge=window;
  if ($("SBOOKPINGFORM"))
    $("SBOOKPINGFORM").ajaxbridge=window;
}

function _sbook_domain_match(x,y)
{
  if (x.length===y.length) return (x===y);
  else {
    var i=0; var len=((x.length<y.length)?(x.length):(y.length));
    while (i<len)
      if (x[i]===y[i]) i++;
      else return false;
    if (x.length>i)
      if (x[i+1]==='.') return true;
      else return false;
    else if (y.length>i)
      if (y[i+1]==='.') return true;
      else return false;
    else return false;}
}

/* Adding qricons */

function sbookAddQRIcons()
{
  var i=0;
  while (i<sbook_heads.length) {
    var head=sbook_heads[i++];
    var id=head.id;
    var title=(head.sbookinfo)&&sbook_get_titlepath(head.sbookinfo);
    var qrhref="http://echoes.sbooks.net/echoes/qricon.fdcgi?"+
      "URI="+encodeURIComponent(sbook_src||sbook_refuri)+
      ((id)?("&FRAG="+head.id):"")+
      ((title) ? ("&TITLE="+encodeURIComponent(title)) : "");
    var qricon=fdjtImage(qrhref,"sbookqricon");
    fdjtPrepend(head,qricon);}
}

/* The Help Splash */

function _sbookHelpSplash()
{
  var cookie=fdjtGetCookie("sbookhidehelp");
  if (cookie==='no') sbookHUDMode("help");
  else if (cookie) {}
  else if (sbook_help_on_startup)
    sbookHUDMode("help");
}

/* Initialization */

var _sbook_setup=false;
var _sbook_setup_start=false;

function sbookSetup()
{
  if (_sbook_setup) return;
  if (!(_sbook_setup_start)) _sbook_setup_start=new Date();
  if (!((fdjt_setup_started))) fdjtSetup();
  if (_sbook_setup) return;
  var fdjt_done=new Date();
  sbookGetSettings();
  sbook_ajax_uri=fdjtGetMeta("SBOOKSAJAX",true);
  if ((!(sbook_ajax_uri))||(sbook_ajax_uri==="")||(sbook_ajax_uri==="none"))
    sbook_ajax_uri=false;
  if (knoHTMLSetup) knoHTMLSetup();
  var knowlets_done=new Date();
  sbookGatherMetadata();
  var metadata_done=new Date();
  if (sbook_echoes_data) sbookEchoSetup();
  else {
    var uri="http://"+sbook_server+"/echoes/echoes.js?URI="+
      ((sbook_baseid) ?
       (encodeURIComponent(sbook_refuri+"#"+sbook_baseid)) :
       (encodeURIComponent(sbook_refuri)));
    var script_elt=fdjtNewElement("SCRIPT");
    script_elt.language="javascript"; script_elt.src=uri;
    document.body.appendChild(script_elt);}
  if (sbook_social_info) sbookSocialSetup();
  else {
    var uri="http://"+sbook_server+"/echoes/social.js";
    var script_elt=fdjtNewElement("SCRIPT");
    script_elt.language="javascript"; script_elt.src=uri;
    document.body.appendChild(script_elt);}
  createSBOOKHUD();
  var hud_done=new Date();
  sbookHUD_Init();
  _sbookHelpSplash();
  window.onmouseup=sbook_onmouseup;
  window.onmousedown=sbook_onmousedown;
  window.onmouseover=sbook_onmouseover;
  window.onmousemove=sbook_onmousemove;
  window.onscroll=sbook_onscroll;
  window.onclick=sbook_onclick;
  window.ondblclick=sbook_ondblclick;
  window.onkeypress=sbook_onkeypress;
  window.onkeydown=sbook_onkeydown;
  window.onkeyup=sbook_onkeyup;
  var hud_init_done=new Date();
  if ((hud_init_done.getTime()-_sbook_setup_start.getTime())>5000) {
    fdjtLog("[%fs] %s",
	    fdjtET(),
	    fdjtRunTimes("sbookSetup",_sbook_setup_start,
			 "fdjt",fdjt_done,"knowlets",knowlets_done,
			 "metadata",metadata_done,
			 "hud",hud_done,"hudinit",hud_init_done));
    _sbook_setup=true;;}
  else {
    sbookFullCloud();
    var cloud_done=new Date();
    /* _sbook_createHUDSocial(); */
    fdjtLog("[%fs] %s",
	    fdjtET(),
	    fdjtRunTimes("sbookSetup",_sbook_setup_start,
			 "fdjt",fdjt_done,"knowlets",knowlets_done,
			 "metadata",metadata_done,
			 "hud",hud_done,"hudinit",hud_init_done,
			 "cloud",cloud_done));
    _sbook_setup=true;}
}

var _sbook_user_setup=false;
var _sbook_echo_setup=false;
var _sbook_social_setup=false;

function sbookEchoSetup()
{
  sbookUserSetup();
  if (_sbook_echo_setup) return;
  sbookImportEchoes();
  sbookSetupEchoServer();
  if (!(sbook_user)) fdjtAddClass(document.body,"nosbookuser");
  if (sbook_heading_qricons) sbookAddQRIcons();
  _sbook_echo_setup=true;
}

function sbookSocialSetup()
{
  sbookUserSetup();
  if (_sbook_social_setup) return;
  if (typeof sbook_tribes !== "undefined")
    sbookImportSocialInfo(sbook_social_info);
  var completions=$("SBOOKPINGCOMPLETIONS");
  if (sbook_friends) {
    var i=0; while (i<sbook_friends.length) 
	       sbookAddConversant(completions,sbook_friends[i++]);}
  if (sbook_tribes) {
    var i=0; while (i<sbook_tribes.length) {
      sbookAddConversant(completions,sbook_tribes[i++]);}}
  if (sbook_user_dist) {
    var i=0; while (i<sbook_user_dist.length) {
      fdjtAddClass
	(sbookAddConversant(completions,sbook_user_dist[i++]),
	 "cue");}}
  if (sbook_user_canpost) {
    fdjtDropClass(document.body,"sbookcantpost");}
  _sbook_social_setup=true;
}

function sbookUserSetup()
{
  if (_sbook_user_setup) return;
  if (!(sbook_user)) {
    fdjtAddClass(document.body,"nosbookuser");
    return;}
  fdjtDropClass(document.body,"nosbookuser");  
  if ($("SBOOKPINGUSER")) $("SBOOKPINGUSER").value=sbook_user;
  if ($("SBOOKPINGFORM"))
    $("SBOOKPINGFORM").onsubmit=fdjtForm_onsubmit;
  if (($("SBOOKUSERIMG"))&&(sbook_user_img))
    $("SBOOKUSERIMG").src=sbook_user_img;
  _sbook_user_setup=true;
}

fdjtAddSetup(sbookSetup);

fdjtLoadMessage("Loaded sbooks module");

/* Emacs local variables
;;;  Local variables: ***
;;;  compile-command: "cd ..; make" ***
;;;  End: ***
*/
