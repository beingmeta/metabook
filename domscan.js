/* -*- Mode: Javascript; Character-encoding: utf-8; -*- */

/* ###################### codex/domscan.js ###################### */

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

/* Scanning the document for Metadata */

Codex.DOMScan=(function(){
    var fdjtString=fdjt.String;
    var fdjtLog=fdjt.Log;
    var fdjtDOM=fdjt.DOM;

    var getLevel=Codex.getTOCLevel;

    function CodexDOMScan(root,docinfo){
        var fdjtID=fdjt.ID;
        var md5ID=fdjt.WSN.md5ID;
        var stdspace=fdjtString.stdspace;
        var flatten=fdjtString.flatten;
        var hasClass=fdjtDOM.hasClass;
        var hasPrefix=fdjtString.hasPrefix;
        var getChildren=fdjtDOM.getChildren;
        var textWidth=fdjtDOM.textWidth;
        var prefix=Codex.prefix;
        
        var start=false;

        if (typeof root === 'undefined') return this;
        if (!(docinfo))
            if (this instanceof CodexDOMScan)
                docinfo=this;
        else docinfo=new CodexDOMScan();
        if (!(root)) root=Codex.docroot||document.body;
        var start=new Date();
        var allheads=[], allids=[];
        docinfo._root=root;
        docinfo._heads=allheads;
        docinfo._ids=allids;
        if (!(root.id)) root.id="SBOOKROOT";
        if (Codex.Trace.startup) {
            if (root.id) 
                fdjtLog("Scanning %s#%s for structure and metadata",
                        root.tagName,root.id);
            else fdjtLog("Scanning DOM for structure and metadata: %o",root);}
        var nodefn=docinfo.nodeFn||false;
        var children=root.childNodes, level=false;
        var scanstate=
            {curlevel: 0,idserial:0,location: 0,
             nodecount: 0,eltcount: 0,headcount: 0,
             tagstack: [],taggings: [],allinfo: [],locinfo: [],
             idstate: {prefix: false,count: 0},
             idstack: [{prefix: false,count: 0}],
             pool: Codex.DocInfo};
        var rootinfo=(((nodefn)&&(nodeFn(root)))||(docinfo[root.id])||
                      (docinfo[root.id]=new scanInfo(root.id,scanstate)));
        scanstate.curhead=root; scanstate.curinfo=rootinfo;
        // Location is an indication of distance into the document
        var location=0;
        rootinfo.pool=scanstate.pool;
        rootinfo.title=root.title||document.title;
        rootinfo.starts_at=0;
        rootinfo.level=0; rootinfo.sub=new Array();
        rootinfo.head=false; rootinfo.heads=new Array();
        rootinfo.frag=root.id;
        rootinfo._id="#"+root.id;
        rootinfo.elt=root;
        scanstate.allinfo.push(rootinfo);
        scanstate.allinfo.push(0);
        /* Build the metadata */
        var i=0; while (i<children.length) {
            var child=children[i++];
            if (!((child.sbookskip)||(child.codexui)))
                scanner(child,scanstate,docinfo,docinfo.nodeFn||false);} 
        docinfo._nodecount=scanstate.nodecount;
        docinfo._headcount=scanstate.headcount;
        docinfo._eltcount=scanstate.eltcount;
        docinfo._maxloc=scanstate.location;
        docinfo._allinfo=scanstate.allinfo;
        docinfo._locinfo=scanstate.locinfo;
        var scaninfo=scanstate.curinfo;
        /* Close off all of the open spans in the TOC */
        while (scaninfo) {
            scaninfo.ends_at=scanstate.location;
            scaninfo=scaninfo.head;}
        var done=new Date();
        if (Codex.Trace.startup)
            fdjtLog('Gathered metadata in %f secs over %d/%d heads/nodes',
                    (done.getTime()-start.getTime())/1000,
                    scanstate.headcount,scanstate.eltcount);
        return docinfo;

        function scanInfo(id,scanstate) {
            if (docinfo[id]) return docinfo[id];
            this.pool=scanstate.pool;
            this.frag=id;
            // this._id="#"+id;
            this._id=id;
            docinfo[id]=this;
            scanstate.allinfo.push(this);
            scanstate.locinfo.push(scanstate.location);
            return this;}
        CodexDOMScan.scanInfo=scanInfo;

        function getTitle(head) {
            var title=
                (head.toctitle)||
                ((head.getAttributeNS)&&
                 (head.getAttributeNS('toctitle','http://sbooks.net')))||
                (head.getAttribute('toctitle'))||
                (head.getAttribute('data-toctitle'))||
                (head.title);
            if (!(title)) {
                var head1=fdjtDOM.getFirstChild(head,"H1,H2,H3,H4,H5,H6");
                if (head1) title=head1.toctitle||
                    ((head1.getAttributeNS)&&
                     (head1.getAttributeNS('toctitle','http://sbooks.net')))||
                    (head1.getAttribute('toctitle'))||
                    (head1.getAttribute('data-toctitle'))||
                    (head1.title);
                if ((!(title))&&(head1)) title=gatherText(head1);
                else title=gatherText(head);
                if ((title)&&(title.length>40))
                    title=title.slice(0,40)+"...";}
            if (typeof title === "string") {
                var std=stdspace(title);
                if (std==="") return false;
                else return std;}
            else {
                var title=fdjtDOM.textify(title,true);
                if ((title)&&(title.length>40))
                    return title.slice(0,40)+"...";
                else return title;}}

        function gatherText(head,s) {
            if (!(s)) s="";
            if (head.nodeType===3)
                return s+head.nodeValue;
            else if (head.nodeType!==1) return s;
            else {
                var children=head.childNodes;
                var i=0; var len=children.length;
                while (i<len) {
                    var child=children[i++];
                    if (child.nodeType===3) s=s+child.nodeValue;
                    else if (child.nodeType===1)
                        s=gatherText(child,s);
                    else {}}
                return s;}}

        function textWidth(elt){
            if (elt.nodeType===3) return elt.nodeValue.length;
            else if (elt.nodeType!==1) return 0;
            else if (elt.getAttribute("data-loclen"))
                return parseInt(elt.getAttribute("data-loclen"));
            else {
                var children=elt.childNodes; var width=0;
                var i=0; var len=children.length;
                while (i<len) {
                    var child=children[i++];
                    if (child.nodeType===3)
                        width=width+child.nodeValue.length;
                    else if (child.nodeType===1)
                        width=width+textWidth(child);
                    else {}}
                return width;}}

        function handleHead(head,docinfo,scanstate,level,
                            curhead,curinfo,curlevel,nodefn){
            var headid=head.id;
            var headinfo=((nodefn)&&(nodefn(head)))||docinfo[headid]||
                (docinfo[headid]=new scanInfo(headid,scanstate));
            scanstate.headcount++;
            allheads.push(head);
            if ((headinfo.elt)&&(headinfo.elt!==head)) {
                var newid=headid+"x"+scanstate.location;
                fdjtLog.warn("Duplicate ID=%o newid=%o",headid,newid);
                head.id=headid=newid;
                headinfo=((nodefn)&&(nodefn(head)))||docinfo[headid]||
                    (docinfo[headid]=new scanInfo(headid,scanstate));}
            if (Codex.Trace.scan)
                fdjtLog("Scanning head item %o under %o at level %d w/id=#%s ",
                        head,curhead,level,headid);
            /* Iniitalize the headinfo */
            headinfo.starts_at=scanstate.location;
            headinfo.elt=head; headinfo.level=level;
            headinfo.sub=new Array();
            headinfo.frag=headid; headinfo._id="#"+headid;
            headinfo.title=getTitle(head);
            headinfo.next=false; headinfo.prev=false;
            if (headinfo.title)
                headinfo.sectag="\u00a7"+stdspace(headinfo.title);
            else headinfo.sectag="\u00a7Anonymous Section";
            if (level>curlevel) {
                /* This is the simple case where we are a subhead
                   of the current head. */
                headinfo.head=curinfo;
                if (!(curinfo.intro_ends_at))
                    curinfo.intro_ends_at=scanstate.location;
                curinfo.sub.push(headinfo);
                /* There is one special case here, were there is a
                   previous head/section (created by a whole block
                   wrapped in a section/article/etc block. */
                if (scanstate.lastlevel===level) {
                    headinfo.prev=scanstate.lastinfo;
                    scanstate.lastinfo.next=headinfo;
                    delete scanstate.lastlevel;
                    delete scanstate.lasthead;
                    delete scanstate.lastinfo;}}
            else { /* We're not a subhead, so
                      we're popping up at least one level. */
                var scan=curhead;
                var scaninfo=curinfo;
                var scanlevel=curinfo.level;
                /* Climb the stack of headers, closing off entries and setting up
                   prev/next pointers where needed. */
                while (scaninfo) {
                    if (Codex.Trace.scan)
                        fdjtLog("Finding head: scan=%o, info=%o, sbook_head=%o, cmp=%o",
                                scan,scaninfo,scanlevel,scaninfo.head,
                                (scanlevel<level));
                    if (scanlevel<level) break;
                    if (level===scanlevel) {
                        headinfo.prev=scaninfo;
                        scaninfo.next=headinfo;}
                    scaninfo.ends_at=scanstate.location;
                    scanstate.tagstack=scanstate.tagstack.slice(0,-1);
                    scaninfo=scaninfo.head; scan=scaninfo.elt;
                    scanlevel=((scaninfo)?(scaninfo.level):(0));}
                if (Codex.Trace.scan)
                    fdjtLog("Found parent: up=%o, upinfo=%o, atlevel=%d, sbook_head=%o",
                            scan,scaninfo,scaninfo.level,scaninfo.head);
                /* We've found the enclosing head for this head, so we
                   establish the links. */
                headinfo.head=scaninfo;
                scaninfo.sub.push(headinfo);}
            /* If we have a head, we get its tags. */
            var supinfo=headinfo.head;
            if ((supinfo)&&(supinfo.sectags))
                headinfo.sectags=supinfo.sectags.concat([headinfo.sectag]);
            else headinfo.sectags=[headinfo.sectag];
            
            /* We create an array of all the heads, which lets us
               replace many recursions with iterations. */
            var newheads=new Array();
            if (supinfo.heads) newheads=newheads.concat(supinfo.heads);
            if (supinfo) newheads.push(supinfo);
            headinfo.heads=newheads;
            if (Codex.Trace.scan)
                fdjtLog("@%d: Found head=%o, headinfo=%o, sbook_head=%o",
                        scanstate.location,head,headinfo,headinfo.head);
            /* Update the toc state */
            scanstate.curhead=head;
            scanstate.curinfo=headinfo;
            scanstate.curlevel=level;
            if (headinfo)
                headinfo.ends_at=scanstate.location+textWidth(head);
            scanstate.location=scanstate.location+textWidth(head);}

        function scanner(child,scanstate,docinfo,nodefn){
            var location=scanstate.location;
            var curhead=scanstate.curhead;
            var curinfo=scanstate.curinfo;
            var curlevel=scanstate.curlevel;
            scanstate.nodecount++;
            // Location tracking and TOC building
            if (child.nodeType===3) {
                var content=stdspace(child.nodeValue);
                var width=content.length;
                // Need to regularize whitespace
                scanstate.location=scanstate.location+width;
                return 0;}
            else if (child.nodeType!==1) return 0;
            else {}
            var tag=child.tagName, classname=child.className, id=child.id;
            if ((Codex.ignore)&&(Codex.ignore.match(child))) return;
            if ((classname)&&(classname.search(/\bsbookignore\b/)>=0))
                return;
            if ((child.codexui)||((id)&&(id.search("CODEX")===0))) return;
            else if ((!(id))&&(!(Codex.baseid))&&
                     (tag.search(/p|h\d|blockquote|li/i)===0)) {
                var baseid="WSN_"+md5ID(child), id=baseid, count=1;
                while (document.getElementById[id])
                    id=baseid+"_"+(count++);
                child.id=id;}
            else {}
            // Get the location in the TOC for this out of context node
            //  These get generated, for example, when the content of an
            //  authorial footnote is moved elsewhere in the document.
            var tocloc=(child.codextocloc)||(child.getAttribute("data-tocloc"));
            if ((tocloc)&&(docinfo[tocloc])) {
                var tocinfo=docinfo[tocloc];
                var curlevel=scanstate.curlevel;
                var curhead=scanstate.curhead;
                var curinfo=scanstate.curinfo;
                var notoc=scanstate.notoc;
                var headinfo=tocinfo.head;
                scanstate.curinfo=headinfo;
                scanstate.curhead=headinfo.elt;
                scanstate.curlevel=headinfo.level;
                scanstate.notoc=true;
                var children=child.childNodes;
                var i=0; var lim=children.length;
                while (i<lim) {
                    var child=children[i++];
                    if (child.nodeType===1)
                        scanner(child,scanstate,docinfo,nodefn);}
                // Put everything back
                scanstate.curlevel=curlevel; scanstate.notoc=notoc;
                scanstate.curhead=curhead; scanstate.curinfo=curinfo;
                return;}
            var toclevel=((child.id)&&(getLevel(child)));
            // The header functionality (for its contents too) is handled by the
            // section
            if ((scanstate.notoc)||(tag==='header')) {
                scanstate.notoc=true; toclevel=0;}
            scanstate.eltcount++;
            var info=((nodefn)&&(nodefn(child)))||(id&&(docinfo[id]));
            if ((!(info))&&(id)) {
                allids.push(id); info=new scanInfo(id,scanstate);
                docinfo[id]=info;}
            if ((info)&&(info.elt)&&(id)&&(info.elt!==child)) {
                var newid=child.id+"x"+scanstate.location;
                fdjtLog.warn("Duplicate ID=%o newid=%o",child.id,newid);
                child.id=id=newid;
                info=((nodefn)&&(nodefn(head)))||docinfo[id]||
                    (docinfo[id]=new scanInfo(id,scanstate));}
            if (info) {
                info.starts_at=scanstate.location;
                info.sbookhead=curhead.id;
                info.headstart=curinfo.starts_at;}
            if (info) info.head=curinfo;
            // Set the first content node
            if ((id)&&(info)&&(!start)) Codex.start=start=child;
            // And the initial content level
            if ((info)&&(toclevel)&&(!(info.toclevel))) info.toclevel=toclevel;
            if ((id)&&(info)) {
                var tags=
                    ((child.getAttributeNS)&&
                     (child.getAttributeNS('tags','http://sbooks.net/')))||
                    (child.getAttribute('tags'))||
                    (child.getAttribute('data-tags'));
                if (tags) info.tags=tags.split(';');}
            if (((classname)&&(classname.search(/\bsbookignore\b/)>=0))||
                ((Codex.ignore)&&(Codex.ignore.match(child))))
                return;
            if ((toclevel)&&(!(info.tocdone)))
                handleHead(child,docinfo,scanstate,toclevel,
                           curhead,curinfo,curlevel,nodefn);
            if (((classname)&&(classname.search(/\bsbookterminal\b/)>=0))||
                ((classname)&&(Codex.terminals)&&
                 (Codex.terminals.match(child)))||
                (tag.search(/p|h\d|pre/i)===0)) {
                scanstate.location=scanstate.location+textWidth(child);}
            else {
                var children=child.childNodes;
                var i=0; var len=children.length;
                while (i<len) {
                    var grandchild=children[i++];
                    if (grandchild.nodeType===3) {
                        var content=stdspace(grandchild.nodeValue);
                        scanstate.location=scanstate.location+
                            content.length;}
                    else if (grandchild.nodeType===1) {
                        scanner(grandchild,scanstate,docinfo,nodefn);}}}
            if (info) info.ends_at=scanstate.location;
            if ((info)&&((info.ends_at-info.starts_at)<5000)) 
                info.wsnid=md5ID(child);
            if (toclevel) {
                scanstate.lasthead=child; scanstate.lastinfo=info;
                scanstate.lastlevel=toclevel;}}}
    
    CodexDOMScan.getTOCLevel=getLevel;
    return CodexDOMScan;})();

/* Emacs local variables
   ;;;  Local variables: ***
   ;;;  compile-command: "cd ..; make" ***
   ;;;  indent-tabs-mode: nil ***
   ;;;  End: ***
*/
