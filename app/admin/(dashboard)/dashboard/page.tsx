// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import Button from "@/usercomponents/Button";
import { AdminView } from "@/app/types/view";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { geocodeAddress } from "@/app/utils/geocodeAddress";
import Image from "next/image";
import jsPDFInvoiceTemplate from "jspdf-invoice-template";
import { getDoc } from "firebase/firestore";
import ToastNotification from "@/usercomponents/ToastNotifications"; // Adjust path as needed


type Coordinates = {
  latitude: number;
  longitude: number;
};

type PackageData = {
  comment: string;
  departureTime: string;
  expectedDeliveryDate: string;
  id: string;
  trackingNumber?: string;
  packageOrigin: string;
  destination: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: string;
  packageContent: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  weightKg: number;
  quantity: number;
  carrierId: string;
  deliveryType: string;
  transportMode: string;
  status?: string;
  currentPosition?: Coordinates;
  endCoordinates?: Coordinates;
  reason?: string;
};

const DashboardOverview = () => {
  const [totalPackages, setTotalPackages] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTotalPackages() {
      try {
        const coll = collection(db, "packages");
        const snapshot = await getCountFromServer(coll);
        setTotalPackages(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching package count:", error);
      }
    }
    fetchTotalPackages();
  }, []);

  return (
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p>
          Total Packages: {totalPackages !== null ? totalPackages : "Loading..."}
        </p>
      </div>
  );
};

type ToastType = "success" | "error" | "warning" | "info";
type ToastAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};
type ToastState = {
  type: ToastType;
  title: string;
  subtitle?: string;
  actions?: ToastAction[];
  onClose?: () => void;
} | null;

const Orders = () => {
  const [carrierNames, setCarrierNames] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState>(null);

  // Helper for showing toast
  const showToast = (type: ToastType, title: string, subtitle?: string, actions?: ToastAction1[], onClose?: () => void) => {
    setToast({ type, title, subtitle, actions, onClose });
  };
  const [formData, setFormData] = useState({
    packageOrigin: "",
    destination: "",
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    receiverAddress: "",
    packageContent: "",
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: "",
    weightKg: "", // string here, parsed later
    quantity: "",
    carrierId: "",
    deliveryType: "national", // default
    transportMode: "",
    expectedDeliveryDate: "",
    departureTime: "",
    comment: "",
  });

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
      null
  );
  const [editMode, setEditMode] = useState(false);
  const [carriers, setCarriers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "couriers"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCarriers(list);
      } catch (error) {
        console.error("Error fetching carriers:", error);
      }
    };
    fetchCarriers();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packageCollection = collection(db, "packages");
        const snapshot = await getDocs(packageCollection);
        const packageList: PackageData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PackageData[];
        setPackages(packageList);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    packages.forEach((pkg) => {
      if (pkg.carrierId) {
        fetchCarrierName(pkg.carrierId);
      }
    });
  });

  const handleChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(Number(formData.weightKg)) || isNaN(Number(formData.quantity))) {
      showToast("error", "Invalid Input", "Weight and quantity must be valid numbers.");
      return;
    }

    if (!formData.carrierId) {
      showToast("error", "Missing Carrier", "Please select a carrier.");
      return;
    }

    const startCoordinates = await geocodeAddress(formData.senderAddress);
    const endCoordinates = await geocodeAddress(formData.receiverAddress);

    if (!startCoordinates || !endCoordinates) {
      showToast("error", "Geocoding Failed", "Failed to get coordinates for addresses.");
      return;
    }

    if (editMode && selectedPackageId) {
      try {
        const packageDoc = doc(db, "packages", selectedPackageId);
        await updateDoc(packageDoc, {
          ...formData,
          weightKg: Number(formData.weightKg),
          quantity: Number(formData.quantity),
          startCoordinates,
          endCoordinates,
        });
        showToast("success", "Package Updated", "Package information updated successfully.");
      } catch (error) {
        console.error("Update error:", error);
        showToast("error", "Update Failed", "Failed to update package.");
      }
    } else {
      const randomDigits = Math.random().toString().slice(2, 16);
      const trackingNumber = `RM${randomDigits}-SHIP`;

      try {
        await setDoc(doc(db, "packages", trackingNumber), {
          ...formData,
          trackingNumber,
          weightKg: Number(formData.weightKg),
          quantity: Number(formData.quantity),
          status: "in transit",
          currentPosition: startCoordinates,
          endCoordinates,
          reason: "",
          expectedDeliveryDate: formData.expectedDeliveryDate,
          departureTime: formData.departureTime,
          comment: formData.comment,
        });
        showToast("success", "Tracking Number Generated", `Tracking number: ${trackingNumber}`);
      } catch (error) {
        console.error("Create error:", error);
        showToast("error", "Creation Failed", "Failed to create package.");
      }
    }

    // ...reset form...
    setFormData({
      packageOrigin: "",
      destination: "",
      receiverName: "",
      receiverEmail: "",
      receiverPhone: "",
      receiverAddress: "",
      packageContent: "",
      senderName: "",
      senderEmail: "",
      senderPhone: "",
      senderAddress: "",
      weightKg: "",
      quantity: "",
      carrierId: "",
      deliveryType: "national",
      transportMode: "",
      expectedDeliveryDate: "",
      departureTime: "",
      comment: "",
    });
    setEditMode(false);
    setSelectedPackageId(null);
  };


  const confirmAction = (title: string, subtitle: string): Promise<boolean> => {
    return new Promise((resolve) => {
      showToast(
          "warning",
          title,
          subtitle,
          [
            {
              label: "Yes",
              onClick: () => {
                setToast(null);
                resolve(true);
              },
              variant: "primary",
            },
            {
              label: "No",
              onClick: () => {
                setToast(null);
                resolve(false);
              },
              variant: "secondary",
            },
          ],
          () => {
            setToast(null);
            resolve(false);
          }
      );
    });
  };


  const handleEdit = (pkg: PackageData) => {
    // When editing, ensure formData fields are strings (weightKg, quantity etc.)
    setFormData({
      packageOrigin: pkg.packageOrigin || "",
      destination: pkg.destination || "",
      receiverName: pkg.receiverName || "",
      receiverEmail: pkg.receiverEmail || "",
      receiverPhone: pkg.receiverPhone || "",
      receiverAddress: pkg.receiverAddress || "",
      packageContent: pkg.packageContent || "",
      senderName: pkg.senderName || "",
      senderEmail: pkg.senderEmail || "",
      senderPhone: pkg.senderPhone || "",
      senderAddress: pkg.senderAddress || "",
      weightKg: pkg.weightKg?.toString() || "",
      quantity: pkg.quantity?.toString() || "",
      carrierId: pkg.carrierId || "",
      deliveryType: pkg.deliveryType || "national",
      transportMode: pkg.transportMode || "",
      expectedDeliveryDate: pkg.expectedDeliveryDate || "",
      departureTime: pkg.departureTime || "",
      comment: pkg.comment || "",
    });
    setSelectedPackageId(pkg.id);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction(
        "Delete Package?",
        "Are you sure you want to delete this package?"
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "packages", id));
      setPackages(packages.filter((pkg) => pkg.id !== id));
      showToast("success", "Package Deleted", "Package deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Delete Failed", "Failed to delete package.");
    }
  };

  const fetchCarrierName = async (carrierId: string) => {
    if (carrierNames[carrierId]) return; // Already fetched

    try {
      const carrierRef = doc(db, "couriers", carrierId);
      const carrierSnap = await getDoc(carrierRef);
      if (carrierSnap.exists()) {
        const carrierData = carrierSnap.data();
        setCarrierNames((prev) => ({
          ...prev,
          [carrierId]: carrierData.name || carrierId,
        }));
      } else {
        setCarrierNames((prev) => ({
          ...prev,
          [carrierId]: carrierId,
        }));
      }
    } catch (error) {
      console.error("Error fetching carrier:", error);
      setCarrierNames((prev) => ({
        ...prev,
        [carrierId]: carrierId,
      }));
    }
  };

  const handleGenerateReceipt = (pkg: PackageData) => {
    const carrierName = carrierNames[pkg.carrierId] || "Unknown";

    const props = {
      outputType: "save",
      fileName: `Receipt_${pkg.trackingNumber}`,
      orientationLandscape: true,
      business: {
        name: "RouteMasterPro",
        email: "outlook.routemasterpro@gmail.com",
        website: "www.routemasterpro.com",
      },
      contact: {
        label: "Shipper Information",
        name: pkg.senderName,
        address: pkg.senderAddress,
        phone: pkg.senderPhone,
        email: pkg.senderEmail,
      },
      invoice: {
        label: pkg.trackingNumber,
        invDate: `Expected Delivery: ${pkg.expectedDeliveryDate}`,
        invGenDate: `Departure Time: ${pkg.departureTime}`,
        headerBorder: false,
        tableBodyBorder: false,
        header: [
          { title: "#", style: { width: 10 } },
          { title: "Details", style: { width: 30 } },
          { title: "Qty", style: { width: 40 } },
          { title: "Weight", style: { width: 50 } },
          { title: "Mode", style: { width: 60 } },
          { title: "DeliveryType", style: { width: 70 } },
          { title: "Status", style: { width: 90 } },
        ],
        table: [
          [
            1,
            pkg.packageContent || "No additional details",
            pkg.quantity,
            `${pkg.weightKg} kg`,
            pkg.transportMode,
            pkg.deliveryType,
            pkg.status,
          ],
        ],
        additionalRows: [
          {
            col1: "Carrier",
            col2: carrierName,
            col3: "",
            style: { fontSize: 12 },
          },
          {
            col2: `Origin: ${pkg.packageOrigin}` || "Unknown",
            col3: "",
            style: { fontSize: 12 },
          },
          {
            col2: `Destination: ${pkg.destination}` || "Unknown",
            col3: "",
            style: { fontSize: 12 },
          },
        ],
        invDescLabel: "Comments",
        invDesc: pkg.comment || "No comments provided.",
      },
    };

    jsPDFInvoiceTemplate(props);
  };

  return (
      <>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          {/* packageOrigin */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PACKAGE ORIGIN
            </label>
            <Input
                type="text"
                name="packageOrigin"
                value={formData.packageOrigin}
                onChange={handleChange}
                required
            />
          </div>

          {/* destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DESTINATION
            </label>
            <Input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
            />
          </div>

          {/* receiverName */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RECEIVER NAME
            </label>
            <Input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                required
            />
          </div>

          {/* receiverEmail */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RECEIVER EMAIL
            </label>
            <Input
                type="email"
                name="receiverEmail"
                value={formData.receiverEmail}
                onChange={handleChange}
                required
            />
          </div>

          {/* receiverPhone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RECEIVER PHONE
            </label>
            <Input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                required
            />
          </div>

          {/* receiverAddress */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RECEIVER ADDRESS
            </label>
            <Input
                type="text"
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleChange}
                required
            />
          </div>

          {/* packageContent */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PACKAGE CONTENT
            </label>
            <Input
                type="text"
                name="packageContent"
                value={formData.packageContent}
                onChange={handleChange}
                required
            />
          </div>

          {/* senderName */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SENDER NAME
            </label>
            <Input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                required
            />
          </div>

          {/* senderEmail */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SENDER EMAIL
            </label>
            <Input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                required
            />
          </div>

          {/* senderPhone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SENDER PHONE
            </label>
            <Input
                type="tel"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleChange}
                required
            />
          </div>

          {/* senderAddress */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SENDER ADDRESS
            </label>
            <Input
                type="text"
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleChange}
                required
            />
          </div>

          {/* weightKg */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              WEIGHT (KG)
            </label>
            <Input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
            />
          </div>

          {/* quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              QUANTITY
            </label>
            <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
            />
          </div>

          {/* carrierId */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CARRIER
            </label>
            <select
                name="carrierId"
                value={formData.carrierId}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
            >
              <option value="" disabled>
                Select a carrier
              </option>
              {carriers.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </option>
              ))}
            </select>
          </div>

          {/* deliveryType */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DELIVERY TYPE
            </label>
            <select
                name="deliveryType"
                value={formData.deliveryType}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            >
              <option value="National Shipping">National</option>
              <option value="International Shipping">International</option>
            </select>
          </div>

          {/* transportMode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              TRANSPORT MODE
            </label>
            <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
            >
              <option value="" disabled>
                Select transport mode
              </option>
              <option value="Air Freight">Air Freight</option>
              <option value="Ship Freight">Ship Freight</option>
              <option value="Truck Freight">Truck Freight</option>
              <option value="Train Freight">Train Freight</option>
            </select>
          </div>

          {/* expectedDeliveryDate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              EXPECTED DELIVERY DATE
            </label>
            <Input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                required
            />
          </div>

          {/* departureTime */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              DEPARTURE TIME
            </label>
            <Input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
            />
          </div>

          {/* comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              COMMENT
            </label>
            <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Optional comment about the package or delivery"
            />
          </div>

          <Button
              type="submit"
              imageSrc="/icons/setup-02.svg"
              imageHeight={30}
              imageWidth={30}
              imageAlt="Gear icon"
              borderRadius="rounded-2xl"
              border="border-none"
              width="250px"
              text={editMode ? "Update Package" : "Generate Tracking Number"}
              bgColor="bg-primary-100"
              textColor="text-white-color"
              className="gap-6"
          />
        </form>

        <h2>Manage Packages</h2>
        <ul className="package-list">
          {packages.map((pkg) => (
              <li key={pkg.id} className="border-primary-200 bg-transparent">
                {pkg.trackingNumber} - {pkg.receiverName}
                <div className="gap-8">
                  <button
                      onClick={() => handleEdit(pkg)}
                      className="w-[170px] p-4 bg-primary-100 hover:bg-blue-500 rounded-2xl text-white-color font-archivo font-medium "
                  >
                    Edit
                  </button>
                  <button
                      onClick={() => handleDelete(pkg.id)}
                      className="w-[170px] p-4 rounded-2xl bg-error hover:bg-red-300 text-white-color font-archivo font-medium"
                  >
                    Delete
                  </button>
                  <button
                      onClick={() => handleGenerateReceipt(pkg)}
                      className="w-[170px] p-4 rounded-2xl bg-info hover:bg-blue-700 text-white-color font-archivo font-medium"
                  >
                    Receipt
                  </button>
                </div>
              </li>
          ))}

          {toast && (
              <div className="fixed top-4 right-4 z-50">
                <ToastNotification
                    {...toast}
                    onClose={() => {
                      setToast(null);
                      toast.onClose && toast.onClose();
                    }}
                />
              </div>
          )}
        </ul>
      </>
  );
};
type Courier = {
  id: string;
  name: string;
};

const Couriers = () => {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (type: ToastType, title: string, subtitle?: string, actions?: ToastAction[], onClose?: () => void) => {
    setToast({ type, title, subtitle, actions, onClose });
  };

  const confirmAction = (title: string, subtitle: string): Promise<boolean> => {
    return new Promise((resolve) => {
      showToast(
          "warning",
          title,
          subtitle,
          [
            {
              label: "Yes",
              onClick: () => {
                setToast(null);
                resolve(true);
              },
              variant: "primary",
            },
            {
              label: "No",
              onClick: () => {
                setToast(null);
                resolve(false);
              },
              variant: "secondary",
            },
          ],
          () => {
            setToast(null);
            resolve(false);
          }
      );
    });
  };


  const getCourierImage = (courierName: string) => {
    switch (courierName.toLowerCase()) {
      case "dhl":
        return "/images/dhl.svg";
      case "fedex":
        return "/images/fedex.svg";
      default:
        return "/images/usps.svg";
    }
  };

  const fetchCouriers = async () => {
    const snapshot = await getDocs(collection(db, "couriers"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Courier, "id">),
    }));
    setCouriers(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("error", "Missing Name", "Courier name is required");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "couriers", editId), { name });
        setEditId(null);
      } else {
        await addDoc(collection(db, "couriers"), { name });
      }

      setName("");
      fetchCouriers();
      showToast("success", "Courier Saved", "Courier information saved successfully.");
    } catch (err) {
      console.error("Error saving courier:", err);
      showToast("error", "Save Failed", "Failed to save courier");
    }
  };

  const handleEdit = (courier: Courier) => {
    setName(courier.name);
    setEditId(courier.id);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction(
        "Delete Courier?",
        "Are you sure you want to delete this courier?"
    );
    if (!confirmed) return;
    await deleteDoc(doc(db, "couriers", id));
    fetchCouriers();
    showToast("success", "Courier Deleted", "Courier deleted successfully.");
  };


  useEffect(() => {
    fetchCouriers();
  }, []);

  return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Courier Management</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
              type="text"
              placeholder="Courier name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
              required
          />
          <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editId ? "Update Courier" : "Add Courier"}
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {couriers.map((courier) => (
              <li
                  key={courier.id}
                  className="flex items-center justify-between border-b pb-2"
              >
            <span>
              <Image
                  src={getCourierImage(courier.name)}
                  alt={courier.name}
                  width={40}
                  height={50}
                  className={"rounded-full"}
              />
              &nbsp;{courier.name}
            </span>
                <div className="flex gap-3">
                  <button
                      onClick={() => handleEdit(courier)}
                      className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                      onClick={() => handleDelete(courier.id)}
                      className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
          ))}
          {toast && (
              <div className="fixed top-4 right-4 z-50">
                <ToastNotification
                    {...toast}
                    onClose={() => {
                      setToast(null);
                      toast.onClose && toast.onClose();
                    }}
                />
              </div>
          )}
        </ul>
      </div>
  );
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "orders":
        return <Orders />;
      case "couriers":
        return <Couriers />;
      case "dashboard":
      default:
        return <DashboardOverview />;
    }
  };

  return (
      <SidebarProvider>
        <AppSidebar
            onChangeViewAction={setCurrentView}
            renderedComponentAction={renderContent}
        />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2 px-4">
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        </SidebarInset>
      </SidebarProvider>
  );
}
