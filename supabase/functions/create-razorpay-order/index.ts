// Supabase Edge Function: create-razorpay-order
// Handles authenticated user verification, pet validation, authoritative service price lookup,
// Razorpay TEST order generation, and appointment record insertion with payment_status = 'pending'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 2. Authentication Verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate user via token using user-scoped client
    const token = authHeader.replace("Bearer ", "").trim();
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuthClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please log in." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize trusted service client for database queries
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 3. Parse and Validate Request Payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { pet_id, service_id, appointment_date, appointment_time, notes } =
      body;

    if (!pet_id || !service_id || !appointment_date || !appointment_time) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: pet_id, service_id, appointment_date, and appointment_time are required.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Validate Pet Ownership
    const { data: pet, error: petError } = await supabaseAdmin
      .from("pets")
      .select("id, name, owner_id")
      .eq("id", pet_id)
      .maybeSingle();

    if (petError || !pet) {
      return new Response(JSON.stringify({ error: "Pet not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(pet.owner_id) !== String(user.id)) {
      return new Response(
        JSON.stringify({
          error: "Access denied. The selected pet does not belong to your account.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Validate Service & Authoritative Price
    const { data: service, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("id, name, price, active, is_active")
      .eq("id", service_id)
      .maybeSingle();

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ error: "Selected service was not found." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isActive = service.active !== false && service.is_active !== false;
    if (!isActive) {
      return new Response(
        JSON.stringify({
          error: "The selected service is currently unavailable or inactive.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const priceRupees = Number(service.price);
    if (isNaN(priceRupees) || priceRupees <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid service price configuration." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Safe Date & Slot Conflict Validation
    const todayStr = new Date().toISOString().split("T")[0];
    if (appointment_date < todayStr) {
      return new Response(
        JSON.stringify({ error: "Appointment date cannot be in the past." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: conflict } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .eq("pet_id", pet_id)
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .neq("status", "cancelled")
      .maybeSingle();

    if (conflict) {
      return new Response(
        JSON.stringify({
          error:
            "This pet already has an appointment booked at this exact date and time.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Amount Conversion (Rupees to Paise)
    const amountInPaise = Math.round(priceRupees * 100);

    // 8. Razorpay Secrets & Authentication
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error(
        "Missing Razorpay credentials in environment: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET."
      );
      return new Response(
        JSON.stringify({
          error:
            "Payment gateway is not configured on the server. Please contact support.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const basicAuth = "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const receiptId = `paw_${Date.now().toString().slice(-8)}_${pet_id.replace(/-/g, "").slice(0, 8)}`;

    // 9. Call Razorpay API to create Order
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          owner_id: user.id,
          pet_id: pet.id,
          service_id: service.id,
          service_name: service.name,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error(
        "Razorpay order creation error:",
        razorpayResponse.status,
        errorText
      );
      return new Response(
        JSON.stringify({
          error: "Failed to initialize payment order with payment gateway.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    // 10. Insert Appointment Record with payment_status = 'pending'
    const { data: appointment, error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert({
        owner_id: user.id,
        pet_id: pet.id,
        service_id: service.id,
        service_type: service.name,
        appointment_date: appointment_date,
        appointment_time: appointment_time,
        notes: typeof notes === "string" ? notes.trim() || null : null,
        status: "scheduled",
        amount: priceRupees,
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "Database insertion failed after Razorpay order was generated:",
        insertError,
        "Order ID:",
        razorpayOrder.id
      );
      return new Response(
        JSON.stringify({
          error:
            "Failed to save appointment record after payment initialization.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 11. Return Clean Success Response (Secret Key is NEVER returned)
    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: razorpayKeyId,
        appointmentId: appointment.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Unhandled error in create-razorpay-order:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error. " + message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
