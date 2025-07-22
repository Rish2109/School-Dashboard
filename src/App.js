import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, ChevronRight, ChevronDown, Download, Plus, UploadCloud, Archive, Trash2, MoreVertical, Info, CheckCircle2, Search, Pencil, Bell, Settings, BarChart2, User, HelpCircle, Briefcase, FileText, Video, Calendar, Users, ShoppingCart, LogOut, BookOpen, ClipboardList, Shield, File as FileIcon, Notebook, Menu, X, MessageSquare, Copy, ArchiveRestore, Loader2, AlertTriangle, Share2, Facebook, Twitter, Globe, Instagram, Check, Bold, Italic, Link, List, ListOrdered, Upload, VideoIcon, ImageIcon, FileText as PdfIcon, Eye, Paperclip } from 'lucide-react';

// --- MOCK DATA ---

const personalNotificationsData = [
    { id: 1, title: 'Upcoming Match', createdBy: 'Kritika Wadhwa', created: '18/07/2025', lastModified: '21/07/2025', read: 0, unread: 3, published: false, info: true },
    { id: 2, title: 'Uniform Reminder', createdBy: 'John Doe', created: '16/07/2025', lastModified: '18/07/2025', read: 1, unread: 0, published: true, uniform: true, urgent: true },
    { id: 3, title: 'Send Push Off', createdBy: 'Harshwardhan More', created: '18/07/2025', lastModified: '18/07/2025', read: 1, unread: 0, published: true, urgent: true },
];

const initialManageNotificationsData = [
    { id: 1, title: 'Parent-Teacher Meeting Reminder', message: 'Dear Parents, this is a reminder about the upcoming Parent-Teacher meeting scheduled for this Friday. Please ensure you have booked your slots. We look forward to seeing you.', postedBy: 'Admin', category: 'Academic', platforms: { facebook: true, web: true, sms: true, instagram: false, twitter: false }, scheduleDate: '25 Jul 2025, 9:00 AM', createdOn: '21 Jul 2025, 10:00 AM', status: 'Scheduled', isArchived: false, previousStatus: null, attachments: [] },
    { id: 2, title: 'School Closed for Holiday', message: 'The school will remain closed tomorrow on account of a public holiday. Regular classes will resume on the following day.', postedBy: 'Principal', category: 'General', platforms: { web: true, sms: true, instagram: false, twitter: false, facebook: false }, scheduleDate: '-', createdOn: '20 Jul 2025, 3:00 PM', status: 'Published', isArchived: false, previousStatus: null, attachments: [] },
    { id: 3, title: 'Draft of Annual Day Invite', message: 'This is the first draft of the annual day invitation card. Please review and provide your feedback by the end of the day.', postedBy: 'Events Team', category: 'General', platforms: { web: false, sms: false, instagram: false, twitter: false, facebook: false }, scheduleDate: '-', createdOn: '21 Jul 2025, 11:30 AM', status: 'Pending', isArchived: false, previousStatus: null, attachments: [{ name: 'Annual_Day_Invite_Draft.pdf', type: 'pdf' }] },
    { id: 4, title: 'Weekly Sports Update', message: 'Congratulations to the football team for their victory! This week, we have the inter-house basketball tournament. All the best to the participants.', postedBy: 'Sports Dept', category: 'Sports', platforms: { web: true, twitter: true, instagram: true, facebook: false, sms: false }, scheduleDate: '-', createdOn: '18 Jul 2025, 5:00 PM', status: 'Published', isArchived: false, previousStatus: null, attachments: [{ name: 'Tournament_Schedule.pdf', type: 'pdf' }, { name: 'Team_Photos.zip', type: 'file' }] },
    ...Array.from({ length: 40 }, (_, i) => {
        const originalStatus = i % 3 === 0 ? 'Scheduled' : (i % 3 === 1 ? 'Published' : 'Pending');
        const isArchived = i > 30;
        return {
            id: i + 9,
            title: `Notification #${i + 9} with a potentially very long title to test wrapping`,
            message: `This is the detailed message for notification #${i + 9}. It contains more information than the title.`,
            postedBy: `User ${i+1}`,
            category: ['Sports', 'Academic', 'General'][i % 3],
            platforms: { web: i % 2 === 0, sms: i % 3 === 0, instagram: i % 4 === 0, twitter: false, facebook: i % 5 === 0 },
            scheduleDate: i % 3 === 0 ? `0${(i%9)+1} Aug 2025, 10:00 AM` : '-',
            createdOn: `1${(i%9)+1} Jul 2025, 12:00 PM`,
            status: isArchived ? 'Pending' : originalStatus,
            isArchived: isArchived,
            previousStatus: isArchived ? originalStatus : null,
            attachments: i % 5 === 0 ? [{ name: `attachment_${i}.docx`, type: 'file' }] : []
        }
    })
];


const notificationCategoriesData = [
    { id: 1, category: 'Sports', sortOrder: 7, createdOn: '04 Sep 2017, 7:15 AM', lastModified: '04 Sep 2017, 7:15 AM', status: 'Published' },
    { id: 2, category: '8th Year', sortOrder: 6, createdOn: '04 Sep 2017, 7:14 AM', lastModified: '04 Sep 2017, 7:14 AM', status: 'Published' },
    { id: 3, category: 'something happened', sortOrder: 6, createdOn: '25 Sep 2019, 10:29 AM', lastModified: '25 Sep 2019, 10:29 AM', status: 'Published' },
];


// --- REUSABLE COMPONENTS ---

const ActionButton = ({ icon: Icon, label, className, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${className} disabled:opacity-50 disabled:cursor-not-allowed`}>
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
    </button>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Confirm", confirmColor = "blue" }) => {
    if (!isOpen) return null;

    const colors = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        red: 'bg-red-600 hover:bg-red-700',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${confirmColor === 'red' ? 'bg-red-100' : 'bg-yellow-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                        <AlertTriangle className={`h-6 w-6 ${confirmColor === 'red' ? 'text-red-600' : 'text-yellow-600'}`} aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {children}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${colors[confirmColor]}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const PersonalNotificationRow = ({ notification, isSelected, onSelect }) => {
    const { id, title, createdBy, created, lastModified, read, unread, published, info, uniform, urgent } = notification;
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isSelected} onChange={() => onSelect(id)} /></td>
            <td className="px-4 py-3 text-gray-800 font-medium">
                <div className="flex items-center gap-2">
                    <span>{title}</span>
                    {info && <Info className="h-4 w-4 text-gray-400" />}
                    {uniform && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {urgent && <Info className="h-4 w-4 text-red-500" />}
                </div>
            </td>
            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{createdBy}</td>
            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{created}</td>
            <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{lastModified}</td>
            <td className="px-4 py-3"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center justify-center w-6 h-6">{read}</span></td>
            <td className="px-4 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center justify-center w-6 h-6 ${unread > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>{unread}</span></td>
            <td className="px-4 py-3">
                {published ? <span className="bg-green-100 text-green-800 text-sm font-bold px-2.5 py-1 rounded-full flex items-center justify-center w-7 h-7">P</span> : <span className="bg-gray-200 text-gray-800 text-sm font-bold px-2.5 py-1 rounded-full flex items-center justify-center w-7 h-7">D</span>}
            </td>
            <td className="px-4 py-3 text-center"><button className="text-gray-500 hover:text-gray-800"><MoreVertical className="h-5 w-5" /></button></td>
        </tr>
    );
};

const ManagePersonalNotificationsPage = () => {
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const handleSelectAll = (e) => setSelectedNotifications(e.target.checked ? personalNotificationsData.map(n => n.id) : []);
    const handleSelectOne = (id) => {
        setSelectedNotifications(
            selectedNotifications.includes(id)
                ? selectedNotifications.filter(item => item !== id)
                : [...selectedNotifications, id]
        );
    };

    return (
        <>
            <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Home className="h-4 w-4" /><ChevronRight className="h-4 w-4 mx-1" /><span>Personal Notification</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Personal Notification</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ActionButton label="Export" icon={Download} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Add PN" icon={Plus} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Publish" icon={UploadCloud} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Archive" icon={Archive} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Delete" icon={Trash2} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                </div>
            </header>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                 <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2 text-sm">
                        <span className="text-gray-800 font-medium">Title</span><ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
                    </div>
                    <div className="relative flex-grow min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search by title" className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" /></div>
                    <button className="px-4 py-2 border rounded-md text-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Today <ChevronDown className="inline h-4 w-4" /></button>
                    <button className="px-4 py-2 border rounded-md text-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Published Status <ChevronDown className="inline h-4 w-4" /></button>
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900">Clear filters</button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" onChange={handleSelectAll} checked={personalNotificationsData.length > 0 && selectedNotifications.length === personalNotificationsData.length} /></th>
                            <th scope="col" className="px-4 py-3">Title</th><th scope="col" className="px-4 py-3 hidden md:table-cell">Created By</th><th scope="col" className="px-4 py-3 hidden lg:table-cell">Created</th><th scope="col" className="px-4 py-3 hidden lg:table-cell">Last Modified</th><th scope="col" className="px-4 py-3">Read</th><th scope="col" className="px-4 py-3">Unread</th><th scope="col" className="px-4 py-3">Published</th><th scope="col" className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>{personalNotificationsData.map(n => <PersonalNotificationRow key={n.id} notification={n} isSelected={selectedNotifications.includes(n.id)} onSelect={handleSelectOne} />)}</tbody>
                </table>
            </div>
        </>
    );
};

const PlatformsPopover = ({ platforms }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    const platformList = [
        { key: 'facebook', name: 'Facebook', icon: Facebook },
        { key: 'twitter', name: 'X (prev. Twitter)', icon: Twitter },
        { key: 'web', name: 'Web', icon: Globe },
        { key: 'instagram', name: 'Instagram', icon: Instagram },
        { key: 'sms', name: 'SMS', icon: MessageSquare },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverRef]);

    return (
        <div className="relative" ref={popoverRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-blue-600">
                <Share2 className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                    <ul className="py-1">
                        {platformList.map(p => (
                            <li key={p.key} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <p.icon className="h-4 w-4" />
                                    <span>{p.name}</span>
                                </div>
                                {platforms[p.key] && <Check className="h-4 w-4 text-green-500" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ActionsMenu = ({ onEdit, onDuplicate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-800">
                <MoreVertical className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border">
                    <ul className="py-1">
                        <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); onEdit(); setIsOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Pencil className="h-4 w-4" /> Edit
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); onDuplicate(); setIsOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Copy className="h-4 w-4" /> Duplicate
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const CreateNotificationPage = ({ onBack, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('Default');
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setMessage(initialData.message || '');
            setCategory(initialData.category || 'Default');
            setAttachments(initialData.attachments || []);
        }
    }, [initialData]);

    const handleFileChange = (event) => {
        setAttachments([...attachments, ...Array.from(event.target.files)]);
    };

    const removeAttachment = (fileName) => {
        setAttachments(attachments.filter(file => file.name !== fileName));
    };

    const triggerFileInput = (accept) => {
        fileInputRef.current.accept = accept;
        fileInputRef.current.click();
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setError(true);
            return;
        }
        setError(false);
        const notificationData = {
            ...(initialData || {}),
            title,
            message,
            postedBy: initialData?.postedBy || 'Admin', // Keep original poster on edit
            platforms: initialData?.platforms || { web: true },
            category,
            attachments: attachments.map(f => ({ name: f.name, type: f.type?.split('/')[0] || 'file' })),
        };
        onSave(notificationData);
    };

    return (
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:underline">Notifications</a>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>{initialData ? 'Edit' : 'Create'} Notification</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{initialData ? 'Edit' : 'Create'} Notification</h1>
            <p className="text-gray-600 mt-1">Create and send notifications to users. Configure notification settings, target audience, and scheduling options.</p>

            {error && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative my-4" role="alert">
                    <strong className="font-bold">Please Fill Mandatory Fields</strong>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6">
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                    <p className="text-right text-xs text-gray-500 mt-1">{title.length}/120 characters</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <div className="border border-gray-300 rounded-md">
                        <div className="flex items-center gap-2 p-2 border-b">
                            <button className="p-1 hover:bg-gray-100 rounded"><Bold className="h-4 w-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Italic className="h-4 w-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><span className="font-bold text-xs">H1</span></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><span className="font-bold text-xs">H2</span></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><List className="h-4 w-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><ListOrdered className="h-4 w-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Link className="h-4 w-4" /></button>
                        </div>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="8" className="w-full p-2 border-0 focus:ring-0" placeholder="Enter your message here..."></textarea>
                    </div>
                </div>
                
                <details className="border-b" open>
                    <summary className="flex justify-between items-center py-4 cursor-pointer">
                        <span className="font-medium text-gray-800">Notification Settings</span>
                        <ChevronDown className="h-5 w-5" />
                    </summary>
                    <div className="p-4 bg-gray-50 space-y-4">
                        <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300"/> App Notification</label>
                        <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300"/> Send as Push Notification</label>
                        <div className="border rounded-lg p-4 bg-white">
                            <p className="font-medium">Send to</p>
                            <div className="flex justify-between text-sm mt-2"><span>Selected Users</span><span>0</span></div>
                            <div className="flex justify-between text-sm text-gray-500"><span>Total Selected</span><span>0</span></div>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                                <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="font-bold text-lg">0</p><p className="text-sm">App Users</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="font-bold text-lg">0</p><p className="text-sm">Non-App Users</p>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4">
                                <ActionButton icon={Plus} label="Add or Remove Users" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"/>
                                <ActionButton icon={Eye} label="View Users" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Default</option>
                                <option>Sports</option>
                                <option>Academic</option>
                                <option>General</option>
                                <option>6th Year</option>
                            </select>
                        </div>
                    </div>
                </details>

                <details className="border-b">
                    <summary className="flex justify-between items-center py-4 cursor-pointer">
                        <span className="font-medium text-gray-800">Attachments</span>
                        <ChevronDown className="h-5 w-5" />
                    </summary>
                    <div className="p-4 bg-gray-50 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onClick={() => triggerFileInput('*/*')} className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-gray-100"><Upload className="h-6 w-6 text-gray-500"/> <span className="text-sm">Choose Files</span></button>
                            <button onClick={() => triggerFileInput('video/*')} className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-gray-100"><VideoIcon className="h-6 w-6 text-gray-500"/> <span className="text-sm">Choose Videos</span></button>
                            <button onClick={() => triggerFileInput('image/*')} className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-gray-100"><ImageIcon className="h-6 w-6 text-gray-500"/> <span className="text-sm">Add images</span></button>
                            <button onClick={() => triggerFileInput('.pdf')} className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-gray-100"><PdfIcon className="h-6 w-6 text-gray-500"/> <span className="text-sm">Upload PDF</span></button>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium text-sm mb-2">Selected Files:</h4>
                                <ul className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between bg-white p-2 border rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeAttachment(file.name)} className="text-red-500 hover:text-red-700">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
                
                <details>
                    <summary className="flex justify-between items-center py-4 cursor-pointer">
                        <span className="font-medium text-gray-800">Schedule & Archive</span>
                        <ChevronDown className="h-5 w-5" />
                    </summary>
                    <div className="p-4 bg-gray-50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label>
                                <input type="date" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Archive Date</label>
                                <input type="date" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Redirect To</label>
                            <select className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Website</option>
                                <option>App</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Setting</label>
                            <textarea rows="3" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="SMS notifications will be sent based on the character limit and user preferences."></textarea>
                        </div>
                    </div>
                </details>
            </div>
             <div className="flex justify-end gap-3 mt-6">
                <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Preview</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-gray-800 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-900">Submit</button>
            </div>
        </div>
    );
};

const ViewNotificationPage = ({ notification, onBack }) => {
    const getFileIcon = (type) => {
        if (type.startsWith('image')) return <ImageIcon className="h-5 w-5 text-gray-500" />;
        if (type.startsWith('video')) return <VideoIcon className="h-5 w-5 text-gray-500" />;
        if (type === 'pdf') return <PdfIcon className="h-5 w-5 text-gray-500" />;
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
    
    return (
        <div>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:underline">Notifications</a>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>View Notification</span>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">{notification.title}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
                    <span><strong>Posted By:</strong> {notification.postedBy}</span>
                    <span><strong>Category:</strong> {notification.category}</span>
                    <span><strong>Created On:</strong> {notification.createdOn}</span>
                </div>

                <hr className="my-4" />

                <div>
                    <h2 className="font-semibold text-gray-800 mb-2">Message:</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{notification.message || 'No message content available.'}</p>
                </div>

                {notification.attachments && notification.attachments.length > 0 && (
                    <div className="mt-6">
                        <hr className="my-4" />
                        <h2 className="font-semibold text-gray-800 mb-2">Attachments:</h2>
                        <ul className="space-y-2">
                            {notification.attachments.map((file, index) => (
                                <li key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                                    {getFileIcon(file.type)}
                                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">{file.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <ActionButton label="Back to List" onClick={onBack} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
            </div>
        </div>
    );
};

const ManageNotificationsPage = () => {
    const [notifications, setNotifications] = useState(initialManageNotificationsData);
    const [selected, setSelected] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Published');
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState({ type: null, isOpen: false });
    const [currentView, setCurrentView] = useState({ view: 'list', data: null });
    
    // Infinite scroll state
    const [displayedItems, setDisplayedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;
    const tableContainerRef = useRef(null);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const statusMatch = (
                filterStatus === 'All' ||
                (filterStatus === 'Archived' && n.isArchived) ||
                (!n.isArchived && n.status === filterStatus)
            );

            const searchMatch = n.title.toLowerCase().includes(searchTerm.toLowerCase());

            return statusMatch && searchMatch;
        });
    }, [notifications, filterStatus, searchTerm]);


    useEffect(() => {
        setPage(1);
        setDisplayedItems(filteredNotifications.slice(0, itemsPerPage));
    }, [filteredNotifications]);

    const loadMoreItems = () => {
        if (isLoading || displayedItems.length >= filteredNotifications.length) return;
        
        setIsLoading(true);
        setTimeout(() => {
            const nextPage = page + 1;
            const newItems = filteredNotifications.slice(0, nextPage * itemsPerPage);
            setPage(nextPage);
            setDisplayedItems(newItems);
            setIsLoading(false);
        }, 500); // Simulate network delay
    };

    useEffect(() => {
        const table = tableContainerRef.current;
        const handleScroll = () => {
            if (table.scrollTop + table.clientHeight >= table.scrollHeight - 10) {
                loadMoreItems();
            }
        };
        table?.addEventListener('scroll', handleScroll);
        return () => table?.removeEventListener('scroll', handleScroll);
    }, [isLoading, displayedItems, filteredNotifications]);


    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(displayedItems.map(n => n.id));
        } else {
            setSelected([]);
        }
    };
    const handleSelectOne = (id) => setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);

    const handleArchive = () => {
        setNotifications(notifications.map(n => {
            if (selected.includes(n.id)) {
                return { ...n, isArchived: true, previousStatus: n.status, status: 'Pending' };
            }
            return n;
        }));
        setSelected([]);
    };
    
    const handleUnarchive = () => {
        setNotifications(notifications.map(n => {
            if (selected.includes(n.id)) {
                return { ...n, isArchived: false, status: n.previousStatus || 'Pending', previousStatus: null };
            }
            return n;
        }));
        setSelected([]);
    };

    const handlePublishClick = () => {
        setIsConfirmModalOpen({ type: 'publish', isOpen: true });
    };

    const handleConfirmPublish = () => {
        setNotifications(notifications.map(n => {
            if (selected.includes(n.id)) {
                return { ...n, status: 'Published', scheduleDate: '-' };
            }
            return n;
        }));
        setSelected([]);
        setIsConfirmModalOpen({ type: null, isOpen: false });
    };

    const handleDeleteClick = () => {
        setIsConfirmModalOpen({ type: 'delete', isOpen: true });
    };

    const handleConfirmDelete = () => {
        setNotifications(notifications.filter(n => !selected.includes(n.id)));
        setSelected([]);
        setIsConfirmModalOpen({ type: null, isOpen: false });
    };

    const handleSaveNotification = (notificationData) => {
        const isEditing = notificationData.id;
        if (isEditing) {
            setNotifications(notifications.map(n => n.id === notificationData.id ? notificationData : n));
        } else {
            const newEntry = {
                ...notificationData,
                id: Date.now(),
                scheduleDate: '-',
                createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                status: 'Pending',
                isArchived: false,
                previousStatus: null,
            };
            setNotifications([newEntry, ...notifications]);
        }
        setCurrentView({ view: 'list', data: null });
    };
    
    const handleDuplicate = (notificationToDuplicate) => {
        const newEntry = {
            ...notificationToDuplicate,
            id: Date.now(),
            title: `(Copy) ${notificationToDuplicate.title}`,
            status: 'Pending',
            isArchived: false,
            previousStatus: null,
            createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        };
        setNotifications([newEntry, ...notifications]);
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilterStatus('Published');
    };
    
    const canPublish = selected.length > 0 && selected.every(id => {
        const notif = notifications.find(n => n.id === id);
        return notif && (notif.status === 'Pending' || notif.status === 'Scheduled');
    });
    
    const StatusTag = ({ status }) => {
        const colors = {
            Published: 'bg-blue-100 text-blue-800',
            Scheduled: 'bg-yellow-100 text-yellow-800',
            Pending: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };

    if (currentView.view === 'create' || currentView.view === 'edit') {
        return <CreateNotificationPage onBack={() => setCurrentView({ view: 'list', data: null })} onSave={handleSaveNotification} initialData={currentView.data} />;
    }
    
    if (currentView.view === 'view') {
        return <ViewNotificationPage notification={currentView.data} onBack={() => setCurrentView({ view: 'list', data: null })} />;
    }

    return (
        <div className="flex flex-col h-full">
            <ConfirmationModal
                isOpen={isConfirmModalOpen.type === 'publish'}
                onClose={() => setIsConfirmModalOpen({ type: null, isOpen: false })}
                onConfirm={handleConfirmPublish}
                title="Publish Notifications"
            >
                Are you sure you want to publish the selected notifications now? This action will override any scheduled time and cannot be undone.
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isConfirmModalOpen.type === 'delete'}
                onClose={() => setIsConfirmModalOpen({ type: null, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title="Delete Notifications"
                confirmText="Delete"
                confirmColor="red"
            >
                Are you sure you want to delete the selected notifications? This action cannot be undone.
            </ConfirmationModal>

            <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Manage Notifications</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <ActionButton label="Add" icon={Plus} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView({ view: 'create', data: null })} />
                    <ActionButton label="Publish" icon={UploadCloud} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={handlePublishClick} disabled={!canPublish} />
                    {filterStatus !== 'Archived' ? (
                        <ActionButton label="Archive" icon={Archive} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={handleArchive} disabled={selected.length === 0} />
                    ) : (
                        <ActionButton label="Unarchive" icon={ArchiveRestore} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={handleUnarchive} disabled={selected.length === 0} />
                    )}
                    <ActionButton label="Delete" icon={Trash2} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={handleDeleteClick} disabled={selected.length === 0} />
                </div>
            </header>
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Title" 
                            className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status:</label>
                        <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="Published">Published</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Pending">Pending</option>
                            <option value="Archived">Archived</option>
                            <option value="All">All Notifications</option>
                        </select>
                    </div>
                    <ActionButton label="Search" className="bg-gray-800 text-white hover:bg-gray-900" />
                    <ActionButton label="Reset" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" onClick={handleReset} />
                </div>
            </div>
            <div className="flex-grow bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div ref={tableContainerRef} className="h-full overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={displayedItems.length > 0 && selected.length === displayedItems.length} /></th>
                                <th className="px-4 py-3 w-16">S.No</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Posted By</th>
                                <th className="px-4 py-3">Category</th>
                                { (filterStatus === 'Scheduled' || filterStatus === 'All') && <th className="px-4 py-3 w-40">Schedule Date</th> }
                                <th className="px-4 py-3 w-40">Created On</th>
                                <th className="px-4 py-3 w-32">Status</th>
                                <th className="px-4 py-3 w-24">Platforms</th>
                                <th className="px-4 py-3 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedItems.map((n, i) => (
                                <tr key={n.id} className="border-b hover:bg-gray-50 [&>td]:px-4 [&>td]:py-3 text-gray-600 cursor-pointer" onClick={() => setCurrentView({ view: 'view', data: n })}>
                                    <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.includes(n.id)} onChange={() => handleSelectOne(n.id)} /></td>
                                    <td>{i + 1}</td>
                                    <td className="font-medium text-gray-800 break-words">{n.title}</td>
                                    <td className="break-words">{n.postedBy}</td>
                                    <td>{n.category}</td>
                                    { (filterStatus === 'Scheduled' || filterStatus === 'All') && <td>{n.scheduleDate}</td> }
                                    <td>{n.createdOn}</td>
                                    <td><StatusTag status={n.status} /></td>
                                    <td onClick={(e) => e.stopPropagation()}><PlatformsPopover platforms={n.platforms} /></td>
                                    <td onClick={(e) => e.stopPropagation()}><ActionsMenu onEdit={() => setCurrentView({ view: 'edit', data: n })} onDuplicate={() => handleDuplicate(n)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>}
                </div>
            </div>
        </div>
    );
};

const NotificationCategoriesPage = () => {
    const [selected, setSelected] = useState([]);
    const handleSelectAll = (e) => setSelected(e.target.checked ? notificationCategoriesData.map(n => n.id) : []);
    const handleSelectOne = (id) => setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Manage Notifications Category</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <ActionButton label="Add" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Publish" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Unpublish" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                    <ActionButton label="Delete" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50" />
                </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr className="[&>th]:px-4 [&>th]:py-3">
                            <th className="p-4"><input type="checkbox" onChange={handleSelectAll} /></th>
                            <th>S.No</th><th>Notification Category</th><th>Sort Order</th><th>Created On</th><th>Last Modified On</th><th>Published</th><th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notificationCategoriesData.map((n, i) => (
                            <tr key={n.id} className="border-b hover:bg-gray-50 [&>td]:px-4 [&>td]:py-3">
                                <td className="p-4"><input type="checkbox" checked={selected.includes(n.id)} onChange={() => handleSelectOne(n.id)} /></td>
                                <td>{i + 1}</td><td>{n.category}</td><td>{n.sortOrder}</td><td>{n.createdOn}</td><td>{n.lastModified}</td>
                                <td><span className={`px-3 py-1 text-xs font-semibold rounded-full ${n.status === 'Published' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{n.status}</span></td>
                                <td><button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Pencil className="h-4 w-4" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const PlaceholderPage = ({ title }) => (
    <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="bg-white p-6 mt-6 rounded-lg border border-gray-200">
            <p className="text-gray-600">This is a placeholder page for the "{title}" section.</p>
        </div>
    </div>
);


// --- MAIN APP & LAYOUT ---

const NavItem = ({ icon: Icon, label, active, badge, subItems, isOpen, onHeaderClick, onSubItemClick }) => {
    return (
        <li className="mb-1">
            <a href="#" onClick={onHeaderClick} className={`flex justify-between items-center p-2 rounded-md text-sm font-medium ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />}
                    <span>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {badge && <span className={`text-xs rounded-full h-5 w-5 flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>{badge}</span>}
                    {subItems && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                </div>
            </a>
            {isOpen && subItems && (
                <ul className="pl-8 mt-1 border-l border-gray-200 ml-2">
                    {subItems.map(item => (
                        <li key={item.label} className="mb-1">
                            <a href="#" onClick={(e) => {e.preventDefault(); onSubItemClick(item.label)}} className={`block p-2 rounded-md text-sm ${item.active ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

export default function App() {
    const [openModule, setOpenModule] = useState('Personal Notification');
    const [activePage, setActivePage] = useState('Manage Personal Notifications');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleModuleClick = (moduleLabel) => {
        setOpenModule(openModule === moduleLabel ? null : moduleLabel);
    };
    
    const handlePageClick = (pageLabel) => {
        setActivePage(pageLabel);
    }

    const navStructure = [
        { icon: BookOpen, label: 'App Engagement Overview' },
        { icon: ClipboardList, label: 'Attendance Overview' },
        { icon: FileIcon, label: 'Note from Parent', badge: '6' },
        { icon: Shield, label: 'Detention' },
        { 
            icon: Bell, 
            label: 'Notifications', 
            subItems: [
                { label: 'Manage Notifications', active: activePage === 'Manage Notifications' },
                { label: 'Notification Categories', active: activePage === 'Notification Categories' },
            ]
        },
        { 
            icon: Bell, 
            label: 'Personal Notification', 
            badge: '1',
            subItems: [
                { label: 'Manage Personal Notifications', active: activePage === 'Manage Personal Notifications' },
                { label: 'PN Templates', active: activePage === 'PN Templates' },
            ]
        },
        { icon: Notebook, label: 'Evening Study' },
    ];

    const renderActivePage = () => {
        switch(activePage) {
            case 'Manage Personal Notifications':
                return <ManagePersonalNotificationsPage />;
            case 'PN Templates':
                return <PlaceholderPage title="PN Templates" />;
            case 'Manage Notifications':
                return <ManageNotificationsPage />;
            case 'Notification Categories':
                return <NotificationCategoriesPage />;
            case 'App Engagement Overview':
            case 'Attendance Overview':
            case 'Note from Parent':
            case 'Detention':
            case 'Evening Study':
                return <PlaceholderPage title={activePage} />;
            default:
                return <ManagePersonalNotificationsPage />;
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 font-sans flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`w-64 bg-white border-r border-gray-200 p-4 flex-shrink-0 flex flex-col absolute inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between gap-3 mb-6 px-2">
                     <h2 className="font-bold text-lg text-gray-800">Test App School 2</h2>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul>
                       {navStructure.map(item => (
                           <NavItem 
                               key={item.label} 
                               {...item} 
                               active={openModule === item.label}
                               isOpen={openModule === item.label}
                               onHeaderClick={(e) => { 
                                   e.preventDefault(); 
                                   handleModuleClick(item.label);
                                   if (!item.subItems) {
                                       handlePageClick(item.label);
                                   }
                               }}
                               onSubItemClick={handlePageClick}
                           />
                       ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
               <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                   <div className="max-w-full mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 text-gray-600"><Menu className="h-6 w-6" /></button>
                                <div className="relative hidden sm:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" placeholder="Search student name" className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <User className="h-6 w-6 rounded-full bg-gray-200" />
                            </div>
                        </div>
                   </div>
               </header>
               <main className="flex-grow p-6 lg:p-8 overflow-y-auto">
                    {renderActivePage()}
               </main>
            </div>
        </div>
    );
}
