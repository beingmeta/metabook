/* -*- Mode: Javascript; -*- */

var sbooks_searchui_id="$Id$";
var sbooks_searchui_version=parseInt("$Revision$".slice(10,-1));

/* Copyright (C) 2009 beingmeta, inc.
   This file implements the search component of a 
    Javascript/DHTML UI for reading large structured documents (sBooks).

   For more information on sbooks, visit www.sbooks.net
   For more information on knowlets, visit www.knowlets.net
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

function sbookShowSearch(result)
{
  if (!(result)) result=sbook_query;
  var results_div=fdjtDiv(".sbookresults.hud");
  results_div.onclick=sbookResults_onclick;
  results_div.onmouseover=sbookResults_onmouseover;
  results_div.onmouseout=sbookResults_onmouseout;
  sbookShowSearchResults(result,results_div);
  fdjtReplace("SBOOKRESULTS",results_div);
}

var sbook_eye_icon="http://static.beingmeta.com/graphics/EyeIcon25.png";
var sbook_details_icon=
  "http://static.beingmeta.com/graphics/detailsicon16x16.png";


function sbookShowSearchResults(result,results_div)
{
  var results=result._results; var head_div;
  var refiners=result._refiners;
  if (results.length===0) 
    head_div=fdjtDiv("sorry");
  else head_div=fdjtDiv("count");
  var query=result._query;
  var j=0; while (j<query.length) 
	     fdjtAppend(head_div,fdjtSpan("dterm",query[j++])," ");
  if (results.length===0)
    fdjtAppend(head_div,"There were no results");
  else if (results.length===1)
    fdjtAppend(head_div,"There is one result");
  else fdjtAppend(head_div,"There are ",results.length," results");
  fdjtAppend(results_div,head_div);
  var i=0; while (i<results.length) {
    var r=results[i++];
    var anchor=sbookSearchResult(r,result);
    if (!(anchor)) {}
    else if (i===1)
      fdjtAppend(results_div,anchor);
    else fdjtAppend(results_div,"\n",anchor);}
  results_div.sbookresult=result;
}

function sbookSearchResult(elt,result)
{
  var key=elt.sortkey;
  var refiners=((result) && (result._refiners));
  var elt_id=(elt.id||elt.fragid);
  var target=$(elt_id);
  if (!(elt)) return false;
  var anchor=fdjtAnchor("#"+elt_id);
  if (elt.pingid)
    anchor.className="searchresult echo";
  else anchor.className="searchresult";
  anchor.sbookelt=$(elt_id);
  if (elt.pingid) anchor.sbookecho=elt;
  var info=fdjtSpan("info");
  var eye=fdjtImage(sbook_eye_icon,"eye","(\u00b7)");
  if ((result) && (result[elt_id])) { /* If you have a score, use it */
    var scorespan=fdjtSpan("score");
    var score=result[key]; var k=0;
    // fdjtTrace("Score for %s is %o",elt_id,result[elt_id]);
    while (k<score) {fdjtAppend(scorespan,"*"); k++;}
    fdjtAppend(info,scorespan);}
  eye.onmouseover=sbookPreview_onmouseover;
  eye.onmouseout=sbookPreview_onmouseout;
  fdjtAppend(info,eye);
  fdjtAppend(anchor,info);
  anchor.searchresult=target;
  var tags=elt.tags;
  if (refiners)
    tags.sort(function(t1,t2) {
	var s1=refiners[t1]; var s2=refiners[t2];
	if ((s1) && (s2))
	  if (s1>s2) return -1;
	  else if (s1===s2) return 0;
	  else return -1;
	else if (s1) return -1;
	else if (s2) return 1;
	else return 0;});
  var head=(((elt.sbookinfo) && (elt.sbookinfo.level)) ? (elt) :
	    ((elt.sbook_head)||(elt)));
  if (head===document.body) head=elt;
  if (elt.pingid) {
    var user=elt.user;
    var userinfo=social_info[user];
    var usrimg=fdjtImage(userinfo.squarepic,"userpic",userinfo.name);
    var interval=((elt.tstamp) ? (fdjtTick()-elt.tstamp) : (-1));
    var agespan=
      ((interval>0)&&
       ((interval>(3*24*3600)) 
	? (fdjtAnchorC("http://webechoes.net/echo/"+elt.pingid,
		       "age",fdjtTickDate(elt.tstamp)))
	: (fdjtAnchorC("http://webechoes.net/echo/"+elt.pingid,
		       "age",fdjtIntervalString(interval)," ago"))));
    if (agespan) {
      agespan.target="webechoes";
      agespan.title="browse this echo";}
    fdjtAppend(anchor,usrimg,
	       ((elt.detail)&&(_sbookDetailsButton())),((elt.detail)&&" "),
	       agespan,((elt.tstamp)&&" "),
	       ((elt.msg)&&(fdjtSpan("msg",elt.msg))),((elt.msg)&&" "),
	       ((elt.excerpt)&&(_sbookExcerptSpan(elt.excerpt))),
	       ((elt.excerpt)&&" "));}
  else if (head.sbookinfo) {
    var info=head.sbookinfo;
    var heads=((info) ? (info.sbook_heads) : []);
    var headspan=fdjtDiv("searchresulthead",info.title);
    var curspan=headspan;
    j=heads.length-1; while (j>=0) {
      var h=heads[j--]; var hinfo=h.sbookinfo;
      if (h===document.body) continue;
      var newspan=fdjtSpan("head",hinfo.title);
      fdjtAppend(curspan," \\ ",newspan);
      curspan=newspan;}
    // fdjtAddClass(curspan,"headhead");
    fdjtAppend(anchor," ",headspan);}
  else {
    var headtext="One result";
    if (elt.title) headtext=elt.title;
    else if (elt.id) headtext=elt.id;
    else {
      var text=fdjtTextify(elt,true);
      if (text.length<50) headtext=text;}
    fdjtAppend(anchor," ",fdjtDiv("searchresulthead",headtext));}
  var tagspan=anchor;
  var j=0; var first=true; while (j<tags.length) {
    var tag=tags[j++];
    if (j===1) 
      fdjtAppend(tagspan,knoDTermSpan(tag));
    else if ((j===7) &&
	     (tagspan===anchor) &&
	     (tags.length>10)) {
      var controller=fdjtSpan("controller","...",tags.length-6,"+...");
      tagspan=fdjtSpan("moretags");
      tagspan.style.display='none';
      controller.title=("click to toggle more tags");
      controller.onclick=fdjtShowHide_onclick;
      controller.clicktotoggle=new Array(tagspan);
      fdjtAppend(anchor," ",controller," ",tagspan);
      j--;}
    else fdjtAppend(tagspan," \u00b7 ",knoDTermSpan(tag));}
  if (elt.detail) 
    fdjtAppend(anchor,fdjtDiv("detail",elt.detail));
  return anchor;
}

function _sbookExcerptSpan(excerpt)
{
  var content=fdjtSpan("content",excerpt);
  var ellipsis=fdjtSpan("ellipsis","...");
  var container=fdjtSpan("excerpt","\u201c",content,ellipsis,"\u201d");
  container.onclick=function(evt) {
    var parent=$P(".searchresult",evt.target);
    if (parent) fdjtToggleClass(parent,"showexcerpt");}
  return container;
}

function _sbookDetailsButton(excerpt)
{
  var img=fdjtImage(sbook_details_icon,"detailsbutton","details");
  img.onclick=function(evt) {
    var anchor=$P(".searchresult",evt.target);
    if (anchor) fdjtToggleClass(anchor,"showdetail");
    evt.target.blur(); if (anchor) anchor.blur();
    evt.preventDefault(); evt.cancelBubble=true;
    return false;};
  img.title=_("show/hide details");
  return img;
}

function sbookEchoSearchResult(entry,echo)
{
  var user=echo.user;
  var userinfo=social_info[user];
  var usrimg=fdjtImage(userinfo.squarepic,"userpic",userinfo.name);
  var userblock=fdjtDiv("userblock",usrimg);
  entry.uri=echo.uri; entry.tags=echo.tags; entry.fragid=echo.fragid;
  if (echo.tribes) anchor.tribes=echo.tribes;
  entry.user=user; entry.pingid=echo.pingid;
}

var _sbookSearchKeyPress_delay=false;

function sbookForceComplete(input_elt)
{
  var completions=fdjtComplete(input_elt);
  var forced=false;
  if (completions.string==="") return;
  if (completions.exactheads.length)
    forced=completions.exactheads[0];
  else if (completions.heads.length)
    forced=completions.heads[0];
  else if (completions.exact.length)
    forced=completions.exact[0];
  else if (completions.length)
    forced=completions[0];
  else {}
  fdjtHandleCompletion(input_elt,forced,false);
}

function sbookSearchInput_onkeypress(evt)
{
  var ch=evt.charCode; var kc=evt.keyCode;
  var target=evt.target;
  if ((kc===13)||(ch===13)) {
    sbookForceComplete(target);
    sbookShowSearch(sbook_query);
    sbookHUDMode("browsing");
    $("SBOOKSEARCHTEXT").blur();
    $("SBOOKRESULTS").focus();
    return false;}
  else if (ch===59) { /* That is, semicolon */
    sbookForceComplete(evt.target);
    evt.preventDefault(); evt.cancelBubble=true;}
  else if (true) {
    if (_sbookSearchKeyPress_delay) 
      clearTimeout(_sbookSearchKeyPress_delay);
    _sbookSearchKeyPress_delay=
      setTimeout(function(){sbookUpdateQuery(target);},500);
    return fdjtComplete_onkey(evt);}
  else return fdjtComplete_onkey(evt);
}

function sbookSearchInput_onkeyup(evt)
{
  var target=evt.target;
  var kc=evt.keyCode;
  if (kc===13) {
    sbookForceComplete(target);
    sbookShowSearch(sbook_query);
    sbookHUDMode("browsing");
    $("SBOOKSEARCHTEXT").blur();
    $("SBOOKRESULTS").focus();
    evt.preventDefault(); evt.cancelBubble=true;
    return false;}
}

function sbookSearchInput_onfocus(evt)
{
  var ch=evt.charCode, kc=evt.keyCode;
  sbook_search_focus=true;
  sbookHUDMode("searching");
  sbookSetQuery(sbookStringToQuery(evt.target.value));
  return fdjtComplete_show(evt);
}

function sbookSearchInput_onblur(evt)
{
  // fdjtDropClass(sbookHUD,"searching");
  sbook_search_focus=false;
}

// This is a version of the function above which changes the current
//  query.
function _sbook_replace_current_entry(elt,value)
{
  if (sbook_trace_search>1)
    fdjtLog("_sbook_replace_current_entry elt=%o value=%o",
	    elt,value);
  var curval=this.value;
  var endsemi=curval.lastIndexOf(';');
  var newval;
  if (endsemi>0)
    if (endsemi<(curval.length-1))
      newval=curval.slice(0,endsemi)+";"+value+';';
    else newval=curval+value+";";
  else newval=value+';';
  // this.value=newval;
  sbookSetQuery(newval,true);
  if ((sbook_search_gotlucky) && 
      (sbook_query._results.length>0) &&
      (sbook_query._results.length<=sbook_search_gotlucky)) {
    // fdjtTrace("Search got lucky: %o",sbook_query);
    sbookShowSearch(sbook_query);
    $("SBOOKSEARCHTEXT").blur();
    sbookHUDMode("browsing");}
  else $("SBOOKSEARCHTEXT").focus();
}

function _sbook_note_completions(completions)
{
  var forced=false;
  if (completions.exactheads.length)
    forced=completions.exactheads[0];
  else if (completions.heads.length)
    forced=completions.heads[0];
  else if (completions.exact.length)
    forced=completions.exact[0];
  else if (completions.length)
    forced=completions[0];
  else {}
  if (forced) 
    fdjtRadioSelect(forced,this.completions,"completion","prime");
}

/* Getting query cloud */

function sbookDTermCompletion(dterm,title)
{
  if ((typeof dterm === "string") && (dterm[0]==="\u00A7")) {
    var span=fdjtSpan("completion sectname",dterm);
    span.key=dterm; span.value=dterm; span.anymatch=true;
    return span;}
  var knowde=Knowde(dterm);
  if (!(knowde))
    fdjtLog("Couldn't get knowlet references from %o",dterm);
  else if (!(knowde.dterm)) {
    fdjtLog("Got bogus dterm reference for %s: %o",dterm,knowde);
    knowde=false;}
  var dterm_node=((knowde) ? (knowde.toHTML()) : (fdjtSpan("dterm",dterm)));
  var span=fdjtSpan("completion");
  // Adds the cute hole to the vaugely tag shaped textform
  // fdjtPrepend(dterm_node,fdjtSpan("bigpunct","\u00b7"));
  if (!(title))
    if (sbook_index[dterm])
      title=sbook_index[dterm].length+" items";
    else title=false;
  if (knowde) {
    if (knowde.gloss)
      if (title)
	span.title=title+": "+knowde.gloss;
      else span.title=knowde.gloss;
    else span.title=title;
    /* Now add variation elements */
    var variations=[];
    var i=0; var terms=knowde.terms;
    while (i<terms.length) {
      var term=terms[i++];
      // var vary=fdjtSpan("variation","(",term,")");
      var vary=fdjtSpan("variation",term);
      vary.key=term;
      variations.push(vary);
      variations.push(" ");}
    i=0; terms=knowde.hooks;
    while (i<terms.length) {
      var term=terms[i++];
      var vary=fdjtSpan("variation",term);
      vary.key=term;
      variations.push(vary);
      variations.push(" ");}
    fdjtAppend(span,variations,dterm_node);
    span.key=knowde.dterm;
    span.value=knowde.dterm;
    span.setAttribute("dterm",knowde.dterm);}
  else {
    // This is helpful for debugging
    span.setAttribute("dterm",dterm);
    span.key=dterm; span.value=dterm;
    if (title) span.title=title;}
  return span;
}

function sbookQueryCloud(query)
{
  if (query._cloud) return query._cloud;
  else if ((query._query.length)===0) {
    query._cloud=sbookFullCloud();
    return query._cloud;}
  else if (!(query._refiners)) {
    result._cloud=sbook_empty_cloud;
    return query._cloud;}
  else {
    var completions=sbookMakeCloud
      (query._refiners._results,query._refiners,
       query._refiners._freqs);
    fdjtPrepend(completions,
		fdjtSpan("counts",
			 query._results.length,
			 ((query._results.length==1) ?
			  " result; " : " results; "),
			 query._refiners._results.length,
			 ((query._refiners._results.length==1) ?
			  " dterm" : " dterms")));
    query._cloud=completions;
    // fdjtTrace("Generated completions for %o: %o",query,completions);
    return completions;}
}

function sbookMakeCloud(dterms,scores,freqs)
{
  var start=new Date();
  if (sbook_trace_clouds)
    fdjtLog("Making cloud based on %d dterms using scores=%o and freqs=%o",
	    dterms.length,scores,freqs);
  var completions=fdjtDiv("completions");
  var n_terms=dterms.length;
  var i=0; var max_score=0;
  if (scores) {
    var i=0; while (i<dterms.length) {
      var score=scores[dterms[i++]];
      if ((score) && (score>max_score)) max_score=score;}}
  var copied=[].concat(dterms);
  if (freqs)
    copied.sort(function (x,y) {
	var xfreq=((freqs[x])?(freqs[x]):(0));
	var yfreq=((freqs[y])?(freqs[y]):(0));
	if (xfreq==yfreq)
	  if (x.length>y.length) return -1;
	  else if (x.length===y.length) return 0;
	  else return 1;
	else if (xfreq>yfreq) return -1;
	else return 1;});
  else copied.sort(function (x,y) {
      var xlen=((sbook_index[x])?(sbook_index[x].length):(0));
      var ylen=((sbook_index[y])?(sbook_index[y].length):(0));
      if (xlen==ylen)
	if (x.length>y.length) return -1;
	else if (x.length===y.length) return 0;
	else return 1;
      else if (xlen>ylen) return -1;
      else return 1;});
  completions.onclick=function (evt) {
    fdjtComplete_onclick(evt);
    evt.preventDefault(); evt.cancelBubble=true;
    return false;}
  i=0; while (i<copied.length) {
    var dterm=copied[i++];
    var count=((sbook_index[dterm]) ? (sbook_index[dterm].length) : (0));
    var freq=((freqs)?(freqs[dterm]||0):(0));
    var score=((scores) ?(scores[dterm]||false) : (false));
    var title=
      ((sbook_noisy_tooltips) ?
       (((score)?("s="+score+"; "):"")+freq+"/"+count+" items") :
       (freq+((freq==1) ? " item" : " items")));
    var relfreq=((freqs) ?
		 ((freq/freqs._count)-(count/sbook_tagged_count))
		 : (0.5));
    var span=sbookDTermCompletion(dterm,title);
    if (freq===1) fdjtAddClass(span,"singleton");
    if ((scores) && (scores[dterm])) {
      var relsize=
	Math.ceil((75+(Math.ceil(50*(score/max_score)))+
		   (Math.ceil(50*(relfreq))))
		  *((dterm.length>8) ? (2/Math.log(dterm.length)) : (1)));
      span.style.fontSize=relsize+"%";}
    fdjtAppend(completions,span,"\n");}
  var end=new Date();
  if (sbook_trace_clouds)
    fdjtLog("Made cloud for %d dterms in %f seconds",
	    dterms.length,(end.getTime()-start.getTime())/1000);
  return completions;
}

var sbook_full_cloud=false;
var sbook_empty_cloud=false;

function sbookFullCloud()
{
  if (sbook_full_cloud) return sbook_full_cloud;
  else {
    var tagscores={}; var tagfreqs={}; var alltags=[];
    var book_tags=sbook_index._all;
    // The scores here are used to determine sizes in the cloud
    // A regular index reference counts as 1 and a prime reference counts
    //  as one more.
    var i=0; while (i<book_tags.length) {
      var tag=book_tags[i++];
      var score=Math.ceil(Math.log(sbook_index[tag].length))+
	((sbook_direct_index[tag]) ? (sbook_direct_index[tag].length) : (0))+
	((sbook_prime_index[tag]) ? (sbook_prime_index[tag].length) : (0));
      if (tagscores[tag]) tagscores[tag]=tagscores[tag]+score;
      else tagscores[tag]=score;
      tagfreqs[tag]=((sbook_index[tag])?(sbook_index[tag].length):(0))
      alltags.push(tag);}
    alltags.sort(function (x,y) {
	var xlen=tagfreqs[x]; var ylen=tagfreqs[y];
	if (xlen==ylen) return 0;
	else if (xlen>ylen) return -1;
	else return 1;});
    var max_score=0;
    var i=0; while (i<alltags.length) {
      var score=tagscores[alltags[i++]];
      if (score>max_score) max_score=score;}
    var completions=sbookMakeCloud(alltags,tagscores,tagfreqs);
    sbook_full_cloud=completions;
    return completions;}
}

/* Search UI */

function createSBOOKHUDsearch()
{
  var input=fdjtInput("TEXT","QTEXT","",null);
  var completions=sbook_empty_cloud=
    fdjtDiv("completions",fdjtSpan("count","no query refinements"));
  
  input.setAttribute("COMPLETEOPTS","nocase prefix showempty");
  input.completions_elt=completions;
  completions.input_elt=input;
  input.onkeydown=fdjtComplete_onkey;
  input.onkeypress=sbookSearchInput_onkeypress;
  input.onkeyup=sbookSearchInput_onkeyup;
  input.onfocus=sbookSearchInput_onfocus;
  input.onblur=sbookSearchInput_onblur;
  input.getCompletionText=_sbook_get_current_entry;
  input.oncomplete=_sbook_replace_current_entry;
  input.noteCompletions=_sbook_note_completions;

  // This causes a timing problem
  // input.onblur=fdjtComplete_hide;
  input.setAttribute("AUTOCOMPLETE","off");
  input.setAttribute("COMPLETIONS","SBOOKSEARCHCOMPLETIONS");
  input.setAttribute("COMPLETECHARS"," \t;");
  input.setAttribute("MAXCOMPLETE","20");  
  completions.id="SBOOKSEARCHCOMPLETIONS";
  input.id="SBOOKSEARCHTEXT";
  var sbooksearch=
    fdjtDiv(".sbooksearch.hud",
	    fdjtDiv("query",completions,input));
  sbooksearch.onmouseover=sbookHUD_onmouseover;
  sbooksearch.onmouseout=sbookHUD_onmouseout;
  return sbooksearch;
}

function _sbook_get_current_entry()
{
  var endsemi=this.value.lastIndexOf(';');
  if (endsemi) return this.value.slice(endsemi+1);
  else return this.value;
}

/* Emacs local variables
;;;  Local variables: ***
;;;  compile-command: "cd ..; make" ***
;;;  End: ***
*/
