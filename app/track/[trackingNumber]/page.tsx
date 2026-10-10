'use client';

import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import React, { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { getCountryFromAddress } from '@/lib/geocode';
import { TrackingDetails, TrackingNotFound, TrackingSkeleton } from '@/usercomponents/tracking/TrackingViews';

const TrackingPage = () => {
    const params = useParams();
    const trackingNumber = decodeURIComponent((params?.trackingNumber as string) || '');

    const [packageData, setPackageData] = useState<DocumentData | null>(null);
    const [carrierName, setCarrierName] = useState<string | null>(null);
    const [originCountry, setOriginCountry] = useState<string | null>(null);
    const [destinationCountry, setDestinationCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!trackingNumber) return;

        const fetchCarrierName = async (carrierId?: string) => {
            if (!carrierId) {
                setCarrierName(' ');
                return;
            }

            try {
                const carrierRef = doc(db, 'couriers', carrierId);
                const carrierSnap = await getDoc(carrierRef);

                if (carrierSnap.exists()) {
                    const carrierData = carrierSnap.data();
                    setCarrierName(carrierData.name || carrierId);
                } else {
                    setCarrierName(carrierId);
                }
            } catch (error) {
                console.error('Error fetching carrier:', error);
                setCarrierName(carrierId);
            }
        };

        const fetchPackage = async () => {
            try {
                const docRef = doc(db, 'packages', trackingNumber);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    console.warn('No such package');
                    return;
                }

                const data = docSnap.data();
                setPackageData(data);

                const [origin, destination] = await Promise.all([
                    getCountryFromAddress(data.senderAddress),
                    getCountryFromAddress(data.receiverAddress),
                ]);

                setOriginCountry(origin);
                setDestinationCountry(destination);
                await fetchCarrierName(data.carrierId);
            } catch (error) {
                console.error('Error fetching package data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [trackingNumber]);

    if (loading) return <TrackingSkeleton />;
    if (!packageData) return <TrackingNotFound trackingNumber={trackingNumber} />;

    return (
        <TrackingDetails
            packageData={packageData}
            trackingNumber={trackingNumber}
            carrierName={carrierName}
            originCountry={originCountry}
            destinationCountry={destinationCountry}
        />
    );
};

export default TrackingPage;
