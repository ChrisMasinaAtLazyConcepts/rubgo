// app/bookings/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Phone, MessageCircle, Star, Lock, Home, DoorOpen, Bell, Shield, Loader2, AlertCircle, Copy, Navigation, Building, Key, MapPin as MapPinIcon, Edit, Save, X } from "lucide-react"
import { toast } from "sonner"

interface ArrivalInstructions {
  buildingType: string;
  address: string;
  unitNumber: string;
  floorNumber: string;
  gateCode: string;
  parkingInstructions: string;
  entryInstructions: string;
  specialNotes: string;
  shareWithTherapist: boolean;
}

interface BookingData {
  id: string;
  therapistName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  price: number;
  therapistETA: string;
  location: string;
  therapistRating: number;
  therapistImage: string;
  therapistPhone: string;
  specialInstructions: string;
  arrivalInstructions: ArrivalInstructions | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [isEditingArrival, setIsEditingArrival] = useState(false);
  const [arrivalData, setArrivalData] = useState<ArrivalInstructions>({
    buildingType: 'house',
    address: '',
    unitNumber: '',
    floorNumber: '',
    gateCode: '',
    parkingInstructions: '',
    entryInstructions: '',
    specialNotes: '',
    shareWithTherapist: true
  });
  const [savingArrival, setSavingArrival] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or cookies
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to fetch booking: ${response.status}`);
      }

      const data = await response.json();
      setBooking(data);
      
      // Set arrival data if exists
      if (data.arrivalInstructions) {
        setArrivalData(data.arrivalInstructions);
      } else {
        // Use location as default address
        setArrivalData(prev => ({
          ...prev,
          address: data.location || ''
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking details');
      toast.error('Failed to load booking details');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateArrivalInstructions = async () => {
    try {
      setSavingArrival(true);
      
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/bookings/${bookingId}/arrival-instructions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(arrivalData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to update arrival instructions: ${response.status}`);
      }

      const updatedBooking = await response.json();
      setBooking(updatedBooking);
      setIsEditingArrival(false);
      toast.success('Arrival instructions updated successfully!');
      
    } catch (err) {
      toast.error('Failed to update arrival instructions');
      console.error('Error updating arrival instructions:', err);
    } finally {
      setSavingArrival(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-green-500"
      case "pending": return "bg-yellow-500"
      case "in_progress":
      case "in-progress": return "bg-blue-500"
      case "cancelled": return "bg-red-500"
      case "completed": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(fieldName);
        toast.success(`Copied ${fieldName} to clipboard!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleCallTherapist = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessageTherapist = (phone: string) => {
    window.location.href = `sms:${phone}`;
  };

  const buildingTypeIcons = {
    house: Home,
    apartment: Building,
    office: Building,
    hotel: Key,
    other: MapPinIcon
  };

  const getBuildingTypeIcon = (type: string) => {
    const Icon = buildingTypeIcons[type as keyof typeof buildingTypeIcons] || MapPinIcon;
    return <Icon className="h-4 w-4" />;
  };

  const getBuildingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      house: 'House',
      apartment: 'Apartment',
      office: 'Office',
      hotel: 'Hotel',
      other: 'Other'
    };
    return labels[type] || 'Location';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Booking Details" showBack={true} />
        <div className="p-4 flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Booking</h2>
          <p className="text-gray-600 text-center mb-6">{error || 'Booking not found'}</p>
          <Button onClick={fetchBookingDetails} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Booking Details" showBack={true} />

      <div className="p-4 space-y-4">
        {/* Therapist Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={booking.therapistImage}
                alt={booking.therapistName}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{booking.therapistName}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">{booking.therapistRating} rating</span>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg">{booking.service}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(booking.date)} at {formatTime(booking.time)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{booking.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA & Tracking */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Therapist ETA</h3>
              <span className={`text-lg font-bold ${
                booking.therapistETA === "Arrived" ? "text-green-600" : "text-blue-600"
              }`}>
                {booking.therapistETA}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleCallTherapist(booking.therapistPhone)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                onClick={() => handleMessageTherapist(booking.therapistPhone)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Special Instructions</h3>
            <p className="text-sm text-muted-foreground">
              {booking.specialInstructions || "No special instructions provided"}
            </p>
          </CardContent>
        </Card>

  {/* Arrival Instructions */}
  <Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Navigation className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Arrival Instructions</h3>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditingArrival(!isEditingArrival)}
        className="h-8 px-2"
      >
        {isEditingArrival ? (
          <X className="h-4 w-4" />
        ) : (
          <Edit className="h-4 w-4" />
        )}
      </Button>
    </div>

    {isEditingArrival ? (
      <div className="space-y-4">
        {/* Editing form - your existing code */}
      </div>
    ) : (
      <div className="space-y-3">
        {booking.arrivalInstructions ? (
          <>
            {/* Display existing arrival instructions */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {getBuildingTypeIcon(booking.arrivalInstructions.buildingType)}
                <div>
                  <p className="font-medium">
                    {getBuildingTypeLabel(booking.arrivalInstructions.buildingType)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.arrivalInstructions.address}
                  </p>
                </div>
              </div>
              
              {booking.arrivalInstructions.unitNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <DoorOpen className="h-4 w-4 text-gray-500" />
                  <span>Unit: {booking.arrivalInstructions.unitNumber}</span>
                </div>
              )}
              
              {booking.arrivalInstructions.floorNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-gray-500" />
                  <span>Floor: {booking.arrivalInstructions.floorNumber}</span>
                </div>
              )}
              
              {/* FIXED: Check for gateCode before rendering */}
              {booking.arrivalInstructions.gateCode && (
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span>Access Code: {booking.arrivalInstructions.gateCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(
                      booking.arrivalInstructions!.gateCode, // Non-null assertion after checking
                      'Access Code'
                    )}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* FIXED: Check for parkingInstructions before rendering */}
              {booking.arrivalInstructions.parkingInstructions && (
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span>Parking: {booking.arrivalInstructions.parkingInstructions}</span>
                </div>
              )}
              
              {/* FIXED: Check for entryInstructions before rendering */}
              {booking.arrivalInstructions.entryInstructions && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span>{booking.arrivalInstructions.entryInstructions}</span>
                </div>
              )}
              
              {/* FIXED: Check for specialNotes before rendering */}
              {booking.arrivalInstructions.specialNotes && (
                <div className="p-2 bg-gray-50 rounded-lg mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Additional Notes:
                  </p>
                  <p className="text-xs text-gray-600">
                    {booking.arrivalInstructions.specialNotes}
                  </p>
                </div>
              )}
              
              {/* FIXED: Check for shareWithTherapist before rendering */}
              {booking.arrivalInstructions.shareWithTherapist && (
                <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
                  <Shield className="h-3 w-3" />
                  <span>Shared with therapist</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Navigation className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              No arrival instructions set
            </p>
            <Button
              onClick={() => setIsEditingArrival(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Add Arrival Instructions
            </Button>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>

        {/* Payment Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>R{booking.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>R{Math.round(booking.price * 0.15)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">R{booking.price + Math.round(booking.price * 0.15)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-600">
                <span>Payment Status</span>
                <span className="capitalize">{booking.paymentStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <div className="text-center text-xs text-muted-foreground">
          Need help? Contact RubGo support: support@rubgo.co.za
        </div>
      </div>

      <BottomNav />
    </div>
  );
}