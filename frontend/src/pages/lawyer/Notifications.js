import React from 'react';
import LawyerSidebarSidebar from '../../components/LawyerSidebar';
import { Bell } from 'lucide-react';

export default function Notifications() {
    return (
        <div className="min-h-screen flex bg-gray-100">
            <LawyerSidebarSidebar />
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6">
                        <Bell className="h-8 w-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold">Notifications</h1>
                    </div>
                    <p className="text-gray-600 mb-4">Stay updated with legal changes, case updates, and system alerts.</p>
                    <div className="bg-white shadow rounded p-6 border border-gray-200 space-y-4">
                        <p className="text-sm text-gray-500">Notification center coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
