'use client';
import { ChevronRight, User, Bell, Lock, HelpCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const settingsItems = [
    { icon: User, text: "Account", description: "Profile, avatar, user ID" },
    { icon: Bell, text: "Notifications", description: "Message and call alerts" },
    { icon: Lock, text: "Privacy & Security", description: "Blocked users, security settings" },
    { icon: HelpCircle, text: "Help & Support", description: "FAQs and contact support" },
    { icon: FileText, text: "Terms of Service", description: "Legal and terms" },
];

export default function SettingsPage() {
    return (
        <div className="p-4">
            <div className="space-y-2">
                {settingsItems.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-secondary transition-colors">
                        <CardContent className="p-4 flex items-center">
                            <div className="p-2 bg-primary/10 rounded-lg mr-4">
                                <item.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.text}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
