import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
	Settings as SettingsIcon,
	ArrowLeft,
	Globe,
	Bell,
	Shield,
	User,
	Save,
	Trash2
} from 'lucide-react';

// Tailwind helper components
function Card({ children, className = '' }) {
	return <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ children }) { return <div className="px-6 pt-5 pb-3 border-b border-gray-200">{children}</div>; }
function CardTitle({ children, className='' }) { return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>; }
function CardContent({ children, className='' }) { return <div className={`px-6 py-5 ${className}`}>{children}</div>; }

function Toggle({ checked, onChange }) {
	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
			aria-pressed={checked}
		>
			<span
				className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
			/>
		</button>
	);
}

export default function Settings() {
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState('general');
	const [generalSettings, setGeneralSettings] = useState({
		language: 'english',
		timezone: 'Asia/Kolkata',
		dateFormat: 'DD/MM/YYYY',
		currency: 'INR'
	});
	const [notificationSettings, setNotificationSettings] = useState({
		emailNotifications: true,
		smsNotifications: false,
		pushNotifications: true,
		legalUpdates: true,
		complaintUpdates: true,
		lawyerMessages: true
	});
	const [privacySettings, setPrivacySettings] = useState({
		profileVisibility: 'private',
		showContactInfo: false,
		allowLawyerContact: true,
		dataSharing: false
	});
	const [accountSettings, setAccountSettings] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		twoFactorAuth: false
	});

	function saveSettings(group) {
		alert(`${group} settings saved successfully.`);
	}
	function exportData() {
		const data = { generalSettings, notificationSettings, privacySettings };
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'settings_export.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
		alert('Data exported.');
	}
	function deleteAccount() {
		if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
			alert('Account deletion requested.');
		}
	}

	const tabBtnBase = 'flex items-center justify-center gap-2 py-2 text-sm font-medium border-b-2';

	return (
		<div className="min-h-screen flex bg-gradient-subtle">
			<UserSidebar />
			<div className="flex-1 p-6">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => navigate('/user/Dashboard')}
								className="border rounded px-3 py-2 flex items-center text-sm bg-white hover:bg-gray-50"
							>
								<ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
							</button>
							<div className="flex items-center space-x-2">
								<SettingsIcon className="h-8 w-8 text-indigo-600" />
								<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Main Tabs Column */}
						<div className="lg:col-span-3">
							{/* Tabs */}
							<div className="grid grid-cols-4 bg-white rounded border mb-6 overflow-hidden">
								<button onClick={() => setActiveTab('general')} className={`${tabBtnBase} ${activeTab==='general' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}><Globe className="h-4 w-4" />General</button>
								<button onClick={() => setActiveTab('notifications')} className={`${tabBtnBase} ${activeTab==='notifications' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}><Bell className="h-4 w-4" />Notifications</button>
								<button onClick={() => setActiveTab('privacy')} className={`${tabBtnBase} ${activeTab==='privacy' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}><Shield className="h-4 w-4" />Privacy</button>
								<button onClick={() => setActiveTab('account')} className={`${tabBtnBase} ${activeTab==='account' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}><User className="h-4 w-4" />Account</button>
							</div>

							{/* Panels */}
							{activeTab === 'general' && (
								<Card className="mb-6">
									<CardHeader>
										<CardTitle>General Preferences</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block mb-1 text-sm font-medium">Language</label>
												<select value={generalSettings.language} onChange={e=>setGeneralSettings(p=>({...p,language:e.target.value}))} className="w-full border rounded px-3 py-2">
													<option value="english">English</option>
													<option value="hindi">Hindi</option>
													<option value="marathi">Marathi</option>
													<option value="gujarati">Gujarati</option>
												</select>
											</div>
											<div>
												<label className="block mb-1 text-sm font-medium">Timezone</label>
												<select value={generalSettings.timezone} onChange={e=>setGeneralSettings(p=>({...p,timezone:e.target.value}))} className="w-full border rounded px-3 py-2">
													<option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
													<option value="Asia/Dubai">Asia/Dubai (GST)</option>
													<option value="UTC">UTC</option>
												</select>
											</div>
											<div>
												<label className="block mb-1 text-sm font-medium">Date Format</label>
												<select value={generalSettings.dateFormat} onChange={e=>setGeneralSettings(p=>({...p,dateFormat:e.target.value}))} className="w-full border rounded px-3 py-2">
													<option value="DD/MM/YYYY">DD/MM/YYYY</option>
													<option value="MM/DD/YYYY">MM/DD/YYYY</option>
													<option value="YYYY-MM-DD">YYYY-MM-DD</option>
												</select>
											</div>
											<div>
												<label className="block mb-1 text-sm font-medium">Currency</label>
												<select value={generalSettings.currency} onChange={e=>setGeneralSettings(p=>({...p,currency:e.target.value}))} className="w-full border rounded px-3 py-2">
													<option value="INR">INR (₹)</option>
													<option value="USD">USD ($)</option>
													<option value="EUR">EUR (€)</option>
												</select>
											</div>
										</div>
										<button onClick={()=>saveSettings('General')} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
											<Save className="h-4 w-4 mr-2" /> Save General Settings
										</button>
									</CardContent>
								</Card>
							)}

							{activeTab === 'notifications' && (
								<Card className="mb-6">
									<CardHeader>
										<CardTitle>Notification Preferences</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="space-y-5">
											{[
												['emailNotifications','Email Notifications','Receive notifications via email'],
												['smsNotifications','SMS Notifications','Receive important updates via SMS'],
												['pushNotifications','Push Notifications','Browser push notifications'],
												['legalUpdates','Legal Updates','New laws and legal changes'],
												['complaintUpdates','Complaint Updates','Status updates on your complaints'],
												['lawyerMessages','Lawyer Messages','Messages from lawyers']
											].map(([key,label,desc]) => (
												<div key={key} className="flex items-center justify-between">
													<div>
														<p className="font-medium text-sm">{label}</p>
														<p className="text-xs text-gray-500">{desc}</p>
													</div>
													<Toggle checked={notificationSettings[key]} onChange={val=>setNotificationSettings(p=>({...p,[key]:val}))} />
												</div>
											))}
										</div>
										<button onClick={()=>saveSettings('Notification')} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
											<Save className="h-4 w-4 mr-2" /> Save Notification Settings
										</button>
									</CardContent>
								</Card>
							)}

							{activeTab === 'privacy' && (
								<Card className="mb-6">
									<CardHeader>
										<CardTitle>Privacy & Security</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="space-y-5">
											<div>
												<label className="block mb-1 text-sm font-medium">Profile Visibility</label>
												<select value={privacySettings.profileVisibility} onChange={e=>setPrivacySettings(p=>({...p,profileVisibility:e.target.value}))} className="w-full border rounded px-3 py-2">
													<option value="public">Public</option>
													<option value="private">Private</option>
													<option value="lawyers-only">Lawyers Only</option>
												</select>
											</div>
											{[
												['showContactInfo','Show Contact Information','Allow lawyers to see your contact details'],
												['allowLawyerContact','Allow Lawyer Contact','Let lawyers contact you directly'],
												['dataSharing','Data Sharing','Share anonymized data for research']
											].map(([key,label,desc]) => (
												<div key={key} className="flex items-center justify-between">
													<div>
														<p className="font-medium text-sm">{label}</p>
														<p className="text-xs text-gray-500">{desc}</p>
													</div>
													<Toggle checked={privacySettings[key]} onChange={val=>setPrivacySettings(p=>({...p,[key]:val}))} />
												</div>
											))}
										</div>
										<button onClick={()=>saveSettings('Privacy')} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
											<Save className="h-4 w-4 mr-2" /> Save Privacy Settings
										</button>
									</CardContent>
								</Card>
							)}

							{activeTab === 'account' && (
								<div className="space-y-6">
									<Card>
										<CardHeader>
											<CardTitle>Password & Security</CardTitle>
										</CardHeader>
										<CardContent className="space-y-5">
											<div>
												<label className="block mb-1 text-sm font-medium">Current Password</label>
												<input type="password" value={accountSettings.currentPassword} onChange={e=>setAccountSettings(p=>({...p,currentPassword:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Enter current password" />
											</div>
											<div>
												<label className="block mb-1 text-sm font-medium">New Password</label>
												<input type="password" value={accountSettings.newPassword} onChange={e=>setAccountSettings(p=>({...p,newPassword:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Enter new password" />
											</div>
											<div>
												<label className="block mb-1 text-sm font-medium">Confirm New Password</label>
												<input type="password" value={accountSettings.confirmPassword} onChange={e=>setAccountSettings(p=>({...p,confirmPassword:e.target.value}))} className="w-full border rounded px-3 py-2" placeholder="Confirm new password" />
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">Two-Factor Authentication</p>
													<p className="text-xs text-gray-500">Add extra security to your account</p>
												</div>
												<Toggle checked={accountSettings.twoFactorAuth} onChange={val=>setAccountSettings(p=>({...p,twoFactorAuth:val}))} />
											</div>
											<button onClick={()=>saveSettings('Password')} className="inline-flex items-center px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium shadow">
												<Save className="h-4 w-4 mr-2" /> Update Password
											</button>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Data Management</CardTitle>
										</CardHeader>
										<CardContent className="space-y-5">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">Export Your Data</p>
													<p className="text-xs text-gray-500">Download all your data</p>
												</div>
												<button onClick={exportData} className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50">Export Data</button>
											</div>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm text-red-600">Delete Account</p>
													<p className="text-xs text-gray-500">Permanently delete your account</p>
												</div>
												<button onClick={deleteAccount} className="px-3 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center"><Trash2 className="h-4 w-4 mr-2" />Delete</button>
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>

						{/* Right Sidebar Quick Actions */}
						<div className="lg:col-span-1 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<button onClick={()=>navigate('/user/profile')} className="w-full text-left px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-2"><User className="h-4 w-4" />Edit Profile</button>
									<button onClick={()=>navigate('/user/notifications')} className="w-full text-left px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-2"><Bell className="h-4 w-4" />View Notifications</button>
									<button onClick={()=>alert('Feedback dialog coming soon')} className="w-full text-left px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50">Feedback & Support</button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
