'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {useRouter} from 'next/navigation';

interface Props {
    trigger: React.ReactNode;
}

export default function TrackingDialog({ trigger }: Props) {
    const [trackingNumber, setTrackingNumber] = useState("");
    const router = useRouter();

    const handleSubmit = () => {
        if (!trackingNumber.trim()) return;
        // You can send the tracking number to your backend or redirect
        router.push(`/track/${trackingNumber}`)
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white-color">
                <DialogHeader>
                    <DialogTitle className="text-primary-200 font-archivo text-h3">Track Your Package</DialogTitle>
                    <DialogDescription>
                        Enter your tracking number to check delivery status.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    placeholder="e.g. ABC123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:outline-none"
                />
                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} className="bg-primary-100 text-white-color font-archivo font-bold">Track</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
