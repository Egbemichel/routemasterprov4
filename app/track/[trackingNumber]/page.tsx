'use client';

import Barcode from 'react-barcode';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import React, { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { getCountryFromAddress } from '@/lib/geocode';
import Image from "next/image";

const statusStyles: { [key: string]: string } = {
    'delivered': 'bg-green-100 text-green-800',
    'in transit': 'bg-primary-100 text-white-color font-bold',
    'on hold': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
};

const TrackingPage = () => {
    const params = useParams();
    const trackingNumber = params?.trackingNumber as string;

    const [packageData, setPackageData] = useState<DocumentData | null>(null);
    const [carrierName, setCarrierName] = useState<string>('Loading...');
    const [originCountry, setOriginCountry] = useState<string | null>(null);
    const [destinationCountry, setDestinationCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!trackingNumber) return;

        const fetchPackage = async () => {
            try {
                const docRef = doc(db, 'packages', trackingNumber);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPackageData(data);

                    // Fetch countries and carrier after we have data
                    const [origin, destination] = await Promise.all([
                        getCountryFromAddress(data.senderAddress),
                        getCountryFromAddress(data.receiverAddress),
                    ]);

                    setOriginCountry(origin);
                    setDestinationCountry(destination);

                    await fetchCarrierName(data.carrierId);
                } else {
                    console.warn('No such package');
                }
            } catch (error) {
                console.error('Error fetching package data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCarrierName = async (carrierId: string) => {
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

        fetchPackage();
    }, [trackingNumber]);

    if (loading || !packageData) return <div className="p-10 text-center text-lg">Loading...</div>;

    const statusClass = statusStyles[packageData.status?.toLowerCase()] || 'bg-gray-100 text-gray-800';

    const getCourierImage = (courierName: string) => {
        switch (courierName.toLowerCase()) {
            case 'dhl':
                return '/images/dhl.svg';
            case 'fedex':
                return '/images/fedex.svg';
            default:
                return '/images/usps.svg';
        }
    };

    return (
        <div className="flex flex-col items-center justify-between gap-5 p-5">
            <Barcode value={trackingNumber} />
            <Separator className="my-4" />

            <h2 className="text-h3 text-primary-200 font-medium font-pilcrow">Shipper Information</h2>
            <Separator className="my-4" />
            <p className="text-h3 text-gray-color">{packageData.senderName}</p>
            <p className="text-h3 text-gray-color">{packageData.senderAddress}</p>
            <p className="text-h3 text-gray-color">{packageData.senderPhone}</p>
            <p className="text-h3 text-gray-color">{packageData.senderEmail}</p>

            <h2 className="text-h3 text-primary-200 font-medium">Receiver Information</h2>
            <Separator className="my-4" />
            <p className="text-h3 text-gray-color">{packageData.receiverName}</p>
            <p className="text-h3 text-gray-color">{packageData.receiverAddress}</p>
            <p className="text-h3 text-gray-color">{packageData.receiverPhone}</p>
            <p className="text-h3 text-gray-color">{packageData.receiverEmail}</p>

            <div className={`px-4 py-2 w-[250px] text-center rounded-2xl text-sm font-semibold ${statusClass}`}>
                {packageData.status}
            </div>

            <h2 className="text-h3 text-primary-200 font-medium">Shipment Information</h2>
            <Separator className="my-4" />
            <p>Origin Country: {originCountry || 'Unknown'}</p>
            <p>Destination Country: {destinationCountry || 'Unknown'}</p>
            <p>Carrier: <Image
                src={getCourierImage(carrierName)}
                alt={carrierName}
                width={40}
                height={50}
                className={"rounded-full"}
            />&nbsp; {carrierName}</p>
            <p>Type of Shipment: {packageData.deliveryType}</p>
            <p>Weight: {packageData.weightKg} kg</p>
            <p>Shipment Mode: {packageData.transportMode}</p>
            <p className="font-bold">Carrier Reference Number: {packageData.trackingNumber}</p>
            <p>Product Qty: {packageData.quantity}</p>
            <p>Expected Delivery Date: {packageData.expectedDeliveryDate}</p>
            <p>Departure Time: {packageData.departureTime}</p>
            <p>Comment: {packageData.comment}</p>
        </div>
    );
};

export default TrackingPage;
