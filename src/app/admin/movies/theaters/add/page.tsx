"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, MapPin, Activity, CheckCircle2 } from "lucide-react";

import { MapLibrePicker, cityCenters, divisionCities, getDivisionForCity } from "@/components/admin/MapLibrePicker";
import { TheaterFormInput, CineplexChain } from "./types";
import { IdentityStep } from "./components/IdentityStep";
import { LocationStep } from "./components/LocationStep";
import { AmenitiesStep } from "./components/AmenitiesStep";
import { ReviewStep } from "./components/ReviewStep";
import { StepperHeader } from "./components/StepperHeader";
import { StepperFooter } from "./components/StepperFooter";

export default function AddTheaterPage() {
  const router = useRouter();
  const [chains, setChains] = useState<CineplexChain[]>([]);
  const [loadingChains, setLoadingChains] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableFacilities = [
    "3D Projections",
    "Dolby Atmos",
    "Recliner Seats",
    "VIP Lounge",
    "Food Court",
    "Arcade Zone",
  ];



  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm<TheaterFormInput>({
    defaultValues: {
      cineplexChainId: "",
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      pincode: "",
      latitude: "23.7508",
      longitude: "90.3916",
      phone: "",
      email: "",
      website: "",
      logoUrl: "",
      contactNumber: "",
      parkingAvailable: false,
      wheelchairAccessible: false,
      foodAllowed: true,
      facilities: [],
    },
  });

  const watchCity = watch("city");
  const watchState = watch("state");
  const watchLatitude = watch("latitude");
  const watchLongitude = watch("longitude");
  const watchFormValues = watch();

  // Fetch Cineplex brands
  useEffect(() => {
    fetch("/api/cinema/chains?limit=1000")
      .then((r) => r.json())
      .then((data) => {
        setChains(data.items || []);
        setLoadingChains(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load Cineplex chains");
        setLoadingChains(false);
      });
  }, []);

  const handleFacilityToggle = (
    facility: string,
    currentFacilities: string[],
  ) => {
    const next = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    setValue("facilities", next);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger([
        "name",
        "slug",
        "cineplexChainId",
        "contactNumber",
      ]);
    } else if (step === 2) {
      isValid = await trigger([
        "address",
        "city",
        "state",
        "country",
        "pincode",
        "latitude",
        "longitude",
      ]);
    } else if (step === 3) {
      isValid = await trigger([
        "phone",
        "email",
        "website",
        "logoUrl",
        "facilities",
        "parkingAvailable",
        "wheelchairAccessible",
        "foodAllowed",
      ]);
    }

    if (isValid) {
      setStep((s) => s + 1);
    } else {
      toast.error(
        "Please fill all required fields correctly before moving to the next stage.",
      );
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onFormSubmit = async (data: TheaterFormInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cineplexChainId: data.cineplexChainId || undefined,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          address: data.address || undefined,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode || undefined,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          logoUrl: data.logoUrl || undefined,
          contactNumber: data.contactNumber || undefined,
          parkingAvailable: data.parkingAvailable,
          wheelchairAccessible: data.wheelchairAccessible,
          foodAllowed: data.foodAllowed,
          facilities: data.facilities,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create cinema branch");
      }

      toast.success("Multiplex branch location configured successfully!");
      router.push("/admin/movies/theaters");
    } catch (error: any) {
      toast.error(error.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Identity", desc: "Name & Chain Brand", icon: Building2 },
    {
      num: 2,
      title: "GPS & Address",
      desc: "Location Coordinates",
      icon: MapPin,
    },
    {
      num: 3,
      title: "Amenities & Contacts",
      desc: "Phone, Web & Tech",
      icon: Activity,
    },
    {
      num: 4,
      title: "Confirmation",
      desc: "Review Parameters",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-background overflow-hidden relative">
      {/* Left Pane (Form Area) */}
      <div
        className={`transition-all duration-700 ease-in-out flex flex-col justify-between overflow-y-auto max-h-screen bg-background ${
          step === 2
            ? "w-full md:w-1/2 border-r border-muted"
            : "w-full md:w-full"
        }`}
      >
        <div
          className={`transition-all duration-700 ease-in-out p-6 md:p-10 space-y-6 ${
            step === 2 ? "w-full" : "max-w-2xl mx-auto w-full"
          }`}
        >
          <StepperHeader step={step} stepsList={stepsList} setStep={setStep} />

          {/* Actual Form Fields */}
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6 pt-4"
          >
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <IdentityStep
                register={register}
                errors={errors}
                setValue={setValue}
                chains={chains}
              />
            )}

            {/* STEP 2: GPS & LOCATION */}
            {step === 2 && (
              <LocationStep
                register={register}
                setValue={setValue}
                watchCity={watchCity}
                watchState={watchState}
                divisionCities={divisionCities}
              />
            )}

            {/* STEP 3: CONTACT & AMENITIES */}
            {step === 3 && (
              <AmenitiesStep
                register={register}
                control={control}
                availableFacilities={availableFacilities}
                handleFacilityToggle={handleFacilityToggle}
              />
            )}

            {/* STEP 4: REVIEW & CONFIRMATION */}
            {step === 4 && (
              <ReviewStep
                watchFormValues={watchFormValues}
                watchLatitude={watchLatitude}
                watchLongitude={watchLongitude}
                chains={chains}
              />
            )}

            <StepperFooter
              step={step}
              isSubmitting={isSubmitting}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          </form>
        </div>
      </div>

      {/* Right Pane (A massive full-pane MapLibre GPS radar picker) */}
      <div
        className={`transition-all duration-700 ease-in-out h-[450px] md:h-screen relative bg-slate-950 overflow-hidden ${
          step === 2
            ? "w-full md:w-1/2 opacity-100 pointer-events-auto"
            : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        <MapLibrePicker
          city={watchCity}
          latitude={watchLatitude}
          longitude={watchLongitude}
          onCoordsChange={(lat, lng) => {
            setValue("latitude", lat);
            setValue("longitude", lng);
          }}
          onCityChange={(c) => {
            setValue("city", c, { shouldValidate: true });
            const division = getDivisionForCity(c);
            if (division) setValue("state", division, { shouldValidate: true });
          }}
          onReverseGeocode={(data) => {
            if (data.address) setValue("address", data.address, { shouldValidate: true });
            if (data.pincode) setValue("pincode", data.pincode, { shouldValidate: true });
            if (data.city) {
              const exactCityMatch = Object.keys(cityCenters).find(c => c.toLowerCase() === data.city?.toLowerCase());
              if (exactCityMatch) {
                setValue("city", exactCityMatch, { shouldValidate: true });
                const division = getDivisionForCity(exactCityMatch);
                if (division) setValue("state", division, { shouldValidate: true });
              }
            }
          }}
        />
      </div>
    </div>
  );
}
