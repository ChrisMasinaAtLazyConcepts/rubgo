'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Phone, MessageCircle, Star, Lock, Home, DoorOpen, Bell, Shield, Loader2, AlertCircle, Copy, Navigation, Building, Key, MapPin as MapPinIcon, Edit, Save, X, User, Info } from "lucide-react"
import { toast } from "sonner"

interface Therapist {
  id: string;
  name: string;
  image: string;
  rating: number;
  phone: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

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
  therapist: Therapist;
  service: Service;
  date: string;
  time: string;
  status: string;
  price: number;
  therapistETA: string;
  location: string;
  specialInstructions: string;
  arrivalInstructions: ArrivalInstructions | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
        if (response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }

      const data = await response.json();
      setBooking(data);
      
      // Set arrival data if exists
      if (data.arrivalInstructions) {
        setArrivalData(data.arrivalInstructions);
      } else if (data.location) {
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

  const updateBookingStatus = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const updatedBooking = await response.json();
      setBooking(updatedBooking);
      toast.success(`Booking ${newStatus.toLowerCase()} successfully!`);
      
    } catch (err) {
      toast.error('Failed to update booking status');
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
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
        throw new Error(`Failed to update arrival instructions: ${response.statusText}`);
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
      case "therapist_en_route": return "bg-purple-500"
      case "arrived": return "bg-emerald-500"
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
    if (!timeString) return '';
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

  const handleCallTherapist = () => {
    if (booking?.therapist?.phone) {
      window.location.href = `tel:${booking.therapist.phone}`;
    }
  };

  const handleMessageTherapist = () => {
    if (booking?.therapist?.phone) {
      window.location.href = `sms:${booking.therapist.phone}`;
    }
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

  const handleStartSession = () => {
    // Navigate to therapist en-route page
    router.push(`/therapist-en-route/${bookingId}`);
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

  const canEditArrival = ['pending', 'confirmed', 'upcoming'].includes(booking.status.toLowerCase());

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Booking Details" showBack={true} />

      <div className="p-4 space-y-4">
        {/* Status Actions */}
        {booking.status.toLowerCase() === 'confirmed' && (
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-700">Ready for Your Session?</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isUpdatingStatus}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Therapist En Route
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Therapist Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={booking.therapist.image || '/default-therapist.jpg'}
                alt={booking.therapist.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{booking.therapist.name}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">{booking.therapist.rating} rating</span>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg">{booking.service.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(booking.date)} {booking.time && `at ${formatTime(booking.time)}`}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{booking.service.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA & Communication */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Communication</h3>
              {booking.therapistETA && (
                <span className={`text-sm font-medium ${
                  booking.therapistETA.toLowerCase() === "arrived" ? "text-green-600" : "text-blue-600"
                }`}>
                  ETA: {booking.therapistETA}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCallTherapist}
                disabled={!booking.therapist?.phone}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button 
                onClick={handleMessageTherapist}
                disabled={!booking.therapist?.phone}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Special Instructions</h3>
              <p className="text-sm text-muted-foreground">
                {booking.specialInstructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Arrival Instructions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Arrival Instructions</h3>
              </div>
              {canEditArrival && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingArrival(!isEditingArrival)}
                  className="h-8 px-2"
                >
                  {isEditingArrival ? (
                    <X className="h-4 w-4" />
                  ) : booking.arrivalInstructions ? (
                    <Edit className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {isEditingArrival ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Building Type</label>
                    <select
                      value={arrivalData.buildingType}
                      onChange={(e) => setArrivalData({...arrivalData, buildingType: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="office">Office</option>
                      <option value="hotel">Hotel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Number</label>
                    <input
                      type="text"
                      value={arrivalData.unitNumber}
                      onChange={(e) => setArrivalData({...arrivalData, unitNumber: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="e.g., 101"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Address *</label>
                  <input
                    type="text"
                    value={arrivalData.address}
                    onChange={(e) => setArrivalData({...arrivalData, address: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Full address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Floor Number</label>
                    <input
                      type="text"
                      value={arrivalData.floorNumber}
                      onChange={(e) => setArrivalData({...arrivalData, floorNumber: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gate Code</label>
                    <input
                      type="text"
                      value={arrivalData.gateCode}
                      onChange={(e) => setArrivalData({...arrivalData, gateCode: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="e.g., #1234"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Parking Instructions</label>
                  <textarea
                    value={arrivalData.parkingInstructions}
                    onChange={(e) => setArrivalData({...arrivalData, parkingInstructions: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm h-20"
                    placeholder="Where should the therapist park?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Entry Instructions</label>
                  <textarea
                    value={arrivalData.entryInstructions}
                    onChange={(e) => setArrivalData({...arrivalData, entryInstructions: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm h-20"
                    placeholder="How should the therapist enter?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Notes</label>
                  <textarea
                    value={arrivalData.specialNotes}
                    onChange={(e) => setArrivalData({...arrivalData, specialNotes: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm h-20"
                    placeholder="Any additional information?"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shareWithTherapist"
                    checked={arrivalData.shareWithTherapist}
                    onChange={(e) => setArrivalData({...arrivalData, shareWithTherapist: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <label htmlFor="shareWithTherapist" className="text-sm">
                    Share these instructions with therapist
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingArrival(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateArrivalInstructions}
                    disabled={savingArrival || !arrivalData.address}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {savingArrival ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Instructions
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {booking.arrivalInstructions ? (
                  <>
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
                      
                      {booking.arrivalInstructions.gateCode && (
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className="h-4 w-4 text-gray-500" />
                          <span>Access Code: {booking.arrivalInstructions.gateCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(
                              booking.arrivalInstructions!.gateCode,
                              'Access Code'
                            )}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {booking.arrivalInstructions.parkingInstructions && (
                        <div className="flex items-center gap-2 text-sm">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span>Parking: {booking.arrivalInstructions.parkingInstructions}</span>
                        </div>
                      )}
                      
                      {booking.arrivalInstructions.entryInstructions && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span>{booking.arrivalInstructions.entryInstructions}</span>
                        </div>
                      )}
                      
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
                    {canEditArrival && (
                      <Button
                        onClick={() => setIsEditingArrival(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Add Arrival Instructions
                      </Button>
                    )}
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
                <span>R{booking.service.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (15%)</span>
                <span>R{Math.round(booking.service.price * 0.15)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">R{booking.service.price + Math.round(booking.service.price * 0.15)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Actions */}
        <div className="flex gap-2">
          {booking.status.toLowerCase() === 'pending' && (
            <>
              <Button
                onClick={() => updateBookingStatus('confirmed')}
                disabled={isUpdatingStatus}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Confirm Booking
              </Button>
              <Button
                onClick={() => updateBookingStatus('cancelled')}
                disabled={isUpdatingStatus}
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
              >
                Cancel
              </Button>
            </>
          )}
          
          {booking.status.toLowerCase() === 'confirmed' && (
            <Button
              onClick={handleStartSession}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="text-center text-xs text-muted-foreground">
          Need help? Contact RubGo support: support@rubgo.co.za
        </div>
      </div>

      <BottomNav />
    </div>
  );
}