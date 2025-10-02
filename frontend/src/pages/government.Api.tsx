"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function GovernmentMocks() {
  const [cac, setCAC] = useState<any>(null);
  const [nimc, setNIMC] = useState<any>(null);
  const [firs, setFIRS] = useState<any>(null);
  const [cbn, setCBN] = useState<any>(null);
  const [ncc, setNCC] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cacData, error: cacError } = await supabase.from("mock_cac").select("*").single();
      if (cacError) console.error("CAC error:", cacError);

      const { data: nimcData, error: nimcError } = await supabase.from("mock_nimc").select("*").single();
      if (nimcError) console.error("NIMC error:", nimcError);

      const { data: firsData, error: firsError } = await supabase.from("mock_firs").select("*").single();
      if (firsError) console.error("FIRS error:", firsError);

      const { data: cbnData, error: cbnError } = await supabase.from("mock_cbn").select("*").single();
      if (cbnError) console.error("CBN error:", cbnError);

      const { data: nccData, error: nccError } = await supabase.from("mock_ncc").select("*").single();
      if (nccError) console.error("NCC error:", nccError);

      setCAC(cacData);
      setNIMC(nimcData);
      setFIRS(firsData);
      setCBN(cbnData);
      setNCC(nccData);
    };

    fetchData();
  }, []);

return (
  <div className="p-8 space-y-8">
    <h1 className="text-3xl font-bold text-center">📊 Mock Government APIs</h1>

    {/* CAC */}
    <Card>
      <CardHeader>
        <CardTitle>1️⃣ CAC – Business Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {cac ? (
          <div className="space-y-2">
            <p><span className="font-semibold">Company:</span> {cac.company_name}</p>
            <p><span className="font-semibold">RC Number:</span> {cac.rc_number}</p>
            <p><span className="font-semibold">Status:</span> {cac.status}</p>
            <p><span className="font-semibold">Type:</span> {cac.company_type}</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" /> Loading CAC...
          </p>
        )}
      </CardContent>
    </Card>

    {/* NIMC */}
    <Card>
      <CardHeader>
        <CardTitle>2️⃣ NIMC – Identity Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {nimc ? (
          <div className="space-y-2">
            <p><span className="font-semibold">Name:</span> {nimc.first_name} {nimc.last_name}</p>
            <p><span className="font-semibold">NIN:</span> {nimc.nin}</p>
            <p><span className="font-semibold">Phone:</span> {nimc.phone}</p>
            <p><span className="font-semibold">Status:</span> {nimc.status}</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" /> Loading NIMC...
          </p>
        )}
      </CardContent>
    </Card>

    {/* FIRS */}
    <Card>
      <CardHeader>
        <CardTitle>3️⃣ FIRS – Tax Validation</CardTitle>
      </CardHeader>
      <CardContent>
        {firs ? (
          <div className="space-y-2">
            <p><span className="font-semibold">TIN:</span> {firs.tin}</p>
            <p><span className="font-semibold">Company:</span> {firs.company_name}</p>
            <p><span className="font-semibold">Tax Status:</span> {firs.tax_status}</p>
            <p><span className="font-semibold">Last Filing:</span> {firs.last_filing_date}</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" /> Loading FIRS...
          </p>
        )}
      </CardContent>
    </Card>

    {/* CBN */}
    <Card>
      <CardHeader>
        <CardTitle>4️⃣ CBN – Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        {cbn ? (
          <div className="space-y-2">
            <p><span className="font-semibold">VTUs Allowed:</span> {cbn.vtus_allowed ? "✅ Yes" : "❌ No"}</p>
            <p><span className="font-semibold">Limit:</span> ₦{cbn.max_transaction_limit.toLocaleString()}</p>
            <p><span className="font-semibold">Level:</span> {cbn.compliance_level}</p>
            <p><span className="font-semibold">Gateways:</span> {cbn.approved_gateways.join(", ")}</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" /> Loading CBN...
          </p>
        )}
      </CardContent>
    </Card>

    {/* NCC */}
    <Card>
      <CardHeader>
        <CardTitle>5️⃣ NCC – Telecom Check</CardTitle>
      </CardHeader>
      <CardContent>
        {ncc ? (
          <div className="space-y-2">
            <p><span className="font-semibold">Operator:</span> {ncc.network_operator}</p>
            <p><span className="font-semibold">Status:</span> {ncc.service_status}</p>
            <p><span className="font-semibold">Compliance:</span> {ncc.compliance_status}</p>
            <p><span className="font-semibold">Audit:</span> {ncc.last_audit}</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" /> Loading NCC...
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);

}

