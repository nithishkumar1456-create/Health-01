import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Undo, Redo, Printer, Eye, Link as LinkIcon, Image as ImageIcon,
  Video, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Code, Smile, Type, ChevronDown, Check, Sparkles, FileText, Share2, HelpCircle,
  Table as TableIcon, Bookmark, FileSpreadsheet, QrCode, Youtube, Layout, Heading1, Heading2,
  Heading3, Quote, Outdent, Indent, X, Upload, Sliders, Maximize2, Minimize2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article content here...",
  minHeight = "280px"
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontSize, setFontSize] = useState('11pt');
  const [formatType, setFormatType] = useState('Paragraph');
  
  // Selection formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Modals state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80');
  const [imageAlt, setImageAlt] = useState('Time for review');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('right');
  const [imageWidth, setImageWidth] = useState('280');

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [showCalloutModal, setShowCalloutModal] = useState(false);
  const [calloutText, setCalloutText] = useState('One of the most powerful features of Health02 is the ready-to-use design elements kit. Design Elements provides tools for scaffolding your information and makes designing of article quicker.');

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync value from props into contentEditable innerHTML when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        // If value is plain text / markdown, convert simple formatting or render directly
        if (!value.includes('<') && !value.includes('>')) {
          editorRef.current.innerHTML = value
            .split('\n\n')
            .map(p => p.trim() ? `<p>${p}</p>` : '')
            .join('');
        } else {
          editorRef.current.innerHTML = value;
        }
      }
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  // Helper command exec
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleContentChange();
    checkSelectionState();
  };

  const checkSelectionState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  // Calculate word count
  const getWordCount = () => {
    if (!editorRef.current) return 0;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  // Format block inserts
  const insertCallout = () => {
    const calloutHtml = `
      <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 16px 0; border-radius: 4px; color: #0369a1; font-size: 14px; line-height: 1.6;">
        ${calloutText}
      </div>
    `;
    execCommand('insertHTML', calloutHtml);
    setShowCalloutModal(false);
  };

  const insertImage = () => {
    let floatStyle = '';
    if (imageAlign === 'right') floatStyle = 'float: right; margin: 0 0 16px 20px;';
    else if (imageAlign === 'left') floatStyle = 'float: left; margin: 0 20px 16px 0;';
    else floatStyle = 'display: block; margin: 16px auto;';

    const imgHtml = `
      <img src="${imageUrl}" alt="${imageAlt}" style="${floatStyle} width: ${imageWidth}px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    `;
    execCommand('insertHTML', imgHtml);
    setShowImageModal(false);
  };

  const insertTable = () => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Cell ${r + 1}, ${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p></p>`;
    execCommand('insertHTML', tableHtml);
    setShowTableModal(false);
  };

  const insertLink = () => {
    if (linkUrl) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #0284c7; text-decoration: underline;">${linkText || linkUrl}</a>`;
      execCommand('insertHTML', linkHtml);
    }
    setShowLinkModal(false);
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs flex flex-col font-sans text-xs">
      
      {/* 1. TOP MENU BAR (Edit, Insert, View, Format, Table, Tools, Add-ons) */}
      <div className="bg-[#f8fafc] border-b border-gray-200 px-3 py-1.5 flex items-center gap-4 text-gray-700 font-medium select-none text-[12px] relative z-20">
        
        {/* Menu Items */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Edit <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { execCommand('undo'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex justify-between">Undo <span>Ctrl+Z</span></button>
              <button type="button" onClick={() => { execCommand('redo'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex justify-between">Redo <span>Ctrl+Y</span></button>
              <div className="border-t border-gray-100 my-1"></div>
              <button type="button" onClick={() => { execCommand('selectAll'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50">Select All</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'insert' ? null : 'insert')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Insert <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'insert' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { setShowImageModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5 text-sky-600" /> Image / Edit Blot</button>
              <button type="button" onClick={() => { setShowLinkModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-sky-600" /> Insert Hyperlink</button>
              <button type="button" onClick={() => { setShowTableModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex items-center gap-2"><TableIcon className="w-3.5 h-3.5 text-sky-600" /> Table Grid</button>
              <button type="button" onClick={() => { setShowCalloutModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex items-center gap-2"><Quote className="w-3.5 h-3.5 text-sky-600" /> Callout / Highlight Box</button>
              <button type="button" onClick={() => { execCommand('insertHorizontalRule'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50">Horizontal Divider Line</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            View <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { setActiveTab('visual'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex justify-between">Visual WYSIWYG {activeTab === 'visual' && '✓'}</button>
              <button type="button" onClick={() => { setActiveTab('code'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 flex justify-between">Source Code {activeTab === 'code' && '✓'}</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'format' ? null : 'format')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Format <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'format' && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { execCommand('bold'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 font-bold">Bold (Ctrl+B)</button>
              <button type="button" onClick={() => { execCommand('italic'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 italic">Italic (Ctrl+I)</button>
              <button type="button" onClick={() => { execCommand('underline'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 underline">Underline (Ctrl+U)</button>
              <button type="button" onClick={() => { execCommand('strikeThrough'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 line-through">Strikethrough</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button type="button" onClick={() => { execCommand('removeFormat'); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50 text-red-600">Clear Formatting</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'table' ? null : 'table')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Table <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'table' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { setShowTableModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50">Insert Table</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Tools <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'tools' && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { alert(`Word count: ${getWordCount()} words`); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50">Word Count</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'addons' ? null : 'addons')}
            className="hover:bg-gray-200/80 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1"
          >
            Add-ons <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {openMenu === 'addons' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 text-[11px]">
              <button type="button" onClick={() => { setShowCalloutModal(true); setOpenMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-sky-50">Insert Health Blockquote</button>
            </div>
          )}
        </div>

      </div>

      {/* 2. ICON ACTIONS TOOLBAR */}
      <div className="bg-[#f1f5f9] border-b border-gray-200 px-3 py-1.5 flex flex-wrap items-center gap-1 text-gray-700 select-none border-t border-white">
        
        {/* Undo / Redo */}
        <button type="button" onClick={() => execCommand('undo')} title="Undo" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Undo className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCommand('redo')} title="Redo" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Redo className="w-3.5 h-3.5" /></button>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>

        {/* Print / Preview / Colors */}
        <button type="button" onClick={() => window.print()} title="Print Article" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Printer className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => setActiveTab(activeTab === 'visual' ? 'code' : 'visual')} title="Toggle Source View" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>

        {/* Text color picker */}
        <div className="relative flex items-center">
          <button type="button" onClick={() => execCommand('foreColor', '#0284c7')} title="Text Color (Blue Accent)" className="p-1 hover:bg-gray-200 rounded cursor-pointer flex items-center">
            <span className="font-bold text-sky-600 text-xs underline">A</span>
          </button>
          <button type="button" onClick={() => execCommand('backColor', '#fef08a')} title="Highlight Background Yellow" className="p-1 hover:bg-gray-200 rounded cursor-pointer">
            <span className="bg-yellow-200 px-1 py-0.2 rounded text-[10px]">A</span>
          </button>
        </div>

        <button type="button" onClick={() => execCommand('insertText', '😊')} title="Insert Emoji" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Smile className="w-3.5 h-3.5 text-amber-600" /></button>
        <button type="button" onClick={() => execCommand('formatBlock', 'pre')} title="Code Block" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Code className="w-3.5 h-3.5" /></button>

        <div className="h-4 w-px bg-gray-300 mx-1"></div>

        {/* Links, Media, Image edit blot */}
        <button type="button" onClick={() => setShowLinkModal(true)} title="Insert Hyperlink" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><LinkIcon className="w-3.5 h-3.5 text-blue-600" /></button>
        <button type="button" onClick={() => setShowImageModal(true)} title="Insert/Edit Image Blot" className="p-1 hover:bg-gray-200 rounded cursor-pointer bg-sky-100/70 text-sky-700 font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-[10px]">Image/Edit</span>
        </button>
        <button type="button" onClick={() => { const url = prompt('Enter YouTube Video Embed URL:'); if (url) execCommand('insertHTML', `<iframe width="100%" height="240" src="${url}" frameborder="0" allowfullscreen style="margin:12px 0; border-radius:8px;"></iframe>`); }} title="Embed Video" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Video className="w-3.5 h-3.5 text-red-600" /></button>

        {/* Yellow Special Toolbar Blots (as featured in screenshot) */}
        <div className="flex items-center gap-0.5 bg-amber-300/80 p-0.5 rounded border border-amber-400 ml-1">
          <button type="button" onClick={() => execCommand('insertHTML', '🚩 ')} title="Bookmark Flag" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><Bookmark className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => setShowCalloutModal(true)} title="Insert Article Callout" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><FileText className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => setShowLinkModal(true)} title="Quick Link" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><LinkIcon className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => setShowTableModal(true)} title="Insert Layout Grid" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><Layout className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => { const url = prompt('YouTube URL:'); if (url) execCommand('insertHTML', `▶️ ${url}`); }} title="YouTube Video" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><Youtube className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => execCommand('insertHTML', '<code>{code}</code>')} title="Code Blot" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><Code className="w-3 h-3 text-amber-900" /></button>
          <button type="button" onClick={() => execCommand('insertHTML', '🏁 QR Verification Code ')} title="QR Code Blot" className="p-1 hover:bg-amber-400 rounded cursor-pointer"><QrCode className="w-3 h-3 text-amber-900" /></button>
        </div>

      </div>

      {/* 3. FORMAT CONTROLS BAR (Formats ▾, B, I, U, Font ▾, Size ▾, Alignments, Lists) */}
      <div className="bg-[#f8fafc] border-b border-gray-200 px-3 py-1.5 flex flex-wrap items-center gap-2 text-gray-700 select-none">
        
        {/* Formats Dropdown */}
        <select
          value={formatType}
          onChange={(e) => {
            const val = e.target.value;
            setFormatType(val);
            if (val === 'H1') execCommand('formatBlock', 'h1');
            else if (val === 'H2') execCommand('formatBlock', 'h2');
            else if (val === 'H3') execCommand('formatBlock', 'h3');
            else if (val === 'Callout Box') setShowCalloutModal(true);
            else execCommand('formatBlock', 'p');
          }}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] outline-none font-medium text-gray-800 hover:border-gray-400 cursor-pointer"
        >
          <option value="Paragraph">Formats ▾</option>
          <option value="H1">Header 1 (Title)</option>
          <option value="H2">Header 2 (Section)</option>
          <option value="H3">Header 3 (Subhead)</option>
          <option value="Paragraph">Normal Paragraph</option>
          <option value="Callout Box">Design Callout Box</option>
        </select>

        <div className="h-4 w-px bg-gray-300"></div>

        {/* B, I, U buttons */}
        <div className="flex items-center gap-0.5 bg-gray-200/60 p-0.5 rounded border border-gray-300">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className={`px-2 py-0.5 rounded font-extrabold cursor-pointer text-xs ${isBold ? 'bg-sky-600 text-white' : 'hover:bg-gray-300 text-gray-800'}`}
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={`px-2 py-0.5 rounded italic font-serif cursor-pointer text-xs ${isItalic ? 'bg-sky-600 text-white' : 'hover:bg-gray-300 text-gray-800'}`}
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={`px-2 py-0.5 rounded underline cursor-pointer text-xs ${isUnderline ? 'bg-sky-600 text-white' : 'hover:bg-gray-300 text-gray-800'}`}
            title="Underline (Ctrl+U)"
          >
            U
          </button>
        </div>

        {/* Font Family Dropdown */}
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            execCommand('fontName', e.target.value);
          }}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] outline-none font-medium text-gray-800 cursor-pointer"
        >
          <option value="Roboto">Roboto</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Font Size Dropdown */}
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            execCommand('fontSize', '3'); // standard size
          }}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] outline-none font-medium text-gray-800 cursor-pointer"
        >
          <option value="9pt">9pt</option>
          <option value="10pt">10pt</option>
          <option value="11pt">11pt</option>
          <option value="12pt">12pt</option>
          <option value="14pt">14pt</option>
          <option value="18pt">18pt</option>
        </select>

        <div className="h-4 w-px bg-gray-300"></div>

        {/* Alignments */}
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => execCommand('justifyLeft')} title="Align Left" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignLeft className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('justifyCenter')} title="Align Center" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignCenter className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('justifyRight')} title="Align Right" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignRight className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('justifyFull')} title="Justify" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><AlignJustify className="w-3.5 h-3.5" /></button>
        </div>

        <div className="h-4 w-px bg-gray-300"></div>

        {/* Lists & Indentation */}
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Bulleted List" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><List className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('insertOrderedList')} title="Numbered List" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><ListOrdered className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('outdent')} title="Outdent" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Outdent className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => execCommand('indent')} title="Indent" className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Indent className="w-3.5 h-3.5" /></button>
        </div>

      </div>

      {/* 4. MAIN EDITABLE TEXT FIELD / AREA */}
      <div className="relative flex-1 bg-white" style={{ minHeight }}>
        {activeTab === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onKeyUp={checkSelectionState}
            onMouseUp={checkSelectionState}
            className="w-full p-5 font-sans text-sm text-gray-800 outline-none leading-relaxed prose max-w-none min-h-[260px]"
            style={{ fontFamily }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-xs text-gray-800 bg-gray-90 outline-none min-h-[260px]"
          />
        )}
      </div>

      {/* 5. BOTTOM STATUS BAR (div » p » span | Word Count) */}
      <div className="bg-[#f1f5f9] border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-500 font-mono select-none">
        <div className="flex items-center gap-2">
          <span>div » p » span</span>
          <span className="text-gray-300">|</span>
          <span className="text-sky-700 font-sans font-bold">Health02 Article Format Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{getWordCount()} words</span>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'visual' ? 'code' : 'visual')}
            className="text-sky-600 font-sans font-bold hover:underline cursor-pointer"
          >
            {activeTab === 'visual' ? 'Switch to HTML/Markdown' : 'Switch to Visual Editor'}
          </button>
        </div>
      </div>

      {/* MODAL 1: INSERT / EDIT IMAGE BLOT */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-gray-200 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                Image Insert & Format Settings
              </h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Image Source URL:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Alt Description Text:</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Float Alignment:</label>
                  <select
                    value={imageAlign}
                    onChange={(e) => setImageAlign(e.target.value as any)}
                    className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                  >
                    <option value="right">Align Right (Wrap Text)</option>
                    <option value="left">Align Left (Wrap Text)</option>
                    <option value="center">Center Block</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Width (pixels):</label>
                  <input
                    type="number"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-2 border border-gray-200 rounded bg-gray-50 text-center">
                <span className="text-[10px] text-gray-500 block mb-1">Image Preview</span>
                <img src={imageUrl} alt="" className="max-h-28 mx-auto rounded object-cover" />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => setShowImageModal(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold">Cancel</button>
              <button type="button" onClick={insertImage} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold">Insert Image Blot</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-gray-200 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-sky-600" />
                Insert Article Link
              </h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">URL:</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Display Text:</label>
                <input
                  type="text"
                  placeholder="e.g. published copy"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => setShowLinkModal(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold">Cancel</button>
              <button type="button" onClick={insertLink} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold">Insert Link</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TABLE MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-xs w-full p-5 border border-gray-200 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-sky-600" />
                Insert Data Table
              </h3>
              <button type="button" onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Rows:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Columns:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => setShowTableModal(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold">Cancel</button>
              <button type="button" onClick={insertTable} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold">Create Grid</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CALLOUT BOX MODAL */}
      {showCalloutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-gray-200 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2">
                <Quote className="w-4 h-4 text-sky-600" />
                Highlight Design Element Box
              </h3>
              <button type="button" onClick={() => setShowCalloutModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col gap-2 font-sans text-xs">
              <label className="font-bold text-gray-700">Callout Highlight Text:</label>
              <textarea
                rows={3}
                value={calloutText}
                onChange={(e) => setCalloutText(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded p-2 text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => setShowCalloutModal(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold">Cancel</button>
              <button type="button" onClick={insertCallout} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold">Insert Highlight Callout</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
